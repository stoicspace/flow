export interface FlowNode {
    id:string,
    type: string,
    label: string,
    config: Record<string, unknown>;
    credential_ref?: string;
    position?: {x:number, y:number};
}

export interface FlowEdge {
    id:string,
    source:string;
    target:string;
    label?: string;
}

export interface NormalisedWorkFlow {
    nodes: FlowNode[];
    edges: FlowEdge[];
    meta? : {
        platform: "n8n" | "zapier" | "make" | "manual" ;
        name: string;
        version?: string;
    };

}

export type DiffStatus = "added" | "removed" | "modified" | "unchanged";

export interface NodeDiff {
    nodeId : string;
    nodeLabel: string;
    status: DiffStatus;
    changedFields? : Array<{field:string; before: unknown; after: unknown;}>;
}

export interface WorkflowDiff {
    nodes:NodeDiff[];
    edgesChanged: boolean;
    summary: {added:number, removed:number, modified:number};
}

// ── Fix Workflow (MVP repair loop) ──────────────────────────────────────────
// Diagnose -> generate structured operations -> validate -> apply -> test.
// Kept deliberately small: five operation types cover the "first 5 fix
// categories" (API failures, missing error handling, invalid config, data
// mapping, reliability). Add new types here as new categories are supported.

export type RepairOperationType =
    | "ADD_RETRY"
    | "ADD_TIMEOUT"
    | "SET_CONFIG_FIELD"
    | "ADD_ERROR_HANDLER"
    | "FIX_DATA_MAPPING";

export interface RepairOperation {
    type: RepairOperationType;
    nodeId: string;
    // ADD_RETRY
    maxRetries?: number;
    backoff?: "fixed" | "exponential";
    // ADD_TIMEOUT
    timeoutMs?: number;
    // SET_CONFIG_FIELD / FIX_DATA_MAPPING
    field?: string;
    value?: unknown;
    fromPath?: string;
    toPath?: string;
    // ADD_ERROR_HANDLER — id/label for the new fallback node this op inserts
    handlerNodeId?: string;
    handlerLabel?: string;
    handlerType?: string;
}

export interface RepairSuggestion {
    diagnosis: string;
    reason: string;
    operations: RepairOperation[];
}

export interface ValidationResult {
    valid: boolean;
    errors: string[];
}

export interface FixTestCheck {
    label: string;
    passed: boolean;
}

export interface FixTestResult {
    passed: boolean;
    message: string;
    checks: FixTestCheck[];
}

export type FixAttemptStatus =
    | "proposed"
    | "validated"
    | "applied"
    | "testing"
    | "success"
    | "failed";

export interface FixAttempt {
    id: string;
    workflow_id: string;
    team_id: string;
    base_snapshot_id: string | null;
    result_snapshot_id: string | null;
    attempt_number: number;
    retry_of: string | null;
    user_request: string | null;
    error_message: string | null;
    diagnosis: string | null;
    reason: string | null;
    operations: RepairOperation[];
    validation: ValidationResult | null;
    test_result: FixTestResult | null;
    status: FixAttemptStatus;
    created_by: string | null;
    created_at: string;
    updated_at: string;
}