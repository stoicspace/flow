// ─────────────────────────────────────────────────────────────
// packages/storage-supabase/src/adapter.ts
// Full Supabase implementation of StorageAdapter — composes workflow
// methods directly with the resource-specific stores (snapshots.ts,
// incidents.ts, auditLog.ts) for everything else.
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

import type { SupabaseClient } from "@supabase/supabase-js";
import type {
  StorageAdapter,
  Workflow,
  WorkflowInput,
  WorkflowUpdate,
  Snapshot,
  SnapshotInput,
  SnapshotSummary,
  SnapshotUpdate,
  Incident,
  IncidentInput,
  IncidentUpdate,
  IncidentFilter,
  IncidentWithSnapshots,
  FixAttemptInput,
  FixAttemptUpdate,
  AuditLogEntry,
} from "@flowlens/core";
import { SupabaseSnapshotStore } from "./snapshots";
import { SupabaseIncidentStore } from "./incidents";
import { SupabaseAuditLogStore } from "./auditLog";
import { SupabaseFixAttemptStore } from "./fixAttempts";

export class SupabaseStorageAdapter implements StorageAdapter {
  private snapshots: SupabaseSnapshotStore;
  private incidents: SupabaseIncidentStore;
  private auditLog: SupabaseAuditLogStore;
  private fixAttempts: SupabaseFixAttemptStore;

  constructor(private db: SupabaseClient) {
    this.snapshots = new SupabaseSnapshotStore(db);
    this.incidents = new SupabaseIncidentStore(db);
    this.auditLog = new SupabaseAuditLogStore(db);
    this.fixAttempts = new SupabaseFixAttemptStore(db);
  }

  async createWorkflow(teamId: string, data: WorkflowInput): Promise<Workflow> {
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

    if (error) throw new Error(error.message);
    return row as Workflow;
  }

  async getWorkflow(teamId: string, id: string): Promise<Workflow | null> {
    const { data, error } = await this.db
      .from("flowlens_workflows")
      .select("*")
      .eq("id", id)
      .eq("team_id", teamId)
      .maybeSingle();

    if (error) throw new Error(error.message);
    return (data as Workflow) || null;
  }

  async listWorkflows(teamId: string): Promise<Workflow[]> {
    const { data, error } = await this.db
      .from("flowlens_workflows")
      .select("*, flowlens_snapshots(count)")
      .eq("team_id", teamId)
      .order("updated_at", { ascending: false });

    if (error) throw new Error(error.message);
    const workflows = (data || []) as Workflow[];

    // Attach each workflow's latest AI summary/review — same best-effort,
    // one-bad-workflow-doesn't-fail-the-list behavior as the original
    // inline route logic.
    await Promise.all(
      workflows.map(async wf => {
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
        } catch {
          wf.latest_ai_summary = null;
          wf.latest_ai_review = null;
        }
      })
    );

    return workflows;
  }

  async updateWorkflow(teamId: string, id: string, data: WorkflowUpdate): Promise<Workflow> {
    const updates: Record<string, unknown> = { ...data, updated_at: new Date().toISOString() };

    const { data: row, error } = await this.db
      .from("flowlens_workflows")
      .update(updates)
      .eq("id", id)
      .eq("team_id", teamId)
      .select()
      .single();

    if (error) throw new Error(error.message);
    return row as Workflow;
  }

  async deleteWorkflow(teamId: string, id: string): Promise<void> {
    const { error } = await this.db
      .from("flowlens_workflows")
      .delete()
      .eq("id", id)
      .eq("team_id", teamId);

    if (error) throw new Error(error.message);
  }

  // No team_id filter here — see the interface's header comment on why
  // this method deliberately doesn't take teamId.
  async findWorkflowByExternalId(externalId: string): Promise<Workflow | null> {
    const { data, error } = await this.db
      .from("flowlens_workflows")
      .select("*")
      .eq("external_id", externalId)
      .maybeSingle();

    if (error) throw new Error(error.message);
    return (data as Workflow) || null;
  }

  // ── Snapshots — delegated to SupabaseSnapshotStore (snapshots.ts) ──────
  createSnapshot(teamId: string, data: SnapshotInput): Promise<Snapshot> {
    return this.snapshots.createSnapshot(teamId, data);
  }
  getSnapshot(teamId: string, id: string): Promise<Snapshot | null> {
    return this.snapshots.getSnapshot(teamId, id);
  }
  listSnapshots(teamId: string, workflowId: string, limit?: number): Promise<SnapshotSummary[]> {
    return this.snapshots.listSnapshots(teamId, workflowId, limit);
  }
  updateSnapshot(teamId: string, id: string, data: SnapshotUpdate): Promise<Snapshot> {
    return this.snapshots.updateSnapshot(teamId, id, data);
  }
  getLatestSuccessfulSnapshot(teamId: string, workflowId: string): Promise<Snapshot | null> {
    return this.snapshots.getLatestSuccessfulSnapshot(teamId, workflowId);
  }
  getLatestSnapshot(teamId: string, workflowId: string): Promise<Snapshot | null> {
    return this.snapshots.getLatestSnapshot(teamId, workflowId);
  }

  // ── Incidents — delegated to SupabaseIncidentStore (incidents.ts) ──────
  createIncident(teamId: string, data: IncidentInput): Promise<Incident> {
    return this.incidents.createIncident(teamId, data);
  }
  getIncident(teamId: string, id: string): Promise<Incident | null> {
    return this.incidents.getIncident(teamId, id);
  }
  getIncidentWithSnapshots(teamId: string, id: string): Promise<IncidentWithSnapshots | null> {
    return this.incidents.getIncidentWithSnapshots(teamId, id);
  }
  listIncidents(teamId: string, filter?: IncidentFilter): Promise<Incident[]> {
    return this.incidents.listIncidents(teamId, filter);
  }
  updateIncident(teamId: string, id: string, data: IncidentUpdate): Promise<Incident> {
    return this.incidents.updateIncident(teamId, id, data);
  }

  // ── Audit log — delegated to SupabaseAuditLogStore (auditLog.ts) ───────
  createAuditLogEntry(teamId: string, entry: AuditLogEntry): Promise<void> {
    return this.auditLog.createAuditLogEntry(teamId, entry);
  }

  // ── Fix attempts — delegated to SupabaseFixAttemptStore (fixAttempts.ts) ─
  createFixAttempt(teamId: string, data: FixAttemptInput) {
    return this.fixAttempts.createFixAttempt(teamId, data);
  }
  getFixAttempt(teamId: string, workflowId: string, id: string) {
    return this.fixAttempts.getFixAttempt(teamId, workflowId, id);
  }
  listFixAttempts(teamId: string, workflowId: string, limit?: number) {
    return this.fixAttempts.listFixAttempts(teamId, workflowId, limit);
  }
  updateFixAttempt(teamId: string, id: string, data: FixAttemptUpdate) {
    return this.fixAttempts.updateFixAttempt(teamId, id, data);
  }
}
