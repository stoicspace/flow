// ─────────────────────────────────────────────────────────────
// packages/core/src/storage/types.ts
// The Workflow record shape, as agreed by every StorageAdapter
// implementation (Supabase today, SQLite for Electron later). This is
// deliberately a plain, framework-free interface — it must not import
// anything from Supabase's generated types or Node's sqlite bindings.
// ─────────────────────────────────────────────────────────────

export interface Workflow {
  id: string;
  team_id: string;
  name: string;
  platform: string;
  external_id: string | null;
  status: "unknown" | "healthy" | "degraded" | "failing";
  created_at: string;
  updated_at: string;
  last_snapshot_at: string | null;
  // Best-effort fields attached from the most recent snapshot — present on
  // list/get responses, never required on create.
  latest_ai_summary?: unknown | null;
  latest_ai_review?: unknown | null;
}

export type WorkflowInput = Pick<Workflow, "name" | "platform"> &
  Partial<Pick<Workflow, "external_id">>;

export type WorkflowUpdate = Partial<Pick<Workflow, "name" | "status" | "external_id" | "last_snapshot_at">>;

// ── Snapshot ─────────────────────────────────────────────────────────────
export interface Snapshot {
  id: string;
  team_id: string;
  workflow_id: string;
  normalised: unknown; // NormalisedWorkFlow — kept as `unknown` here to avoid
                        // a circular import between storage/types.ts and the
                        // top-level types.ts; callers cast at the boundary.
  raw: unknown;
  source: "webhook" | "manual" | "import" | "api" | "ai_fix";
  label: string | null;
  created_by: string | null;
  execution_status: "success" | "failure" | "unknown";
  error_message: string | null;
  created_at: string;
  ai_summary?: unknown | null;
  ai_review?: unknown | null;
  ai_documentation?: unknown | null;
}

export type SnapshotInput = Pick<Snapshot, "workflow_id" | "normalised" | "raw" | "source"> &
  Partial<Pick<Snapshot, "label" | "execution_status" | "error_message" | "created_by">>;

export type SnapshotUpdate = Partial<Pick<Snapshot, "ai_summary" | "ai_review" | "ai_documentation" | "execution_status" | "error_message">>;

// Trimmed shape returned by list endpoints — matches the original routes'
// `.select("id, created_at, source, execution_status, error_message, label, created_by")`,
// deliberately excluding the (large) `normalised`/`raw` payloads.
export type SnapshotSummary = Omit<Snapshot, "normalised" | "raw" | "ai_summary" | "ai_review" | "ai_documentation">;

// ── Incident ─────────────────────────────────────────────────────────────
export interface Incident {
  id: string;
  team_id: string;
  workflow_id: string;
  status: "open" | "resolved" | "dismissed";
  detected_at: string;
  resolved_at: string | null;
  error_message: string | null;
  snapshot_before: string | null; // snapshot id
  snapshot_after: string | null;  // snapshot id
  // AI analysis fields — all null until /analyse has run once.
  problem: string | null;
  root_cause: string | null;
  confidence: number | null;
  business_impact: string | null;
  impact_summary: string | null;
  what_changed: string | null;
  suggested_fix: unknown | null;
  execution_evidence: string | null;
  recovery_steps: unknown | null;
}

export type IncidentInput = Pick<Incident, "workflow_id"> &
  Partial<Pick<Incident, "error_message" | "snapshot_before" | "snapshot_after">>;

export type IncidentUpdate = Partial<
  Pick<
    Incident,
    | "status"
    | "resolved_at"
    | "problem"
    | "root_cause"
    | "confidence"
    | "business_impact"
    | "impact_summary"
    | "what_changed"
    | "suggested_fix"
    | "execution_evidence"
    | "recovery_steps"
  >
>;

export interface IncidentFilter {
  workflowId?: string;
  status?: Incident["status"];
}

// Returned by getIncidentWithSnapshots — the two linked snapshots resolved
// as plain queries rather than a database-specific embedded join, so this
// works identically whether the adapter is Postgres or SQLite.
export interface IncidentWithSnapshots {
  incident: Incident;
  snapshotBefore: Snapshot | null;
  snapshotAfter: Snapshot | null;
}

// ── Fix Attempt (repair loop) ───────────────────────────────────────────
// The FixAttempt record type itself already exists in ../types.ts (it's
// the shape generateRepairFix/applyOperations/testRepair already use) —
// re-exported here isn't needed since consumers import it from the
// top-level @flowlens/core barrel either way. Storage only needs the
// input/update shapes for its own create/update methods.
import type { FixAttempt } from "../types";
export type { FixAttempt };

export type FixAttemptInput = Pick<
  FixAttempt,
  "workflow_id" | "base_snapshot_id" | "attempt_number" | "operations" | "validation" | "status" | "created_by"
> &
  Partial<Pick<FixAttempt, "retry_of" | "user_request" | "error_message" | "diagnosis" | "reason">>;

export type FixAttemptUpdate = Partial<Pick<FixAttempt, "result_snapshot_id" | "test_result" | "status">>;

// ── Audit log (change_log) ──────────────────────────────────────────────
export interface AuditLogEntry {
  workflow_id: string;
  snapshot_id: string | null;
  actor_id: string;
  actor_type: "user" | "system" | "ai";
  action: string;
}
