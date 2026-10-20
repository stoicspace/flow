"use strict";
// ─────────────────────────────────────────────────────────────
// packages/storage-supabase/src/auditLog.ts
// Wraps the change_log inserts that used to be duplicated inline across
// app/api/snapshots/import/route.ts and .../restore/route.ts.
// ─────────────────────────────────────────────────────────────
Object.defineProperty(exports, "__esModule", { value: true });
exports.SupabaseAuditLogStore = void 0;
class SupabaseAuditLogStore {
    db;
    constructor(db) {
        this.db = db;
    }
    async createAuditLogEntry(teamId, entry) {
        const { error } = await this.db.from("change_log").insert({
            workflow_id: entry.workflow_id,
            team_id: teamId,
            snapshot_id: entry.snapshot_id,
            actor_id: entry.actor_id,
            actor_type: entry.actor_type,
            action: entry.action,
        });
        // Audit logging failing shouldn't block the actual operation that
        // triggered it (import/restore already succeeded by the time this
        // runs) — log and continue, same as the original inline behavior which
        // never checked the insert's error at all.
        if (error)
            console.error("createAuditLogEntry failed:", error.message);
    }
}
exports.SupabaseAuditLogStore = SupabaseAuditLogStore;
