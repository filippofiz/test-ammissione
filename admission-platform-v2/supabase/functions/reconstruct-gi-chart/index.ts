// Supabase Edge Function: reconstruct-gi-chart
// Accepts base64 PNG screenshot(s) of a GMAT GI chart + extracted metadata,
// calls Claude Vision API, and returns a complete Python matplotlib script
// that recreates the chart as a clean high-quality figure.
// The Python code is executed locally by reconstruct_di_images.py.

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';

const CLAUDE_API_KEY = Deno.env.get('CLAUDE_API_KEY');
const CLAUDE_API_URL = 'https://api.anthropic.com/v1/messages';
const MODEL = 'claude-opus-4-5-20251101';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// ---------------------------------------------------------------------------
// System prompt
// ---------------------------------------------------------------------------

const SYSTEM_PROMPT = `You are an expert data visualisation engineer. \
You will receive one or more screenshots of a GMAT Graphics Interpretation chart \
along with structured metadata about it (title, type, description, data points).

Your task: write a complete, self-contained Python script using matplotlib \
(and optionally numpy / pandas) that recreates the chart as faithfully as possible.

Requirements for the generated script:
1. Import only standard scientific Python libraries (matplotlib, numpy, pandas — no seaborn needed).
2. Create a figure with figsize=(8, 5) and a clean white background (no grid lines unless \
   the original has them).
3. Reproduce axis labels, title, tick values, legend, and data series as accurately as possible \
   from the screenshot and metadata.
4. Use colours that match the original chart (or close approximations). \
   Where the original uses a single colour, use steelblue.
5. The very last line of the script MUST be:
       plt.savefig('output.png', dpi=150, bbox_inches='tight', facecolor='white')
   followed by:
       plt.close()
   Do NOT call plt.show().
6. Output ONLY the raw Python code — no markdown fences, no prose, no explanation.`;

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
    const {
      images,           // string[]  — base64 PNG screenshots
      chart_title,      // string
      chart_type,       // string
      chart_description,// string
      chart_data_points,// object | null
    }: {
      images: string[];
      chart_title: string;
      chart_type: string;
      chart_description: string;
      chart_data_points: unknown;
    } = await req.json();

    if (!images || images.length === 0) {
      return new Response(
        JSON.stringify({ error: 'Missing required field: images' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Build content: screenshots first, then structured metadata text
    const content: unknown[] = images.map((b64) => ({
      type: 'image',
      source: { type: 'base64', media_type: 'image/png', data: b64 },
    }));

    const metaLines = [
      `Chart title: ${chart_title || '(none)'}`,
      `Chart type: ${chart_type || 'unknown'}`,
      `Description: ${chart_description || '(none)'}`,
    ];
    if (chart_data_points) {
      metaLines.push(`Data points: ${JSON.stringify(chart_data_points)}`);
    }

    content.push({
      type: 'text',
      text: [
        'Using the screenshot(s) above and the metadata below, write a Python matplotlib script that faithfully recreates this chart.',
        '',
        ...metaLines,
        '',
        'Output ONLY the Python script code.',
      ].join('\n'),
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
        system: SYSTEM_PROMPT,
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
    const pythonCode: string = claudeData.content?.[0]?.text ?? '';
    const usage = claudeData.usage ?? { input_tokens: 0, output_tokens: 0 };

    return new Response(
      JSON.stringify({ python_code: pythonCode, usage }),
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
