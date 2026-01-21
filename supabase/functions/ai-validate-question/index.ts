import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";
import { callAnthropic, parseAIJSON } from "../_shared/anthropic.ts";
import { withRetry } from "../_shared/retry.ts";
import {
  AIValidationResult,
  Question,
  ValidationFlag,
  FLAG_SEVERITY,
  ValidationComment,
} from "../_shared/types.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  console.log("🔍 AI Validate Question function called");

  try {
    const { question_id } = await req.json();
    console.log("📝 Question ID:", question_id);

    if (!question_id) {
      throw new Error("Missing question_id");
    }

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

    console.log("🔑 Env check - SUPABASE_URL:", supabaseUrl ? "✅ Set" : "❌ Missing");
    console.log("🔑 Env check - SERVICE_ROLE_KEY:", supabaseKey ? "✅ Set" : "❌ Missing");

    if (!supabaseUrl || !supabaseKey) {
      throw new Error("Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY environment variables");
    }

    const supabase = createClient(supabaseUrl, supabaseKey);
    console.log("✅ Supabase client created");

    // Fetch question
    console.log("🔍 Fetching question from database...");
    const { data: question, error: fetchError } = await supabase
      .from("2V_questions")
      .select("*")
      .eq("id", question_id)
      .single();

    if (fetchError) {
      console.error("❌ Database fetch error:", fetchError);
      throw new Error(`Failed to fetch question: ${fetchError.message}`);
    }

    if (!question) {
      throw new Error(`Question not found: ${question_id}`);
    }

    console.log(
      `📝 Validating question ${question.question_number} (${question.test_type})`
    );

    // Skip PDF questions - they have different structure and don't need AI validation
    if (question.question_type === "pdf") {
      console.log("⏭️ Skipping PDF question - no validation needed");
      const pdfValidationResult: AIValidationResult = {
        status: "completed",
        validated_at: new Date().toISOString(),
        total_checks: 1,
        checks_passed: 1,
        flags: ["ai_verified_correct"],
        technical_validation: { passed: true, issues: [] },
        comments: [{ flag: "ai_verified_correct", severity: "success", message: "PDF question - no validation required" }],
      };

      await updateQuestionValidation(supabase, question_id, pdfValidationResult);

      return new Response(
        JSON.stringify({ success: true, validation: pdfValidationResult }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Initialize validation result
    const validationResult: AIValidationResult = {
      status: "processing",
      validated_at: new Date().toISOString(),
      total_checks: 5,
      checks_passed: 0,
      flags: [],
      technical_validation: { passed: false, issues: [] },
      comments: [],
    };

    // STEP 1: Technical Validation (using Haiku)
    console.log("⚙️ Step 1: Technical validation...");
    const technicalResult = await performTechnicalValidation(question);
    validationResult.technical_validation = technicalResult;

    if (!technicalResult.passed) {
      // Technical validation failed - stop here
      validationResult.status = "completed";
      validationResult.flags = extractFlagsFromTechnical(technicalResult);
      validationResult.comments = technicalResult.issues.map((issue) => ({
        flag: determineTechnicalFlag(issue),
        severity: "critical",
        message: issue,
      }));

      await updateQuestionValidation(supabase, question_id, validationResult);

      return new Response(
        JSON.stringify({ success: true, validation: validationResult }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    validationResult.checks_passed++;

    // STEP 1.5: Translation Consistency Check (if bilingual question)
    console.log("🌐 Step 1.5: Checking translation consistency...");
    const translationCheck = await performTranslationCheck(question);
    if (translationCheck.has_mismatch) {
      validationResult.flags.push("translation_mismatch");
      validationResult.comments.push({
        flag: "translation_mismatch",
        severity: "high",
        message: translationCheck.mismatch_details,
      });
    }
    validationResult.checks_passed++;

    // STEP 2: AI Blind Solve (using Sonnet)
    console.log("🤖 Step 2: AI solving question without seeing answer...");
    const aiSolution = await withRetry(
      () => performBlindSolve(question),
      { question_id, operation: "AI Blind Solve" }
    );
    validationResult.ai_solution = aiSolution;
    validationResult.checks_passed++;

    // STEP 3: Compare Results
    console.log("🔄 Step 3: Comparing AI answer with stored answer...");
    const storedAnswer = parseStoredAnswer(question.answers);
    const matches = aiSolution.answer === storedAnswer;

    // Initialize statistics tracking
    const statistics = {
      immediate_match: matches,
      needed_deep_verification: !matches,
      needed_re_verification: false,
      re_verification_changed_verdict: false,
    };

    if (matches) {
      // Perfect match - mark as verified
      console.log("✅ Immediate match - AI answer matches stored answer");
      statistics.final_verdict = "correct";

      validationResult.answer_verification = {
        matches_stored: true,
        final_verdict: "correct",
        correct_should_be: storedAnswer,
        explanation: "AI solution matches stored answer",
      };
      validationResult.flags.push("ai_verified_correct");
      validationResult.checks_passed++;

      // Still do quality check
      console.log("✅ Step 4: Skipped (answers match)");
      console.log("📊 Step 5: Quality assessment...");
      const qualityResult = await withRetry(
        () => performQualityCheck(question),
        { question_id, operation: "Quality Check" }
      );
      validationResult.quality_checks = qualityResult;
      validationResult.checks_passed++;

      // Add quality flags if any
      if (qualityResult.issues.length > 0) {
        const qualityFlags = extractQualityFlags(qualityResult);
        validationResult.flags.push(...qualityFlags);
        validationResult.comments.push(
          ...qualityResult.issues.map((issue) => ({
            flag: determineQualityFlag(issue),
            severity: FLAG_SEVERITY[determineQualityFlag(issue)],
            message: issue,
          }))
        );
      }
    } else {
      // Answers don't match - deep verification needed
      console.log("⚠️ Step 4: Deep verification (answers don't match)...");
      const verification = await withRetry(
        () => performDeepVerification(question, aiSolution, storedAnswer),
        { question_id, operation: "Deep Verification" }
      );
      validationResult.answer_verification = verification;
      validationResult.checks_passed++;

      // Step 4b: Re-verify if something is marked as wrong (double-check to prevent false positives)
      if (verification.final_verdict === "stored_answer_wrong" ||
          verification.final_verdict === "both_wrong" ||
          verification.final_verdict === "multiple_correct") {
        console.log("🔍 Step 4b: Re-verification (double-checking wrong answer verdict)...");
        statistics.needed_re_verification = true;
        statistics.initial_verdict = verification.final_verdict;

        const reVerification = await withRetry(
          () => performReVerification(question, aiSolution, storedAnswer, verification),
          { question_id, operation: "Re-Verification" }
        );

        // Track if re-verification changed the verdict
        statistics.re_verification_changed_verdict =
          reVerification.confirmed_verdict !== verification.final_verdict;
        statistics.final_verdict = reVerification.confirmed_verdict;

        if (statistics.re_verification_changed_verdict) {
          console.log(`🔄 Re-verification changed verdict: ${statistics.initial_verdict} → ${statistics.final_verdict}`);
        }

        // Update verification with re-verification results
        validationResult.answer_verification = {
          ...verification,
          re_verification: reVerification,
          final_verdict: reVerification.confirmed_verdict,
          explanation: reVerification.final_explanation,
        };
        validationResult.checks_passed++;
      } else {
        // No re-verification needed, track final verdict
        statistics.final_verdict = verification.final_verdict;
      }

      // Add flags based on verification result
      const finalVerdict = validationResult.answer_verification.final_verdict;

      if (finalVerdict === "stored_answer_wrong") {
        validationResult.flags.push("incorrect_answer");
        validationResult.comments.push({
          flag: "incorrect_answer",
          severity: "high",
          message: `Stored answer '${storedAnswer}' is incorrect. ${validationResult.answer_verification.explanation}`,
        });
      } else if (finalVerdict === "both_wrong") {
        validationResult.flags.push("no_correct_answer");
        validationResult.comments.push({
          flag: "no_correct_answer",
          severity: "high",
          message: validationResult.answer_verification.explanation,
        });
      } else if (finalVerdict === "ai_answer_wrong") {
        // AI got it wrong, but stored answer is correct
        validationResult.flags.push("ai_verified_correct");
        validationResult.comments.push({
          flag: "ai_verified_correct",
          severity: "success",
          message: `Stored answer '${storedAnswer}' verified correct through deep verification. AI initially answered '${aiSolution.answer}' but verification confirmed the stored answer is correct.`,
        });
      } else if (finalVerdict === "multiple_correct") {
        validationResult.flags.push("options_not_distinct");
        validationResult.comments.push({
          flag: "options_not_distinct",
          severity: "high",
          message: `Multiple correct answers detected. ${validationResult.answer_verification.explanation}`,
        });
      }

      // STEP 5: Quality Check
      console.log("📊 Step 5: Quality assessment...");
      const qualityResult = await withRetry(
        () => performQualityCheck(question),
        { question_id, operation: "Quality Check" }
      );
      validationResult.quality_checks = qualityResult;
      validationResult.checks_passed++;

      // Add quality flags
      if (qualityResult.issues.length > 0) {
        const qualityFlags = extractQualityFlags(qualityResult);
        validationResult.flags.push(...qualityFlags);
        validationResult.comments.push(
          ...qualityResult.issues.map((issue) => ({
            flag: determineQualityFlag(issue),
            severity: FLAG_SEVERITY[determineQualityFlag(issue)],
            message: issue,
          }))
        );
      }
    }

    validationResult.status = "completed";
    validationResult.statistics = statistics;

    // Log statistics summary
    console.log("📊 Validation Statistics:");
    console.log(`   Immediate Match: ${statistics.immediate_match ? '✅' : '❌'}`);
    console.log(`   Needed Deep Verification: ${statistics.needed_deep_verification ? '✅' : '❌'}`);
    console.log(`   Needed Re-verification: ${statistics.needed_re_verification ? '✅' : '❌'}`);
    if (statistics.needed_re_verification) {
      console.log(`   Re-verification Changed Verdict: ${statistics.re_verification_changed_verdict ? '✅ YES' : '❌ NO'}`);
      if (statistics.re_verification_changed_verdict) {
        console.log(`   Verdict Changed: ${statistics.initial_verdict} → ${statistics.final_verdict}`);
      }
    }

    // Update question with validation result
    console.log("💾 Updating question validation in database...");
    await updateQuestionValidation(supabase, question_id, validationResult);

    console.log(
      `✅ Validation complete for question ${question_id}: ${validationResult.flags.join(", ")}`
    );

    const responseData = { success: true, validation: validationResult };
    console.log("📤 Returning success response");

    return new Response(
      JSON.stringify(responseData),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("❌ Validation error:", error);
    console.error("❌ Error stack:", error.stack);

    const errorResponse = { success: false, error: error.message || String(error) };
    console.log("📤 Returning error response:", errorResponse);

    return new Response(
      JSON.stringify(errorResponse),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});

/**
 * Step 1: Technical validation using Haiku
 */
async function performTechnicalValidation(question: Question) {
  const issues: string[] = [];

  // Check JSON structure
  try {
    if (typeof question.question_data === "string") {
      JSON.parse(question.question_data);
    }
  } catch {
    issues.push("Malformed JSON in question_data");
  }

  try {
    if (typeof question.answers === "string") {
      JSON.parse(question.answers);
    }
  } catch {
    issues.push("Malformed JSON in answers");
  }

  const questionData =
    typeof question.question_data === "string"
      ? JSON.parse(question.question_data)
      : question.question_data;
  const answers =
    typeof question.answers === "string"
      ? JSON.parse(question.answers)
      : question.answers;

  // Skip validation for PDF questions (they have different structure)
  if (question.question_type === "pdf") {
    return { passed: true, issues: [] };
  }

  // Check required fields
  if (!questionData.question_text) {
    issues.push("Missing question_text");
  }

  // Only check for options if NOT open_ended
  if (question.question_type !== "open_ended" && !questionData.options) {
    issues.push("Missing options");
  }

  if (!answers.correct_answer) {
    issues.push("Missing correct_answer");
  }

  // Check image consistency
  if (questionData.has_image && !questionData.image_url) {
    issues.push("has_image is true but image_url is missing");
  }

  // Validate LaTeX if present
  if (questionData.question_text?.includes("$")) {
    const latexIssues = validateLaTeX(questionData.question_text);
    issues.push(...latexIssues);
  }

  // Check options
  if (questionData.options) {
    Object.values(questionData.options).forEach((option: any) => {
      if (typeof option === "string" && option.includes("$")) {
        const latexIssues = validateLaTeX(option);
        issues.push(...latexIssues);
      }
    });
  }

  return {
    passed: issues.length === 0,
    issues,
  };
}

/**
 * Validate LaTeX syntax
 */
function validateLaTeX(text: string): string[] {
  const issues: string[] = [];

  // Check for unmatched $ signs
  const dollarSigns = (text.match(/\$/g) || []).length;
  if (dollarSigns % 2 !== 0) {
    issues.push("Unmatched $ signs in LaTeX");
  }

  // Check for unmatched braces
  const openBraces = (text.match(/\\{/g) || []).length;
  const closeBraces = (text.match(/\\}/g) || []).length;
  if (openBraces !== closeBraces) {
    issues.push("Unmatched braces in LaTeX");
  }

  return issues;
}

/**
 * Step 1.5: Check translation consistency between Italian and English versions
 */
async function performTranslationCheck(question: Question) {
  const questionData =
    typeof question.question_data === "string"
      ? JSON.parse(question.question_data)
      : question.question_data;

  // Skip if no English version
  if (!questionData.question_text_eng) {
    return { has_mismatch: false, mismatch_details: "" };
  }

  const prompt = `You are verifying translation consistency between Italian and English versions of an exam question.

ITALIAN VERSION:
Question: ${questionData.question_text}

Options:
${questionData.options ? Object.entries(questionData.options)
  .map(([key, value]) => `${key}) ${value}`)
  .join("\n") : "N/A"}

ENGLISH VERSION:
Question: ${questionData.question_text_eng}

Options:
${questionData.options_eng ? Object.entries(questionData.options_eng)
  .map(([key, value]) => `${key}) ${value}`)
  .join("\n") : "N/A"}

CRITICAL: The Italian version is AUTHORITATIVE. Check if the English translation accurately conveys the same meaning as the Italian original.

Look for:
- Meaning changes that could affect the answer
- Missing or added information in translation
- Nuanced differences that alter the question's difficulty or interpretation
- Option translations that don't match the Italian meaning

IMPORTANT: Respond with ONLY a JSON object, no additional text before or after.

Respond in this exact JSON format:
{
  "has_mismatch": true | false,
  "mismatch_type": "question" | "options" | "both" | null,
  "mismatch_details": "Detailed explanation of the mismatch, or empty string if no mismatch"
}`;

  const response = await callAnthropic(
    [{ role: "user", content: prompt }],
    "sonnet",
    2048
  );

  const result = parseAIJSON<{
    has_mismatch: boolean;
    mismatch_type: string | null;
    mismatch_details: string;
  }>(response.content);

  return result;
}

/**
 * Step 2: AI solves the question without seeing the answer
 */
async function performBlindSolve(question: Question) {
  const questionData =
    typeof question.question_data === "string"
      ? JSON.parse(question.question_data)
      : question.question_data;

  // Determine if this is a verbal reasoning question
  const verbalReasoningContext =
    question.section === "Comprensione Verbale" ||
    question.test_type === "BOCCONI" ||
    questionData.question_text?.toLowerCase().includes("coerente") ||
    questionData.question_text?.toLowerCase().includes("sostenuto") ||
    questionData.question_text?.toLowerCase().includes("contrario") ||
    questionData.question_text?.toLowerCase().includes("presuppone") ||
    questionData.question_text?.toLowerCase().includes("deducibile") ||
    questionData.question_text?.toLowerCase().includes("struttura logica");

  const prompt = `You are a test-taking expert. Solve this ${question.test_type} exam question.

Question: ${questionData.question_text}

Options:
${Object.entries(questionData.options)
  .map(([key, value]) => `${key}) ${value}`)
  .join("\n")}

${questionData.passage_text ? `Context/Passage:\n${questionData.passage_text}\n` : ""}

${verbalReasoningContext ? `
CRITICAL: For Italian Verbal Reasoning questions, understand these key terms:
- "coerente con il testo" = COHERENT/CONSISTENT/COMPATIBLE with the text (does NOT require explicit proof)
- "sostenuta dal testo" / "avallata dal testo" = SUPPORTED/ENDORSED by the text (requires explicit evidence)
- "contrario al testo" / "in contraddizione" = CONTRARY to the text (contradicts the text)
- "si può dedurre" / "deducibile" = CAN BE DEDUCED from the text (logical inference allowed)
- "presuppone che" = PRESUPPOSES that (the unstated FOUNDATIONAL ASSUMPTION the argument RELIES ON, not a consequence or stated fact)
- "stessa struttura logica" = same LOGICAL FORM (match the reasoning PATTERN, not surface keywords)

Key clarifications:
1. "coerente" = logically compatible/consistent (even if not explicitly stated)
2. For "presuppone" questions: Find what MUST BE TRUE (unstated) for the argument to work
3. For "struttura logica" questions: Identify the FORM of reasoning (If P→Q, P, ∴Q) and match the pattern exactly, not just surface similarity

Example: If text says "books have irreplaceable qualities," then "digital won't completely replace books" is COERENTE (coherent), even though not explicitly stated.
` : ""}

${questionData.question_text ? `IMPORTANT: Provide your "reasoning" field in ITALIAN (the question is in Italian).` : `IMPORTANT: Provide your "reasoning" field in ENGLISH (the question is in English).`}

CRITICAL SELF-VERIFICATION:
Before stating your final answer, VERIFY it matches your reasoning:
1. Review your calculations/logic in the reasoning
2. Check which answer (a/b/c/d/e) your work points to
3. If your calculations show answer X but you're about to state answer Y, STOP and recalculate
4. Your final "answer" field MUST match what your "reasoning" concludes

Common mistakes to avoid:
- Calculating correctly but selecting wrong letter
- Reasoning leads to option C but stating option B
- Getting confused between what you calculated vs what options say

Respond with ONLY a JSON object, no additional text before or after. Do your thinking inside the "reasoning" field.

Provide your answer in this exact JSON format:
{
  "answer": "a" | "b" | "c" | "d" | "e",
  "reasoning": "Detailed step-by-step explanation of why this is correct",
  "confidence": 0.0 to 1.0
}`;

  const response = await callAnthropic(
    [{ role: "user", content: prompt }],
    "sonnet",
    2048
  );

  return parseAIJSON<{
    answer: string;
    reasoning: string;
    confidence: number;
  }>(response.content);
}

/**
 * Step 4: Deep verification when answers don't match
 */
async function performDeepVerification(
  question: Question,
  aiSolution: any,
  storedAnswer: string
) {
  const questionData =
    typeof question.question_data === "string"
      ? JSON.parse(question.question_data)
      : question.question_data;

  const prompt = `You are validating a test question's answer key. Two different answers have been proposed for this question, and you need to determine which is correct through a systematic verification process.

Question: ${questionData.question_text}

${questionData.question_text_eng ? `English Question: ${questionData.question_text_eng}\n` : ""}

Options:
${Object.entries(questionData.options)
  .map(([key, value]) => `${key}) ${value}`)
  .join("\n")}

${questionData.passage_text ? `Context/Passage:\n${questionData.passage_text}\n` : ""}
${questionData.passage_text_eng ? `English Passage:\n${questionData.passage_text_eng}\n` : ""}

AI's Answer: ${aiSolution.answer}
AI's Reasoning: ${aiSolution.reasoning}

Stored Answer in Database: ${storedAnswer}

VERIFICATION PROCESS (follow these steps in order):

STEP 1: Solve the problem independently from scratch
- Work through the problem completely from the beginning
- Show all your calculations and reasoning
- Arrive at what you believe is the correct answer based on first principles
- Do NOT look at either proposed answer yet - solve it fresh
- CRITICAL: Before finalizing step1_your_answer, verify it matches your calculations in step1_independent_solve

STEP 2: Test the AI's answer ("${aiSolution.answer}")
- Take the AI's proposed answer and plug it back into the problem
- Does it satisfy all the question requirements?
- Show specifically why it works or doesn't work
- Verify calculations if it's a math problem

STEP 3: Test the stored answer ("${storedAnswer}")
- Take the stored answer and plug it back into the problem
- Does it satisfy all the question requirements?
- Show specifically why it works or doesn't work
- Verify calculations if it's a math problem

STEP 4: Make final determination
- Compare all results from steps 1, 2, and 3
- Determine which answer(s) are actually correct
- Choose the appropriate verdict

IMPORTANT CONTEXT:
- For Italian math problems, "soluzioni" (solutions) typically means REAL solutions ONLY, not complex solutions, unless explicitly stated otherwise
- For Italian Verbal Reasoning questions, understand these key terms:
  * "coerente con il testo" = COHERENT/CONSISTENT/COMPATIBLE with the text (does NOT require explicit proof, just logical compatibility)
  * "sostenuta dal testo" / "avallata dal testo" = SUPPORTED/ENDORSED by the text (requires explicit evidence)
  * "contrario al testo" / "in contraddizione" = CONTRARY to the text (contradicts the text)
  * "presuppone che" = PRESUPPOSES that (the unstated FOUNDATIONAL ASSUMPTION needed for the argument to work)
  * "stessa struttura logica" = same LOGICAL FORM (match the reasoning pattern: If P→Q, P, ∴Q)
  * "deducibile dal testo" = CAN BE DEDUCED from the text (logical inference allowed)
  * If a statement is "coerente," it means it's logically consistent with what's stated, even if not explicitly proven
  * For "presuppone" questions: Find what MUST BE TRUE (unstated) for the argument to work, not consequences
  * For "struttura logica" questions: Match the FORM of reasoning, not surface similarity
- In physics/chemistry, consider practical constraints (e.g., water evaporation in cooking, physical impossibilities)
- Some exam questions may have flaws - if neither answer works, say so
- If both answers work, flag it as multiple correct answers

${questionData.question_text ? `IMPORTANT: Provide ALL analysis fields in ITALIAN (the question is in Italian). This includes step1_independent_solve, step2_test_ai, step3_test_stored, step4_final_analysis, and explanation.` : `IMPORTANT: Provide ALL analysis fields in ENGLISH (the question is in English).`}

Respond with ONLY a JSON object, no additional text before or after. Do all your step-by-step analysis inside the "step1_independent_solve", "step2_test_ai", "step3_test_stored", and "step4_final_analysis" fields.

Respond in this exact JSON format:
{
  "step1_independent_solve": "Your complete work solving the problem from scratch",
  "step1_your_answer": "The answer you arrived at independently (a/b/c/d/e)",
  "step2_test_ai": "Analysis of whether the AI's answer works when tested",
  "step2_ai_works": true | false,
  "step3_test_stored": "Analysis of whether the stored answer works when tested",
  "step3_stored_works": true | false,
  "step4_final_analysis": "Final comparison and determination",
  "final_verdict": "correct" | "stored_answer_wrong" | "ai_answer_wrong" | "both_wrong" | "multiple_correct" | "inconclusive",
  "correct_should_be": "a" | "b" | "c" | "d" | "e" | null,
  "explanation": "Summary of the verification process and conclusion"
}`;

  const response = await callAnthropic(
    [{ role: "user", content: prompt }],
    "sonnet",
    4096  // Increased token limit for detailed step-by-step analysis
  );

  const result = parseAIJSON<{
    step1_independent_solve: string;
    step1_your_answer: string;
    step2_test_ai: string;
    step2_ai_works: boolean;
    step3_test_stored: string;
    step3_stored_works: boolean;
    step4_final_analysis: string;
    final_verdict: string;
    correct_should_be: string | null;
    explanation: string;
  }>(response.content);

  return {
    matches_stored: result.final_verdict === "correct",
    final_verdict: result.final_verdict as any,
    correct_should_be: result.correct_should_be,
    explanation: result.explanation,
    // Include detailed verification steps for debugging/transparency
    verification_steps: {
      step1_independent_solve: result.step1_independent_solve,
      step1_your_answer: result.step1_your_answer,
      step2_test_ai: result.step2_test_ai,
      step2_ai_works: result.step2_ai_works,
      step3_test_stored: result.step3_test_stored,
      step3_stored_works: result.step3_stored_works,
      step4_final_analysis: result.step4_final_analysis,
    },
  };
}

/**
 * Step 4b: Re-verification - Double-check when answer is marked as wrong
 */
async function performReVerification(
  question: Question,
  aiSolution: any,
  storedAnswer: string,
  initialVerification: any
) {
  const questionData =
    typeof question.question_data === "string"
      ? JSON.parse(question.question_data)
      : question.question_data;

  const prompt = `You are performing a FINAL RE-VERIFICATION of a question where an answer was marked as wrong. This is a critical double-check to prevent false positives.

Question: ${questionData.question_text}

${questionData.question_text_eng ? `English Question: ${questionData.question_text_eng}\n` : ""}

Options:
${Object.entries(questionData.options)
  .map(([key, value]) => `${key}) ${value}`)
  .join("\n")}

${questionData.passage_text ? `Context/Passage:\n${questionData.passage_text}\n` : ""}
${questionData.passage_text_eng ? `English Passage:\n${questionData.passage_text_eng}\n` : ""}

AI's Answer: ${aiSolution.answer}
AI's Reasoning: ${aiSolution.reasoning}

Stored Answer in Database: ${storedAnswer}

INITIAL VERIFICATION RESULT: ${initialVerification.final_verdict}

INITIAL VERIFICATION ANALYSIS:
Step 1 (Independent Solve): ${initialVerification.verification_steps.step1_independent_solve}
Independent Answer: ${initialVerification.verification_steps.step1_your_answer}

Step 2 (Test AI's answer "${aiSolution.answer}"): ${initialVerification.verification_steps.step2_test_ai}
AI Answer Works: ${initialVerification.verification_steps.step2_ai_works}

Step 3 (Test stored answer "${storedAnswer}"): ${initialVerification.verification_steps.step3_test_stored}
Stored Answer Works: ${initialVerification.verification_steps.step3_stored_works}

Step 4 (Final Analysis): ${initialVerification.verification_steps.step4_final_analysis}

YOUR TASK:
Review the entire analysis above and confirm whether the verdict "${initialVerification.final_verdict}" is correct.

CRITICAL REMINDERS:
- For Italian math problems, "soluzioni" means REAL solutions only (not complex)
- For Italian Verbal Reasoning:
  * "coerente con il testo" = COHERENT/COMPATIBLE (NOT explicitly proven, just logically consistent)
  * "sostenuto/avallata dal testo" = SUPPORTED/ENDORSED (requires explicit evidence)
  * "presuppone che" = PRESUPPOSES (unstated foundational assumption needed for argument)
  * "stessa struttura logica" = same LOGICAL FORM (match reasoning pattern, not surface words)
- Physical/chemical problems should consider practical constraints (evaporation, etc.)
- Sometimes both the AI and stored answer can be wrong - check thoroughly
- If the initial verification made an error, correct it now

${questionData.question_text ? `IMPORTANT: Provide re_analysis and final_explanation in ITALIAN (the question is in Italian).` : `IMPORTANT: Provide re_analysis and final_explanation in ENGLISH (the question is in English).`}

Respond in this exact JSON format:
{
  "confirmed_verdict": "correct" | "stored_answer_wrong" | "ai_answer_wrong" | "both_wrong" | "multiple_correct",
  "agreement_with_initial": true | false,
  "re_analysis": "Your fresh analysis after reviewing everything",
  "confidence": 0.0 to 1.0,
  "final_explanation": "Final explanation confirming or correcting the initial verdict"
}`;

  const response = await callAnthropic(
    [{ role: "user", content: prompt }],
    "sonnet",
    3072
  );

  const result = parseAIJSON<{
    confirmed_verdict: string;
    agreement_with_initial: boolean;
    re_analysis: string;
    confidence: number;
    final_explanation: string;
  }>(response.content);

  return result;
}

/**
 * Step 5: Quality assessment
 */
async function performQualityCheck(question: Question) {
  const questionData =
    typeof question.question_data === "string"
      ? JSON.parse(question.question_data)
      : question.question_data;

  const prompt = `Assess ONLY CRITICAL quality issues in this exam question.

CRITICAL ISSUES ONLY (flag these):
- Question is IMPOSSIBLE to answer (missing essential information)
- Options that appear TRUNCATED or cut off mid-sentence (e.g., ends with "di 100" without completing the thought)
- Wrong units of measurement that make the question nonsensical (e.g., gravity in kg/m³ instead of m/s²)
- Italian translation is MISSING critical content that exists in English (passages, context, bullet points)
- Italian question text is significantly shorter than English when it shouldn't be
- Obvious typos that change meaning (NOT minor punctuation)
- Multiple correct answers exist
- No correct answer exists
- Severe grammatical errors that make question incomprehensible

DO NOT FLAG (these are acceptable):
- Minor stylistic variations ("sempre" vs "costantemente" is fine)
- Questions that reference passages/images (this is normal for exams)
- Options that are similar but test understanding (having multiple "2^x" options tests comprehension)
- Options with similar formats (e.g., √2, 2√3, 3√2 - these are distinct values)
- Minor punctuation or formatting preferences
- Synonym usage or slight wording variations
- Gender agreement errors that don't affect comprehension

IMPORTANT FOR "OPTIONS NOT DISTINCT":
Only flag this if two or more options are MATHEMATICALLY EQUIVALENT (e.g., "1/2" and "0.5") or SEMANTICALLY INDISTINGUISHABLE (exact same meaning). Having multiple similar-looking options is normal test design to test comprehension. For example:
- Multiple powers of 2 (2, 4, 8, 16) - ACCEPTABLE, tests understanding
- Multiple square roots (√2, √3, √5) - ACCEPTABLE, these are distinct values
- Two options both saying "1/2" - FLAG THIS, truly not distinct
- Similar wording that means different things - ACCEPTABLE

CRITICAL CHECK FOR MISSING ITALIAN CONTENT:
1. Count bullet points: If English passage has 5+ bullet points and Italian has 0, FLAG immediately as "Italian translation missing critical bullet points"
2. Compare lengths: If English passage is 3x longer than Italian equivalent (character count), FLAG as "Italian translation missing critical content - significantly shorter"
3. Look for structural mismatch: If English has detailed context/passage but Italian only has bare question, FLAG

Italian Question: ${questionData.question_text || 'MISSING'}

Italian Options:
${questionData.options ? Object.entries(questionData.options)
  .map(([key, value]) => `${key}) ${value}`)
  .join("\n") : 'MISSING'}

${questionData.passage_text ? `Italian Passage/Context:\n${questionData.passage_text}\n` : "NO ITALIAN PASSAGE"}

English Question: ${questionData.question_text_eng || 'MISSING'}

${questionData.passage_text_eng ? `English Passage/Context:\n${questionData.passage_text_eng}\n` : "NO ENGLISH PASSAGE"}

IMPORTANT: Only report issues that would prevent a student from answering correctly. Minor style issues should be ignored.

${questionData.question_text ? `IMPORTANT: Provide issues in ITALIAN (the question is in Italian).` : `IMPORTANT: Provide issues in ENGLISH (the question is in English).`}

Respond with ONLY a JSON object, no additional text before or after.

Respond in this exact JSON format:
{
  "clarity_score": 0.0 to 1.0,
  "issues": ["issue 1", "issue 2", ...]
}`;

  const response = await callAnthropic(
    [{ role: "user", content: prompt }],
    "sonnet",
    2048
  );

  return parseAIJSON<{
    clarity_score: number;
    issues: string[];
  }>(response.content);
}

/**
 * Parse stored answer from answers JSON
 */
function parseStoredAnswer(answers: any): string {
  const answersObj = typeof answers === "string" ? JSON.parse(answers) : answers;
  return answersObj.correct_answer;
}

/**
 * Update question with validation result
 */
async function updateQuestionValidation(
  supabase: any,
  questionId: string,
  validation: AIValidationResult
) {
  const { error } = await supabase
    .from("2V_questions")
    .update({ ai_validation: validation })
    .eq("id", questionId);

  if (error) {
    console.error("Failed to update question validation:", error);
    throw error;
  }
}

/**
 * Extract flags from technical validation
 */
function extractFlagsFromTechnical(technical: any): ValidationFlag[] {
  const flags: ValidationFlag[] = [];

  technical.issues.forEach((issue: string) => {
    if (issue.includes("Malformed JSON")) flags.push("technical_malformed_json");
    if (issue.includes("image")) flags.push("technical_missing_image");
    if (issue.includes("Missing")) flags.push("technical_missing_fields");
    if (issue.includes("LaTeX")) flags.push("technical_invalid_latex");
  });

  return flags;
}

/**
 * Determine technical flag from issue text
 */
function determineTechnicalFlag(issue: string): ValidationFlag {
  if (issue.includes("Malformed JSON")) return "technical_malformed_json";
  if (issue.includes("image")) return "technical_missing_image";
  if (issue.includes("LaTeX")) return "technical_invalid_latex";
  return "technical_missing_fields";
}

/**
 * Extract quality flags (CRITICAL issues only)
 */
function extractQualityFlags(quality: any): ValidationFlag[] {
  const flags: ValidationFlag[] = [];

  quality.issues.forEach((issue: string) => {
    const lowerIssue = issue.toLowerCase();

    // Only flag critical typos (ones that change meaning)
    if ((lowerIssue.includes("typo") || lowerIssue.includes("spelling")) &&
        lowerIssue.includes("change")) {
      flags.push("typo_detected");
    }

    // Only flag if question is truly incomprehensible
    if (lowerIssue.includes("impossible") || lowerIssue.includes("incomprehensible")) {
      flags.push("unclear_question");
    }

    // Only flag critical translation mismatches (not minor variations)
    if (lowerIssue.includes("translation") && lowerIssue.includes("wrong")) {
      flags.push("translation_mismatch");
    }

    // Only flag if multiple correct answers or no correct answer
    if (lowerIssue.includes("multiple correct") || lowerIssue.includes("no correct")) {
      flags.push("options_not_distinct");
    }
  });

  return flags;
}

/**
 * Determine quality flag from issue text
 */
function determineQualityFlag(issue: string): ValidationFlag {
  const lowerIssue = issue.toLowerCase();
  if (lowerIssue.includes("typo") || lowerIssue.includes("spelling"))
    return "typo_detected";
  if (lowerIssue.includes("unclear") || lowerIssue.includes("ambiguous"))
    return "unclear_question";
  if (lowerIssue.includes("format")) return "formatting_issue";
  if (lowerIssue.includes("translation")) return "translation_mismatch";
  if (lowerIssue.includes("distinct") || lowerIssue.includes("similar"))
    return "options_not_distinct";
  return "formatting_issue";
}
