// Supabase Edge Function: translate-text
// Translates text using Google Translate API

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';

const GOOGLE_TRANSLATE_API_KEY = Deno.env.get('GOOGLE_TRANSLATE_API_KEY');
const GOOGLE_TRANSLATE_URL = 'https://translation.googleapis.com/language/translate/v2';

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
    if (!GOOGLE_TRANSLATE_API_KEY) {
      return new Response(
        JSON.stringify({ error: 'Google Translate API key not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const { texts, targetLang, sourceLang } = await req.json();

    if (!texts || !Array.isArray(texts) || texts.length === 0) {
      return new Response(
        JSON.stringify({ error: 'Missing required field: texts (array)' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (!targetLang) {
      return new Response(
        JSON.stringify({ error: 'Missing required field: targetLang' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Call Google Translate API
    const response = await fetch(
      `${GOOGLE_TRANSLATE_URL}?key=${GOOGLE_TRANSLATE_API_KEY}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          q: texts,
          source: sourceLang || undefined,
          target: targetLang,
          format: 'text',
        }),
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Google Translate API error:', errorText);
      return new Response(
        JSON.stringify({ error: 'Translation failed', details: errorText }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const data = await response.json();
    const translations = data.data?.translations?.map((t: any) => t.translatedText) || texts;

    return new Response(
      JSON.stringify({ translations }),
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
