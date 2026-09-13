"use strict";
// ─────────────────────────────────────────────────────────────
// packages/storage-supabase/src/fixAttempts.ts
// 1:1 wrap of the queries that used to live inline in
// app/api/workflows/[id]/fix/route.ts and .../[attemptId]/apply/route.ts.
// ─────────────────────────────────────────────────────────────
Object.defineProperty(exports, "__esModule", { value: true });
exports.SupabaseFixAttemptStore = void 0;
class SupabaseFixAttemptStore {
    db;
    constructor(db) {
        this.db = db;
    }
    async createFixAttempt(teamId, data) {
        const { data: row, error } = await this.db
            .from("flowlens_fix_attempts")
            .insert({
            workflow_id: data.workflow_id,
            team_id: teamId,
            base_snapshot_id: data.base_snapshot_id,
            attempt_number: data.attempt_number,
            retry_of: data.retry_of ?? null,
            user_request: data.user_request ?? null,
            error_message: data.error_message ?? null,
            diagnosis: data.diagnosis ?? null,
            reason: data.reason ?? null,
            operations: data.operations,
            validation: data.validation,
            status: data.status,
            created_by: data.created_by,
        })
            .select()
            .single();
        if (error)
            throw new Error(error.message);
        return row;
    }
    async getFixAttempt(teamId, workflowId, id) {
        const { data, error } = await this.db
            .from("flowlens_fix_attempts")
            .select("*")
            .eq("id", id)
            .eq("workflow_id", workflowId)
            .eq("team_id", teamId)
            .maybeSingle();
        if (error)
            throw new Error(error.message);
        return data || null;
    }
    async listFixAttempts(teamId, workflowId, limit = 20) {
        const { data, error } = await this.db
            .from("flowlens_fix_attempts")
            .select("*")
            .eq("workflow_id", workflowId)
            .eq("team_id", teamId)
            .order("created_at", { ascending: false })
            .limit(limit);
        if (error)
            throw new Error(error.message);
        return (data || []);
    }
    async updateFixAttempt(teamId, id, data) {
        const { data: row, error } = await this.db
            .from("flowlens_fix_attempts")
            .update({ ...data, updated_at: new Date().toISOString() })
            .eq("id", id)
            .eq("team_id", teamId)
            .select()
            .single();
        if (error)
            throw new Error(error.message);
        return row;
    }
}
exports.SupabaseFixAttemptStore = SupabaseFixAttemptStore;
