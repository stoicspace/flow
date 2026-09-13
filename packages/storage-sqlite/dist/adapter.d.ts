import type { StorageAdapter, Workflow, WorkflowInput, WorkflowUpdate, Snapshot, SnapshotInput, SnapshotSummary, SnapshotUpdate, Incident, IncidentInput, IncidentUpdate, IncidentFilter, IncidentWithSnapshots, FixAttempt, FixAttemptInput, FixAttemptUpdate, AuditLogEntry } from "@flowlens/core";
export declare class SQLiteStorageAdapter implements StorageAdapter {
    private db;
    constructor(dbPath: string);
    private runMigrations;
    private toWorkflow;
    createWorkflow(teamId: string, data: WorkflowInput): Promise<Workflow>;
    getWorkflow(_teamId: string, id: string): Promise<Workflow | null>;
    listWorkflows(_teamId: string): Promise<Workflow[]>;
    updateWorkflow(teamId: string, id: string, data: WorkflowUpdate): Promise<Workflow>;
    deleteWorkflow(_teamId: string, id: string): Promise<void>;
    findWorkflowByExternalId(externalId: string): Promise<Workflow | null>;
    private toSnapshot;
    private toSnapshotSummary;
    createSnapshot(teamId: string, data: SnapshotInput): Promise<Snapshot>;
    getSnapshot(_teamId: string, id: string): Promise<Snapshot | null>;
    listSnapshots(_teamId: string, workflowId: string, limit?: number): Promise<SnapshotSummary[]>;
    updateSnapshot(teamId: string, id: string, data: SnapshotUpdate): Promise<Snapshot>;
    getLatestSuccessfulSnapshot(_teamId: string, workflowId: string): Promise<Snapshot | null>;
    getLatestSnapshot(_teamId: string, workflowId: string): Promise<Snapshot | null>;
    private toIncident;
    createIncident(teamId: string, data: IncidentInput): Promise<Incident>;
    getIncident(_teamId: string, id: string): Promise<Incident | null>;
    getIncidentWithSnapshots(teamId: string, id: string): Promise<IncidentWithSnapshots | null>;
    listIncidents(_teamId: string, filter?: IncidentFilter): Promise<Incident[]>;
    updateIncident(teamId: string, id: string, data: IncidentUpdate): Promise<Incident>;
    createAuditLogEntry(_teamId: string, entry: AuditLogEntry): Promise<void>;
    private toFixAttempt;
    createFixAttempt(teamId: string, data: FixAttemptInput): Promise<FixAttempt>;
    getFixAttempt(_teamId: string, workflowId: string, id: string): Promise<FixAttempt | null>;
    listFixAttempts(_teamId: string, workflowId: string, limit?: number): Promise<FixAttempt[]>;
    updateFixAttempt(_teamId: string, id: string, data: FixAttemptUpdate): Promise<FixAttempt>;
}
//# sourceMappingURL=adapter.d.ts.map