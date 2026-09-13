// ─────────────────────────────────────────────────────────────
// packages/core/src/ai/provider.ts
// Provider-agnostic AI client driven by config — endpoint URL, shape
// (request/response format), model name, and API key. No hardcoded
// provider list: OpenRouter, OpenAI, Google AI Studio, self-hosted
// vLLM/LM Studio/Ollama, or anything else that speaks OpenAI-compatible
// chat completions works by typing in the right endpoint.
//
// Two shapes today: "openai" (OpenAI, OpenRouter, Google AI Studio
// OpenAI-compat, vLLM, etc.) and "anthropic" (Claude native Messages API).
//
// This file lives in @flowlens/core so both the Next.js web app and the
// Electron desktop app can use the same provider with zero framework deps.
// ─────────────────────────────────────────────────────────────

export type ProviderShape = "openai" | "anthropic";

export interface ProviderConfig {
  endpoint: string;
  shape: ProviderShape;
  model: string;
  apiKey: string;
}

export interface ChatMessage {
  role: "user" | "assistant" | "system";
  content: string;
}

export interface CompleteOptions {
  maxTokens?: number;
  timeoutMs?: number;
}

function authHeaders(config: ProviderConfig): Record<string, string> {
  if (!config.apiKey) return {};
  return config.shape === "anthropic"
    ? { "x-api-key": config.apiKey, "anthropic-version": "2023-06-01" }
    : { Authorization: `Bearer ${config.apiKey}` };
}

function buildBody(
  config: ProviderConfig,
  messages: ChatMessage[],
  maxTokens: number,
  stream: boolean
) {
  if (config.shape === "anthropic") {
    const system = messages.find((m) => m.role === "system")?.content;
    return {
      model: config.model,
      max_tokens: maxTokens,
      stream,
      messages: messages.filter((m) => m.role !== "system"),
      ...(system ? { system } : {}),
    };
  }
  return { model: config.model, max_tokens: maxTokens, stream, messages };
}

export class AIProvider {
  constructor(private config: ProviderConfig) {}

  get model() {
    return this.config.model;
  }

  async complete(prompt: string, options: CompleteOptions = {}): Promise<string> {
    return this.chat([{ role: "user", content: prompt }], options);
  }

  async chat(messages: ChatMessage[], options: CompleteOptions = {}): Promise<string> {
    const res = await fetch(this.config.endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json", ...authHeaders(this.config) },
      body: JSON.stringify(buildBody(this.config, messages, options.maxTokens || 1000, false)),
      signal: AbortSignal.timeout(options.timeoutMs || 30000),
    });

    if (!res.ok) {
      throw new Error(`AI provider error (${res.status}): ${await res.text()}`);
    }

    const data = await res.json();
    return this.config.shape === "anthropic"
      ? data.content?.[0]?.text || ""
      : data.choices?.[0]?.message?.content || "";
  }

  async *streamChat(
    messages: ChatMessage[],
    options: CompleteOptions = {}
  ): AsyncGenerator<string> {
    const res = await fetch(this.config.endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json", ...authHeaders(this.config) },
      body: JSON.stringify(buildBody(this.config, messages, options.maxTokens || 1000, true)),
      signal: AbortSignal.timeout(options.timeoutMs || 60000),
    });

    if (!res.ok || !res.body) {
      throw new Error(
        `AI provider stream error (${res.status}): ${res.ok ? "no body" : await res.text()}`
      );
    }

    const reader = res.body.getReader();
    const decoder = new TextDecoder();
    let buffer = "";

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      buffer += decoder.decode(value, { stream: true });

      const lines = buffer.split("\n");
      buffer = lines.pop() || "";

      for (const line of lines) {
        if (!line.startsWith("data: ")) continue;
        const raw = line.slice(6).trim();
        if (raw === "[DONE]") return;

        try {
          const parsed = JSON.parse(raw);
          if (this.config.shape === "anthropic") {
            if (parsed.type === "content_block_delta" && parsed.delta?.text) {
              yield parsed.delta.text;
            }
          } else {
            const text = parsed.choices?.[0]?.delta?.content;
            if (text) yield text;
          }
        } catch {
          // partial/malformed chunk — skip
        }
      }
    }
  }

  async healthCheck(): Promise<{ ok: boolean; latencyMs: number; error?: string }> {
    const start = Date.now();
    try {
      await this.complete("ping", { maxTokens: 5, timeoutMs: 8000 });
      return { ok: true, latencyMs: Date.now() - start };
    } catch (e: unknown) {
      return {
        ok: false,
        latencyMs: Date.now() - start,
        error: e instanceof Error ? e.message : String(e),
      };
    }
  }

  async validateKey(): Promise<{ valid: boolean; error?: string }> {
    try {
      await this.complete("Respond with the single word: ok", { maxTokens: 5, timeoutMs: 10000 });
      return { valid: true };
    } catch (e: unknown) {
      return { valid: false, error: e instanceof Error ? e.message : String(e) };
    }
  }
}

export function createProvider(config: ProviderConfig): AIProvider {
  if (!config.endpoint) throw new Error("No AI provider endpoint configured.");
  if (!config.model) throw new Error("No AI model configured.");
  return new AIProvider(config);
}
