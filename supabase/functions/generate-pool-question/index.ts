// Supabase Edge Function: generate-pool-question
// Generates AI questions for the infinite practice pool
// Uses few-shot examples + topic-based dedup + optional graph descriptions

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";
import { callAnthropic, parseAIJSON } from "../_shared/anthropic.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface GenerateRequest {
  test_type: string;
  section: string;
  exclude_topics?: string[];
}

interface GraphElement {
  kind: "point" | "segment" | "polygon" | "circle" | "label";
  [key: string]: any;
}

interface GraphDescription {
  type: "function" | "geometry";
  functions?: string[];
  elements?: GraphElement[];
  x_range: [number, number];
  y_range: [number, number];
  show_grid?: boolean;
  show_axes?: boolean;
}

interface GeneratedQuestionData {
  question_text: string;
  question_text_eng?: string;
  options: Record<string, string>;
  options_eng?: Record<string, string>;
  has_image: boolean;
  graph_description?: GraphDescription;
}

interface GeneratedAnswers {
  correct_answer: string;
  wrong_answers: string[];
}

interface GeneratedQuestion {
  topic: string;
  reasoning: string;
  question_data: GeneratedQuestionData;
  answers: GeneratedAnswers;
  explanation: string;
}

// Cost per token (Sonnet generation only)
const SONNET_INPUT_COST_PER_MILLION = 3;
const SONNET_OUTPUT_COST_PER_MILLION = 15;

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  const t0 = Date.now();

  try {
    const { test_type, section, exclude_topics }: GenerateRequest = await req.json();

    if (!test_type || !section) {
      throw new Error("Missing test_type or section");
    }

    console.log(`[PoolEdge] ========== START ==========`);
    console.log(`[PoolEdge] request: test_type=${test_type} section=${section} exclude_topics=${exclude_topics?.length || 0}`);

    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

    if (!supabaseUrl || !supabaseKey) {
      throw new Error("Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY");
    }

    const supabase = createClient(supabaseUrl, supabaseKey);

    // Step 1: Fetch 20 random few-shot examples + graph % from all 2V
    const t1 = Date.now();
    const { examples, graphPct } = await fetchExamples(supabase, test_type, section);
    if (examples.length < 3) {
      throw new Error(
        `Not enough examples for ${test_type}/${section}. Found ${examples.length}, need at least 3.`
      );
    }
    console.log(`[PoolEdge] step1 fetchExamples: ${examples.length} examples, graphPct=${graphPct}% in ${Date.now() - t1}ms`);

    // Step 2: Fetch recently generated topics + texts for dedup
    const t2 = Date.now();
    const recentInfo = await fetchRecentInfo(supabase, section);
    // Merge caller-provided exclude_topics (for batch dedup) with DB-fetched topics
    if (exclude_topics?.length) {
      recentInfo.topics.push(...exclude_topics);
    }
    console.log(`[PoolEdge] step2 fetchRecentInfo: ${recentInfo.topics.length} topics, ${recentInfo.texts.length} texts in ${Date.now() - t2}ms`);
    console.log(`[PoolEdge] step2 topics: [${recentInfo.topics.join(", ")}]`);

    // Step 3: Generate question with Sonnet
    const t3 = Date.now();
    console.log(`[PoolEdge] step3 generateQuestion: calling Sonnet...`);
    let { question, genUsage } = await generateQuestion(
      examples,
      test_type,
      section,
      recentInfo,
      graphPct
    );
    console.log(`[PoolEdge] step3 generateQuestion: done in ${Date.now() - t3}ms | topic="${question.topic}" tokens_in=${genUsage.input_tokens} tokens_out=${genUsage.output_tokens}`);

    // Shuffle options to fix LLM bias (models overwhelmingly put correct answer at "c")
    const originalCorrect = question.answers.correct_answer;
    question = shuffleOptions(question);
    console.log(`[PoolEdge] step3 shuffle: correct ${originalCorrect} → ${question.answers.correct_answer}`);

    // Step 4: Calculate cost
    const totalCost =
      (genUsage.input_tokens * SONNET_INPUT_COST_PER_MILLION +
        genUsage.output_tokens * SONNET_OUTPUT_COST_PER_MILLION) /
      1_000_000;
    console.log(`[PoolEdge] step4 cost: $${totalCost.toFixed(6)}`);

    // Step 5: Build question_data for DB
    const questionData: Record<string, any> = {
      question_text: question.question_data.question_text,
      options: question.question_data.options,
      explanation: question.explanation,
      topic: question.topic,
      has_image: question.question_data.has_image,
    };
    if (question.question_data.question_text_eng) {
      questionData.question_text_eng = question.question_data.question_text_eng;
    }
    if (question.question_data.options_eng) {
      questionData.options_eng = question.question_data.options_eng;
    }
    if (question.question_data.graph_description) {
      questionData.graph_description = question.question_data.graph_description;
    }
    if (question.reasoning) {
      questionData.reasoning = question.reasoning;
    }

    const reviewStatus = "pending";
    console.log(`[PoolEdge] step5 review_status=${reviewStatus}`);

    const t6 = Date.now();
    const { data: saved, error: saveError } = await supabase
      .from("ai_pool_questions")
      .insert({
        test_type,
        section,
        question_data: questionData,
        answers: question.answers,
        source: "ai_generated",
        generation_model: "sonnet",
        generation_cost_usd: totalCost,
        review_status: reviewStatus,
        is_active: true,
      })
      .select()
      .single();

    if (saveError) {
      throw new Error(`Failed to save question: ${saveError.message}`);
    }

    const totalTime = Date.now() - t0;
    console.log(`[PoolEdge] step5 saved: id=${saved.id} in ${Date.now() - t6}ms`);
    console.log(`[PoolEdge] ========== DONE in ${totalTime}ms | id=${saved.id} topic="${question.topic}" status=${reviewStatus} cost=$${totalCost.toFixed(6)} ==========`);

    return new Response(
      JSON.stringify({
        success: true,
        question: saved,
        cost_usd: totalCost,
        topic: question.topic,
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    const totalTime = Date.now() - t0;
    console.error(`[PoolEdge] ========== ERROR after ${totalTime}ms: ${error.message} ==========`);
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});

// Fetch 20 random examples from 2V_questions + approved ai_pool_questions
async function fetchExamples(
  supabase: any,
  testType: string,
  section: string
) {
  // Fetch from 2V_questions (multiple_choice only, same test_type and section)
  const t0 = Date.now();
  const { data: dbQuestions, error: dbErr } = await supabase
    .from("2V_questions")
    .select("id, question_data, answers")
    .eq("test_type", testType)
    .eq("question_type", "multiple_choice")
    .eq("section", section)
    .eq("is_active", true)
    .not("question_data", "is", null);

  if (dbErr) {
    console.error("[PoolEdge] fetchExamples: error fetching 2V_questions:", dbErr.message);
  }
  console.log(`[PoolEdge] fetchExamples: 2V_questions=${(dbQuestions || []).length} in ${Date.now() - t0}ms`);

  // Also fetch questions shared via additional_test_ids
  const t1 = Date.now();
  const { data: testsData } = await supabase
    .from("2V_tests")
    .select("id")
    .eq("test_type", testType);

  const testIds = (testsData || []).map((t: any) => t.id);
  let sharedQuestions: any[] = [];
  const relatedTestTypes = new Set<string>([testType]);
  if (testIds.length > 0) {
    const orFilter = testIds
      .map((id: string) => `additional_test_ids.cs.["${id}"]`)
      .join(",");
    const { data: shared } = await supabase
      .from("2V_questions")
      .select("id, question_data, answers, test_type")
      .eq("question_type", "multiple_choice")
      .eq("section", section)
      .eq("is_active", true)
      .neq("test_type", testType)
      .not("question_data", "is", null)
      .or(orFilter);
    sharedQuestions = shared || [];
    sharedQuestions.forEach((q: any) => {
      if (q.test_type) relatedTestTypes.add(q.test_type);
    });
  }
  console.log(`[PoolEdge] fetchExamples: shared=${sharedQuestions.length} relatedTestTypes=[${[...relatedTestTypes].join(", ")}] in ${Date.now() - t1}ms`);

  // Filter to only questions with actual question_text and options, dedup by id
  const seenIds = new Set<string>();
  const allDbQuestions = [...(dbQuestions || []), ...sharedQuestions];
  const validDbQuestions = allDbQuestions.filter((q: any) => {
    if (q.id && seenIds.has(q.id)) return false;
    if (q.id) seenIds.add(q.id);
    const qd =
      typeof q.question_data === "string"
        ? JSON.parse(q.question_data)
        : q.question_data;
    return qd?.question_text && qd?.options;
  });
  console.log(`[PoolEdge] fetchExamples: valid 2V after dedup=${validDbQuestions.length} (filtered ${allDbQuestions.length - validDbQuestions.length})`);

  // Fetch from approved ai_pool_questions (including related test_types)
  const t2 = Date.now();
  const { data: aiQuestions, error: aiErr } = await supabase
    .from("ai_pool_questions")
    .select("question_data, answers")
    .in("test_type", [...relatedTestTypes])
    .eq("section", section)
    .eq("review_status", "approved")
    .eq("is_active", true);

  if (aiErr) {
    console.error("[PoolEdge] fetchExamples: error fetching ai_pool_questions:", aiErr.message);
  }
  console.log(`[PoolEdge] fetchExamples: approved AI=${(aiQuestions || []).length} in ${Date.now() - t2}ms`);

  // Calculate graph percentage from ALL 2V questions in the section
  const parsed2v = validDbQuestions.map((q: any) => {
    const qd = typeof q.question_data === "string" ? JSON.parse(q.question_data) : q.question_data;
    return qd;
  });
  const graphCount2v = parsed2v.filter((qd: any) =>
    qd.has_image ||
    qd.graph_description ||
    qd.image_url ||
    /grafico|figura|immagine/i.test(qd.question_text || "")
  ).length;
  const graphPct = validDbQuestions.length > 0
    ? Math.round((graphCount2v / validDbQuestions.length) * 100)
    : 0;
  console.log(`[PoolEdge] fetchExamples: graph questions=${graphCount2v}/${validDbQuestions.length} (${graphPct}%) from ALL 2V`);

  // Combine and shuffle
  const all = [
    ...validDbQuestions.map((q: any) => ({
      question_data:
        typeof q.question_data === "string"
          ? JSON.parse(q.question_data)
          : q.question_data,
      answers:
        typeof q.answers === "string" ? JSON.parse(q.answers) : q.answers,
    })),
    ...(aiQuestions || []).map((q: any) => ({
      question_data: q.question_data,
      answers: q.answers,
    })),
  ];

  // Shuffle and take 20
  const shuffled = all.sort(() => Math.random() - 0.5);
  const selected = shuffled.slice(0, 20);
  console.log(`[PoolEdge] fetchExamples: total_pool=${all.length} selected=${selected.length} (2V: ${validDbQuestions.length}, AI: ${(aiQuestions || []).length})`);
  return { examples: selected, graphPct };
}

// Fetch recently generated topics and question texts for dedup
async function fetchRecentInfo(
  supabase: any,
  section: string
): Promise<{ topics: string[]; texts: string[] }> {
  const t0 = Date.now();
  const { data, error } = await supabase
    .from("ai_pool_questions")
    .select("question_data")
    .eq("section", section)
    .eq("is_active", true)
    .in("review_status", ["pending", "approved"])
    .order("created_at", { ascending: false })
    .limit(20);

  if (error) {
    console.error("[PoolEdge] fetchRecentInfo: error:", error.message);
    return { topics: [], texts: [] };
  }

  const topics: string[] = [];
  const texts: string[] = [];

  (data || []).forEach((q: any) => {
    const qd =
      typeof q.question_data === "string"
        ? JSON.parse(q.question_data)
        : q.question_data;
    if (qd?.topic) topics.push(qd.topic);
    if (qd?.question_text) texts.push(qd.question_text);
  });

  console.log(`[PoolEdge] fetchRecentInfo: ${data?.length || 0} recent questions → ${topics.length} topics, ${texts.length} texts in ${Date.now() - t0}ms`);
  return { topics, texts };
}

// Generate a question using Sonnet with few-shot examples + dedup
async function generateQuestion(
  examples: any[],
  testType: string,
  section: string,
  recentInfo: { topics: string[]; texts: string[] },
  graphPct: number
) {
  const examplesText = examples
    .map((ex, i) => {
      const qd = ex.question_data;
      const ans = ex.answers;
      const optionsStr = Object.entries(qd.options || {})
        .map(([k, v]) => `  ${k}) ${v}`)
        .join("\n");

      // Note if question references an image/graph
      const hasImageRef = /grafico|figura|immagine|rappresenta/i.test(
        qd.question_text
      );
      const imageNote = hasImageRef
        ? "\n[NOTE: This question includes a mathematical graph/figure — not shown here]"
        : "";

      return `--- Example ${i + 1} ---${imageNote}
Question: ${qd.question_text}
Options:
${optionsStr}
Correct answer: ${ans.correct_answer}`;
    })
    .join("\n\n");

  // Build topic dedup section
  const recentTopicsStr =
    recentInfo.topics.length > 0
      ? recentInfo.topics.map((t, i) => `${i + 1}. ${t}`).join("\n")
      : "None yet — you have full creative freedom.";

  const recentTextsStr =
    recentInfo.texts.length > 0
      ? recentInfo.texts.map((t, i) => `${i + 1}. ${t}`).join("\n")
      : "";

  const recentSection = recentInfo.texts.length > 0
    ? `RECENTLY COVERED TOPICS (choose a DIFFERENT topic AND a different TYPE of mathematical reasoning):
${recentTopicsStr}

RECENTLY GENERATED QUESTIONS (do NOT create anything similar — avoid the same mathematical approach even if the topic label differs):
${recentTextsStr}`
    : `No questions generated yet — you have full creative freedom.`;

  const graphInstruction = graphPct > 0
    ? `GRAPH/FIGURE QUESTIONS:
In the reference examples, approximately ${graphPct}% include a graph or figure. Match this proportion — include a graph only when the question genuinely requires visual interpretation.
When your question needs a graph, set "has_image": true and include a "graph_description" with:
- "type": either "function" (for plotting curves) or "geometry" (for geometric figures)
- "x_range" and "y_range": viewport bounds
- For type "function": include "functions" array with Desmos-compatible LaTeX (e.g. "y=x^2-4", "y=\\sin(x)")
- For type "geometry": include "elements" array with objects like:
  {"kind": "point", "x": 3, "y": 4, "label": "A"}
  {"kind": "segment", "from": [0,0], "to": [3,4]}
  {"kind": "circle", "center": [0,0], "radius": 5}
  {"kind": "polygon", "vertices": [[0,0],[3,0],[3,4]]}
  {"kind": "label", "text": "Area?", "x": 1, "y": 1}
- Optional: "show_grid": true/false, "show_axes": true/false (both default true)
The graph will be rendered automatically. The question text should reference "il grafico" / "la figura".`
    : `GRAPH QUESTIONS: The reference examples for this section do NOT include graphs or figures. Do NOT generate graph questions. Set "has_image": false and "graph_description": null.`;

  const prompt = `You are an expert question writer for "${testType}" admission tests, section "${section}".

TASK: Generate ONE new, highly original multiple-choice question.

PROCESS:
1. Choose a topic DIFFERENT from the recently covered topics listed below.
2. Create a creative, original question on that topic.
3. Solve the question internally. Verify that your correct answer is actually correct and that no other option is also correct.
4. Output ONLY the JSON object.

REQUIREMENTS:
- ORIGINALITY: Do NOT just change numbers in a common template. Invent genuinely new mathematical scenarios. Use different function types, ask from different angles.
- DIFFICULTY: This is a UNIVERSITY ENTRANCE EXAM. If a good student can solve the question in under 30 seconds, it is TOO EASY — add a twist. Combine multiple concepts, add edge cases, require multi-step reasoning. Simple substitution or single-formula questions are NOT acceptable.
- CORRECTNESS: The correct answer must be mathematically rigorous and uniquely correct. Double-check ALL calculations in your thinking.
- LANGUAGE: Write the question in the same language as the examples (Italian or English). Also provide English translations in the _eng fields.
- Exactly 5 options (a through e). The wrong_answers array must contain exactly the 4 remaining letters.
- EXPLANATION: Reference options by their CONTENT, never by letter. Write "l'opzione che propone (2x+4)/(x-1)" NOT "l'opzione c". This is mandatory.
- TOPIC LABEL: Must be in Italian, 3-6 words, specific and descriptive. Good examples: "dominio di funzione composta", "intersezione retta-parabola", "calcolo derivata trigonometrica", "disequazione logaritmica con parametro". BAD: "funzioni", "algebra", "calcolo" (too vague), English labels.

REASONING TYPES (vary across these — do NOT repeat the same type as recent questions):
1. "Analisi per casi" — piecewise functions, absolute value, sign analysis
2. "Ragionamento qualitativo" — deduce properties without explicit computation (e.g. "which statement is always true?")
3. "Composizione multi-step" — combine 2+ concepts (e.g. domain + composition + inequalities in one question)
4. "Lettura e interpretazione grafico" — read a graph to answer a NON-trivial question (e.g. "given graph of f, where is g(x)=f(2x-1) increasing?")
5. "Controintuitivo/trabocchetto" — answer seems obvious but requires careful analysis (e.g. a zero that falls outside the domain)
6. "Calcolo diretto" — substitute and compute (use SPARINGLY — max 1 in every 5 questions)
Choose a reasoning type that is DIFFERENT from the recent questions listed below.

${graphInstruction}

${recentSection}

REFERENCE EXAMPLES from this section (study the VARIETY of topics and styles):

${examplesText}

OUTPUT FORMAT — Return ONLY valid JSON, no other text:
{
  "topic": "3-6 word topic label, e.g. 'dominio di funzione composta'",
  "reasoning": "Brief summary: how you verified the correct answer",
  "question_data": {
    "question_text": "Question text in original language",
    "question_text_eng": "English translation of the question",
    "options": {"a": "...", "b": "...", "c": "...", "d": "...", "e": "..."},
    "options_eng": {"a": "...", "b": "...", "c": "...", "d": "...", "e": "..."},
    "has_image": false,
    "graph_description": null
  },
  "answers": {
    "correct_answer": "[letter]",
    "wrong_answers": ["[other 4 letters]"]
  },
  "explanation": "Clear explanation referencing options by CONTENT, never by letter"
}

For graph questions, replace "has_image": false with true and "graph_description": null with the structured object (type "function" with functions array, or type "geometry" with elements array).

Generate ONE creative, original question now.`;

  const promptLen = prompt.length;
  console.log(`[PoolEdge] generateQuestion: prompt length=${promptLen} chars, calling Sonnet (temp=0.7, max_tokens=8192)...`);

  const tCall = Date.now();
  let response = await callAnthropic(
    [{ role: "user", content: prompt }],
    "sonnet",
    8192,
    0.7,
    'You are a JSON-only API. Output ONLY a single valid JSON object. No explanations, no markdown, no thinking, no text before or after the JSON. The very first character of your response must be "{".'
  );
  console.log(`[PoolEdge] generateQuestion: Sonnet responded in ${Date.now() - tCall}ms | tokens_in=${response.usage.input_tokens} tokens_out=${response.usage.output_tokens} response_len=${response.content.length}`);

  let question: GeneratedQuestion;
  let retryUsage = { input_tokens: 0, output_tokens: 0 };
  try {
    question = parseAIJSON<GeneratedQuestion>(response.content);
    console.log(`[PoolEdge] generateQuestion: JSON parsed OK on first attempt`);
  } catch (firstErr) {
    // Retry: fresh simple call without few-shot examples (shorter prompt = model has room for JSON)
    console.warn(`[PoolEdge] generateQuestion: JSON parse FAILED (attempt 1): ${firstErr.message}`);
    console.warn(`[PoolEdge] generateQuestion: response preview: ${response.content.substring(0, 300)}...`);
    console.log(`[PoolEdge] generateQuestion: retrying with simplified prompt...`);
    const tRetry = Date.now();
    const retryPrompt = `Generate ONE multiple-choice question for "${testType}" admission test, section "${section}".

Requirements:
- University entrance exam level difficulty
- 5 options (a through e), exactly one correct
- Question in Italian, translations in _eng fields
- Topic label in Italian, 3-6 words

Return ONLY this JSON:
{"topic":"...","reasoning":"brief verification","question_data":{"question_text":"...","question_text_eng":"...","options":{"a":"...","b":"...","c":"...","d":"...","e":"..."},"options_eng":{"a":"...","b":"...","c":"...","d":"...","e":"..."},"has_image":false,"graph_description":null},"answers":{"correct_answer":"...","wrong_answers":["...","...","...","..."]},"explanation":"..."}`;
    const retry = await callAnthropic(
      [{ role: "user", content: retryPrompt }],
      "sonnet",
      4096,
      0.3,
      'You are a JSON-only API. Output ONLY a single valid JSON object. No explanations, no markdown, no thinking, no text before or after the JSON. The very first character of your response must be "{".'
    );
    console.log(`[PoolEdge] generateQuestion: retry responded in ${Date.now() - tRetry}ms | tokens_in=${retry.usage.input_tokens} tokens_out=${retry.usage.output_tokens}`);
    console.log(`[PoolEdge] generateQuestion: retry preview: ${retry.content.substring(0, 200)}...`);
    question = parseAIJSON<GeneratedQuestion>(retry.content);
    console.log(`[PoolEdge] generateQuestion: JSON parsed OK on retry`);
    retryUsage = retry.usage;
  }

  // Validate structure — all 5 options required
  const requiredKeys = ["a", "b", "c", "d", "e"];
  const hasAllOptions = requiredKeys.every(
    (k) => question.question_data?.options?.[k]
  );
  // reasoning can be brief/empty with extended thinking — don't require it
  if (
    !question.question_data?.question_text ||
    !hasAllOptions ||
    !question.answers?.correct_answer ||
    !question.topic
  ) {
    const missing = [];
    if (!question.question_data?.question_text) missing.push("question_text");
    if (!hasAllOptions) missing.push("options(a-e)");
    if (!question.answers?.correct_answer) missing.push("correct_answer");
    if (!question.topic) missing.push("topic");
    console.error(`[PoolEdge] generateQuestion: invalid structure — missing: [${missing.join(", ")}]`);
    throw new Error(`Generated question has invalid structure (missing: ${missing.join(", ")})`);
  }

  // Validate correct_answer is a valid option letter
  if (!requiredKeys.includes(question.answers.correct_answer)) {
    console.error(`[PoolEdge] generateQuestion: invalid correct_answer="${question.answers.correct_answer}"`);
    throw new Error(
      `Invalid correct_answer: "${question.answers.correct_answer}"`
    );
  }

  console.log(`[PoolEdge] generateQuestion: structure valid | topic="${question.topic}" correct="${question.answers.correct_answer}" has_image=${question.question_data.has_image} has_graph=${!!question.question_data.graph_description}`);

  // Ensure wrong_answers is correct (safety net)
  question.answers.wrong_answers = requiredKeys.filter(
    (k) => k !== question.answers.correct_answer
  );

  // Ensure has_image is set correctly
  if (question.question_data.graph_description) {
    question.question_data.has_image = true;
  }

  // Sum retry cost if applicable
  const genUsage = {
    input_tokens: response.usage.input_tokens + retryUsage.input_tokens,
    output_tokens: response.usage.output_tokens + retryUsage.output_tokens,
  };

  return { question, genUsage };
}

// Shuffle options to fix LLM position bias (models tend to put correct answer at "c")
function shuffleOptions(question: GeneratedQuestion): GeneratedQuestion {
  const entries = Object.entries(question.question_data.options);
  const entriesEng = question.question_data.options_eng
    ? Object.entries(question.question_data.options_eng)
    : null;

  // Fisher-Yates shuffle on indices
  const indices = [0, 1, 2, 3, 4];
  for (let i = indices.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [indices[i], indices[j]] = [indices[j], indices[i]];
  }

  const letters = ["a", "b", "c", "d", "e"];
  const newOptions: Record<string, string> = {};
  const newOptionsEng: Record<string, string> = {};
  let newCorrect = "";

  indices.forEach((oldIdx, newIdx) => {
    const oldLetter = letters[oldIdx];
    const newLetter = letters[newIdx];
    newOptions[newLetter] = entries[oldIdx][1];
    if (entriesEng) {
      newOptionsEng[newLetter] = entriesEng[oldIdx][1];
    }
    if (oldLetter === question.answers.correct_answer) {
      newCorrect = newLetter;
    }
  });

  question.question_data.options = newOptions;
  if (entriesEng) {
    question.question_data.options_eng = newOptionsEng;
  }
  question.answers.correct_answer = newCorrect;
  question.answers.wrong_answers = letters.filter((l) => l !== newCorrect);

  // Remap letter references in explanation and reasoning
  const letterMap: Record<string, string> = {};
  indices.forEach((oldIdx, newIdx) => {
    letterMap[letters[oldIdx]] = letters[newIdx];
  });

  if (question.explanation) {
    question.explanation = remapLetters(question.explanation, letterMap);
  }
  if (question.reasoning) {
    question.reasoning = remapLetters(question.reasoning, letterMap);
  }

  return question;
}

// Remap option letter references in text after shuffle (uses placeholders to avoid chain replacements)
function remapLetters(
  text: string,
  letterMap: Record<string, string>
): string {
  const placeholder = "§§";
  let result = text;

  for (const [oldL, newL] of Object.entries(letterMap)) {
    const patterns = [
      new RegExp(`(opzion[ei]\\s+)${oldL}\\b`, "gi"),
      new RegExp(`(option\\s+)${oldL}\\b`, "gi"),
      new RegExp(`\\(${oldL}\\)`, "g"),
      new RegExp(`\\*\\*${oldL}\\)\\*\\*`, "g"),
      new RegExp(`(?<=^|[\\s(])${oldL}\\)`, "gm"),
      new RegExp(`(?<=[-–]\\s*)\\*\\*${oldL}\\)\\*\\*`, "gm"),
      new RegExp(`(?<=^|\\n)\\s*${oldL}\\)\\s`, "gm"),
    ];
    for (const pat of patterns) {
      result = result.replace(pat, (match) =>
        match.replace(oldL, `${placeholder}${newL}`)
      );
    }
  }

  return result.replace(new RegExp(`${placeholder}`, "g"), "");
}

