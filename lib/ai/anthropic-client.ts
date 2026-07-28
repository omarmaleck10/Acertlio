/**
 * Cliente Anthropic vía fetch directo.
 * No usa @anthropic-ai/sdk para no añadir dependencias — la API es simple.
 *
 * Requiere env var: ANTHROPIC_API_KEY (configúrala en Vercel).
 */

const ANTHROPIC_API_URL = "https://api.anthropic.com/v1/messages";
const ANTHROPIC_VERSION = "2023-06-01";


export interface AnthropicMessage {
  role: "user" | "assistant";
  content: string;
}

export interface AnthropicResponse {
  content: Array<{ type: "text"; text: string }>;
  usage: {
    input_tokens: number;
    output_tokens: number;
  };
  stop_reason: string;
  model: string;
}


export async function callAnthropic(params: {
  model: string;
  system: string;
  messages: AnthropicMessage[];
  max_tokens: number;
  temperature?: number;
}): Promise<AnthropicResponse> {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    throw new Error("ANTHROPIC_API_KEY no está configurada en el entorno.");
  }

  const res = await fetch(ANTHROPIC_API_URL, {
    method: "POST",
    headers: {
      "content-type": "application/json",
      "x-api-key": apiKey,
      "anthropic-version": ANTHROPIC_VERSION,
    },
    body: JSON.stringify({
      model: params.model,
      system: params.system,
      messages: params.messages,
      max_tokens: params.max_tokens,
      temperature: params.temperature ?? 0.3,
    }),
  });

  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`Anthropic API error ${res.status}: ${errText}`);
  }

  return (await res.json()) as AnthropicResponse;
}


/**
 * Precios en USD por millón de tokens.
 * Actualizados a Sonnet 4.6.
 */
const PRICING: Record<string, { input: number; output: number }> = {
  "claude-sonnet-4-6": { input: 3, output: 15 },
  "claude-opus-4-7": { input: 15, output: 75 },
  "claude-haiku-4-5": { input: 0.25, output: 1.25 },
};

export function estimateCostUsd(
  model: string,
  inputTokens: number,
  outputTokens: number
): number {
  const p = PRICING[model];
  if (!p) return 0;
  return (
    (inputTokens * p.input) / 1_000_000 +
    (outputTokens * p.output) / 1_000_000
  );
}
