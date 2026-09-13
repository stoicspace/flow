// ─────────────────────────────────────────────────────────────
// src/app/api/settings/ai/route.ts
// GET   /api/settings/ai — team's AI & privacy settings
// PATCH /api/settings/ai — update them
// ─────────────────────────────────────────────────────────────

import { NextResponse } from "next/server";
import { getAuthContext } from "@/lib/supabase/auth-helper";
import { AISettings, DEFAULT_AI_SETTINGS, getAiSettings } from "@/lib/services/aiSettings";
import { maskApiKey } from "@/lib/ai/keyEncryption";
import { createProvider } from "@/lib/ai/provider";
import { SupabaseKeyStore } from "@/lib/keystore/supabaseKeyStore";

export type { AISettings };

// Only one custom-provider key slot exists today (see SupabaseKeyStore's
// header comment) — this constant just names that slot so the KeyStore
// interface's providerId parameter has something stable to pass. Not a
// real per-provider id yet.
const CUSTOM_PROVIDER_SLOT = "custom";

// Strips the encrypted key out of anything sent to the client, replacing
// it with a boolean + masked hint so the UI can show "configured" without
// ever seeing the real value again.
function toClientSettings(settings: AISettings, plainKeyForMasking?: string) {
  const { ai_provider_key_encrypted, ...rest } = settings;
  return {
    ...rest,
    has_api_key: !!ai_provider_key_encrypted,
    api_key_hint: plainKeyForMasking ? maskApiKey(plainKeyForMasking) : undefined,
  };
}

export async function GET() {
  const ctx = await getAuthContext();
  if (ctx.error) return ctx.error;
  const { teamId, db } = ctx;

  const settings = await getAiSettings(db, teamId);
  return NextResponse.json({ settings: toClientSettings(settings) });
}

export async function PATCH(request: Request) {
  const ctx = await getAuthContext();
  if (ctx.error) return ctx.error;
  const { teamId, db } = ctx;

  const body = await request.json();
  const allowed: (keyof AISettings)[] = [
    "ai_analysis_enabled",
    "workflow_data_processing",
    "ai_documentation_enabled",
    "automatic_reviews_enabled",
    "privacy_mode",
    "processing_location",
    "ai_provider_endpoint",
    "ai_provider_shape",
    "ai_provider_model",
  ];

  const updates: Partial<AISettings> = {};
  allowed.forEach(k => { if (k in body) (updates as Record<string, unknown>)[k] = body[k]; });

  try {
    // Compute the merged settings in memory first — nothing gets written
    // until any submitted key has been validated. Writing non-secret
    // fields before validation would leave processing_location=self_hosted
    // persisted even if the key/endpoint combo turns out not to work,
    // which is exactly the half-saved state this route is meant to avoid.
    const existing = await getAiSettings(db, teamId);
    const merged: AISettings = { ...DEFAULT_AI_SETTINGS, ...existing, ...updates };

    // `ai_provider_api_key` is write-only: plaintext in, encrypted out,
    // never round-tripped back to the client. Only present when the
    // person is actually setting/changing a key.
    const rawKey: string | undefined = body.ai_provider_api_key;
    let plainKeyForMasking: string | undefined;

    if (typeof rawKey === "string" && rawKey.length > 0) {
      const candidate = createProvider({
        endpoint: merged.ai_provider_endpoint || "",
        shape: merged.ai_provider_shape || "openai",
        model: merged.ai_provider_model || "",
        apiKey: rawKey,
      });
      const result = await candidate.validateKey();
      if (!result.valid) {
        return NextResponse.json(
          { error: `Could not connect with these settings: ${result.error || "unknown error"}` },
          { status: 400 }
        );
      }
      plainKeyForMasking = rawKey;
    }

    // Only now does anything actually get written.
    const { error: settingsError } = await db
      .from("flowlens_teams")
      .update({ ai_settings: merged })
      .eq("id", teamId);
    if (settingsError) throw settingsError;

    // The key, once validated, goes through the KeyStore abstraction — the
    // same interface Electron's ElectronKeyStore fulfils, so this is the
    // one code path that changes when this logic eventually runs there.
    // Runs after the settings write above so its internal read-merge-write
    // sees the just-saved endpoint/shape/model rather than stale values.
    if (plainKeyForMasking) {
      const keyStore = new SupabaseKeyStore(db, teamId);
      await keyStore.saveKey(CUSTOM_PROVIDER_SLOT, plainKeyForMasking);
    }

    const finalSettings = await getAiSettings(db, teamId);
    return NextResponse.json({ settings: toClientSettings(finalSettings, plainKeyForMasking) });
  } catch (e: unknown) {
    console.error("Saving ai_settings failed:", e);
    const message = e instanceof Error ? e.message : "Could not save settings.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

