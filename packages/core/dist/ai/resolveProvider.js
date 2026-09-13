"use strict";
// ─────────────────────────────────────────────────────────────
// packages/core/src/ai/resolveProvider.ts
// Resolves which AIProvider instance to use based on stored settings.
// Used by both the Next.js web app (cloud) and Electron (desktop) —
// the only difference is where settings come from (Supabase vs SQLite).
// ─────────────────────────────────────────────────────────────
Object.defineProperty(exports, "__esModule", { value: true });
exports.resolveProvider = resolveProvider;
const provider_1 = require("./provider");
function resolveProvider(settings, cloudDefaults) {
    if (settings.processing_location === "self_hosted" &&
        settings.ai_provider_endpoint &&
        settings.ai_provider_model &&
        settings.ai_provider_key) {
        return {
            provider: (0, provider_1.createProvider)({
                endpoint: settings.ai_provider_endpoint,
                shape: settings.ai_provider_shape || "openai",
                model: settings.ai_provider_model,
                apiKey: settings.ai_provider_key,
            }),
            source: "custom",
        };
    }
    return {
        provider: (0, provider_1.createProvider)({
            endpoint: cloudDefaults.endpoint,
            shape: "openai",
            model: cloudDefaults.model,
            apiKey: cloudDefaults.apiKey,
        }),
        source: "cloud",
    };
}
