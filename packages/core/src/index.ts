// ─────────────────────────────────────────────────────────────
// packages/core/src/index.ts
// Public API of @flowlens/core — the only file consumers should import
// from. Everything exported here has zero Next.js/Supabase/React
// dependency: it takes plain JS objects in, returns plain JS objects out.
// This is what makes it safe to run identically in the Next.js web app's
// server routes and inside Electron's main process.
// ─────────────────────────────────────────────────────────────

// Shared types — every other export here uses these
export * from "./types";

// Workflow normalisation — turns raw n8n/Make/Zapier JSON into FlowLens's
// internal NormalisedWorkFlow shape
export { normalise, detectPlatform } from "./normalizer";

// Diffing — compares two NormalisedWorkFlow snapshots
export { diffWorkflows } from "./diff";

// Repair pipeline — apply/validate/test a set of proposed fixes.
// Note: generating a repair *suggestion* (calling the AI) is NOT here —
// that lives in apps/web/lib/services/ai.ts, since it needs a live
// AIProvider instance. Core only knows how to apply, validate, and test
// operations once a suggestion already exists.
// Storage — the contract for where Workflow/Snapshot/Incident records
// live. Implementations (Supabase, SQLite) are separate packages that
// depend on this interface, not the other way around.
export * from "./storage/types";
export * from "./storage/interface";

// KeyStore — the contract for where a provider API key physically lives.
export * from "./keystore/interface";

export { applyOperations } from "./repairEngine";
export { validateOperations, normalizeOperations } from "./repairValidator";
export { testRepair } from "./repairTest";

// AI provider — config-driven, no hardcoded providers. Both web and
// desktop import this to construct an AIProvider from stored settings.
export { AIProvider, createProvider } from "./ai/provider";
export type { ProviderConfig, ProviderShape, ChatMessage, CompleteOptions } from "./ai/provider";

// Key encryption — AES-256-GCM for BYOK API keys. Accepts secret as
// parameter so it works without process.env in Electron's main process.
export { encryptApiKey, decryptApiKey, maskApiKey } from "./ai/keyEncryption";

// Provider resolver — determines which AIProvider to use based on
// stored settings (self-hosted custom endpoint vs cloud fallback).
export { resolveProvider } from "./ai/resolveProvider";
export type { ResolvedProvider, ProviderSettings, CloudDefaults } from "./ai/resolveProvider";
