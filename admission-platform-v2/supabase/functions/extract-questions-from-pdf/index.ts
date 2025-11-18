// Supabase Edge Function: extract-questions-from-pdf
// Calls Claude API to extract questions from PDF text and convert to LaTeX

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.38.4';

const CLAUDE_API_KEY = Deno.env.get('CLAUDE_API_KEY');
const CLAUDE_API_URL = 'https://api.anthropic.com/v1/messages';
const GOOGLE_TRANSLATE_API_KEY = Deno.env.get('GOOGLE_TRANSLATE_API_KEY');
const GOOGLE_TRANSLATE_URL = 'https://translation.googleapis.com/language/translate/v2';

interface ExtractQuestionsRequest {
  pdfUrl?: string;
  pdfText?: string;
  testType: string;
  section: string;
  testNumber: number;
  extractFromPdf?: boolean;
  databaseAnswers?: { question_number: number; correct_answer: string; wrong_answers?: string[] }[];
}

interface ExtractedQuestion {
  question_number: number;
  question_text: string;
  question_text_eng?: string;
  options: {
    a: string;
    b: string;
    c: string;
    d: string;
    e?: string;
  };
  options_eng?: {
    a: string;
    b: string;
    c: string;
    d: string;
    e?: string;
  };
  correct_answer: string;
  section: string;
  difficulty?: 'easy' | 'medium' | 'hard';
  has_image?: boolean;
  page_number?: number;
  image_url?: string;
  image_mapping?: any;
  recreate_graph?: boolean;
  graph_latex?: string;
  graph_function?: string;
  graph_analysis?: string;
  graph_type?: 'trigonometric' | 'polynomial' | 'exponential' | 'rational' | 'absolute' | 'composite';
  graph_features?: string[];
  graph_domain?: [number, number];
  graph_range?: [number, number];
}

serve(async (req) => {
  // CORS headers
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  };

  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Verify authentication
    const authHeader = req.headers.get('Authorization');
    console.log('Authorization header exists:', !!authHeader);
    console.log('Authorization header format:', authHeader?.substring(0, 20) + '...');

    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'Missing authorization header' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Verify user is admin or tutor
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

    console.log('Auth check - URL exists:', !!supabaseUrl);
    console.log('Auth check - Service key exists:', !!supabaseServiceKey);

    if (!supabaseUrl || !supabaseServiceKey) {
      console.error('Missing Supabase credentials');
      return new Response(
        JSON.stringify({ error: 'Server configuration error' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Create admin client with service role key (bypasses RLS)
    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    });

    // Extract JWT token from header
    const jwt = authHeader.replace('Bearer ', '');
    console.log('JWT token length:', jwt.length);

    // Verify JWT using admin client
    const { data: { user }, error: userError } = await supabaseAdmin.auth.getUser(jwt);

    console.log('User check - User exists:', !!user);
    console.log('User check - Error:', userError?.message);
    console.log('User check - Error code:', userError?.code);
    console.log('User check - Error status:', userError?.status);

    if (userError || !user) {
      console.error('JWT verification failed:', JSON.stringify(userError));
      return new Response(
        JSON.stringify({
          error: 'Unauthorized',
          details: userError?.message,
          code: userError?.code,
          hint: 'Try logging out and logging back in'
        }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('Fetching profile for user:', user.id);

    // Use admin client to fetch profile (bypasses RLS)
    const { data: profile, error: profileError } = await supabaseAdmin
      .from('2V_profiles')
      .select('roles')
      .eq('auth_uid', user.id)
      .single();

    console.log('Profile check - Profile exists:', !!profile);
    console.log('Profile check - Error:', profileError?.message);
    console.log('Profile check - Roles:', profile?.roles);

    if (profileError) {
      console.error('Profile fetch error:', profileError);
      return new Response(
        JSON.stringify({ error: 'Profile not found', details: profileError.message }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Handle roles - might be JSONB array or JSON string
    let roles: string[] = [];

    if (profile?.roles) {
      if (typeof profile.roles === 'string') {
        // It's a JSON string, parse it
        console.log('Roles is string, parsing:', profile.roles);
        try {
          roles = JSON.parse(profile.roles);
        } catch (e) {
          console.error('Failed to parse roles string:', e);
          roles = [];
        }
      } else if (Array.isArray(profile.roles)) {
        // It's already an array
        console.log('Roles is already array:', profile.roles);
        roles = profile.roles;
      } else {
        console.log('Roles is unknown type:', typeof profile.roles);
        roles = [];
      }
    }

    console.log('Parsed roles:', roles);

    const hasAdmin = roles.includes('ADMIN');
    const hasTutor = roles.includes('TUTOR');

    console.log('Role check - Has ADMIN:', hasAdmin);
    console.log('Role check - Has TUTOR:', hasTutor);

    if (!hasAdmin && !hasTutor) {
      return new Response(
        JSON.stringify({
          error: 'Forbidden - Admin or Tutor role required',
          yourRoles: roles,
          rawRoles: profile?.roles
        }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('✓ Auth check passed for user:', user.email);

    // Parse request body
    const { pdfUrl, pdfText, testType, section, testNumber, extractFromPdf, databaseAnswers }: ExtractQuestionsRequest = await req.json();

    if ((!pdfText && !pdfUrl) || !testType || !section) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields: (pdfUrl or pdfText), testType, section' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (!CLAUDE_API_KEY) {
      return new Response(
        JSON.stringify({ error: 'Claude API key not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Prepare Claude API request
    let claudeMessages: any[] = [];

    // If we have a PDF URL, fetch and send the PDF to Claude
    if (pdfUrl) {
      console.log('Fetching PDF from URL:', pdfUrl);

      try {
        // Fetch the PDF file
        const pdfResponse = await fetch(pdfUrl);
        if (!pdfResponse.ok) {
          throw new Error(`Failed to fetch PDF: ${pdfResponse.statusText}`);
        }

        // Get PDF as base64 (process in chunks to avoid stack overflow)
        const pdfBuffer = await pdfResponse.arrayBuffer();
        const uint8Array = new Uint8Array(pdfBuffer);

        // Convert to base64 in chunks
        let binary = '';
        const chunkSize = 8192;
        for (let i = 0; i < uint8Array.length; i += chunkSize) {
          const chunk = uint8Array.slice(i, i + chunkSize);
          binary += String.fromCharCode.apply(null, Array.from(chunk));
        }
        const pdfBase64 = btoa(binary);

        console.log(`PDF fetched successfully, size: ${pdfBuffer.byteLength} bytes`);

        // Send PDF to Claude with vision
        claudeMessages.push({
          role: 'user',
          content: [
            {
              type: 'document',
              source: {
                type: 'base64',
                media_type: 'application/pdf',
                data: pdfBase64,
              },
            },
            {
              type: 'text',
              text: `Extract all questions from this ${testType} test PDF (${section} section).

${pdfText ? `\nAdditional context from database:\n${pdfText}\n` : ''}

CRITICAL INSTRUCTIONS - READ CAREFULLY:
1. Extract the EXACT question text from the PDF, word-for-word
2. IDENTIFY if question contains a graph, diagram, or image - set has_image: true
3. Extract ALL answer options (A, B, C, D, E) exactly as they appear
4. Convert all mathematical notation to LaTeX with EXTREME ATTENTION TO DETAIL:
   - Exponents: 4^x NOT 4x, e^(2x) NOT ex, x² NOT x2
   - Fractions: Check BOTH numerator AND denominator carefully → $\\frac{numerator}{denominator}$
   - Subscripts: x_1, a_n, log_2
   - Square roots: $\\sqrt{expression}$
   - Complex expressions: $\\frac{x^2 + 1}{4^x - 3}$ - verify each part!

4. ZOOM IN MENTALLY on each mathematical symbol:
   - Is that 4^x or just x?
   - Is the denominator 4^x or x?
   - Is it x² or 2x?
   - Are there nested exponents like (x^2)^3?

5. Preserve question numbering exactly as in PDF
6. Do NOT try to determine correct answers - just extract questions and options
7. Return ONLY valid JSON, no markdown, no explanations

GENIUS GRAPH RECREATION FEATURE:
8. FOR QUESTIONS WITH GRAPHS: Analyze EVERY graph intelligently:

   A. IDENTIFY THE GRAPH TYPE by visual characteristics:
      - Periodic functions (sine, cosine, tangent)
      - Absolute value functions
      - Polynomials (parabolas, cubics, etc.)
      - Exponential/logarithmic curves
      - Rational functions (hyperbolas)
      - Piecewise functions
      - Composite functions (e.g., |sin x|, sin|x|)

   B. EXTRACT KEY FEATURES:
      - Period and amplitude for trig functions
      - Vertex/turning points for polynomials
      - Asymptotes for rational functions
      - Domain and range restrictions
      - Intercepts and critical points
      - Symmetry (even/odd functions)

   C. MATCH WITH OPTIONS:
      - Compare graph features with each option
      - Identify the correct function that matches the graph
      - Consider transformations (shifts, stretches, reflections)

   D. RECREATE THE GRAPH:
      Set "recreate_graph": true
      Set "graph_function": with the actual function (e.g., "abs(sin(x))")
      Set "graph_analysis": with your analysis of why this function matches

   E. PROVIDE METADATA:
      "graph_type": "trigonometric" | "polynomial" | "exponential" | "rational" | "absolute" | "composite"
      "graph_features": ["periodic", "symmetric", "continuous", etc.]
      "domain": [-5, 5] // suggested viewing window
      "range": [-2, 2]

   Example: If you see a V-shaped periodic wave and options include |sin x|, sin|x|, |cos x|:
   - Analyze: V-shapes indicate absolute value, periodic indicates trig
   - Match: |sin x| creates V-shaped waves with period π
   - Recreate: "graph_function": "abs(sin(x))"

MATHEMATICAL NOTATION EXAMPLES:
- "four to the power of x" → $4^x$
- "x squared over four to the x" → $\\frac{x^2}{4^x}$
- "e to the two x" → $e^{2x}$
- "log base 2 of x" → $\\log_2{x}$

Return JSON in this exact format:
{
  "questions": [
    {
      "question_number": 1,
      "question_text": "Exact question text from PDF with $LaTeX$ math",
      "options": {
        "a": "Exact option A from PDF",
        "b": "Exact option B from PDF",
        "c": "Exact option C from PDF",
        "d": "Exact option D from PDF",
        "e": "Exact option E from PDF (if exists)"
      },
      "section": "${section}",
      "has_image": false,
      "page_number": 1,
      "image_mapping": {
        "question": 1,
        "option_a": 2,
        "option_b": 3
      },
      "recreate_graph": false,
      "graph_latex": null
    }
  ]
}

CRITICAL - IMAGE MAPPING:
- COUNT the images on each page from top to bottom (1, 2, 3, ...)
- In image_mapping, specify which image number belongs to which part:
  - "question": <image_number> if question has a diagram/graph
  - "option_a": <image_number> if option A is an image
  - "option_b": <image_number> if option B is an image
  - etc.
- Set has_image: true if ANY images are present
- ONLY include image_mapping if there are actually images

Example with image mapping:
{
  "question_number": 7,
  "question_text": "La seguente figura rappresenta il grafico di una funzione. Quale?",
  "options": {
    "a": "$y = \\sin|x|$",
    "b": "$y = \\cos|x|$",
    "c": "$y = |\\sin x|$",
    "d": "$y = |\\cos x|$",
    "e": "$y = x$"
  },
  "has_image": true,
  "page_number": 3,
  "image_mapping": {
    "question": 1
  },
  "recreate_graph": false,
  "graph_latex": null
}

Example with option images:
{
  "question_number": 10,
  "question_text": "Quale delle seguenti figure mostra...?",
  "options": {
    "a": "Figura A",
    "b": "Figura B",
    "c": "Figura C",
    "d": "Figura D"
  },
  "has_image": true,
  "page_number": 5,
  "image_mapping": {
    "option_a": 1,
    "option_b": 2,
    "option_c": 3,
    "option_d": 4
  },
  "recreate_graph": false,
  "graph_latex": null
}

Example with GENIUS GRAPH RECREATION:
{
  "question_number": 7,
  "question_text": "La seguente figura rappresenta il grafico di una funzione. Quale?",
  "options": {
    "a": "$y = \\sin|x|$",
    "b": "$y = \\cos|x|$",
    "c": "$y = |\\sin x|$",
    "d": "$y = |\\cos x|$",
    "e": "$y = \\sin x$"
  },
  "has_image": true,
  "page_number": 3,
  "recreate_graph": true,
  "graph_function": "abs(sin(x))",
  "graph_analysis": "V-shaped periodic wave with period π, always positive, peaks at 1, matches |sin x|",
  "graph_type": "composite",
  "graph_features": ["periodic", "v-shaped", "always-positive", "continuous"],
  "graph_domain": [-6.28, 6.28],
  "graph_range": [0, 1],
  "graph_latex": "\\begin{tikzpicture}[scale=1.5]\n\\begin{axis}[\n  axis lines=middle,\n  xlabel=$x$,\n  ylabel=$y$,\n  xmin=-2π,\n  xmax=2π,\n  ymin=-0.5,\n  ymax=1.5,\n  xtick={-6.28,-3.14,0,3.14,6.28},\n  xticklabels={$-2\\pi$,$-\\pi$,$0$,$\\pi$,$2\\pi$},\n  ytick={0,0.5,1},\n  grid=major,\n  width=10cm,\n  height=6cm\n]\n\\addplot[domain=-6.28:6.28,samples=200,blue,thick] {abs(sin(deg(x)))};\n\\end{axis}\n\\end{tikzpicture}",
  "image_mapping": null
}

FINAL VERIFICATION BEFORE RETURNING:
- Double-check ALL exponents (superscripts)
- Double-check ALL denominators in fractions
- Double-check ALL subscripts
- Ensure every mathematical symbol is correctly converted to LaTeX

IMPORTANT:
- Extract word-for-word from the PDF. Do NOT generate or infer content.
- Correct answers will be provided separately from our database.
- ACCURACY IS CRITICAL - These are test questions, errors are unacceptable.`,
            },
          ],
        });
      } catch (fetchError) {
        console.error('PDF fetch error:', fetchError);
        return new Response(
          JSON.stringify({
            error: 'Failed to fetch PDF',
            details: fetchError instanceof Error ? fetchError.message : 'Unknown error',
          }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
    } else if (pdfText) {
      // Fallback: use text-only if no PDF URL
      claudeMessages.push({
        role: 'user',
        content: `Extract questions from this ${testType} test (${section} section) and convert to JSON with LaTeX.

Input text:
${pdfText}

Convert all mathematical expressions to LaTeX format.
Return ONLY valid JSON with the questions array.`,
      });
    } else {
      return new Response(
        JSON.stringify({ error: 'No PDF URL or text provided' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Call Claude API
    const claudeResponse = await fetch(CLAUDE_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': CLAUDE_API_KEY,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-5',
        max_tokens: 16000, // Increased for PDF processing
        temperature: 0,
        messages: claudeMessages,
      }),
    });

    if (!claudeResponse.ok) {
      const errorText = await claudeResponse.text();
      console.error('Claude API error:', errorText);
      return new Response(
        JSON.stringify({ error: 'Claude API error', details: errorText }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const claudeData = await claudeResponse.json();
    const content = claudeData.content?.[0]?.text;
    const usage = claudeData.usage; // Get token usage from Claude API

    if (!content) {
      return new Response(
        JSON.stringify({ error: 'No content returned from Claude API' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Log usage for debugging
    console.log('Claude API usage:', JSON.stringify(usage));

    // Parse Claude's response as JSON
    let extractedQuestions: { questions: ExtractedQuestion[] };
    try {
      // Extract JSON from response (handle markdown code blocks and extra text)
      let jsonContent = content;

      // If response contains markdown code blocks, extract the JSON
      const codeBlockMatch = content.match(/```json\s*\n([\s\S]*?)\n```/);
      if (codeBlockMatch) {
        jsonContent = codeBlockMatch[1];
      } else {
        // Try to find JSON object directly (starts with { and ends with })
        const jsonMatch = content.match(/\{[\s\S]*"questions"[\s\S]*\}/);
        if (jsonMatch) {
          jsonContent = jsonMatch[0];
        }
      }

      // Clean up any remaining markdown artifacts
      jsonContent = jsonContent
        .replace(/```json\n?/g, '')
        .replace(/```\n?/g, '')
        .trim();

      console.log('Cleaned JSON content (first 200 chars):', jsonContent.substring(0, 200));

      extractedQuestions = JSON.parse(jsonContent);

      if (!extractedQuestions.questions || !Array.isArray(extractedQuestions.questions)) {
        throw new Error('Invalid response structure: missing questions array');
      }

      console.log(`Successfully parsed ${extractedQuestions.questions.length} questions`);
    } catch (parseError) {
      console.error('Failed to parse Claude response:', parseError);
      console.error('Content (first 500 chars):', content.substring(0, 500));
      return new Response(
        JSON.stringify({
          error: 'Failed to parse AI response',
          details: parseError instanceof Error ? parseError.message : 'Parse error',
          contentPreview: content.substring(0, 200)
        }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Merge with database answers
    if (databaseAnswers && Array.isArray(databaseAnswers)) {
      console.log(`Merging ${extractedQuestions.questions.length} extracted questions with ${databaseAnswers.length} database answers`);

      // Create a map of database answers by question number
      const answerMap = new Map(
        databaseAnswers.map(item => [item.question_number, item.correct_answer])
      );

      // Add correct answers to extracted questions
      extractedQuestions.questions.forEach(q => {
        const dbAnswer = answerMap.get(q.question_number);
        if (dbAnswer) {
          q.correct_answer = dbAnswer.toLowerCase();
          console.log(`Question ${q.question_number}: matched with DB answer '${dbAnswer}'`);
        } else {
          // Default to 'a' if no database answer found
          q.correct_answer = 'a';
          console.warn(`Question ${q.question_number}: no DB answer found, defaulting to 'a'`);
        }
      });
    }

    // NOTE: Image extraction moved to frontend (PDFToLatexConverterPage.tsx)
    // because pdfjs requires full DOM/Canvas support not available in Deno Edge Functions.
    // The Edge Function only detects has_image and page_number using Claude vision.
    // Frontend will extract and upload images when saving questions.

    // Translate using Google Translate API (auto-detect language)
    if (GOOGLE_TRANSLATE_API_KEY) {
      console.log('Detecting language and translating questions...');

      try {
        // Detect language from first question
        const detectResponse = await fetch(
          `${GOOGLE_TRANSLATE_URL}/detect?key=${GOOGLE_TRANSLATE_API_KEY}`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              q: extractedQuestions.questions[0]?.question_text || '',
            }),
          }
        );

        let sourceLang = 'it'; // Default to Italian
        if (detectResponse.ok) {
          const detectData = await detectResponse.json();
          sourceLang = detectData.data.detections[0][0].language;
          console.log(`Detected language: ${sourceLang}`);
        }

        const isEnglish = sourceLang === 'en';
        const targetLang = isEnglish ? 'it' : 'en';

        console.log(`Translating from ${sourceLang} to ${targetLang}...`);

        for (const question of extractedQuestions.questions) {
          // Translate question text
          const questionTextResponse = await fetch(
            `${GOOGLE_TRANSLATE_URL}?key=${GOOGLE_TRANSLATE_API_KEY}`,
            {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                q: question.question_text,
                source: sourceLang,
                target: targetLang,
                format: 'text',
              }),
            }
          );

          if (questionTextResponse.ok) {
            const questionTextData = await questionTextResponse.json();
            const translatedText = questionTextData.data.translations[0].translatedText;

            if (isEnglish) {
              // Source is English, save as _eng and translate to Italian
              question.question_text_eng = question.question_text;
              question.question_text = translatedText;
            } else {
              // Source is Italian, keep as-is and save English translation
              question.question_text_eng = translatedText;
            }
          } else {
            console.warn(`Failed to translate question ${question.question_number} text`);
          }

          // Translate options
          const optionsToTranslate = Object.values(question.options);
          const optionsResponse = await fetch(
            `${GOOGLE_TRANSLATE_URL}?key=${GOOGLE_TRANSLATE_API_KEY}`,
            {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                q: optionsToTranslate,
                source: sourceLang,
                target: targetLang,
                format: 'text',
              }),
            }
          );

          if (optionsResponse.ok) {
            const optionsData = await optionsResponse.json();
            const translatedOptions: any = {};
            Object.keys(question.options).forEach((key, index) => {
              translatedOptions[key] = optionsData.data.translations[index].translatedText;
            });

            if (isEnglish) {
              // Source is English, save as _eng and translate to Italian
              question.options_eng = question.options;
              question.options = translatedOptions;
            } else {
              // Source is Italian, keep as-is and save English translation
              question.options_eng = translatedOptions;
            }
          } else {
            console.warn(`Failed to translate question ${question.question_number} options`);
          }
        }

        console.log(`✓ Translated ${extractedQuestions.questions.length} questions (${sourceLang} → ${targetLang})`);
      } catch (translateError) {
        console.error('Translation error:', translateError);
        // Continue without translations if error
      }
    } else {
      console.warn('Google Translate API key not configured, skipping translation');
    }

    // Calculate cost based on Claude API pricing (as of 2025)
    // Sonnet 4.5: Input ~$3/M tokens, Output ~$15/M tokens
    const inputCost = ((usage?.input_tokens || 0) / 1_000_000) * 3;
    const outputCost = ((usage?.output_tokens || 0) / 1_000_000) * 15;
    const totalCost = inputCost + outputCost;

    // Return extracted questions with usage data
    return new Response(
      JSON.stringify({
        success: true,
        questions: extractedQuestions.questions,
        metadata: {
          testType,
          section,
          testNumber,
          extractedCount: extractedQuestions.questions.length,
        },
        usage: {
          input_tokens: usage?.input_tokens || 0,
          output_tokens: usage?.output_tokens || 0,
          total_tokens: (usage?.input_tokens || 0) + (usage?.output_tokens || 0),
          cost_usd: totalCost,
          cost_breakdown: {
            input_cost_usd: inputCost,
            output_cost_usd: outputCost,
          },
        },
      }),
      {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error('Function error:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error', details: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
