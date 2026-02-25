// Supabase Edge Function: extract-from-screenshot
// Accepts base64 PNG image(s) + section type, calls Claude Vision API,
// returns structured question JSON. Used by extract_screenshots.py.

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';

const CLAUDE_API_KEY = Deno.env.get('CLAUDE_API_KEY');
const CLAUDE_API_URL = 'https://api.anthropic.com/v1/messages';
const MODEL = 'claude-opus-4-5-20251101';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// ---------------------------------------------------------------------------
// Prompts (mirrors extract_screenshots.py)
// ---------------------------------------------------------------------------

const QR_SYSTEM_PROMPT = `You are an expert GMAT question extractor. You will receive one or more screenshots \
from the official GMAT practice platform showing a Quantitative Reasoning question. \
When multiple images are provided they belong to the same question (e.g. a wide question \
split across two screen captures).

Extract the question data and return ONLY valid JSON — no markdown fences, no prose.

Rules:
- Use LaTeX delimited by $...$ for ALL mathematical expressions (fractions, exponents, \
  variables, subscripts, equations, square roots, etc.). Example: $\\frac{1}{200}$, $x^2$, $\\sqrt{3}$.
- Number formatting rules (apply to ALL text fields):
  - Use a regular hyphen - instead of en-dash (–) or em-dash (—).
  - Wrap dollar amounts in LaTeX: $91.25 → $\\$$91.25$, $1,200 → $\\$$1{,}200$.
  - Wrap percentages in LaTeX: 12% → $12\\%$, 15.6% → $15.6\\%$.
  - Wrap bare standalone numbers in LaTeX: "30 passengers" → "$30$ passengers". \
    Exception: do NOT wrap 4-digit years (1900–2099), time expressions (e.g. 3:00), \
    or ordinals (1st, 2nd, 3rd), or numbers that are part of a word/code.
- Identify the correct answer from the green checkmark on an answer option OR from the \
  sentence "The correct answer is X." in the explanation section.
- \`categories\`: read the bold header at the top of the explanation section (e.g. "Arithmetic \
  Probability"). Split it into a structured array: the first element is the broad GMAT topic, \
  subsequent elements are sub-topics. Use the canonical list below. If no header is visible, \
  infer categories from the question content.
  Broad topics: Arithmetic, Algebra, Geometry, Statistics, Probability, Word Problems, Number Properties
  Sub-topics (examples): Percents, Fractions, Rate problems, Work problem, Sets, Probability, \
  Ratios, Operations with integers, Operations on rational numbers, Linear systems, \
  Second-degree equations, Inequalities, Applied problems, Coordinate geometry, \
  Solid geometry, Plane geometry, Estimation, Sequences, Functions, Exponents
  Examples of correct output:
    "Arithmetic Probability" → ["Arithmetic", "Probability"]
    "Algebra First-degree equations" → ["Algebra", "First-degree equations"]
    "Arithmetic Rate problems Work problem" → ["Arithmetic", "Rate problems", "Work problem"]
    "Arithmetic Percents" → ["Arithmetic", "Percents"]
    "Algebra Sets Probability" → ["Algebra", "Sets", "Probability"]
- Set \`needs_manual_review\` to true if any field is uncertain or the image is unclear.
- \`has_table\` / \`has_chart\` / \`has_image\` refer to content in the QUESTION itself \
  (not the explanation). Images that are purely decorative do not count.

Return exactly this JSON shape:
{
  "gmat_id": "<e.g. 4GM184>",
  "question_text": "<full question text with LaTeX>",
  "options": {
    "a": "<option A text with LaTeX>",
    "b": "<option B text>",
    "c": "<option C text>",
    "d": "<option D text>",
    "e": "<option E text>"
  },
  "correct_answer": "<single lowercase letter: a|b|c|d|e>",
  "explanation": "<full explanation text>",
  "categories": ["<broad topic>", "<sub-topic>"],
  "has_table": false,
  "has_chart": false,
  "has_image": false,
  "needs_manual_review": false
}`;

const DI_SYSTEM_PROMPT = `You are an expert GMAT question extractor. You will receive one or more screenshots \
from the official GMAT practice platform showing a Data Insights question. \
When multiple images are provided they belong to the same question (tabs, scrolled views, etc.).

First identify the DI subtype:
- DS  = Data Sufficiency (problem + two statements + A-E options)
- TPA = Two-Part Analysis (two-column selection grid)
- TA  = Table Analysis (sortable table + Yes/No statements)
- GI  = Graphics Interpretation (chart/graph + fill-in-the-blank statement)
- MSR = Multi-Source Reasoning (tabbed sources + sub-questions)

Extract the question data and return ONLY valid JSON — no markdown fences, no prose.

Rules:
- Use LaTeX $...$ for ALL mathematical expressions.
- Number formatting rules (apply to ALL text fields):
  - Use a regular hyphen - instead of en-dash (–) or em-dash (—).
  - Wrap dollar amounts in LaTeX: $91.25 → $\\$$91.25$, $1,200 → $\\$$1{,}200$.
  - Wrap percentages in LaTeX: 12% → $12\\%$, 15.6% → $15.6\\%$.
  - Wrap bare standalone numbers in LaTeX: "30 rows" → "$30$ rows". \
    Exception: do NOT wrap 4-digit years (1900–2099), time expressions (e.g. 3:00), \
    or ordinals (1st, 2nd, 3rd), or numbers that are part of a word/code.
- Identify correct answers from green checkmarks OR "The correct answer is X" text.
- Set \`needs_manual_review\` to true if any field is uncertain or the image is unclear.

Return exactly ONE of these JSON shapes depending on the subtype:

DS:
{
  "di_type": "DS",
  "gmat_id": "<e.g. 8GM204>",
  "problem": "<problem statement>",
  "statement1": "<(1) statement text>",
  "statement2": "<(2) statement text>",
  "correct_answer": "<A|B|C|D|E>",
  "explanation": "<full explanation text>",
  "needs_manual_review": false
}

TPA:
{
  "di_type": "TPA",
  "gmat_id": "<e.g. 8GM193>",
  "scenario": "<passage/scenario text>",
  "column1_title": "<e.g. Most Strengthen>",
  "column2_title": "<e.g. Most Weaken>",
  "shared_options": ["<option text>", "..."],
  "correct_col1": "<exact option text for column 1>",
  "correct_col2": "<exact option text for column 2>",
  "explanation": "<full explanation text>",
  "needs_manual_review": false
}

TA:
{
  "di_type": "TA",
  "gmat_id": "<e.g. 8GM127>",
  "table_title": "<title above the table>",
  "stimulus_text": "<instruction paragraph above the table>",
  "column_headers": ["<header1>", "<header2>", "..."],
  "table_data": [["<row1col1>", "<row1col2>", "..."], ["<row2col1>", "..."]],
  "statements": [
    {"text": "<statement text>", "is_true": true},
    {"text": "<statement text>", "is_true": false}
  ],
  "answer_col1_title": "<e.g. Yes>",
  "answer_col2_title": "<e.g. No>",
  "statement_column_title": "<e.g. Statement>",
  "explanation": "<full explanation>",
  "needs_manual_review": false
}

GI:
{
  "di_type": "GI",
  "gmat_id": "<e.g. 8GM147>",
  "context_text": "<background/scenario text above the chart>",
  "statement_text": "<the fill-in sentence using [BLANK1] and [BLANK2] as placeholders>",
  "blank1_options": ["<opt1>", "<opt2>", "..."],
  "blank1_correct": "<correct option text for blank 1>",
  "blank2_options": ["<opt1>", "<opt2>", "..."],
  "blank2_correct": "<correct option text for blank 2>",
  "chart_title": "<title of the chart or empty string>",
  "chart_type": "<bar|line|scatter|pie|other>",
  "chart_description": "<detailed prose description of the chart: axes, scale, data series, approximate values at key points>",
  "chart_data_points": "<JSON-serialisable object with extracted numeric data if readable, else null>",
  "explanation": "<full explanation>",
  "needs_manual_review": false
}

MSR:
{
  "di_type": "MSR",
  "gmat_id": "<e.g. 8GM169>",
  "sources": [
    {"tab_name": "<tab label>", "content": "<full text content of this tab>"}
  ],
  "questions": [
    {
      "text": "<sub-question text>",
      "options": {"a": "...", "b": "...", "c": "...", "d": "...", "e": "..."},
      "correct_answer": "<a|b|c|d|e>"
    }
  ],
  "explanation": "<full explanation>",
  "needs_manual_review": false
}`;

// ---------------------------------------------------------------------------
// Handler
// ---------------------------------------------------------------------------

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  if (!CLAUDE_API_KEY) {
    return new Response(
      JSON.stringify({ error: 'CLAUDE_API_KEY not configured' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }

  try {
    const body: { section: 'QR' | 'DI'; images: string[]; system_prompt?: string } = await req.json();
    const { section, images, system_prompt } = body;

    if (!section || !images || images.length === 0) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields: section, images' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (!['QR', 'DI'].includes(section)) {
      return new Response(
        JSON.stringify({ error: 'section must be QR or DI' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Allow callers to supply a custom system prompt (e.g. extract_oqbk.py for OQBK questions)
    const systemPrompt = system_prompt ?? (section === 'QR' ? QR_SYSTEM_PROMPT : DI_SYSTEM_PROMPT);

    // Build content array: images first, then the instruction text
    const content: unknown[] = images.map((b64) => ({
      type: 'image',
      source: { type: 'base64', media_type: 'image/png', data: b64 },
    }));
    content.push({
      type: 'text',
      text: 'Extract the question data from the screenshot(s) above and return the JSON.',
    });

    const claudeResponse = await fetch(CLAUDE_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': CLAUDE_API_KEY,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: MODEL,
        max_tokens: 4096,
        system: systemPrompt,
        messages: [{ role: 'user', content }],
      }),
    });

    if (!claudeResponse.ok) {
      const err = await claudeResponse.text();
      console.error('Claude API error:', err);
      return new Response(
        JSON.stringify({ error: `Claude API error: ${claudeResponse.status}`, detail: err }),
        { status: 502, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const claudeData = await claudeResponse.json();
    const rawText: string = claudeData.content?.[0]?.text ?? '';
    const usage = claudeData.usage ?? { input_tokens: 0, output_tokens: 0 };

    return new Response(
      JSON.stringify({ raw_text: rawText, usage }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (err) {
    console.error('Error:', err);
    return new Response(
      JSON.stringify({ error: err instanceof Error ? err.message : 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
