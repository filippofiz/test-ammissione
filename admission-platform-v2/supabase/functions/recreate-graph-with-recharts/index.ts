// Supabase Edge Function: recreate-graph-with-recharts
// Uses Claude API to analyze graphs and generate Recharts code

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
      return new Response(
        JSON.stringify({ error: 'CLAUDE_API_KEY not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
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

    console.log(`📊 Using Claude API to analyze graph and generate Recharts code`);

    // Call Claude API to analyze the graph and generate Recharts code
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
                text: `Analyze this graph/chart from a PDF and extract the data to recreate it as an interactive Recharts component.

1. Identify the chart type (LineChart, BarChart, AreaChart, ScatterChart, etc.)
2. Extract all data points from the graph as accurately as possible
3. Identify axis labels, titles, and formatting
4. Generate complete React/Recharts code to recreate this graph

Return ONLY valid React component code using Recharts. The component should:
- Use Recharts library (LineChart, BarChart, etc.)
- Include all extracted data
- Match the styling and formatting of the original graph
- Be a complete, ready-to-use component
- Export as default

Example format (adapt based on the actual graph):

\`\`\`tsx
import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const data = [
  { x: 0, y: 100 },
  // ... extracted data points
];

export default function GraphComponent() {
  return (
    <div className="w-full h-96">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="x" label={{ value: 'X Axis Label', position: 'bottom' }} />
          <YAxis label={{ value: 'Y Axis Label', angle: -90, position: 'insideLeft' }} />
          <Tooltip />
          <Line type="monotone" dataKey="y" stroke="#8884d8" />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
\`\`\`

Return ONLY the code block with tsx language identifier, no explanations.`,
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
    let rechartsCode = claudeData.content[0].text;

    // Extract code from markdown code block if present
    const codeBlockMatch = rechartsCode.match(/```(?:tsx|typescript|jsx|javascript)?\n([\s\S]*?)\n```/);
    if (codeBlockMatch) {
      rechartsCode = codeBlockMatch[1];
    }

    console.log('✅ Claude generated Recharts code');

    return new Response(
      JSON.stringify({
        rechartsCode,
        graphType: 'interactive',
        success: true,
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
