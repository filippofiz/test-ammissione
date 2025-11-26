// Supabase Edge Function: extract-questions-from-pdf
// Calls Claude API to extract questions from PDF text and convert to LaTeX

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.38.4';
import { PDFDocument } from 'https://esm.sh/pdf-lib@1.17.1';

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
  // Chunking parameters for large PDFs (by pages, not questions)
  pageStart?: number;  // First page number in this chunk (1-indexed)
  pageEnd?: number;    // Last page number in this chunk (1-indexed)
  // Passage extraction mode
  extractPassageOnly?: boolean;  // Extract only passage text, no questions
  targetQuestions?: number[];     // Which questions this passage is for
}

interface Passage {
  passage_id: string;
  passage_text: string;
  passage_text_eng?: string;
  passage_title?: string;
  question_numbers: number[];
}

interface ExtractedQuestion {
  question_number: number;
  question_text: string;
  question_text_eng?: string;
  passage_id?: string | null;
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
    const { pdfUrl, pdfText, testType, section, testNumber, extractFromPdf, databaseAnswers, pageStart, pageEnd, extractPassageOnly, targetQuestions }: ExtractQuestionsRequest = await req.json();

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

    // Helper function to call Claude API
    const callClaudeAPI = async (messages: any[], maxTokens: number = 64000) => {
      const response = await fetch(CLAUDE_API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': CLAUDE_API_KEY,
          'anthropic-version': '2023-06-01',
        },
        body: JSON.stringify({
          model: 'claude-sonnet-4-5',
          max_tokens: maxTokens,
          temperature: 0,
          messages,
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Claude API error: ${errorText}`);
      }

      return await response.json();
    };

    // Prepare Claude API request
    let claudeMessages: any[] = [];
    let pdfBase64: string = '';

    // If we have a PDF URL, fetch and send the PDF to Claude
    if (pdfUrl) {
      console.log('Fetching PDF from URL:', pdfUrl);

      try {
        // Fetch the PDF file
        const pdfResponse = await fetch(pdfUrl);
        if (!pdfResponse.ok) {
          throw new Error(`Failed to fetch PDF: ${pdfResponse.statusText}`);
        }

        // Get PDF as array buffer
        const pdfBuffer = await pdfResponse.arrayBuffer();
        console.log(`PDF fetched successfully, size: ${pdfBuffer.byteLength} bytes`);

        // If pageStart and pageEnd are specified, extract only those pages
        let finalPdfBuffer = pdfBuffer;
        if (pageStart && pageEnd) {
          console.log(`📄 Extracting pages ${pageStart}-${pageEnd} from PDF...`);

          // Load the PDF document
          const pdfDoc = await PDFDocument.load(pdfBuffer);
          const totalPages = pdfDoc.getPageCount();
          console.log(`PDF has ${totalPages} total pages`);

          // Create a new PDF with only the requested pages
          const newPdfDoc = await PDFDocument.create();

          // Copy pages (pageStart and pageEnd are 1-indexed, but copyPages uses 0-indexed)
          const pagesToCopy = [];
          for (let i = pageStart - 1; i < pageEnd && i < totalPages; i++) {
            pagesToCopy.push(i);
          }

          const copiedPages = await newPdfDoc.copyPages(pdfDoc, pagesToCopy);
          copiedPages.forEach(page => {
            newPdfDoc.addPage(page);
          });

          // Save the new PDF
          const newPdfBytes = await newPdfDoc.save();
          finalPdfBuffer = newPdfBytes.buffer;

          console.log(`✓ Extracted ${pagesToCopy.length} pages, new PDF size: ${finalPdfBuffer.byteLength} bytes`);
        }

        // Convert to base64 (process in chunks to avoid stack overflow)
        const uint8Array = new Uint8Array(finalPdfBuffer);
        let binary = '';
        const chunkSize = 8192;
        for (let i = 0; i < uint8Array.length; i += chunkSize) {
          const chunk = uint8Array.slice(i, i + chunkSize);
          binary += String.fromCharCode.apply(null, Array.from(chunk));
        }
        pdfBase64 = btoa(binary);

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
              text: extractPassageOnly ?
                // Passage-only extraction prompt
                `Extract ONLY the shared passage/reading text from pages ${pageStart || 1} to ${pageEnd || 'end'} of this PDF.

${targetQuestions && targetQuestions.length > 0 ? `This passage is for questions ${targetQuestions.join(', ')}.` : ''}

INSTRUCTIONS:
1. Find and extract the main passage text that questions refer to
2. This could be a reading passage, table, data, or shared context
3. Do NOT extract the questions themselves
4. Return the passage text exactly as it appears
5. If there's a title or heading for the passage, include it

CRITICAL - TABLE FORMATTING:
If the passage contains a table, you MUST convert it to proper LaTeX table format using \\begin{array}:

Example table format:
\\begin{array}{|l|c|c|}
\\hline
\\text{Header 1} & \\text{Header 2} & \\text{Header 3} \\\\
\\hline
\\text{Row 1 Col 1} & \\text{Row 1 Col 2} & \\text{Row 1 Col 3} \\\\
\\text{Row 2 Col 1} & \\text{Row 2 Col 2} & \\text{Row 2 Col 3} \\\\
\\hline
\\end{array}

Table formatting rules:
- Use |l|c|c| or |l|c|r| for column alignment: l=left, c=center, r=right
- Add | between columns for vertical lines
- Use \\hline for horizontal lines between rows
- Separate columns with &
- End each row with \\\\
- Wrap text content in \\text{} to preserve formatting
- Preserve all data accurately from the PDF

Return JSON in this format:
{
  "passages": [
    {
      "passage_id": "passage_1",
      "passage_text": "The full text of the passage with proper LaTeX table formatting...",
      "passage_title": "Title if present",
      "question_numbers": [${targetQuestions?.join(', ') || ''}]
    }
  ],
  "extractedText": "Raw text if no clear passage structure found"
}` :
                // Normal question extraction prompt
                `Extract all questions from this ${testType} test PDF (${section} section).${pageStart && pageEnd ? `\n\n🎯 CRITICAL: Process ONLY pages ${pageStart} through ${pageEnd} of this PDF. Ignore all other pages.\n` : ''}

🚨 IMPORTANT: This test contains exactly ${databaseAnswers?.length || 'UNKNOWN'} questions numbered 1 to ${databaseAnswers?.length || '?'}.
ONLY extract questions with numbers 1-${databaseAnswers?.length || '?'}.
IGNORE any content that appears to be answer keys, solutions, or questions with numbers higher than ${databaseAnswers?.length || '?'}.

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

5. TABLE FORMATTING - If question or options contain tables:
   Convert tables to LaTeX \\begin{array} format (MathJax compatible):
   \\begin{array}{|l|c|c|}
   \\hline
   \\text{Proposta} & \\text{Sì} & \\text{No} \\\\
   \\hline
   \\text{Il Fante e l'Asso non sono accanto al cavallo} & \\text{A} & \\text{B} \\\\
   \\text{L'Asso e il Fante non sono a fianco del Re} & \\text{C} & \\text{D} \\\\
   \\hline
   \\end{array}
   - Use |l|c|r| for left/center/right alignment
   - Add | for vertical lines between columns
   - Use \\hline for horizontal lines
   - Separate columns with &
   - End rows with \\\\
   - Wrap all text in \\text{} for proper rendering

6. ZOOM IN MENTALLY on each mathematical symbol:
   - Is that 4^x or just x?
   - Is the denominator 4^x or x?
   - Is it x² or 2x?
   - Are there nested exponents like (x^2)^3?

7. Preserve question numbering exactly as in PDF
8. Do NOT try to determine correct answers - just extract questions and options
9. Return ONLY valid JSON, no markdown, no explanations

GENIUS GRAPH RECREATION FEATURE:
10. FOR QUESTIONS WITH GRAPHS: Analyze EVERY graph intelligently:

   TYPE 1: GRAPH IN QUESTION, TEXT OPTIONS (identify which text matches):
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

   TYPE 2: GRAPH IMAGES IN OPTIONS (generate equations for ALL options):
   If the question shows an equation and asks "Which graph represents f(x) = ...?":

   A. IDENTIFY THE CORRECT GRAPH from the images

   B. GENERATE SIMILAR WRONG ANSWER EQUATIONS:
      For each wrong option, create a PLAUSIBLE but INCORRECT equation that:
      - Uses similar notation/structure to the question
      - Looks visually similar but has key differences
      - Would produce a different graph

      Examples of good wrong answers:
      - If correct is (4/3)^(-x), wrong could be: (3/4)^(-x), (4/3)^x, -(4/3)^(-x), (4/3)^(-x) + 1
      - If correct is |sin x|, wrong could be: sin|x|, |cos x|, sin x, -|sin x|
      - If correct is x^2 + 1, wrong could be: x^2 - 1, -x^2 + 1, (x+1)^2, 2x^2 + 1

   C. ADD "generated_options": true to indicate these are AI-generated

   D. ENSURE ALL OPTIONS are valid LaTeX equations that can be graphed

   Example: If you see a V-shaped periodic wave and options include |sin x|, sin|x|, |cos x|:
   - Analyze: V-shapes indicate absolute value, periodic indicates trig
   - Match: |sin x| creates V-shaped waves with period π
   - Recreate: "graph_function": "abs(sin(x))"

MATHEMATICAL NOTATION EXAMPLES:
- "four to the power of x" → $4^x$
- "x squared over four to the x" → $\\frac{x^2}{4^x}$
- "e to the two x" → $e^{2x}$
- "log base 2 of x" → $\\log_2{x}$

SHARED PASSAGES / READING COMPREHENSION:
If multiple questions refer to the SAME passage, text, or figure:
- Extract the full passage text ONCE
- Assign a unique "passage_id" (e.g., "passage_1", "passage_2")
- Include the passage_id in ALL questions that refer to it
- Store passages in a separate "passages" array

Return JSON in this exact format:
{
  "passages": [
    {
      "passage_id": "passage_1",
      "passage_text": "Full text of the reading passage or shared context...",
      "passage_title": "Optional title if present",
      "question_numbers": [15, 16, 17, 18, 19, 20]
    }
  ],
  "questions": [
    {
      "question_number": 1,
      "question_text": "Exact question text from PDF with $LaTeX$ math",
      "passage_id": null,
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

Example with shared passage containing a table:
{
  "passages": [
    {
      "passage_id": "passage_1",
      "passage_text": "The following table shows the population of City X from 1990 to 2020:\\n\\n$$\\\\begin{array}{|l|c|}\\\\hline\\n\\\\text{Year} & \\\\text{Population} \\\\\\\\\\\\hline\\n\\\\text{1990} & \\\\text{50,000} \\\\\\\\\\n\\\\text{2000} & \\\\text{65,000} \\\\\\\\\\n\\\\text{2010} & \\\\text{78,000} \\\\\\\\\\n\\\\text{2020} & \\\\text{92,000} \\\\\\\\\\\\hline\\n\\\\end{array}$$",
      "passage_title": "Population Data",
      "question_numbers": [5, 6, 7]
    }
  ],
  "questions": [
    {
      "question_number": 5,
      "question_text": "According to the table, what was the population increase between 1990 and 2000?",
      "passage_id": "passage_1",
      ...
    },
    {
      "question_number": 6,
      "question_text": "Based on the data, what is the average annual growth rate?",
      "passage_id": "passage_1",
      ...
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

Example with GENIUS GRAPH RECREATION (Type 1 - Graph in question):
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

Example with GENERATED OPTIONS (Type 2 - Graph images in options):
{
  "question_number": 8,
  "question_text": "Quale dei seguenti rappresenta il grafico di $f(x) = (\\frac{4}{3})^{-x}$?",
  "options": {
    "a": "$(\\frac{4}{3})^{-x}$",
    "b": "$(\\frac{3}{4})^{-x}$",
    "c": "$(\\frac{4}{3})^x$",
    "d": "$-(\\frac{4}{3})^{-x}$",
    "e": "$(\\frac{4}{3})^{-x} + 1$"
  },
  "has_image": true,
  "page_number": 4,
  "generated_options": true,
  "recreate_all_options": true,
  "image_mapping": {
    "option_a": 1,
    "option_b": 2,
    "option_c": 3,
    "option_d": 4,
    "option_e": 5
  }
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

    // Helper function to parse Claude's JSON response
    const parseClaudeJSON = (content: string) => {
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

      const parsed = JSON.parse(jsonContent);

      // Allow either questions array OR passages array (for passage extraction mode)
      if (!parsed.questions && !parsed.passages && !parsed.extractedText) {
        throw new Error('Invalid response structure: missing questions/passages array');
      }

      return parsed;
    };

    // STEP 1: Extract questions (support chunking for large PDFs by pages)
    const isPageChunked = pageStart !== undefined && pageEnd !== undefined;
    const totalQuestions = databaseAnswers?.length || 0;

    if (isPageChunked) {
      console.log(`📊 Processing page chunk: Pages ${pageStart}-${pageEnd}`);
    } else {
      console.log(`📊 Processing all pages (${totalQuestions} total questions in database)`);
    }

    // Build final messages
    const finalMessages = claudeMessages;

    // Call Claude API
    console.log(`🔄 Calling Claude API...`);
    const apiData = await callClaudeAPI(finalMessages, 64000);
    const apiContent = apiData.content?.[0]?.text;
    const usage = apiData.usage;

    console.log(`✓ API complete. Tokens: ${usage?.input_tokens || 0} input, ${usage?.output_tokens || 0} output`);

    // Parse the response
    let extractedQuestions;
    try {
      extractedQuestions = parseClaudeJSON(apiContent);
      if (extractPassageOnly) {
        console.log(`✅ Successfully extracted ${extractedQuestions.passages?.length || 0} passages`);
      } else {
        console.log(`✅ Successfully extracted ${extractedQuestions.questions?.length || 0} questions`);
      }
    } catch (parseError) {
      console.error(`❌ Failed to parse Claude response:`, parseError);
      console.error('Content (first 500 chars):', apiContent.substring(0, 500));
      throw new Error(`Parsing failed: ${parseError instanceof Error ? parseError.message : 'Parse error'}`);
    }

    // If extracting passage only, return early
    if (extractPassageOnly) {
      return new Response(
        JSON.stringify({
          success: true,
          passages: extractedQuestions.passages || [],
          extractedText: extractedQuestions.extractedText || null,
          usage: {
            input_tokens: usage?.input_tokens || 0,
            output_tokens: usage?.output_tokens || 0,
            total_tokens: (usage?.input_tokens || 0) + (usage?.output_tokens || 0),
            cost_usd: 0,
            cost_breakdown: {
              input_cost_usd: 0,
              output_cost_usd: 0,
            },
          },
        }),
        {
          status: 200,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
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
    if (GOOGLE_TRANSLATE_API_KEY && extractedQuestions.questions && extractedQuestions.questions.length > 0) {
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

        // Batch all translations into a single API call for better performance
        const allTextsToTranslate: string[] = [];
        const questionTextIndexes: number[] = [];
        const questionOptionsIndexes: { questionIdx: number; optionKeys: string[] }[] = [];
        const passageTextIndexes: number[] = [];

        // Collect passage texts first
        if (extractedQuestions.passages && extractedQuestions.passages.length > 0) {
          extractedQuestions.passages.forEach((passage, pIdx) => {
            passageTextIndexes.push(allTextsToTranslate.length);
            allTextsToTranslate.push(passage.passage_text);
          });
        }

        // Collect all question texts
        extractedQuestions.questions.forEach((question, qIdx) => {
          // Add question text
          questionTextIndexes.push(allTextsToTranslate.length);
          allTextsToTranslate.push(question.question_text);

          // Add all options
          const optionKeys = Object.keys(question.options);
          questionOptionsIndexes.push({
            questionIdx: qIdx,
            optionKeys: optionKeys
          });
          optionKeys.forEach(key => {
            allTextsToTranslate.push(question.options[key]);
          });
        });

        console.log(`Batching ${allTextsToTranslate.length} strings for translation (including ${passageTextIndexes.length} passages)...`);

        // Single batched translation call
        const batchResponse = await fetch(
          `${GOOGLE_TRANSLATE_URL}?key=${GOOGLE_TRANSLATE_API_KEY}`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              q: allTextsToTranslate,
              source: sourceLang,
              target: targetLang,
              format: 'text',
            }),
          }
        );

        if (batchResponse.ok) {
          const batchData = await batchResponse.json();
          const allTranslations = batchData.data.translations.map((t: any) => t.translatedText);

          // Distribute translations back to passages
          if (extractedQuestions.passages && extractedQuestions.passages.length > 0) {
            extractedQuestions.passages.forEach((passage, pIdx) => {
              const passageTranslation = allTranslations[passageTextIndexes[pIdx]];
              if (isEnglish) {
                passage.passage_text_eng = passage.passage_text;
                passage.passage_text = passageTranslation;
              } else {
                passage.passage_text_eng = passageTranslation;
              }
            });
          }

          // Distribute translations back to questions
          extractedQuestions.questions.forEach((question, qIdx) => {
            // Get question text translation
            const questionTextTranslation = allTranslations[questionTextIndexes[qIdx]];

            if (isEnglish) {
              question.question_text_eng = question.question_text;
              question.question_text = questionTextTranslation;
            } else {
              question.question_text_eng = questionTextTranslation;
            }

            // Get options translations
            const optionsInfo = questionOptionsIndexes[qIdx];
            const baseIndex = questionTextIndexes[qIdx] + 1; // Options start after question text
            const translatedOptions: any = {};

            optionsInfo.optionKeys.forEach((key, idx) => {
              const translationIndex = baseIndex + idx;
              translatedOptions[key] = allTranslations[translationIndex];
            });

            if (isEnglish) {
              question.options_eng = question.options;
              question.options = translatedOptions;
            } else {
              question.options_eng = translatedOptions;
            }
          });

          console.log(`✓ Translated ${extractedQuestions.questions.length} questions and ${passageTextIndexes.length} passages (${sourceLang} → ${targetLang}) in single batch`);
        } else {
          console.warn('Batch translation failed, skipping translations');
        }
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
        passages: extractedQuestions.passages || [],
        metadata: {
          testType,
          section,
          testNumber,
          extractedCount: extractedQuestions.questions.length,
          passageCount: extractedQuestions.passages?.length || 0,
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
