"use strict";
// ─────────────────────────────────────────────────────────────
// packages/storage-supabase/src/workflows.ts
// Supabase implementation of the Workflow half of StorageAdapter.
//
// This is a 1:1 wrap of the queries that used to live inline in
// apps/web/app/api/workflows/route.ts and .../[id]/route.ts — behavior is
// unchanged, this just gives it a name and a shared interface so the same
// API routes can later run against SQLiteStorageAdapter in Electron
// without a rewrite.
//
// Security note: this class only ever scopes queries by the `teamId`
// passed in by the caller — it never trusts a team_id embedded in the
// request body. Every method takes teamId as an explicit first argument
// for that reason; don't "simplify" this by reading it off `this` or a
// module-level variable, since that's how row isolation bugs happen
// between requests on a shared server.
// ─────────────────────────────────────────────────────────────
Object.defineProperty(exports, "__esModule", { value: true });
exports.SupabaseStorageAdapter = void 0;
class SupabaseStorageAdapter {
    db;
    constructor(db) {
        this.db = db;
    }
    async createWorkflow(teamId, data) {
        const { data: row, error } = await this.db
            .from("flowlens_workflows")
            .insert({
            name: data.name,
            platform: data.platform,
            external_id: data.external_id ?? null,
            team_id: teamId,
            status: "unknown",
        })
            .select()
            .single();
        if (error)
            throw new Error(error.message);
        return row;
    }
    async getWorkflow(teamId, id) {
        const { data, error } = await this.db
            .from("flowlens_workflows")
            .select("*")
            .eq("id", id)
            .eq("team_id", teamId)
            .maybeSingle();
        if (error)
            throw new Error(error.message);
        return data || null;
    }
    async listWorkflows(teamId) {
        const { data, error } = await this.db
            .from("flowlens_workflows")
            .select("*, flowlens_snapshots(count)")
            .eq("team_id", teamId)
            .order("updated_at", { ascending: false });
        if (error)
            throw new Error(error.message);
        const workflows = (data || []);
        // Attach each workflow's latest AI summary/review — same best-effort,
        // one-bad-workflow-doesn't-fail-the-list behavior as the original
        // inline route logic.
        await Promise.all(workflows.map(async (wf) => {
            try {
                const { data: snap } = await this.db
                    .from("flowlens_snapshots")
                    .select("ai_summary, ai_review, created_at")
                    .eq("workflow_id", wf.id)
                    .eq("team_id", teamId)
                    .order("created_at", { ascending: false })
                    .limit(1)
                    .maybeSingle();
                wf.latest_ai_summary = snap?.ai_summary || null;
                wf.latest_ai_review = snap?.ai_review || null;
            }
            catch {
                wf.latest_ai_summary = null;
                wf.latest_ai_review = null;
            }
        }));
        return workflows;
    }
    async updateWorkflow(teamId, id, data) {
        const updates = { ...data, updated_at: new Date().toISOString() };
        const { data: row, error } = await this.db
            .from("flowlens_workflows")
            .update(updates)
            .eq("id", id)
            .eq("team_id", teamId)
            .select()
            .single();
        if (error)
            throw new Error(error.message);
        return row;
    }
    async deleteWorkflow(teamId, id) {
        const { error } = await this.db
            .from("flowlens_workflows")
            .delete()
            .eq("id", id)
            .eq("team_id", teamId);
        if (error)
            throw new Error(error.message);
    }
}
exports.SupabaseStorageAdapter = SupabaseStorageAdapter;
