// ─────────────────────────────────────────────────────────────
// packages/storage-supabase/src/auditLog.ts
// Wraps the change_log inserts that used to be duplicated inline across
// app/api/snapshots/import/route.ts and .../restore/route.ts.
// ─────────────────────────────────────────────────────────────

import type { SupabaseClient } from "@supabase/supabase-js";
import type { AuditLogEntry } from "@flowlens/core";

export class SupabaseAuditLogStore {
  constructor(private db: SupabaseClient) {}

  async createAuditLogEntry(teamId: string, entry: AuditLogEntry): Promise<void> {
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
    if (error) console.error("createAuditLogEntry failed:", error.message);
  }
}
