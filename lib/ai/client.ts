import OpenAI from "openai";
import { z } from "zod";

/**
 * AI access via OpenRouter (or NVIDIA / OpenAI compatible endpoints).
 * Server-side only — the key is read from non-public environment variables.
 */
export const AI_MODEL =
  process.env.AI_MODEL ||
  process.env.OPENROUTER_MODEL ||
  "nvidia/nemotron-3-ultra-550b-a55b:free";

const getBaseUrl = (key?: string) => {
  if (process.env.AI_BASE_URL) return process.env.AI_BASE_URL;
  if (process.env.OPENROUTER_BASE_URL) return process.env.OPENROUTER_BASE_URL;
  if (key?.startsWith("sk-or-") || process.env.OPENROUTER_API_KEY) {
    return "https://openrouter.ai/api/v1";
  }
  return process.env.NVIDIA_BASE_URL || "https://integrate.api.nvidia.com/v1";
};

const MAX_ATTEMPTS = 2;

export class AIError extends Error {
  constructor(message: string, public readonly cause?: unknown) {
    super(message);
    this.name = "AIError";
  }
}

let client: OpenAI | null | undefined;

/** Returns null when no AI key is configured so callers can degrade gracefully. */
export function getAIClient(): OpenAI | null {
  if (client !== undefined) return client;
  const apiKey =
    process.env.OPENROUTER_API_KEY ||
    process.env.NVIDIA_API_KEY ||
    process.env.AI_API_KEY;

  if (!apiKey) {
    client = null;
    return null;
  }

  const baseURL = getBaseUrl(apiKey);
  client = new OpenAI({
    apiKey,
    baseURL,
    defaultHeaders: {
      "HTTP-Referer": process.env.NEXTAUTH_URL || "http://localhost:3000",
      "X-Title": "Wealthzy Financial Guru",
    },
    timeout: 120_000,
    maxRetries: 2,
  });
  return client;
}

export function isAIConfigured(): boolean {
  return getAIClient() !== null;
}

/** Pulls the JSON object out of a model reply (drops <think> blocks and ``` fences). */
function extractJson(text: string): unknown {
  const cleaned = text.replace(/<think>[\s\S]*?<\/think>/gi, "").trim();
  const fenced = cleaned.match(/```(?:json)?\s*([\s\S]*?)```/i);
  const body = fenced ? fenced[1] : cleaned;
  const start = body.indexOf("{");
  const end = body.lastIndexOf("}");
  if (start === -1 || end <= start) throw new Error("no JSON object in response");
  return JSON.parse(body.slice(start, end + 1));
}

/**
 * One structured-output call with reasoning support.
 * Preserves reasoning_details in multi-turn error correction loops.
 */
export async function generateStructured<S extends z.ZodType>(opts: {
  schema: S;
  system: string;
  prompt: string;
  effort?: "low" | "medium" | "high";
  enableReasoning?: boolean;
}): Promise<z.infer<S>> {
  const ai = getAIClient();
  if (!ai) throw new AIError("AI is not configured (set OPENROUTER_API_KEY or NVIDIA_API_KEY).");

  const jsonSchema = JSON.stringify(z.toJSONSchema(opts.schema), null, 2);
  const messages: any[] = [
    {
      role: "system",
      content: `${opts.system}\n\nRespond with a single JSON object only — no prose, no markdown fences. It must validate against this JSON Schema:\n${jsonSchema}`,
    },
    { role: "user", content: opts.prompt },
  ];

  let lastProblem = "";
  for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
    let completion: OpenAI.Chat.ChatCompletion;
    try {
      const extraBody: Record<string, any> = {};
      if (opts.enableReasoning !== false) {
        extraBody.reasoning = { enabled: true };
      }

      completion = await ai.chat.completions.create({
        model: AI_MODEL,
        messages: messages as any,
        temperature: 0.2,
        max_tokens: 8192,
        ...(Object.keys(extraBody).length > 0 ? ({ extra_body: extraBody } as any) : {}),
      });
    } catch (err) {
      if (err instanceof OpenAI.AuthenticationError || err instanceof OpenAI.PermissionDeniedError) {
        throw new AIError("AI API key is invalid or unauthorized.", err);
      }
      if (err instanceof OpenAI.NotFoundError || (err instanceof OpenAI.APIError && err.status === 410)) {
        throw new AIError(`AI model "${AI_MODEL}" is not available. Check your model name.`, err);
      }
      if (err instanceof OpenAI.RateLimitError) throw new AIError("AI service is rate limited.", err);
      if (err instanceof OpenAI.APIConnectionError) throw new AIError("Could not reach the AI service.", err);
      if (err instanceof OpenAI.APIError) throw new AIError(`AI service error (${err.status}): ${err.message}`, err);
      throw new AIError("AI request failed.", err);
    }

    const choice = completion.choices[0];
    const message = choice?.message;
    const text = message?.content ?? "";

    if (choice?.finish_reason === "length") {
      lastProblem = "response was truncated";
    } else {
      try {
        const parsed = opts.schema.safeParse(extractJson(text));
        if (parsed.success) return parsed.data;
        lastProblem = parsed.error.issues
          .slice(0, 5)
          .map((i) => `${i.path.join(".") || "(root)"}: ${i.message}`)
          .join("; ");
      } catch (err) {
        lastProblem = err instanceof Error ? err.message : "invalid JSON";
      }
    }

    // Preserve assistant message along with reasoning_details for reasoning continuation
    const assistantMessage: any = { role: "assistant", content: text };
    if ((message as any)?.reasoning_details) {
      assistantMessage.reasoning_details = (message as any).reasoning_details;
    }

    messages.push(
      assistantMessage,
      {
        role: "user",
        content: `That reply was not valid (${lastProblem}). Reply again with only the corrected JSON object.`,
      }
    );
  }

  throw new AIError(`AI returned output that did not match the expected format (${lastProblem}).`);
}

