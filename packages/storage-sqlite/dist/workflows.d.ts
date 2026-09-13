import type { StorageAdapter, Workflow, WorkflowInput, WorkflowUpdate } from "@flowlens/core";
export declare class SQLiteStorageAdapter implements StorageAdapter {
    private db;
    constructor(dbPath: string);
    private runMigrations;
    private toWorkflow;
    createWorkflow(_teamId: string, data: WorkflowInput): Promise<Workflow>;
    getWorkflow(_teamId: string, id: string): Promise<Workflow | null>;
    listWorkflows(_teamId: string): Promise<Workflow[]>;
    updateWorkflow(_teamId: string, id: string, data: WorkflowUpdate): Promise<Workflow>;
    deleteWorkflow(_teamId: string, id: string): Promise<void>;
}
//# sourceMappingURL=workflows.d.ts.map