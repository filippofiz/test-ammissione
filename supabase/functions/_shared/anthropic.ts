export interface AnthropicMessage {
  role: 'user' | 'assistant';
  content: string;
}

export interface AnthropicResponse {
  content: string;
  usage: {
    input_tokens: number;
    output_tokens: number;
  };
}

/**
 * Call Anthropic API with specified model
 */
export async function callAnthropic(
  messages: AnthropicMessage[],
  model: 'haiku' | 'sonnet' = 'sonnet',
  maxTokens: number = 4096
): Promise<AnthropicResponse> {
  const apiKey = Deno.env.get('CLAUDE_API_KEY') || Deno.env.get('ANTHROPIC_API_KEY');
  if (!apiKey) {
    throw new Error('CLAUDE_API_KEY or ANTHROPIC_API_KEY not configured');
  }

  const modelMap = {
    haiku: 'claude-3-5-haiku-20241022',
    sonnet: 'claude-sonnet-4-5-20250929',  // Claude Sonnet 4.5
  };

  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model: modelMap[model],
      max_tokens: maxTokens,
      messages,
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(
      `Anthropic API error (${response.status}): ${errorText}`
    );
  }

  const data = await response.json();

  return {
    content: data.content[0].text,
    usage: {
      input_tokens: data.usage.input_tokens,
      output_tokens: data.usage.output_tokens,
    },
  };
}

/**
 * Parse JSON from AI response, handling markdown code blocks and extracting JSON from mixed content
 */
export function parseAIJSON<T>(content: string): T {
  let jsonStr = content.trim();

  // First try: Remove markdown code blocks if present
  if (jsonStr.includes('```json')) {
    const match = jsonStr.match(/```json\s*\n([\s\S]*?)\n```/);
    if (match) {
      jsonStr = match[1].trim();
    }
  } else if (jsonStr.includes('```')) {
    const match = jsonStr.match(/```\s*\n([\s\S]*?)\n```/);
    if (match) {
      jsonStr = match[1].trim();
    }
  }

  // Second try: Extract JSON object from text (look for { ... } pattern)
  if (!jsonStr.startsWith('{')) {
    const jsonMatch = jsonStr.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      jsonStr = jsonMatch[0];
    }
  }

  try {
    return JSON.parse(jsonStr.trim());
  } catch (error) {
    console.error('Failed to parse AI JSON response:', jsonStr.substring(0, 200));
    throw new Error(`Invalid JSON from AI: ${error.message}`);
  }
}
