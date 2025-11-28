import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const CLAUDE_API_KEY = Deno.env.get('CLAUDE_API_KEY');

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    // Get authorization header
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      throw new Error('Missing authorization header');
    }

    // Create Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    });

    // Extract JWT token from header
    const jwt = authHeader.replace('Bearer ', '');

    // Verify JWT
    const { data: { user }, error: userError } = await supabaseAdmin.auth.getUser(jwt);

    if (userError || !user) {
      console.error('JWT verification failed:', userError);
      throw new Error('Unauthorized');
    }

    // Parse request body
    const { solutionsPdfUrl } = await req.json();

    if (!solutionsPdfUrl) {
      throw new Error('Missing solutionsPdfUrl');
    }

    console.log('Extracting answers from:', solutionsPdfUrl);

    // Fetch the PDF
    const pdfResponse = await fetch(solutionsPdfUrl);
    if (!pdfResponse.ok) {
      throw new Error(`Failed to fetch PDF: ${pdfResponse.statusText}`);
    }

    const pdfBuffer = await pdfResponse.arrayBuffer();
    const pdfBase64 = btoa(String.fromCharCode(...new Uint8Array(pdfBuffer)));

    // Call Claude API to extract answers
    const anthropicResponse = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': CLAUDE_API_KEY!,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 4000,
        messages: [
          {
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
                text: `This is a solutions PDF for a multiple-choice test. Extract the answer key (correct answers) in order.

Return ONLY a JSON array of the correct answers in lowercase (a, b, c, d, or e), in the exact order they appear.

Example format:
["a", "b", "c", "d", "a", "b", "c", "d"]

Do not include any explanations, just the JSON array.`,
              },
            ],
          },
        ],
      }),
    });

    if (!anthropicResponse.ok) {
      const errorText = await anthropicResponse.text();
      console.error('Anthropic API error:', errorText);
      throw new Error(`Anthropic API error: ${errorText}`);
    }

    const anthropicData = await anthropicResponse.json();
    console.log('Anthropic response:', JSON.stringify(anthropicData, null, 2));

    // Extract the text response
    const textContent = anthropicData.content?.find((c: any) => c.type === 'text')?.text || '';

    // Parse the JSON array from the response
    const jsonMatch = textContent.match(/\[[\s\S]*?\]/);
    if (!jsonMatch) {
      throw new Error('Could not find answer array in response');
    }

    const answers = JSON.parse(jsonMatch[0]);

    console.log(`✓ Extracted ${answers.length} answers:`, answers);

    return new Response(
      JSON.stringify({
        success: true,
        answers: answers,
        count: answers.length,
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );
  } catch (error) {
    console.error('Error:', error);
    return new Response(
      JSON.stringify({
        error: error instanceof Error ? error.message : 'Unknown error',
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      }
    );
  }
});
