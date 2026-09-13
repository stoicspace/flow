// ─────────────────────────────────────────────────────────────
// src/lib/services/aiSettings.ts
// Single source of truth for the team's AI & Privacy settings, and the
// gate every AI-calling route uses to actually respect them.
//
// Previously these settings (app/api/settings/ai/route.ts) saved to the DB
// correctly but were never read anywhere else — toggling "AI analysis" off
// or setting "processing location" to local/self-hosted changed nothing.
// This file is what makes them real.
// ─────────────────────────────────────────────────────────────

import { createProvider, AIProvider } from "../ai/provider";
import { decryptApiKey } from "../ai/keyEncryption";

export interface AISettings {
  ai_analysis_enabled: boolean;
  workflow_data_processing: boolean;
  ai_documentation_enabled: boolean;
  automatic_reviews_enabled: boolean;
  privacy_mode: "standard" | "strict";
  // "self_hosted" now means "custom endpoint / BYOK" — the person has
  // pointed FlowLens at their own endpoint (see ai_provider_* fields
  // below). "local" is still Planned (on-device inference, no network
  // call at all) and stays unavailable until that's actually built.
  processing_location: "cloud" | "local" | "self_hosted";
  // Custom endpoint config — only meaningful when processing_location is
  // "self_hosted". ai_provider_key_encrypted is never sent to the client;
  // the settings route strips it and returns has_api_key instead.
  ai_provider_endpoint?: string;
  ai_provider_shape?: "openai" | "anthropic";
  ai_provider_model?: string;
  ai_provider_key_encrypted?: string;
}

export const DEFAULT_AI_SETTINGS: AISettings = {
  ai_analysis_enabled: true,
  workflow_data_processing: true,
  ai_documentation_enabled: true,
  automatic_reviews_enabled: false,
  privacy_mode: "standard",
  processing_location: "cloud",
};

// The real Supabase client's query builder is thenable but not a strict
// Promise (it has extra chainable methods), so this stays loosely typed —
// matching how `db` is typed everywhere else in this codebase — rather
// than fighting Supabase's builder types for a helper this small.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type DbLike = any;

export async function getAiSettings(db: DbLike, teamId: string): Promise<AISettings> {
  try {
    const { data, error } = await db
      .from("flowlens_teams")
      .select("ai_settings")
      .eq("id", teamId)
      .single();

    if (error) throw error;
    return { ...DEFAULT_AI_SETTINGS, ...(data?.ai_settings || {}) };
  } catch {
    // `ai_settings` column may not exist yet (pre-migration) — fall back to
    // defaults rather than blocking every AI call because of a schema gap.
    return DEFAULT_AI_SETTINGS;
  }
}

export type AiFeature =
  | "analysis"       // incident root-cause analysis, insights, reviews
  | "documentation"   // /api/ai/document
  | "automatic_review" // reviews/scans not directly requested by a click
  | "chat"            // /api/chat
  | "fix";             // Fix Workflow diagnose/apply

export interface AiGateResult {
  allowed: boolean;
  reason?: string;
  settings: AISettings;
}

// The one place that decides whether an AI call is allowed to happen.
// `includesWorkflowData` should be true for anything that sends node
// configs/edges/execution errors to the model (nearly everything except a
// context-free chat message).
export async function assertAiAllowed(
  db: DbLike,
  teamId: string,
  feature: AiFeature,
  { includesWorkflowData = true }: { includesWorkflowData?: boolean } = {}
): Promise<AiGateResult> {
  const settings = await getAiSettings(db, teamId);

  if (!settings.ai_analysis_enabled) {
    return {
      allowed: false,
      reason: "AI analysis is turned off for this workspace (Settings → AI & Privacy).",
      settings,
    };
  }

  if (feature === "documentation" && !settings.ai_documentation_enabled) {
    return {
      allowed: false,
      reason: "AI-generated documentation is turned off for this workspace (Settings → AI & Privacy).",
      settings,
    };
  }

  if (feature === "automatic_review" && !settings.automatic_reviews_enabled) {
    return {
      allowed: false,
      reason: "Automatic reviews are turned off for this workspace (Settings → AI & Privacy).",
      settings,
    };
  }

  if (includesWorkflowData && !settings.workflow_data_processing) {
    return {
      allowed: false,
      reason: "Sending workflow data to AI is turned off for this workspace (Settings → AI & Privacy).",
      settings,
    };
  }

  // Cloud always works (uses FlowLens's own key via env vars). Self-hosted
  // works once the person has actually finished configuring an endpoint —
  // refusing here with a clear reason beats silently falling back to cloud
  // and quietly ignoring their choice. Local isn't built yet at all.
  if (settings.processing_location === "local") {
    return {
      allowed: false,
      reason: `Local on-device processing isn't available yet. Switch to Cloud or Self-Hosted in Settings → AI & Privacy to use AI features.`,
      settings,
    };
  }

  if (settings.processing_location === "self_hosted") {
    if (!settings.ai_provider_endpoint || !settings.ai_provider_model || !settings.ai_provider_key_encrypted) {
      return {
        allowed: false,
        reason: "Self-hosted processing is selected but the endpoint, model, or API key isn't fully configured yet. Finish setup in Settings → AI & Privacy, or switch back to Cloud.",
        settings,
      };
    }
  }

  return { allowed: true, settings };
}

// The one place that decides which actual AIProvider instance to use for a
// team — resolves the team's custom endpoint if self-hosted is configured,
// otherwise falls back to FlowLens's own cloud provider (env vars).
// `assertAiAllowed` should always be called first; this function assumes
// the caller already knows the request is allowed.
export async function getTeamAIProvider(db: DbLike, teamId: string): Promise<AIProvider> {
  const settings = await getAiSettings(db, teamId);

  if (
    settings.processing_location === "self_hosted" &&
    settings.ai_provider_endpoint &&
    settings.ai_provider_model &&
    settings.ai_provider_key_encrypted
  ) {
    return createProvider({
      endpoint: settings.ai_provider_endpoint,
      shape: settings.ai_provider_shape || "openai",
      model: settings.ai_provider_model,
      apiKey: decryptApiKey(settings.ai_provider_key_encrypted),
    });
  }

  // Cloud fallback — FlowLens's own key. If OPENROUTER_API_KEY isn't set,
  // this throws when the provider actually tries to call out, which is the
  // correct failure mode (loud, not a silent no-op).
  return createProvider({
    endpoint: "https://openrouter.ai/api/v1/chat/completions",
    shape: "openai",
    // The previous hardcoded model (google/gemma-4-26b-a4b-it:free) was
    // broken — this is the fix called out in todo.md's "Immediate Next
    // Actions" #1, folded in here since it's the same code path.
    model: process.env.FLOWLENS_AI_MODEL || "google/gemini-2.0-flash-001",
    apiKey: process.env.OPENROUTER_API_KEY || "",
  });
}
