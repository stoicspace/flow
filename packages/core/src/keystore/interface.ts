// ─────────────────────────────────────────────────────────────
// packages/core/src/keystore/interface.ts
// The contract for *where a provider API key physically lives* — separate
// from the AIProvider class itself (which just needs a plaintext key handed
// to it at call time and doesn't care where it came from).
//
// Web: encrypted inside flowlens_teams.ai_settings (Supabase).
// Electron (future): OS keychain via `keytar` — never a plain file.
//
// Security note for whoever implements this next: an implementation must
// NEVER log the key, NEVER return it in a list/summary response, and
// NEVER round-trip it back through an API response after it's been saved.
// getKey() is for server-side/main-process use only — it should never be
// exposed over an HTTP route or IPC channel directly.
// ─────────────────────────────────────────────────────────────

export interface KeyStore {
  saveKey(providerId: string, apiKey: string): Promise<void>;
  getKey(providerId: string): Promise<string | null>;
  deleteKey(providerId: string): Promise<void>;
  hasKey(providerId: string): Promise<boolean>;
}
