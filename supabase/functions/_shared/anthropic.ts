export interface AnthropicMessage {
  role: 'user' | 'assistant';
  content: string;
}

export interface AnthropicResponse {
  content: string;
  usage: {
    input_tokens: number;
    output_tokens: number;
    cache_creation_input_tokens?: number;
    cache_read_input_tokens?: number;
  };
}

/**
 * Call Anthropic API with specified model
 */
export async function callAnthropic(
  messages: AnthropicMessage[],
  model: 'haiku' | 'sonnet' = 'sonnet',
  maxTokens: number = 4096,
  temperature?: number,
  system?: string
): Promise<AnthropicResponse> {
  const apiKey = Deno.env.get('CLAUDE_API_KEY') || Deno.env.get('ANTHROPIC_API_KEY');
  if (!apiKey) {
    throw new Error('CLAUDE_API_KEY or ANTHROPIC_API_KEY not configured');
  }

  const modelMap = {
    haiku: 'claude-haiku-4-5-20251001',
    sonnet: 'claude-sonnet-4-6',
  };

  const MAX_RETRIES = 3;
  const RETRYABLE_STATUSES = [429, 529];
  let lastError: Error | null = null;

  for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
    if (attempt > 0) {
      const delay = Math.min(1000 * Math.pow(2, attempt - 1), 8000);
      console.log(`[Anthropic] Retry ${attempt}/${MAX_RETRIES} after ${delay}ms`);
      await new Promise(r => setTimeout(r, delay));
    }

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
        ...(temperature !== undefined && { temperature }),
        ...(system && { system }),
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      lastError = new Error(
        `Anthropic API error (${response.status}): ${errorText}`
      );
      if (RETRYABLE_STATUSES.includes(response.status) && attempt < MAX_RETRIES) {
        console.warn(`[Anthropic] ${response.status} on attempt ${attempt + 1}, will retry`);
        continue;
      }
      throw lastError;
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

  throw lastError || new Error('Anthropic API: max retries exceeded');
}

/**
 * Parse JSON from AI response, handling markdown code blocks, extracting JSON
 * from mixed content, and fixing common LLM JSON mistakes.
 */
export function parseAIJSON<T>(content: string): T {
  let jsonStr = content.trim();

  // Step 1: Remove markdown code blocks if present
  if (jsonStr.includes('```json')) {
    const match = jsonStr.match(/```json\s*\n?([\s\S]*?)\n?```/);
    if (match) {
      jsonStr = match[1].trim();
    }
  } else if (jsonStr.includes('```')) {
    const match = jsonStr.match(/```\s*\n?([\s\S]*?)\n?```/);
    if (match) {
      jsonStr = match[1].trim();
    }
  }

  // Step 2: Extract JSON object from surrounding text
  // Use {"  to avoid matching LaTeX set notation like {-2,-1,0,1,2\}
  if (!jsonStr.startsWith('{') && !jsonStr.startsWith('[')) {
    const jsonMatch = jsonStr.match(/\{"[\s\S]*\}/);
    if (jsonMatch) {
      jsonStr = jsonMatch[0];
    }
  }

  // Step 3: Try parsing as-is
  try {
    return JSON.parse(jsonStr.trim());
  } catch (_firstError) {
    // Continue to repair attempts
  }

  // Step 4: Fix common LLM JSON mistakes
  let repaired = jsonStr.trim();

  // Fix trailing commas before } or ] (very common LLM issue)
  repaired = repaired.replace(/,\s*([}\]])/g, '$1');

  // Fix unescaped newlines inside string values
  repaired = repaired.replace(/(?<=:\s*"[^"]*)\n(?=[^"]*")/g, '\\n');

  // Fix single quotes used instead of double quotes (but not inside strings)
  // Only do this if there are no double-quoted strings (indicates the model used single quotes throughout)
  if (!repaired.includes('"') && repaired.includes("'")) {
    repaired = repaired.replace(/'/g, '"');
  }

  // Fix missing comma between properties: }\n" or "\n" patterns
  repaired = repaired.replace(/"\s*\n\s*"/g, '",\n"');

  // Fix JavaScript-style comments
  repaired = repaired.replace(/\/\/[^\n]*/g, '');
  repaired = repaired.replace(/\/\*[\s\S]*?\*\//g, '');

  // Fix truncated JSON: count braces and add missing closing ones
  let openBraces = 0;
  let openBrackets = 0;
  let inString = false;
  let escaped = false;
  for (const ch of repaired) {
    if (escaped) { escaped = false; continue; }
    if (ch === '\\') { escaped = true; continue; }
    if (ch === '"') { inString = !inString; continue; }
    if (inString) continue;
    if (ch === '{') openBraces++;
    if (ch === '}') openBraces--;
    if (ch === '[') openBrackets++;
    if (ch === ']') openBrackets--;
  }
  // If inside an unclosed string, close it
  if (inString) repaired += '"';
  // Remove any trailing comma before we close
  repaired = repaired.replace(/,\s*$/, '');
  // Close unclosed brackets/braces
  for (let i = 0; i < openBrackets; i++) repaired += ']';
  for (let i = 0; i < openBraces; i++) repaired += '}';

  try {
    return JSON.parse(repaired);
  } catch (error) {
    console.error('Failed to parse AI JSON response after repair:', jsonStr.substring(0, 300));
    throw new Error(`Invalid JSON from AI: ${error.message}`);
  }
}
