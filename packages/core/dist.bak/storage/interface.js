"use strict";
// ─────────────────────────────────────────────────────────────
// packages/core/src/storage/interface.ts
// The contract every storage backend implements. Nothing in this file
// talks to a database — it's the shape both the Supabase-backed adapter
// (apps/web, multi-tenant, RLS) and the SQLite-backed adapter (Electron,
// single-tenant) agree to fulfil.
//
// Scope note: only Workflow methods are defined so far. Snapshots and
// Incidents follow the identical pattern — add them here, then implement
// on both adapters, one resource at a time. Don't add a method here
// without also adding it to both adapters in the same change; a
// half-implemented interface is worse than a small one.
// ─────────────────────────────────────────────────────────────
Object.defineProperty(exports, "__esModule", { value: true });
