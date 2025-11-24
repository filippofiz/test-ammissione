// Supabase Edge Function: review-questions-ai
// Uses Claude API to review questions for correctness and translation issues

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.38.4';

const CLAUDE_API_KEY = Deno.env.get('CLAUDE_API_KEY');
const CLAUDE_API_URL = 'https://api.anthropic.com/v1/messages';

interface ReviewRequest {
  questions: {
    id: string;
    question_number: number;
    question_data: any;
    answers: any;
  }[];
  checkType: 'correctness' | 'translation' | 'both';
  testInfo?: {
    test_type: string;
    section: string;
  };
  generateGraph?: boolean; // Request graph recreation for questions with images
}

interface ReviewIssue {
  type: 'correctness' | 'translation';
  severity: 'error' | 'warning' | 'info';
  description: string;
  currentValue?: string;
  suggestedValue?: string;
  field?: string;
  confidence?: number; // 0-100 confidence level
}

interface QuestionReview {
  questionId: string;
  questionNumber: number;
  issues: ReviewIssue[];
  explanation?: string; // Always provided explanation of the answer
  isCorrect?: boolean; // Whether the marked answer is correct
  // Graph recreation fields
  graphRecreated?: boolean;
  graphFunction?: string;
  graphType?: string;
  graphDomain?: [number, number];
  graphRange?: [number, number];
  graphAnalysis?: string;
  cannotRecreateReason?: string; // Why graph/image cannot be recreated
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
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'Missing authorization header' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Verify user is admin or tutor
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

    if (!supabaseUrl || !supabaseServiceKey) {
      return new Response(
        JSON.stringify({ error: 'Server configuration error' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    });

    const jwt = authHeader.replace('Bearer ', '');
    const { data: { user }, error: userError } = await supabaseAdmin.auth.getUser(jwt);

    if (userError || !user) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Check roles
    const { data: profile } = await supabaseAdmin
      .from('2V_profiles')
      .select('roles')
      .eq('auth_uid', user.id)
      .single();

    let roles: string[] = [];
    if (profile?.roles) {
      if (typeof profile.roles === 'string') {
        try {
          roles = JSON.parse(profile.roles);
        } catch {
          roles = [];
        }
      } else if (Array.isArray(profile.roles)) {
        roles = profile.roles;
      }
    }

    if (!roles.includes('ADMIN') && !roles.includes('TUTOR')) {
      return new Response(
        JSON.stringify({ error: 'Forbidden - Admin or Tutor role required' }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Parse request
    const { questions, checkType, testInfo, generateGraph }: ReviewRequest = await req.json();

    if (!questions || !Array.isArray(questions) || questions.length === 0) {
      return new Response(
        JSON.stringify({ error: 'No questions provided' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (!CLAUDE_API_KEY) {
      return new Response(
        JSON.stringify({ error: 'Claude API key not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Check if any questions have images
    const questionsWithImages = questions.filter(q => q.question_data?.image_url);
    const hasImages = questionsWithImages.length > 0;
    console.log(`Questions with images: ${questionsWithImages.length}/${questions.length}`);

    // Build prompt for Claude
    let checkInstructions = '';
    if (checkType === 'correctness' || checkType === 'both') {
      checkInstructions += `
CORRECTNESS CHECKS:
1. Verify the question text makes logical sense and is complete
2. Check if the correct answer actually matches one of the options
3. Verify all options are valid and properly formatted
4. Check for mathematical/scientific accuracy
5. Identify any logical errors or contradictions
6. Check LaTeX formatting is correct
7. Verify the correct answer is actually correct based on the question
8. FOR QUESTIONS WITH IMAGES: Use the image to verify the answer
`;
    }

    if (checkType === 'translation' || checkType === 'both') {
      checkInstructions += `
TRANSLATION CHECKS:
1. Check if Italian question text exists and is complete
2. Check if English translation exists
3. Verify translation accuracy - does the English properly convey the Italian meaning?
4. Check if options translations match
5. Identify any missing translations
6. Suggest improvements for awkward or incorrect translations
`;
    }

    // Prepare questions data - include image info and regeneration feedback
    const questionsJson = questions.map(q => ({
      id: q.id,
      number: q.question_number,
      question_text: q.question_data?.question_text,
      question_text_eng: q.question_data?.question_text_eng,
      options: q.question_data?.options,
      options_eng: q.question_data?.options_eng,
      correct_answer: q.answers?.correct_answer,
      has_image: !!q.question_data?.image_url,
      image_url: q.question_data?.image_url || null,
      regenerate_feedback: q.question_data?.regenerate_feedback || null,
    }));

    // Check if any questions have regeneration feedback
    const hasRegenerateFeedback = questions.some(q => q.question_data?.regenerate_feedback);
    if (hasRegenerateFeedback) {
      console.log('Regeneration feedback provided for some questions');
    }

    // Fetch images and convert to base64 for vision API
    const imageContents: any[] = [];
    for (const q of questions) {
      if (q.question_data?.image_url) {
        try {
          console.log(`Fetching image for Q${q.question_number}: ${q.question_data.image_url}`);
          const imageResponse = await fetch(q.question_data.image_url);
          if (imageResponse.ok) {
            const imageBuffer = await imageResponse.arrayBuffer();
            const uint8Array = new Uint8Array(imageBuffer);
            let binary = '';
            const chunkSize = 8192;
            for (let i = 0; i < uint8Array.length; i += chunkSize) {
              const chunk = uint8Array.slice(i, i + chunkSize);
              binary += String.fromCharCode.apply(null, Array.from(chunk));
            }
            const base64 = btoa(binary);

            // Detect media type from URL or response
            const contentType = imageResponse.headers.get('content-type') || 'image/png';

            imageContents.push({
              questionId: q.id,
              questionNumber: q.question_number,
              base64,
              mediaType: contentType,
            });
            console.log(`✓ Image loaded for Q${q.question_number} (${contentType})`);
          } else {
            console.warn(`Failed to fetch image for Q${q.question_number}: ${imageResponse.status}`);
          }
        } catch (err) {
          console.error(`Error fetching image for Q${q.question_number}:`, err);
        }
      }
    }

    const prompt = `You are a question quality reviewer. Analyze these test questions.

${checkInstructions}

Questions to review:
${JSON.stringify(questionsJson, null, 2)}

${testInfo ? `Context: This is a ${testInfo.test_type} test, section: ${testInfo.section}` : ''}

IMPORTANT: FOR EVERY QUESTION, YOU MUST:
1. Solve the question mathematically/logically step by step
2. Determine which option is correct based on your calculation
3. Compare with the marked correct_answer
4. Provide a clear explanation of WHY the answer is correct
5. If the marked answer is WRONG, add it to the issues array

FOR QUESTIONS WITH IMAGES (has_image: true):
- The images are provided below for your analysis
- Use the visual information to solve geometry, graph, or diagram problems
- You MUST attempt to RECREATE graphs/diagrams programmatically

GRAPH/IMAGE RECREATION:
For each question with an image, determine if you can recreate it:

TYPE 1 - MATHEMATICAL GRAPHS (CAN recreate):
- Function graphs (sin, cos, polynomials, exponentials, etc.)
- Set "graphRecreated": true
- Set "graphFunction": JavaScript math expression (e.g., "Math.abs(Math.sin(x))")
- Set "graphType": "trigonometric" | "polynomial" | "exponential" | "rational" | "absolute"
- Set "graphDomain": [min, max] viewing window
- Set "graphRange": [min, max] viewing window
- Set "graphAnalysis": description of graph features

TYPE 2 - GEOMETRY (CAN recreate with coordinates):
- Triangles, circles, polygons, rectangles with labeled measurements
- Set "graphRecreated": true
- Set "graphType": "geometry"
- Set "graphFunction": JSON object with shape data

GEOMETRY FORMAT - IMPORTANT:
{
  "type": "composite",
  "shapes": [
    {
      "type": "rectangle",
      "topLeft": [0, 4],
      "width": 6,
      "height": 3,
      "label": "a/2",
      "labelPosition": [-1.5, 2.5]  // LEFT of shape for height labels
    },
    {
      "type": "polygon",
      "points": [[10, 0], [18, 0], [18, 6]],  // Array of [x, y] coordinates
      "labels": {
        "rightSide": {"text": "a", "position": [19, 3]},  // RIGHT of shape
        "rightAngle": {"position": [17.2, 0.8]}  // Small square marker position
      }
    }
  ]
}

LABEL POSITIONING RULES:
- Height labels (like "a/2"): Place to the LEFT of the shape
- Side labels (like "a"): Place to the RIGHT or along the edge
- Use "labelPosition": [x, y] to set exact position
- For fractions like a/2, use text "a/2" (renderer will display it)
- rightAngle: draws a small square at the corner position

REGENERATION FEEDBACK:
If a question has "regenerate_feedback", this means the user was unhappy with a previous generation.
PAY CLOSE ATTENTION to their feedback and fix the specific issues they mentioned.
Common feedback examples:
- "Label should be on the left" -> Adjust labelPosition to be on the left
- "Right angle in wrong corner" -> Move rightAngle position to correct corner
- "Triangle pointing wrong direction" -> Adjust coordinates to flip orientation

TYPE 3 - CANNOT RECREATE:
- Photos, complex diagrams, 3D objects, real-world images
- Set "graphRecreated": false
- Set "cannotRecreateReason": Explain WHY (e.g., "Complex 3D diagram with shading", "Photographic image of real object")

FOR EACH QUESTION, ALWAYS PROVIDE:
- explanation: Step-by-step reasoning explaining how to solve the question and why the correct answer is what it is
- isCorrect: true if marked answer matches your solution, false if it doesn't

ONLY ADD TO ISSUES IF:
- The marked answer is WRONG (currentValue != suggestedValue)
- There are translation problems
- There are text/formula errors in options

FORMAT FOR ISSUES (only when something is wrong):
- type: "correctness" or "translation"
- severity: "error", "warning", or "info"
- description: Brief description of what's wrong
- currentValue: What's currently there
- suggestedValue: What it should be
- field: "correct_answer", "option_a", "question_text", etc.
- confidence: 0-100

Return ONLY valid JSON in this exact format:
{
  "reviews": [
    {
      "questionId": "uuid-here",
      "questionNumber": 1,
      "explanation": "Step 1: [calculation]. Step 2: [reasoning]. Therefore the answer is B because [reason].",
      "isCorrect": true,
      "issues": []
    },
    {
      "questionId": "uuid-here",
      "questionNumber": 2,
      "explanation": "Rectangle has height a/2, triangle has hypotenuse a. Areas are equal when...",
      "isCorrect": true,
      "issues": [],
      "graphRecreated": true,
      "graphType": "geometry",
      "graphFunction": {"type": "composite", "shapes": [{"type": "rectangle", "topLeft": [0, 3], "width": 6, "height": 2, "label": "a/2", "labelPosition": [-1.5, 2]}, {"type": "polygon", "points": [[10, 0], [18, 0], [18, 4]], "labels": {"rightSide": {"text": "a", "position": [19, 2]}, "rightAngle": {"position": [17.2, 0.8]}}}]},
      "graphDomain": [-3, 22],
      "graphRange": [-1, 6],
      "graphAnalysis": "Rectangle with height a/2 and right triangle with hypotenuse a"
    },
    {
      "questionId": "uuid-here",
      "questionNumber": 3,
      "explanation": "This is a 3D molecular structure...",
      "isCorrect": true,
      "issues": [],
      "graphRecreated": false,
      "cannotRecreateReason": "3D molecular structure with complex bonding angles cannot be represented in 2D graph"
    }
  ],
  "summary": {
    "totalIssues": 0,
    "errors": 0,
    "warnings": 0,
    "questionsWithIssues": 0,
    "questionsCorrect": 3
  }
}

CRITICAL:
- Include ALL questions in reviews array (even if no issues)
- ALWAYS provide explanation for every question
- Each issue should appear ONLY ONCE
- Only add to issues array if something needs to be fixed
- For questions with images, ALWAYS include graphRecreated (true/false) and either graph data or cannotRecreateReason`;

    // Build message content with images if available
    let messageContent: any[];

    if (imageContents.length > 0) {
      // Include images in the message for vision analysis
      messageContent = [];

      // Add each image with a label
      for (const img of imageContents) {
        messageContent.push({
          type: 'text',
          text: `\n--- Image for Question ${img.questionNumber} ---`,
        });
        messageContent.push({
          type: 'image',
          source: {
            type: 'base64',
            media_type: img.mediaType,
            data: img.base64,
          },
        });
      }

      // Add the main prompt
      messageContent.push({
        type: 'text',
        text: prompt,
      });
    } else {
      // No images, just text
      messageContent = [{ type: 'text', text: prompt }];
    }

    // Call Claude API
    const response = await fetch(CLAUDE_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': CLAUDE_API_KEY,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-5',
        max_tokens: 8000,
        temperature: 0,
        messages: [
          {
            role: 'user',
            content: messageContent,
          },
        ],
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Claude API error: ${errorText}`);
    }

    const apiData = await response.json();
    const content = apiData.content?.[0]?.text;
    const usage = apiData.usage;

    // Parse Claude's response
    let reviewResult;
    try {
      // Extract JSON from response
      let jsonContent = content;
      const codeBlockMatch = content.match(/```json\s*\n([\s\S]*?)\n```/);
      if (codeBlockMatch) {
        jsonContent = codeBlockMatch[1];
      } else {
        const jsonMatch = content.match(/\{[\s\S]*"reviews"[\s\S]*\}/);
        if (jsonMatch) {
          jsonContent = jsonMatch[0];
        }
      }
      jsonContent = jsonContent.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
      reviewResult = JSON.parse(jsonContent);
    } catch (parseError) {
      console.error('Failed to parse Claude response:', parseError);
      console.error('Content:', content.substring(0, 500));
      throw new Error('Failed to parse AI review response');
    }

    // Calculate cost
    const inputCost = ((usage?.input_tokens || 0) / 1_000_000) * 3;
    const outputCost = ((usage?.output_tokens || 0) / 1_000_000) * 15;
    const totalCost = inputCost + outputCost;

    return new Response(
      JSON.stringify({
        success: true,
        reviews: reviewResult.reviews || [],
        summary: reviewResult.summary || {
          totalIssues: 0,
          errors: 0,
          warnings: 0,
          questionsWithIssues: 0,
        },
        usage: {
          input_tokens: usage?.input_tokens || 0,
          output_tokens: usage?.output_tokens || 0,
          total_tokens: (usage?.input_tokens || 0) + (usage?.output_tokens || 0),
          cost_usd: totalCost,
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
