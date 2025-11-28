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

    console.log(`🤖 Using Claude API to generate Python code for image recreation: ${width}x${height}px`);

    // Call Claude API to analyze the image and generate Python code for enhancement
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
                text: `Analyze this image extracted from a PDF (likely a graph, chart, or mathematical diagram). Generate Python code using PIL (Pillow) and OpenCV to enhance and professionally recreate this image.

The Python code should:
1. Take a base64 encoded image as input
2. Decode and enhance it with appropriate techniques:
   - Sharpness enhancement
   - Contrast adjustment
   - Noise reduction
   - Upscaling if needed
   - Any other improvements based on the image content
3. Return the enhanced image as base64

Return ONLY the Python code, no explanations. The code should be a complete function called 'enhance_image(image_base64: str) -> str' that returns the enhanced image as base64.`,
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
    const pythonCode = claudeData.content[0].text;

    console.log('✅ Claude generated Python code');
    console.log('Python code:', pythonCode);

    // For now, return the generated code and original image
    // TODO: Execute the Python code using Pyodide or similar
    return new Response(
      JSON.stringify({
        recreatedImageBase64: imageBase64, // For now, return original
        width,
        height,
        format: 'png',
        quality: 'high',
        generatedPythonCode: pythonCode, // Include the generated code for reference
        note: 'Python code generated but not yet executed. Execution coming soon.',
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
