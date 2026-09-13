// apps/web/lib/ai/provider.ts — re-export from @flowlens/core
// The canonical implementation lives in packages/core/src/ai/provider.ts.
// This file exists only so existing imports like "@/lib/ai/provider" keep working.
export { AIProvider, createProvider } from "@flowlens/core";
export type { ProviderConfig, ProviderShape, ChatMessage, CompleteOptions } from "@flowlens/core";
