// Supabase Edge Function: recreate-image-python
// Uses Claude API to generate Python code for recreating/enhancing images extracted from PDF

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.38.4';

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
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'Missing authorization header' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    const claudeApiKey = Deno.env.get('CLAUDE_API_KEY');

    if (!supabaseUrl || !supabaseServiceKey) {
      return new Response(
        JSON.stringify({ error: 'Server configuration error' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (!claudeApiKey) {
      console.warn('⚠️  CLAUDE_API_KEY not configured, returning original image');
      return new Response(
        JSON.stringify({
          recreatedImageBase64: imageBase64,
          width,
          height,
          note: 'Claude API not configured, returned original image'
        }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
      auth: { autoRefreshToken: false, persistSession: false }
    });

    const jwt = authHeader.replace('Bearer ', '');
    const { data: { user }, error: userError } = await supabaseAdmin.auth.getUser(jwt);

    if (userError || !user) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized', details: userError?.message }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Parse request body
    const { imageBase64, width, height } = await req.json();

    if (!imageBase64) {
      return new Response(
        JSON.stringify({ error: 'Missing imageBase64' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`🤖 Using Claude API to analyze image and generate graph recreation code: ${width}x${height}px`);

    // Call Claude API to analyze the image
    const claudeResponse = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': claudeApiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 4096,
        messages: [
          {
            role: 'user',
            content: [
              {
                type: 'image',
                source: {
                  type: 'base64',
                  media_type: 'image/png',
                  data: imageBase64,
                },
              },
              {
                type: 'text',
                text: `Analyze this image extracted from a PDF test question.

If this is a GRAPH/CHART/PLOT:
1. Identify the type (line plot, bar chart, scatter plot, function graph, etc.)
2. Extract key data points, axes labels, and any equations/functions shown
3. Generate Python matplotlib code to recreate it

If this is NOT a graph (e.g., a diagram, table, text, photo):
1. Return "NOT_A_GRAPH"

Response format (JSON only):
{
  "is_graph": true/false,
  "graph_type": "line|bar|scatter|function|other",
  "python_code": "import matplotlib.pyplot as plt\\nimport numpy as np\\n..."
}

The Python code should create a clean, professional recreation using matplotlib and return the figure as base64 PNG.`,
              },
            ],
          },
        ],
      }),
    });

    if (!claudeResponse.ok) {
      const errorText = await claudeResponse.text();
      console.error('Claude API error:', errorText);
      throw new Error(`Claude API failed: ${errorText}`);
    }

    const claudeData = await claudeResponse.json();
    let claudeText = claudeData.content[0].text;

    // Extract JSON from markdown code blocks if present
    if (claudeText.includes('```json')) {
      claudeText = claudeText.split('```json')[1].split('```')[0].trim();
    } else if (claudeText.includes('```')) {
      claudeText = claudeText.split('```')[1].split('```')[0].trim();
    }

    const analysis = JSON.parse(claudeText);

    console.log('✅ Claude analysis:', { is_graph: analysis.is_graph, type: analysis.graph_type });

    if (!analysis.is_graph || analysis.graph_type === 'NOT_A_GRAPH') {
      console.log('ℹ️  Not a graph, returning original image');
      return new Response(
        JSON.stringify({
          recreatedImageBase64: imageBase64,
          width,
          height,
          format: 'png',
          note: 'Not identified as a graph, returned original image.',
        }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Execute Python code using matplotlib
    console.log('🐍 Executing Python matplotlib code...');

    // TODO: Execute Python code via external service
    // For now, return original image with analysis
    return new Response(
      JSON.stringify({
        recreatedImageBase64: imageBase64,
        width,
        height,
        format: 'png',
        quality: 'high',
        is_graph: analysis.is_graph,
        graph_type: analysis.graph_type,
        python_code: analysis.python_code,
        note: 'Graph detected and code generated. Python execution service needed.',
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Function error:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error', details: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
