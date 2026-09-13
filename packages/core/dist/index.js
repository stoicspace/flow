"use strict";
// ─────────────────────────────────────────────────────────────
// packages/core/src/index.ts
// Public API of @flowlens/core — the only file consumers should import
// from. Everything exported here has zero Next.js/Supabase/React
// dependency: it takes plain JS objects in, returns plain JS objects out.
// This is what makes it safe to run identically in the Next.js web app's
// server routes and inside Electron's main process.
// ─────────────────────────────────────────────────────────────
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __exportStar = (this && this.__exportStar) || function(m, exports) {
    for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports, p)) __createBinding(exports, m, p);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.resolveProvider = exports.maskApiKey = exports.decryptApiKey = exports.encryptApiKey = exports.createProvider = exports.AIProvider = exports.testRepair = exports.normalizeOperations = exports.validateOperations = exports.applyOperations = exports.diffWorkflows = exports.detectPlatform = exports.normalise = void 0;
// Shared types — every other export here uses these
__exportStar(require("./types"), exports);
// Workflow normalisation — turns raw n8n/Make/Zapier JSON into FlowLens's
// internal NormalisedWorkFlow shape
var normalizer_1 = require("./normalizer");
Object.defineProperty(exports, "normalise", { enumerable: true, get: function () { return normalizer_1.normalise; } });
Object.defineProperty(exports, "detectPlatform", { enumerable: true, get: function () { return normalizer_1.detectPlatform; } });
// Diffing — compares two NormalisedWorkFlow snapshots
var diff_1 = require("./diff");
Object.defineProperty(exports, "diffWorkflows", { enumerable: true, get: function () { return diff_1.diffWorkflows; } });
// Repair pipeline — apply/validate/test a set of proposed fixes.
// Note: generating a repair *suggestion* (calling the AI) is NOT here —
// that lives in apps/web/lib/services/ai.ts, since it needs a live
// AIProvider instance. Core only knows how to apply, validate, and test
// operations once a suggestion already exists.
// Storage — the contract for where Workflow/Snapshot/Incident records
// live. Implementations (Supabase, SQLite) are separate packages that
// depend on this interface, not the other way around.
__exportStar(require("./storage/types"), exports);
__exportStar(require("./storage/interface"), exports);
// KeyStore — the contract for where a provider API key physically lives.
__exportStar(require("./keystore/interface"), exports);
var repairEngine_1 = require("./repairEngine");
Object.defineProperty(exports, "applyOperations", { enumerable: true, get: function () { return repairEngine_1.applyOperations; } });
var repairValidator_1 = require("./repairValidator");
Object.defineProperty(exports, "validateOperations", { enumerable: true, get: function () { return repairValidator_1.validateOperations; } });
Object.defineProperty(exports, "normalizeOperations", { enumerable: true, get: function () { return repairValidator_1.normalizeOperations; } });
var repairTest_1 = require("./repairTest");
Object.defineProperty(exports, "testRepair", { enumerable: true, get: function () { return repairTest_1.testRepair; } });
// AI provider — config-driven, no hardcoded providers. Both web and
// desktop import this to construct an AIProvider from stored settings.
var provider_1 = require("./ai/provider");
Object.defineProperty(exports, "AIProvider", { enumerable: true, get: function () { return provider_1.AIProvider; } });
Object.defineProperty(exports, "createProvider", { enumerable: true, get: function () { return provider_1.createProvider; } });
// Key encryption — AES-256-GCM for BYOK API keys. Accepts secret as
// parameter so it works without process.env in Electron's main process.
var keyEncryption_1 = require("./ai/keyEncryption");
Object.defineProperty(exports, "encryptApiKey", { enumerable: true, get: function () { return keyEncryption_1.encryptApiKey; } });
Object.defineProperty(exports, "decryptApiKey", { enumerable: true, get: function () { return keyEncryption_1.decryptApiKey; } });
Object.defineProperty(exports, "maskApiKey", { enumerable: true, get: function () { return keyEncryption_1.maskApiKey; } });
// Provider resolver — determines which AIProvider to use based on
// stored settings (self-hosted custom endpoint vs cloud fallback).
var resolveProvider_1 = require("./ai/resolveProvider");
Object.defineProperty(exports, "resolveProvider", { enumerable: true, get: function () { return resolveProvider_1.resolveProvider; } });
