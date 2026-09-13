"use strict";
// ─────────────────────────────────────────────────────────────
// packages/storage-supabase/src/incidents.ts
// 1:1 wrap of the queries that used to live inline in
// app/api/incidents/route.ts, .../[id]/route.ts, and .../[id]/analyse/route.ts.
//
// getIncidentWithSnapshots deliberately does NOT use PostgREST's embedded
// resource syntax (`snap_before:snapshot_before(normalised)`) even though
// that's what the original route used — that syntax is Postgres/PostgREST
// specific and has no SQLite equivalent. Two plain queries instead, so the
// exact same method signature works identically on SQLiteStorageAdapter.
// ─────────────────────────────────────────────────────────────
Object.defineProperty(exports, "__esModule", { value: true });
exports.SupabaseIncidentStore = void 0;
class SupabaseIncidentStore {
    db;
    constructor(db) {
        this.db = db;
    }
    async createIncident(teamId, data) {
        const { data: row, error } = await this.db
            .from("flowlens_incidents")
            .insert({
            workflow_id: data.workflow_id,
            team_id: teamId,
            status: "open",
            error_message: data.error_message ?? null,
            snapshot_before: data.snapshot_before ?? null,
            snapshot_after: data.snapshot_after ?? null,
        })
            .select()
            .single();
        if (error)
            throw new Error(error.message);
        return row;
    }
    async getIncident(teamId, id) {
        const { data, error } = await this.db
            .from("flowlens_incidents")
            .select("*")
            .eq("id", id)
            .eq("team_id", teamId)
            .maybeSingle();
        if (error)
            throw new Error(error.message);
        return data || null;
    }
    async getIncidentWithSnapshots(teamId, id) {
        const incident = await this.getIncident(teamId, id);
        if (!incident)
            return null;
        const [snapshotBefore, snapshotAfter] = await Promise.all([
            incident.snapshot_before ? this.fetchSnapshot(teamId, incident.snapshot_before) : null,
            incident.snapshot_after ? this.fetchSnapshot(teamId, incident.snapshot_after) : null,
        ]);
        return { incident, snapshotBefore, snapshotAfter };
    }
    async fetchSnapshot(teamId, id) {
        const { data } = await this.db
            .from("flowlens_snapshots")
            .select("*")
            .eq("id", id)
            .eq("team_id", teamId)
            .maybeSingle();
        return data || null;
    }
    async listIncidents(teamId, filter = {}) {
        let query = this.db
            .from("flowlens_incidents")
            .select("*")
            .eq("team_id", teamId)
            .order("detected_at", { ascending: false });
        if (filter.status)
            query = query.eq("status", filter.status);
        if (filter.workflowId)
            query = query.eq("workflow_id", filter.workflowId);
        const { data, error } = await query;
        if (error)
            throw new Error(error.message);
        return (data || []);
    }
    async updateIncident(teamId, id, data) {
        const { data: row, error } = await this.db
            .from("flowlens_incidents")
            .update(data)
            .eq("id", id)
            .eq("team_id", teamId)
            .select()
            .single();
        if (error)
            throw new Error(error.message);
        return row;
    }
}
exports.SupabaseIncidentStore = SupabaseIncidentStore;
