// ─────────────────────────────────────────────────────────────
// packages/core/src/ai/resolveProvider.ts
// Resolves which AIProvider instance to use based on stored settings.
// Used by both the Next.js web app (cloud) and Electron (desktop) —
// the only difference is where settings come from (Supabase vs SQLite).
// ─────────────────────────────────────────────────────────────

import { AIProvider, createProvider, ProviderConfig } from "./provider";

export interface ResolvedProvider {
  provider: AIProvider;
  source: "custom" | "cloud";
}

export interface ProviderSettings {
  processing_location: string;
  ai_provider_endpoint?: string;
  ai_provider_shape?: string;
  ai_provider_model?: string;
  ai_provider_key?: string; // already decrypted
}

export interface CloudDefaults {
  endpoint: string;
  model: string;
  apiKey: string;
}

export function resolveProvider(
  settings: ProviderSettings,
  cloudDefaults: CloudDefaults
): ResolvedProvider {
  if (
    settings.processing_location === "self_hosted" &&
    settings.ai_provider_endpoint &&
    settings.ai_provider_model &&
    settings.ai_provider_key
  ) {
    return {
      provider: createProvider({
        endpoint: settings.ai_provider_endpoint,
        shape: (settings.ai_provider_shape as ProviderConfig["shape"]) || "openai",
        model: settings.ai_provider_model,
        apiKey: settings.ai_provider_key,
      }),
      source: "custom",
    };
  }

  return {
    provider: createProvider({
      endpoint: cloudDefaults.endpoint,
      shape: "openai",
      model: cloudDefaults.model,
      apiKey: cloudDefaults.apiKey,
    }),
    source: "cloud",
  };
}
