// ─────────────────────────────────────────────────────────────
// packages/storage-supabase/src/fixAttempts.ts
// 1:1 wrap of the queries that used to live inline in
// app/api/workflows/[id]/fix/route.ts and .../[attemptId]/apply/route.ts.
// ─────────────────────────────────────────────────────────────

import type { SupabaseClient } from "@supabase/supabase-js";
import type { FixAttempt, FixAttemptInput, FixAttemptUpdate } from "@flowlens/core";

export class SupabaseFixAttemptStore {
  constructor(private db: SupabaseClient) {}

  async createFixAttempt(teamId: string, data: FixAttemptInput): Promise<FixAttempt> {
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

    if (error) throw new Error(error.message);
    return row as FixAttempt;
  }

  async getFixAttempt(teamId: string, workflowId: string, id: string): Promise<FixAttempt | null> {
    const { data, error } = await this.db
      .from("flowlens_fix_attempts")
      .select("*")
      .eq("id", id)
      .eq("workflow_id", workflowId)
      .eq("team_id", teamId)
      .maybeSingle();

    if (error) throw new Error(error.message);
    return (data as FixAttempt) || null;
  }

  async listFixAttempts(teamId: string, workflowId: string, limit = 20): Promise<FixAttempt[]> {
    const { data, error } = await this.db
      .from("flowlens_fix_attempts")
      .select("*")
      .eq("workflow_id", workflowId)
      .eq("team_id", teamId)
      .order("created_at", { ascending: false })
      .limit(limit);

    if (error) throw new Error(error.message);
    return (data || []) as FixAttempt[];
  }

  async updateFixAttempt(teamId: string, id: string, data: FixAttemptUpdate): Promise<FixAttempt> {
    const { data: row, error } = await this.db
      .from("flowlens_fix_attempts")
      .update({ ...data, updated_at: new Date().toISOString() })
      .eq("id", id)
      .eq("team_id", teamId)
      .select()
      .single();

    if (error) throw new Error(error.message);
    return row as FixAttempt;
  }
}
