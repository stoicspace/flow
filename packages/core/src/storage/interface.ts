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

import {
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
  FixAttempt,
  FixAttemptInput,
  FixAttemptUpdate,
  AuditLogEntry,
} from "./types";

export interface StorageAdapter {
  createWorkflow(teamId: string, data: WorkflowInput): Promise<Workflow>;
  getWorkflow(teamId: string, id: string): Promise<Workflow | null>;
  listWorkflows(teamId: string): Promise<Workflow[]>;
  updateWorkflow(teamId: string, id: string, data: WorkflowUpdate): Promise<Workflow>;
  deleteWorkflow(teamId: string, id: string): Promise<void>;
  // Deliberately does NOT take teamId — used only by inbound, unauthenticated
  // webhook handlers that receive an external platform's workflow id before
  // they know which team it belongs to. The returned Workflow's `team_id`
  // is what the caller then uses to scope every subsequent call. Every
  // other method on this interface takes teamId as an explicit first
  // argument for a reason (see adapter.ts's header comment) — this is the
  // one deliberate, narrow exception, not a precedent to copy elsewhere.
  findWorkflowByExternalId(externalId: string): Promise<Workflow | null>;

  createSnapshot(teamId: string, data: SnapshotInput): Promise<Snapshot>;
  getSnapshot(teamId: string, id: string): Promise<Snapshot | null>;
  listSnapshots(teamId: string, workflowId: string, limit?: number): Promise<SnapshotSummary[]>;
  updateSnapshot(teamId: string, id: string, data: SnapshotUpdate): Promise<Snapshot>;
  getLatestSnapshot(teamId: string, workflowId: string): Promise<Snapshot | null>;
  getLatestSuccessfulSnapshot(teamId: string, workflowId: string): Promise<Snapshot | null>;

  createIncident(teamId: string, data: IncidentInput): Promise<Incident>;
  getIncident(teamId: string, id: string): Promise<Incident | null>;
  getIncidentWithSnapshots(teamId: string, id: string): Promise<IncidentWithSnapshots | null>;
  listIncidents(teamId: string, filter?: IncidentFilter): Promise<Incident[]>;
  updateIncident(teamId: string, id: string, data: IncidentUpdate): Promise<Incident>;

  createAuditLogEntry(teamId: string, entry: AuditLogEntry): Promise<void>;

  createFixAttempt(teamId: string, data: FixAttemptInput): Promise<FixAttempt>;
  getFixAttempt(teamId: string, workflowId: string, id: string): Promise<FixAttempt | null>;
  listFixAttempts(teamId: string, workflowId: string, limit?: number): Promise<FixAttempt[]>;
  updateFixAttempt(teamId: string, id: string, data: FixAttemptUpdate): Promise<FixAttempt>;
}
