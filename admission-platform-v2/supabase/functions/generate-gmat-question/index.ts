// Supabase Edge Function: generate-gmat-question
// Uses Claude API to generate new GMAT questions based on example questions

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.38.4';

const CLAUDE_API_KEY = Deno.env.get('CLAUDE_API_KEY');
const CLAUDE_API_URL = 'https://api.anthropic.com/v1/messages';

// Cost per token (as of 2024)
const INPUT_COST_PER_MILLION = 3; // $3 per million input tokens
const OUTPUT_COST_PER_MILLION = 15; // $15 per million output tokens

interface GenerateRequest {
  section: 'Quantitative Reasoning' | 'Data Insights';
  diType?: 'DS' | 'GI' | 'TA' | 'TPA' | 'MSR'; // Required for Data Insights
  difficulty: 'easy' | 'medium' | 'hard';
  count: number; // 1-10
  categories: string[]; // User-selected categories
  exampleQuestions: {
    question_data: any;
    answers: any;
    difficulty: string;
  }[];
}

interface GeneratedQuestion {
  question_data: any;
  answers: any;
  section: string;
  question_type: string;
  difficulty: string;
}

interface GenerateResponse {
  success: boolean;
  questions: GeneratedQuestion[];
  usage: {
    input_tokens: number;
    output_tokens: number;
    total_tokens: number;
    cost_usd: number;
  };
  error?: string;
}

// JSON schemas for each question type
const QUESTION_SCHEMAS = {
  QR: `{
  "question_text": "The full question text with any LaTeX math using $...$ delimiters",
  "options": {
    "a": "First option",
    "b": "Second option",
    "c": "Third option",
    "d": "Fourth option",
    "e": "Fifth option"
  },
  "categories": ["category1", "category2"]
}`,

  DS: `{
  "di_type": "DS",
  "problem": "The main question/problem statement",
  "statement1": "First statement to evaluate",
  "statement2": "Second statement to evaluate",
  "answer_choices": {
    "A": "Statement (1) ALONE is sufficient, but statement (2) alone is not sufficient.",
    "B": "Statement (2) ALONE is sufficient, but statement (1) alone is not sufficient.",
    "C": "BOTH statements TOGETHER are sufficient, but NEITHER statement ALONE is sufficient.",
    "D": "EACH statement ALONE is sufficient.",
    "E": "Statements (1) and (2) TOGETHER are NOT sufficient."
  },
  "correct_answer": "A or B or C or D or E",
  "explanation": "Detailed explanation of why this is the correct answer"
}`,

  GI: `{
  "di_type": "GI",
  "chart_config": {
    "type": "bar or line or scatter",
    "title": "Chart title",
    "labels": ["Label1", "Label2", "Label3"],
    "datasets": [
      {
        "label": "Dataset name",
        "data": [10, 20, 30],
        "color": "#3b82f6"
      }
    ],
    "x_axis_label": "X axis label",
    "y_axis_label": "Y axis label"
  },
  "context_text": "Description of what the chart shows",
  "statement_text": "Statement with [BLANK1] and [BLANK2] placeholders",
  "blank1_options": ["Option1", "Option2", "Option3", "Option4"],
  "blank1_correct": "The correct option for BLANK1",
  "blank2_options": ["Option1", "Option2", "Option3", "Option4"],
  "blank2_correct": "The correct option for BLANK2"
}`,

  TA: `{
  "di_type": "TA",
  "table_title": "Table title",
  "column_headers": ["Column1", "Column2", "Column3", "Column4"],
  "table_data": [
    ["Row1Col1", "Row1Col2", "Row1Col3", "Row1Col4"],
    ["Row2Col1", "Row2Col2", "Row2Col3", "Row2Col4"]
  ],
  "stimulus_text": "Optional context about the table",
  "statements": [
    {"text": "First statement to evaluate as true or false", "is_true": true},
    {"text": "Second statement to evaluate as true or false", "is_true": false},
    {"text": "Third statement to evaluate as true or false", "is_true": true}
  ],
  "answer_col1_title": "True",
  "answer_col2_title": "False",
  "statement_column_title": "Statement"
}`,

  TPA: `{
  "di_type": "TPA",
  "scenario": "The scenario or problem description",
  "column1_title": "Title for first answer column (e.g., 'Value of X')",
  "column2_title": "Title for second answer column (e.g., 'Value of Y')",
  "shared_options": ["Option A description", "Option B description", "Option C description", "Option D description", "Option E description"],
  "correct_answers": {
    "col1": "The correct option for column 1",
    "col2": "The correct option for column 2"
  }
}`,

  MSR: `{
  "di_type": "MSR",
  "sources": [
    {
      "tab_name": "Tab 1 Title",
      "content_type": "text",
      "content": "Text content for this tab"
    },
    {
      "tab_name": "Tab 2 Title",
      "content_type": "table",
      "table_headers": ["Header1", "Header2", "Header3"],
      "table_data": [["Data1", "Data2", "Data3"]]
    }
  ],
  "questions": [
    {
      "text": "First question text",
      "options": {
        "a": "Option A",
        "b": "Option B",
        "c": "Option C",
        "d": "Option D",
        "e": "Option E"
      },
      "question_type": "multiple_choice",
      "correct_answer": "a or b or c or d or e"
    }
  ]
}`
};

// Answer schemas for each question type
const ANSWER_SCHEMAS = {
  QR: `{"correct_answer": "a or b or c or d or e", "wrong_answers": []}`,
  DS: `{"correct_answer": ["A or B or C or D or E"], "wrong_answers": []}`,
  GI: `{"correct_answer": ["blank1_correct_value", "blank2_correct_value"], "wrong_answers": []}`,
  TA: `{"correct_answer": [{"stmt0": "col1 or col2", "stmt1": "col1 or col2", "stmt2": "col1 or col2"}], "wrong_answers": []}`,
  TPA: `{"correct_answer": [{"col1": "correct_option", "col2": "correct_option"}], "wrong_answers": []}`,
  MSR: `{"correct_answer": ["answer1", "answer2", "answer3"], "wrong_answers": []}`
};

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
    const { section, diType, difficulty, count, categories, exampleQuestions }: GenerateRequest = await req.json();

    // Validate request
    if (!section || !difficulty || !count || count < 1 || count > 10) {
      return new Response(
        JSON.stringify({ error: 'Invalid request parameters' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (section === 'Data Insights' && !diType) {
      return new Response(
        JSON.stringify({ error: 'diType is required for Data Insights questions' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (!exampleQuestions || exampleQuestions.length === 0) {
      return new Response(
        JSON.stringify({ error: 'At least one example question is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (!CLAUDE_API_KEY) {
      return new Response(
        JSON.stringify({ error: 'Claude API key not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Determine question type and schema
    const questionType = section === 'Quantitative Reasoning' ? 'QR' : diType!;
    const questionSchema = QUESTION_SCHEMAS[questionType as keyof typeof QUESTION_SCHEMAS];
    const answerSchema = ANSWER_SCHEMAS[questionType as keyof typeof ANSWER_SCHEMAS];

    if (!questionSchema || !answerSchema) {
      return new Response(
        JSON.stringify({ error: `Unsupported question type: ${questionType}` }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Build prompt for Claude
    const prompt = buildPrompt(
      section,
      questionType,
      difficulty,
      count,
      categories,
      exampleQuestions,
      questionSchema,
      answerSchema
    );

    console.log(`Generating ${count} ${difficulty} ${questionType} questions`);

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
        temperature: 0.7, // Some creativity for varied questions
        messages: [
          {
            role: 'user',
            content: prompt,
          },
        ],
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Claude API error:', errorText);
      return new Response(
        JSON.stringify({ error: `Claude API error: ${response.status}` }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const claudeResponse = await response.json();
    const content = claudeResponse.content?.[0]?.text || '';
    const usage = claudeResponse.usage || { input_tokens: 0, output_tokens: 0 };

    // Calculate cost
    const costUsd =
      (usage.input_tokens / 1_000_000) * INPUT_COST_PER_MILLION +
      (usage.output_tokens / 1_000_000) * OUTPUT_COST_PER_MILLION;

    // Parse the generated questions from Claude's response
    const questions = parseGeneratedQuestions(content, section, questionType, difficulty);

    const result: GenerateResponse = {
      success: true,
      questions,
      usage: {
        input_tokens: usage.input_tokens,
        output_tokens: usage.output_tokens,
        total_tokens: usage.input_tokens + usage.output_tokens,
        cost_usd: Math.round(costUsd * 10000) / 10000, // Round to 4 decimal places
      },
    };

    return new Response(
      JSON.stringify(result),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

// GMAT-specific difficulty calibration with concrete benchmarks
const GMAT_DIFFICULTY_CALIBRATION: Record<string, Record<string, string>> = {
  QR: {
    easy: `EASY (Foundation level, ~50th percentile):
- Single-step calculations or direct formula application
- Numbers that work out cleanly (e.g., integers, simple fractions like 1/2, 1/4)
- Basic concepts: simple percentages, basic algebra, straightforward geometry
- Time expectation: solvable in under 1.5 minutes
- Example complexity: "If x + 5 = 12, what is x?"`,
    medium: `MEDIUM (Development level, ~60-70th percentile):
- 2-3 step problems requiring concept integration
- May use less obvious numbers but calculations remain manageable
- Requires understanding of relationships between concepts
- Time expectation: 1.5-2.5 minutes
- Example complexity: "A price increases by 20% then decreases by 20%. What is the net change?"`,
    hard: `HARD (Excellence level, ~80th+ percentile):
- Multi-step problems with non-obvious solution paths
- May require testing cases, working backwards, or clever insights
- Numbers may be intentionally complex for estimation questions
- Requires mastery of multiple concepts simultaneously
- Time expectation: 2-3 minutes with efficient strategy
- Example complexity: Problems requiring recognition of patterns, number properties, or elegant shortcuts`
  },
  DS: {
    easy: `EASY Data Sufficiency:
- Each statement clearly sufficient or insufficient on its own
- Direct relationships between variables
- No need for complex algebraic manipulation
- Common patterns: one equation one unknown, direct value given`,
    medium: `MEDIUM Data Sufficiency:
- May require combining information from both statements
- Some algebraic manipulation needed
- Tests understanding of what information is actually needed vs. provided
- May have statements that seem sufficient but have edge cases`,
    hard: `HARD Data Sufficiency:
- Requires careful analysis of edge cases and special conditions
- May involve number properties (even/odd, positive/negative, integer constraints)
- Statements may interact in non-obvious ways
- Tests deep understanding of mathematical sufficiency vs. actual computation`
  },
  GI: {
    easy: `EASY Graphics Interpretation:
- Direct reading from charts (specific values, simple comparisons)
- Clear trends easily visible
- Calculations involve simple operations on clearly labeled data`,
    medium: `MEDIUM Graphics Interpretation:
- Requires calculation or comparison across multiple data points
- May involve percentages, ratios, or rates derived from chart data
- Trends may require interpretation rather than direct reading`,
    hard: `HARD Graphics Interpretation:
- Complex multi-step calculations from chart data
- May require combining information from multiple chart elements
- Could involve projections, weighted averages, or rate of change analysis`
  },
  TA: {
    easy: `EASY Table Analysis:
- Direct lookup or simple comparison within the table
- Statements can be verified with 1-2 table references
- Clear yes/no determinations`,
    medium: `MEDIUM Table Analysis:
- Requires sorting/ranking mental model or calculations across rows
- May need to compare multiple columns or derive new values
- Some statements may require careful attention to wording`,
    hard: `HARD Table Analysis:
- Complex calculations or comparisons across multiple dimensions
- May require statistical reasoning (medians, ranges, distributions)
- Statements may have subtle conditions that affect truth value`
  },
  TPA: {
    easy: `EASY Two-Part Analysis:
- Each part can be solved relatively independently
- Clear constraints that guide the solution
- Straightforward algebra or logic`,
    medium: `MEDIUM Two-Part Analysis:
- Parts are interrelated but relationship is clear
- May require setting up equations from word problems
- Solution requires systematic approach`,
    hard: `HARD Two-Part Analysis:
- Complex interdependency between the two parts
- May require optimization or constraint satisfaction
- Multiple valid-looking but incorrect answer combinations`
  },
  MSR: {
    easy: `EASY Multi-Source Reasoning:
- Information needed is clearly located in one source
- Direct comprehension questions
- Simple synthesis across sources`,
    medium: `MEDIUM Multi-Source Reasoning:
- Requires synthesizing information from 2+ sources
- May need to resolve apparent contradictions
- Calculations based on combined source information`,
    hard: `HARD Multi-Source Reasoning:
- Complex reasoning across all sources
- May require inference beyond stated information
- Critical evaluation of source reliability or completeness`
  }
};

// Category-specific guidance for creating authentic GMAT questions
const CATEGORY_GUIDANCE: Record<string, string> = {
  // QR Categories
  'Number Properties': `Focus on: divisibility rules, prime factorization, odd/even properties, remainders, GCD/LCM.
GMAT often tests: "Is n divisible by...?", properties of consecutive integers, digit problems.
Trap answers exploit: forgetting 0 and 1 edge cases, negative number properties, assuming integer when not stated.`,

  'Arithmetic': `Focus on: fractions, decimals, order of operations, absolute values.
GMAT often tests: comparing fractions, operations with mixed numbers, properties of zero.
Trap answers exploit: sign errors, fraction comparison mistakes, order of operations errors.`,

  'Algebra': `Focus on: equations, inequalities, functions, exponents, roots.
GMAT often tests: systems of equations, quadratic relationships, direct/inverse variation.
Trap answers exploit: forgetting ± in square roots, inequality sign flips, exponent rule errors.`,

  'Word Problems': `Focus on: rate/work problems, mixture problems, age problems, profit/loss.
GMAT often tests: combined rates, overlapping sets, weighted averages.
Trap answers exploit: unit conversion errors, partial vs. total quantities, time vs. rate confusion.`,

  'Statistics': `Focus on: mean, median, mode, range, standard deviation concepts.
GMAT often tests: effect of adding/removing values, comparing distributions, weighted averages.
Trap answers exploit: median vs. mean confusion, range calculation errors, weighted average mistakes.`,

  'Probability': `Focus on: basic probability, combinations, permutations, independent events.
GMAT often tests: "at least one" problems, conditional probability, counting principles.
Trap answers exploit: overcounting, forgetting complementary probability, dependent vs. independent events.`,

  'Percents': `Focus on: percent change, percent of percent, compound percent.
GMAT often tests: successive percent changes, reverse percent problems, percent vs. percentage point.
Trap answers exploit: applying percent to wrong base, not recognizing compound effects.`,

  'Ratios': `Focus on: ratio setup, proportion solving, scaling.
GMAT often tests: part-to-part vs. part-to-whole, ratio changes, combining ratios.
Trap answers exploit: ratio direction errors, not finding common basis for comparison.`,

  'Geometry': `Focus on: triangles, circles, quadrilaterals, coordinate geometry, 3D figures.
GMAT often tests: similar triangles, inscribed figures, area/perimeter relationships.
Trap answers exploit: assuming right angles, misapplying formulas, coordinate geometry sign errors.`,

  'Estimation': `SPECIAL NOTE - Estimation questions intentionally use "ugly" numbers!
Purpose: Test ability to approximate efficiently without exact calculation.
Use numbers like: 0.4873, 19.7%, 3.14159 (π), √2, large numbers requiring rounding.
Correct approach: Round strategically, use benchmarks, estimate order of magnitude.
Answer choices should be spread enough that estimation gives a clear answer.`,
};

// GMAT-specific trap answer strategies
const TRAP_ANSWER_GUIDANCE = `
The GMAT uses carefully designed wrong answers that catch common mistakes:
- Partial calculation (stopping one step early)
- Sign/direction errors
- Unit confusion
- Misread traps ("increase" vs "new value")
- Formula misapplication
- Edge case oversight (0, 1, negatives)

At least 2-3 wrong answers should represent predictable student errors, not random values.
`;

// Numerical value guidance based on question context
const NUMERICAL_GUIDANCE = `
**Number Selection:**
- CLEAN numbers: for algebraic manipulation, basic concepts, multi-step problems
- REALISTIC numbers: for estimation, real-world data, number sense
- Avoid numbers that give away the answer
- Geometry: Pythagorean triples (3-4-5), special angles (30-60-90)
`;

// Creative scenario bank - diverse real-world contexts to inspire originality (200+ scenarios)
const CREATIVE_SCENARIO_BANK: Record<string, string[]> = {
  QR: [
    // === SCIENCE & NATURE (40 scenarios) ===
    'bacterial colony growth patterns', 'telescope mirror dimensions', 'earthquake magnitude comparisons',
    'glacier melting rates', 'butterfly migration distances', 'volcanic ash dispersion',
    'tidal patterns and moon phases', 'tree ring growth analysis', 'coral reef ecosystem balance',
    'deep sea pressure calculations', 'aurora borealis frequency', 'fossil carbon dating accuracy',
    'pollinator flight patterns', 'ocean current speed variations', 'atmospheric CO2 absorption',
    'seed germination temperature ranges', 'animal hibernation energy reserves', 'lightning strike probability',
    'soil erosion rate factors', 'photosynthesis efficiency by light wavelength', 'bird flock formation angles',
    'whale song frequency analysis', 'mushroom spore dispersal radius', 'desert oasis water table levels',
    'volcanic eruption interval predictions', 'rainforest canopy light penetration', 'arctic ice thickness measurements',
    'river delta sediment accumulation', 'comet orbit eccentricity', 'geothermal energy extraction depths',
    'bioluminescence intensity factors', 'pollen count seasonal variations', 'cave stalactite growth rates',
    'mangrove root oxygen exchange', 'meteor shower peak timing', 'tide pool salinity fluctuations',
    'mountain snowpack water content', 'fungal network nutrient transfer', 'planetary retrograde motion periods',
    'deep ocean thermal vents', 'desert temperature daily swings',

    // === TECHNOLOGY & COMPUTING (35 scenarios) ===
    'smartphone battery degradation', 'social media engagement algorithms', 'streaming service bandwidth',
    'electric vehicle charging networks', 'drone delivery route optimization', 'app download statistics',
    'server load balancing', 'cryptocurrency mining efficiency', 'satellite orbit calculations',
    'quantum computer error rates', 'fiber optic signal attenuation', '5G tower coverage overlap',
    'machine learning training epochs', 'cloud storage redundancy levels', 'GPS accuracy by terrain',
    'smart home energy optimization', 'video compression quality tradeoffs', 'biometric scanner false positives',
    'autonomous vehicle sensor range', 'data center cooling efficiency', 'wireless charging distance decay',
    'augmented reality rendering speed', 'blockchain transaction confirmation times', 'voice assistant response latency',
    'solar panel efficiency by angle', 'robot vacuum coverage patterns', 'smart grid load distribution',
    'virtual reality motion sickness thresholds', 'password entropy calculations', 'network packet loss recovery',
    'touchscreen sensitivity calibration', 'facial recognition confidence scores', 'speech-to-text accuracy rates',
    'wearable fitness tracker precision', 'home automation scheduling conflicts',

    // === SPORTS & ATHLETICS (35 scenarios) ===
    'marathon pacing strategies', 'basketball shot probability zones', 'chess tournament scoring',
    'swimming pool lane allocation', 'golf handicap calculations', 'esports team rankings',
    'cycling gear ratios', 'archery wind compensation', 'rock climbing route difficulty',
    'tennis serve speed vs accuracy', 'soccer penalty kick angles', 'baseball pitch spin rate effects',
    'track relay handoff zones', 'figure skating rotation physics', 'surfing wave height requirements',
    'weightlifting progressive overload', 'diving splash reduction angles', 'rowing stroke synchronization',
    'boxing punch force measurement', 'ski slope gradient classifications', 'volleyball rotation strategies',
    'cricket batting strike rates', 'fencing reaction time windows', 'triathlon transition optimization',
    'gymnastics scoring deductions', 'sailing wind angle calculations', 'pole vault approach speed',
    'hockey power play efficiency', 'Formula 1 tire degradation curves', 'mountain biking trail grades',
    'water polo shot clock management', 'badminton shuttle speed decay', 'wrestling weight class strategies',
    'parkour obstacle spacing', 'disc golf flight path predictions',

    // === ARTS, ENTERTAINMENT & CULTURE (30 scenarios) ===
    'museum visitor flow patterns', 'orchestra seating arrangements', 'film production budgets',
    'book publishing print runs', 'art auction price trends', 'music streaming royalties',
    'theater ticket pricing tiers', 'photography exposure settings', 'dance competition scoring',
    'vinyl record pressing costs', 'concert venue acoustics', 'animation frame rate smoothness',
    'podcast episode length optimization', 'video game difficulty scaling', 'screenplay page to screen time',
    'gallery lighting intensity levels', 'symphony conductor tempo variations', 'ceramic kiln firing schedules',
    'tattoo ink fading rates', 'fashion runway show timing', 'comic book panel layout density',
    'movie theater seat utilization', 'music festival stage scheduling', 'sculpture bronze casting shrinkage',
    'opera singer voice projection', 'street art mural scale calculations', 'DJ mixing beat matching',
    'magic trick timing precision', 'circus acrobat safety margins', 'indie film distribution windows',

    // === FOOD, BEVERAGE & AGRICULTURE (30 scenarios) ===
    'crop rotation yield optimization', 'recipe scaling for events', 'coffee roasting temperature curves',
    'wine vineyard spacing', 'beehive honey production', 'cheese aging time effects',
    'greenhouse climate control', 'farmers market pricing', 'food truck route planning',
    'bread dough rising times', 'beer fermentation temperatures', 'chocolate tempering precision',
    'sushi rice water ratios', 'pasta cooking altitude adjustments', 'spice blend proportions',
    'meat smoking duration curves', 'ice cream overrun percentages', 'olive oil extraction yields',
    'aquaculture fish density limits', 'vertical farming light cycles', 'kombucha fermentation pH',
    'sourdough starter hydration', 'maple syrup sap concentration', 'truffle hunting success rates',
    'tea steeping temperature effects', 'fruit ripening ethylene levels', 'herb garden companion planting',
    'barbecue temperature zone management', 'cocktail dilution ratios', 'grain mill particle sizes',

    // === URBAN PLANNING & ARCHITECTURE (25 scenarios) ===
    'elevator wait time optimization', 'parking garage capacity', 'bridge stress distribution',
    'subway system passenger flow', 'building shadow analysis', 'traffic light timing',
    'water tower capacity planning', 'urban park space allocation', 'bicycle lane network design',
    'skyscraper wind load calculations', 'underground tunnel ventilation', 'pedestrian crossing timing',
    'street lighting coverage overlap', 'emergency evacuation route capacity', 'public fountain water recycling',
    'rooftop garden weight limits', 'acoustic barrier effectiveness', 'storm drain overflow thresholds',
    'historic building renovation constraints', 'wheelchair ramp gradient requirements', 'fire escape capacity ratings',
    'community garden plot allocation', 'solar panel rooftop coverage', 'bus route frequency optimization',
    'sidewalk width pedestrian flow',

    // === HEALTH & MEDICINE (25 scenarios) ===
    'vaccine distribution logistics', 'hospital bed turnover rates', 'medical dosage calculations',
    'clinical trial participant selection', 'rehabilitation progress tracking', 'nutrition label analysis',
    'blood pressure medication timing', 'physical therapy session frequency', 'hearing aid frequency ranges',
    'insulin pump delivery rates', 'X-ray radiation exposure limits', 'surgical recovery milestone tracking',
    'allergy test result interpretation', 'sleep study data patterns', 'vision prescription changes',
    'dental filling material durability', 'bone density scan comparisons', 'vaccine antibody decay rates',
    'wound healing progression rates', 'medication half-life calculations', 'respiratory therapy airflow',
    'cardiac monitor alert thresholds', 'hydration requirement factors', 'vitamin absorption efficiency',
    'exercise heart rate zone targets',

    // === ENVIRONMENT & SUSTAINABILITY (20 scenarios) ===
    'carbon footprint offset calculations', 'recycling contamination rates', 'solar farm land requirements',
    'wind turbine spacing optimization', 'rainwater harvesting capacity', 'electric grid peak load management',
    'composting decomposition timelines', 'ocean plastic accumulation zones', 'forest fire spread modeling',
    'air quality index calculations', 'groundwater depletion rates', 'wildlife corridor width requirements',
    'invasive species spread patterns', 'wetland water filtration capacity', 'urban heat island effects',
    'biodegradable packaging breakdown', 'endangered species population thresholds', 'noise pollution distance decay',
    'light pollution sky brightness', 'microplastic concentration depths',

    // === FINANCE & ECONOMICS (unusual angles) (20 scenarios) ===
    'vintage car depreciation curves', 'rare book price appreciation', 'renewable energy ROI',
    'carbon credit trading', 'freelancer income variability', 'crowdfunding goal optimization',
    'sneaker resale market timing', 'cryptocurrency staking rewards', 'art NFT royalty structures',
    'micro-lending default rates', 'subscription box churn rates', 'influencer engagement value',
    'garage sale pricing strategies', 'loyalty program point inflation', 'tipping culture regional variations',
    'secondhand clothing resale margins', 'farmers market vendor spacing fees', 'busking income location factors',
    'fantasy sports prize distribution', 'collectible card market bubbles',

    // === TRANSPORTATION & LOGISTICS (20 scenarios) ===
    'cargo ship container stacking', 'airport runway utilization', 'train schedule buffer times',
    'last-mile delivery optimization', 'ferry passenger loading sequences', 'helicopter fuel range planning',
    'bicycle sharing rebalancing', 'package sorting facility throughput', 'taxi surge pricing zones',
    'cruise ship port scheduling', 'freight train car coupling efficiency', 'ambulance response time coverage',
    'moving truck space utilization', 'airline overbooking rates', 'toll road congestion pricing',
    'scooter charging station placement', 'mail carrier route optimization', 'tugboat harbor maneuvering',
    'ski lift capacity management', 'cable car wind speed limits',

    // === EDUCATION & LEARNING (15 scenarios) ===
    'classroom seating arrangement effects', 'online course completion rates', 'library book circulation patterns',
    'tutoring session frequency optimization', 'exam question difficulty calibration', 'study break timing effectiveness',
    'flashcard spaced repetition intervals', 'lecture hall acoustics', 'student attention span curves',
    'homework assignment load balancing', 'group project contribution tracking', 'language learning vocabulary retention',
    'music practice session structure', 'science lab equipment scheduling', 'field trip transportation logistics',

    // === MANUFACTURING & INDUSTRY (15 scenarios) ===
    'assembly line station balancing', 'quality control sampling rates', 'inventory reorder point calculations',
    'machine maintenance scheduling', 'factory floor heat management', 'packaging material optimization',
    'shift changeover efficiency', 'raw material yield percentages', 'equipment depreciation schedules',
    'supply chain buffer stock levels', 'production batch size tradeoffs', 'warehouse picking route optimization',
    'tool wear replacement timing', 'energy consumption per unit tracking', 'defect rate trend analysis',
  ],
  DS: [
    // Original scenarios
    'Is the chemical reaction reversible?', 'Can the bridge support the load?',
    'Will the satellite maintain orbit?', 'Is the encryption key unique?',
    'Does the recipe scale proportionally?', 'Can the athlete qualify?',
    'Is the investment profitable?', 'Will the ecosystem stabilize?',
    'Can the schedule be optimized?', 'Is the measurement precise enough?',
    // New scenarios (30 more)
    'Does the medication dosage exceed safe limits?', 'Can the concert venue accommodate the crowd?',
    'Is the flight path fuel-efficient?', 'Will the crop yield meet demand?',
    'Does the password meet security requirements?', 'Can the runner complete the marathon in time?',
    'Is the building earthquake-resistant?', 'Will the experiment produce significant results?',
    'Does the budget cover all expenses?', 'Can the network handle peak traffic?',
    'Is the water safe for drinking?', 'Will the battery last the full trip?',
    'Does the alloy meet strength specifications?', 'Can the student graduate on time?',
    'Is the pricing strategy profitable?', 'Will the repair last five years?',
    'Does the signal reach all areas?', 'Can the team finish before deadline?',
    'Is the sample size statistically valid?', 'Will the ice support the weight?',
    'Does the diet provide adequate nutrition?', 'Can the container hold the volume?',
    'Is the transaction fraudulent?', 'Will the plant survive the winter?',
    'Does the route avoid traffic zones?', 'Can the system recover from failure?',
    'Is the claim covered by insurance?', 'Will the sound be audible from the back?',
    'Does the mixture achieve the desired viscosity?', 'Can the elevator carry the load?',
  ],
  GI: [
    // Original scenarios
    'renewable energy adoption by region', 'podcast listener demographics over time',
    'urban vs rural internet speeds', 'seasonal airline pricing trends',
    'video game sales by platform generation', 'electric vehicle range improvements',
    'remote work productivity metrics', 'streaming service content library growth',
    'global shipping container traffic', 'smartphone feature adoption rates',
    // New scenarios (30 more)
    'coffee consumption by country and age group', 'home prices vs mortgage rates over decades',
    'social media platform user growth comparison', 'vaccine rollout progress by region',
    'student loan debt trends by generation', 'streaming vs cable TV subscriptions',
    'electric vs gas vehicle sales projections', 'average commute times by city',
    'food delivery app market share changes', 'cryptocurrency price volatility comparison',
    'airline passenger load factors by season', 'cloud computing market share evolution',
    'global literacy rates by continent', 'renewable vs fossil fuel investment trends',
    'mobile payment adoption by country', 'average wedding costs by state',
    'gym membership retention rates', 'pet ownership trends by pet type',
    'online shopping cart abandonment rates', 'average screen time by age group',
    'startup funding by industry sector', 'movie box office vs streaming revenue',
    'hybrid work arrangement preferences', 'plant-based food sales growth',
    'housing affordability index changes', 'mental health service utilization',
    'e-sports viewership demographics', 'sustainable packaging adoption',
    'freelance workforce growth trends', 'telemedicine usage patterns',
  ],
  TA: [
    // Original scenarios
    'startup funding rounds by sector', 'university graduation rates by major',
    'athletic performance by training method', 'software bug resolution times',
    'restaurant health inspection scores', 'public transit ridership patterns',
    'renewable energy output by source', 'online course completion rates',
    'wildlife population surveys', 'manufacturing defect rates by shift',
    // New scenarios (30 more)
    'employee satisfaction scores by department', 'customer complaint categories by product',
    'flight delay causes by airline', 'student test scores by study method',
    'hospital readmission rates by condition', 'energy consumption by building type',
    'crime statistics by neighborhood', 'voter turnout by age and district',
    'product return reasons by category', 'website traffic sources by campaign',
    'insurance claim types by region', 'library book checkouts by genre',
    'gym equipment usage by time slot', 'restaurant menu item profitability',
    'employee turnover by tenure length', 'customer lifetime value by segment',
    'shipping damage rates by carrier', 'student attendance by day of week',
    'call center metrics by shift', 'inventory shrinkage by store location',
    'patient wait times by department', 'marketing channel conversion rates',
    'supplier quality ratings comparison', 'parking lot utilization by hour',
    'subscription cancellation reasons', 'air quality readings by sensor location',
    'social media post engagement by type', 'maintenance request priorities',
    'sales performance by territory', 'course enrollment by time slot',
  ],
  TPA: [
    // Original scenarios
    'optimal pricing and quantity decisions', 'resource allocation between projects',
    'hiring decisions balancing skills and cost', 'investment portfolio balancing',
    'production scheduling with constraints', 'route and vehicle selection',
    'menu pricing and portion sizing', 'staffing levels and service quality',
    // New scenarios (25 more)
    'warehouse location and capacity planning', 'advertising budget and channel allocation',
    'equipment lease vs purchase decisions', 'supplier selection and order quantities',
    'training program design and duration', 'product mix and profit optimization',
    'delivery speed and cost tradeoffs', 'quality level and price point setting',
    'inventory level and service rate balancing', 'machine assignment and job scheduling',
    'loan terms and payment structure', 'shift scheduling and overtime management',
    'raw material sourcing and quality', 'marketing timing and budget splitting',
    'fleet size and route assignment', 'course load and completion timeline',
    'rental property selection and renovation', 'subscription tier and feature bundling',
    'event venue and catering choices', 'software feature priority and release timing',
    'energy source mix and cost optimization', 'crop selection and land allocation',
    'insurance coverage and deductible levels', 'hiring timeline and training investment',
    'packaging design and shipping efficiency',
  ],
  MSR: [
    // Original scenarios
    'corporate merger analysis with financial and market data',
    'environmental policy with scientific and economic reports',
    'product launch with marketing research and production data',
    'city planning with demographic and infrastructure reports',
    'healthcare policy with clinical studies and cost analyses',
    // New scenarios (20 more)
    'university expansion with enrollment projections and budget constraints',
    'retail store opening with market analysis and real estate data',
    'technology adoption with user research and cost-benefit analysis',
    'transportation project with traffic studies and environmental impact',
    'restaurant franchise with location analysis and financial projections',
    'manufacturing relocation with labor costs and logistics data',
    'software platform migration with technical specs and timeline',
    'nonprofit program evaluation with outcomes data and donor reports',
    'sports team relocation with fan surveys and revenue projections',
    'pharmaceutical development with trial results and regulatory guidance',
    'renewable energy project with resource assessment and grid capacity',
    'school district rezoning with demographic data and facility reports',
    'airline route expansion with demand forecasts and operational costs',
    'museum exhibit planning with visitor data and curatorial notes',
    'agricultural policy with yield data and trade statistics',
    'insurance product design with actuarial tables and market research',
    'hotel renovation with guest feedback and competitive analysis',
    'startup acquisition with due diligence reports and synergy estimates',
    'urban redevelopment with community input and economic projections',
    'subscription service pricing with churn data and feature usage',
  ],
};

// Mathematical variation techniques to encourage structural originality
const MATH_VARIATION_TECHNIQUES: Record<string, string[]> = {
  'Number Properties': [
    'Work with remainders when dividing by unusual numbers (7, 11, 13)',
    'Explore digit sum properties and divisibility shortcuts',
    'Use prime factorization in unexpected contexts',
    'Combine even/odd with positive/negative constraints',
    'Create problems where the answer depends on whether n is an integer',
  ],
  'Algebra': [
    'Use nested functions f(g(x)) in practical contexts',
    'Create systems where one equation is quadratic',
    'Design problems requiring factoring by grouping',
    'Explore absolute value equations with multiple solutions',
    'Use direct/inverse variation with three or more variables',
  ],
  'Geometry': [
    'Inscribe unusual shapes (hexagons in circles, circles in triangles)',
    'Use coordinate geometry with non-origin centers',
    'Combine 2D and 3D reasoning in single problems',
    'Create problems with similar but not congruent figures',
    'Explore transformations (rotation, reflection) numerically',
  ],
  'Word Problems': [
    'Combine work and distance in single scenario',
    'Use "meeting" problems with more than two parties',
    'Create mixture problems with three components',
    'Design problems with rates that change mid-scenario',
    'Use overlapping work shifts with different rates',
  ],
  'Statistics': [
    'Problems where adding one value changes median but not mean (or vice versa)',
    'Compare distributions without knowing all values',
    'Use weighted averages with missing weights',
    'Create scenarios where range is misleading',
    'Design problems requiring standard deviation reasoning without calculation',
  ],
  'Probability': [
    'Conditional probability in multi-stage scenarios',
    '"At least one" with dependent events',
    'Geometric probability (random points in regions)',
    'Expected value optimization problems',
    'Counting problems with overcounting traps',
  ],
  'Percents': [
    'Three successive percent changes',
    'Percent of a percent in different bases',
    'Reverse percent problems (finding original)',
    'Percent change vs percentage point difference',
    'Compound growth over fractional periods',
  ],
  'Ratios': [
    'Three-way ratios with shared components',
    'Ratios that change after operations',
    'Part-to-part converted to part-to-whole',
    'Ratios in geometric scaling contexts',
    'Compound ratios (rate × time × quantity)',
  ],
};

// Helper function to extract a brief topic summary from a question (for deduplication without anchoring)
function extractQuestionSummary(questionData: any): string {
  // Extract the core topic/scenario in 10-15 words max
  let text = '';
  if (questionData.question_text) {
    text = questionData.question_text;
  } else if (questionData.problem) {
    text = questionData.problem;
  } else if (questionData.scenario) {
    text = questionData.scenario;
  } else if (questionData.context_text) {
    text = questionData.context_text;
  } else if (questionData.stimulus_text) {
    text = questionData.stimulus_text;
  } else if (questionData.table_title) {
    text = questionData.table_title;
  }

  // Clean and truncate to create a brief summary
  const cleaned = text
    .replace(/\$[^$]+\$/g, '[math]') // Replace LaTeX with placeholder
    .replace(/\s+/g, ' ')
    .trim();

  // Take first ~80 chars or to first sentence
  const firstSentence = cleaned.split(/[.?!]/)[0];
  return firstSentence.length > 80 ? firstSentence.substring(0, 80) + '...' : firstSentence;
}

// Helper function to select random items from an array using Fisher-Yates shuffle
// Uses crypto.getRandomValues for better randomness in Deno environment
function selectRandom<T>(array: T[], count: number): T[] {
  const arr = [...array];
  // Fisher-Yates shuffle with crypto-based randomness
  for (let i = arr.length - 1; i > 0; i--) {
    // Use crypto for better randomness, fallback to Math.random
    let j: number;
    try {
      const randomBuffer = new Uint32Array(1);
      crypto.getRandomValues(randomBuffer);
      j = randomBuffer[0] % (i + 1);
    } catch {
      j = Math.floor(Math.random() * (i + 1));
    }
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr.slice(0, Math.min(count, arr.length));
}

function buildPrompt(
  section: string,
  questionType: string,
  difficulty: string,
  count: number,
  categories: string[],
  exampleQuestions: any[],
  questionSchema: string,
  answerSchema: string
): string {
  // Get GMAT-specific difficulty calibration
  const difficultyCalibration = GMAT_DIFFICULTY_CALIBRATION[questionType]?.[difficulty] ||
    GMAT_DIFFICULTY_CALIBRATION['QR'][difficulty];

  // Build category-specific guidance
  const categoryGuidanceText = categories.length > 0
    ? categories.map(cat => {
        const matchedKey = Object.keys(CATEGORY_GUIDANCE).find(key =>
          cat.toLowerCase().includes(key.toLowerCase()) ||
          key.toLowerCase().includes(cat.toLowerCase())
        );
        return matchedKey ? `**${cat}:** ${CATEGORY_GUIDANCE[matchedKey]}` : '';
      }).filter(g => g).join('\n\n')
    : '';

  // Check if this is an estimation-related question
  const isEstimation = categories.some(cat =>
    cat.toLowerCase().includes('estimation') || cat.toLowerCase().includes('approximate')
  );

  // === NEW ARCHITECTURE: Separate format examples from duplication list ===

  // 1. FORMAT EXAMPLES: Only 2-3 examples for JSON structure (randomly selected for variety)
  const formatExamples = selectRandom(exampleQuestions, Math.min(3, exampleQuestions.length));
  const formatExamplesText = formatExamples.map((q, i) =>
    `Example ${i + 1}:\nquestion_data: ${JSON.stringify(q.question_data, null, 2)}\nanswers: ${JSON.stringify(q.answers, null, 2)}`
  ).join('\n\n');

  // 2. DEDUPLICATION LIST: Brief summaries of ALL existing questions (topics only, not full content)
  const existingTopics = exampleQuestions.map((q, i) =>
    `${i + 1}. ${extractQuestionSummary(q.question_data)}`
  ).join('\n');

  // 3. CREATIVE INSPIRATION: Random selection from scenario bank
  const scenarioBank = CREATIVE_SCENARIO_BANK[questionType] || CREATIVE_SCENARIO_BANK['QR'];
  const suggestedScenarios = selectRandom(scenarioBank, 8);

  // Log the selected scenarios for debugging
  console.log(`Selected scenarios for ${questionType}:`, suggestedScenarios);

  // 4. MATHEMATICAL TECHNIQUES: Get relevant variation techniques
  const variationTechniques: string[] = [];
  categories.forEach(cat => {
    const matchedKey = Object.keys(MATH_VARIATION_TECHNIQUES).find(key =>
      cat.toLowerCase().includes(key.toLowerCase()) ||
      key.toLowerCase().includes(cat.toLowerCase())
    );
    if (matchedKey) {
      variationTechniques.push(...selectRandom(MATH_VARIATION_TECHNIQUES[matchedKey], 2));
    }
  });
  // Add some general techniques if we don't have enough
  if (variationTechniques.length < 3) {
    const allTechniques = Object.values(MATH_VARIATION_TECHNIQUES).flat();
    variationTechniques.push(...selectRandom(allTechniques, 3 - variationTechniques.length));
  }

  return `You are an EXPERT GMAT question writer creating ORIGINAL, CREATIVE questions. Your goal is to invent questions that feel fresh and different from typical GMAT prep materials while maintaining test authenticity.

═══════════════════════════════════════════════════════════════════
YOUR CREATIVE MISSION
═══════════════════════════════════════════════════════════════════
Generate ${count} ${difficulty.toUpperCase()} ${section}${questionType !== 'QR' ? ` (${questionType})` : ''} question(s).

**Think like a creative question designer**, not a question copier. Your questions should:
- Use UNEXPECTED real-world contexts that students rarely see
- Apply mathematical concepts in NOVEL ways
- Feel fresh while being mathematically rigorous

═══════════════════════════════════════════════════════════════════
⚠️ MANDATORY SCENARIO ASSIGNMENT - YOU MUST USE THESE EXACT TOPICS ⚠️
═══════════════════════════════════════════════════════════════════
Each question MUST be based on one of these assigned scenarios:
${suggestedScenarios.map((s, i) => `${i + 1}. ${s}`).join('\n')}

CRITICAL: Do NOT use generic business/finance scenarios like "company profits", "sales growth", or "investment returns".
Do NOT use classic textbook scenarios like "trains traveling", "pipes filling tanks", or "workers completing jobs".
You MUST select from the specific scenarios listed above - they were randomly assigned to ensure variety.

═══════════════════════════════════════════════════════════════════
MATHEMATICAL CREATIVITY TECHNIQUES
═══════════════════════════════════════════════════════════════════
Try these approaches to create structurally original problems:
${variationTechniques.map(t => `• ${t}`).join('\n')}

═══════════════════════════════════════════════════════════════════
DIFFICULTY: ${difficulty.toUpperCase()}
═══════════════════════════════════════════════════════════════════
${difficultyCalibration}

═══════════════════════════════════════════════════════════════════
CATEGORY GUIDANCE: ${categories.length > 0 ? categories.join(', ') : 'General'}
═══════════════════════════════════════════════════════════════════
${categoryGuidanceText || 'Create questions appropriate for the selected section and type.'}

${isEstimation ? `
⚠️ ESTIMATION QUESTION - Use "ugly" numbers that require approximation!
Numbers like: 0.4873, 19.7%, √2, large values requiring rounding.
` : NUMERICAL_GUIDANCE}

${TRAP_ANSWER_GUIDANCE}

═══════════════════════════════════════════════════════════════════
EXISTING QUESTIONS TO AVOID (${exampleQuestions.length} topics) - DO NOT DUPLICATE THESE SCENARIOS:
═══════════════════════════════════════════════════════════════════
${existingTopics}

Your questions must use COMPLETELY DIFFERENT scenarios, contexts, and problem setups.

═══════════════════════════════════════════════════════════════════
JSON FORMAT REFERENCE (follow this structure exactly)
═══════════════════════════════════════════════════════════════════
${formatExamplesText}

**Schemas:**
question_data: ${questionSchema}
answers: ${answerSchema}

═══════════════════════════════════════════════════════════════════
QUALITY CHECKLIST
═══════════════════════════════════════════════════════════════════
Before outputting, verify each question:
✓ Uses a FRESH scenario not in the existing list above
✓ Has ONE definitively correct answer
✓ Wrong answers represent plausible student errors
✓ Matches ${difficulty} difficulty calibration
✓ Solvable in appropriate time (easy: <1.5min, medium: ~2min, hard: 2-3min)
✓ Requires no external knowledge beyond GMAT math curriculum
✓ ${getTypeSpecificChecklist(questionType)}

═══════════════════════════════════════════════════════════════════
OUTPUT
═══════════════════════════════════════════════════════════════════
Return ONLY a JSON array. No explanations, no markdown code blocks, no commentary.

Generate ${count} CREATIVE, ORIGINAL question(s) now:`;
}

// Helper function for type-specific final checklist
function getTypeSpecificChecklist(questionType: string): string {
  const checklists: Record<string, string> = {
    QR: 'All 5 answer options are mathematically distinct; calculations verified',
    DS: 'Each statement tested independently; combined case verified; answer choice logic is sound',
    GI: 'Chart data is internally consistent; blank options are plausible; correct answers derivable from data',
    TA: 'Table data supports clear true/false determinations; no ambiguous statements',
    TPA: 'Both parts independently solvable; answer combinations tested; shared options are distinct',
    MSR: 'All sources contain necessary information; questions require actual source synthesis'
  };
  return checklists[questionType] || 'Question meets all standard GMAT criteria';
}

function parseGeneratedQuestions(
  content: string,
  section: string,
  questionType: string,
  difficulty: string
): GeneratedQuestion[] {
  try {
    // Try to extract JSON array from the response
    let jsonContent = content.trim();

    // If the response has markdown code blocks, extract the JSON
    const jsonMatch = jsonContent.match(/```(?:json)?\s*([\s\S]*?)```/);
    if (jsonMatch) {
      jsonContent = jsonMatch[1].trim();
    }

    // Try to find JSON array in the content
    const arrayMatch = jsonContent.match(/\[[\s\S]*\]/);
    if (arrayMatch) {
      jsonContent = arrayMatch[0];
    }

    const parsed = JSON.parse(jsonContent);

    if (!Array.isArray(parsed)) {
      console.error('Parsed content is not an array');
      return [];
    }

    return parsed.map(item => ({
      question_data: item.question_data,
      answers: item.answers,
      section,
      question_type: section === 'Quantitative Reasoning' ? 'multiple_choice' : 'data_insights',
      difficulty,
    }));
  } catch (error) {
    console.error('Failed to parse Claude response:', error);
    console.error('Raw content:', content);
    return [];
  }
}
