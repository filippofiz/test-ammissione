// Supabase Edge Function: format-theory-content
// Uses Claude API to format raw theory content into clean markdown + LaTeX

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';

const CLAUDE_API_KEY = Deno.env.get('CLAUDE_API_KEY');
const CLAUDE_API_URL = 'https://api.anthropic.com/v1/messages';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  if (!CLAUDE_API_KEY) {
    return new Response(JSON.stringify({ error: 'CLAUDE_API_KEY not configured' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  try {
    const { content_raw, materia, section, topic, title } = await req.json();

    if (!content_raw || !content_raw.trim()) {
      return new Response(JSON.stringify({ error: 'content_raw is required' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const systemPrompt = `You are an expert educational content formatter for Italian STEM education.

Your task: take raw theory notes and format them into beautiful, structured educational content using Markdown + LaTeX.

OUTPUT FORMAT RULES:
- Use ## for main headings, ### for sub-headings
- Use **bold** for key terms and definitions
- Use $...$ for inline math (e.g., $P_1 V_1 = P_2 V_2$)
- Use $$...$$ for display math (centered equations)
- Use bullet lists (- item) for listing properties, steps, or conditions
- Use numbered lists (1. item) for sequential procedures
- Add clear paragraph breaks between concepts
- Include practical examples where the raw content suggests them
- Keep the language in Italian (the content is for Italian students)
- If the raw content has formulas written informally (e.g., "P1*V1/T1 = P2*V2/T2"), convert to proper LaTeX
- Add a "Nota bene" or "Ricorda" callout for important warnings/tips using > blockquote syntax
- Keep it concise — students need clear, scannable content, not walls of text
- Do NOT add content that isn't in or implied by the raw notes
- Do NOT wrap the output in code fences or add "markdown" labels

CONTEXT:
- Subject (Materia): ${materia || 'N/A'}
- Section: ${section || 'N/A'}
- Topic: ${topic || 'N/A'}
- Title: ${title || 'N/A'}`;

    const response = await fetch(CLAUDE_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': CLAUDE_API_KEY,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 4096,
        system: systemPrompt,
        messages: [
          {
            role: 'user',
            content: `Format the following raw theory notes into clean, structured educational content:\n\n${content_raw}`,
          },
        ],
      }),
    });

    if (!response.ok) {
      const errText = await response.text();
      console.error('Claude API error:', errText);
      return new Response(JSON.stringify({ error: 'AI formatting failed', details: errText }), {
        status: 502,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const result = await response.json();
    const content_formatted = result.content?.[0]?.text || '';

    return new Response(JSON.stringify({ content_formatted }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (err) {
    console.error('Edge function error:', err);
    return new Response(JSON.stringify({ error: err.message || 'Internal error' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
