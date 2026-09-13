// ─────────────────────────────────────────────────────────────
// packages/storage-supabase/src/snapshots.ts
// 1:1 wrap of the queries that used to live inline in
// app/api/snapshots/route.ts, .../[id]/route.ts, .../import/route.ts, and
// .../restore/route.ts.
// ─────────────────────────────────────────────────────────────

import type { SupabaseClient } from "@supabase/supabase-js";
import type { Snapshot, SnapshotInput, SnapshotSummary, SnapshotUpdate } from "@flowlens/core";

const SNAPSHOT_SUMMARY_COLUMNS = "id, created_at, source, execution_status, error_message, label, created_by";

export class SupabaseSnapshotStore {
  constructor(private db: SupabaseClient) {}

  async createSnapshot(teamId: string, data: SnapshotInput): Promise<Snapshot> {
    const { data: row, error } = await this.db
      .from("flowlens_snapshots")
      .insert({
        workflow_id: data.workflow_id,
        team_id: teamId,
        normalised: data.normalised,
        raw: data.raw,
        source: data.source,
        label: data.label ?? null,
        // Omitted entirely (not set to null) when absent — lets the
        // column's own default/nullability apply exactly as it did before
        // this went through an adapter, e.g. webhook-created snapshots
        // have no created_by at all.
        ...(data.created_by ? { created_by: data.created_by } : {}),
        execution_status: data.execution_status ?? "unknown",
        error_message: data.error_message ?? null,
      })
      .select()
      .single();

    if (error) throw new Error(error.message);
    return row as Snapshot;
  }

  async getSnapshot(teamId: string, id: string): Promise<Snapshot | null> {
    const { data, error } = await this.db
      .from("flowlens_snapshots")
      .select("*")
      .eq("id", id)
      .eq("team_id", teamId)
      .maybeSingle();

    if (error) throw new Error(error.message);
    return (data as Snapshot) || null;
  }

  async listSnapshots(teamId: string, workflowId: string, limit = 50): Promise<SnapshotSummary[]> {
    const { data, error } = await this.db
      .from("flowlens_snapshots")
      .select(SNAPSHOT_SUMMARY_COLUMNS)
      .eq("workflow_id", workflowId)
      .eq("team_id", teamId)
      .order("created_at", { ascending: false })
      .limit(limit);

    if (error) throw new Error(error.message);
    return (data || []) as unknown as SnapshotSummary[];
  }

  async updateSnapshot(teamId: string, id: string, data: SnapshotUpdate): Promise<Snapshot> {
    const { data: row, error } = await this.db
      .from("flowlens_snapshots")
      .update(data)
      .eq("id", id)
      .eq("team_id", teamId)
      .select()
      .single();

    if (error) throw new Error(error.message);
    return row as Snapshot;
  }

  async getLatestSuccessfulSnapshot(teamId: string, workflowId: string): Promise<Snapshot | null> {
    const { data, error } = await this.db
      .from("flowlens_snapshots")
      .select("*")
      .eq("workflow_id", workflowId)
      .eq("team_id", teamId)
      .eq("execution_status", "success")
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (error) throw new Error(error.message);
    return (data as Snapshot) || null;
  }

  async getLatestSnapshot(teamId: string, workflowId: string): Promise<Snapshot | null> {
    const { data, error } = await this.db
      .from("flowlens_snapshots")
      .select("*")
      .eq("workflow_id", workflowId)
      .eq("team_id", teamId)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (error) throw new Error(error.message);
    return (data as Snapshot) || null;
  }
}
