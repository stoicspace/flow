// ─────────────────────────────────────────────────────────────
// apps/web/lib/keystore/supabaseKeyStore.ts
// Supabase implementation of the KeyStore interface from @flowlens/core.
//
// Deliberately wraps the EXISTING encryptApiKey/decryptApiKey functions in
// lib/ai/keyEncryption.ts instead of adding a new encryption scheme. This
// codebase already has two independent AES-256-GCM implementations
// (lib/services/crypto.ts for platform connection keys, lib/ai/keyEncryption.ts
// for BYOK provider keys) — a keystore built for this task must not become
// a third. If you want them fully consolidated onto one encryption key and
// one implementation, that's a deliberate follow-up, not something folded
// in silently here.
//
// Known limitation, stated plainly rather than hidden: flowlens_teams
// currently stores exactly ONE custom-provider key slot
// (ai_provider_key_encrypted on the ai_settings jsonb blob) — there's no
// per-providerId keying yet. This class honors the KeyStore interface's
// shape (providerId is accepted) but all providerId values currently read
// and write the same single slot. If you need to store a distinct key per
// provider simultaneously (e.g. an OpenAI key AND an Anthropic key active
// at once), aiSettings needs a `provider_keys: Record<string, string>`
// jsonb map instead of flat ai_provider_* fields — a schema change, not
// something this class can paper over safely.
//
// Security: getKey() is for server-side use only (called from API routes
// right before constructing an AIProvider) — never expose it over an HTTP
// response. saveKey() validates nothing itself; callers (see
// app/api/settings/ai/route.ts) are responsible for calling
// provider.validateKey() before persisting, same as before this class
// existed.
// ─────────────────────────────────────────────────────────────

import type { SupabaseClient } from "@supabase/supabase-js";
import type { KeyStore } from "@flowlens/core";
import { encryptApiKey, decryptApiKey } from "@/lib/ai/keyEncryption";
import { getAiSettings, DEFAULT_AI_SETTINGS, type AISettings } from "@/lib/services/aiSettings";

export class SupabaseKeyStore implements KeyStore {
  constructor(private db: SupabaseClient, private teamId: string) {}

  async saveKey(_providerId: string, apiKey: string): Promise<void> {
    const existing = await getAiSettings(this.db, this.teamId);
    const merged: AISettings = {
      ...DEFAULT_AI_SETTINGS,
      ...existing,
      ai_provider_key_encrypted: encryptApiKey(apiKey),
    };

    const { error } = await this.db
      .from("flowlens_teams")
      .update({ ai_settings: merged })
      .eq("id", this.teamId);

    if (error) throw new Error(error.message);
  }

  async getKey(_providerId: string): Promise<string | null> {
    const settings = await getAiSettings(this.db, this.teamId);
    if (!settings.ai_provider_key_encrypted) return null;
    return decryptApiKey(settings.ai_provider_key_encrypted);
  }

  async deleteKey(_providerId: string): Promise<void> {
    const existing = await getAiSettings(this.db, this.teamId);
    const merged: AISettings = { ...DEFAULT_AI_SETTINGS, ...existing };
    delete merged.ai_provider_key_encrypted;

    const { error } = await this.db
      .from("flowlens_teams")
      .update({ ai_settings: merged })
      .eq("id", this.teamId);

    if (error) throw new Error(error.message);
  }

  async hasKey(_providerId: string): Promise<boolean> {
    const settings = await getAiSettings(this.db, this.teamId);
    return !!settings.ai_provider_key_encrypted;
  }
}
