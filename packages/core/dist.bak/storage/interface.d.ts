import { Workflow, WorkflowInput, WorkflowUpdate, Snapshot, SnapshotInput, SnapshotSummary, SnapshotUpdate, Incident, IncidentInput, IncidentUpdate, IncidentFilter, IncidentWithSnapshots, FixAttempt, FixAttemptInput, FixAttemptUpdate, AuditLogEntry } from "./types";
export interface StorageAdapter {
    createWorkflow(teamId: string, data: WorkflowInput): Promise<Workflow>;
    getWorkflow(teamId: string, id: string): Promise<Workflow | null>;
    listWorkflows(teamId: string): Promise<Workflow[]>;
    updateWorkflow(teamId: string, id: string, data: WorkflowUpdate): Promise<Workflow>;
    deleteWorkflow(teamId: string, id: string): Promise<void>;
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
//# sourceMappingURL=interface.d.ts.map