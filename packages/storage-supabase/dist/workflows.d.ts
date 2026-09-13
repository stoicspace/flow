import type { SupabaseClient } from "@supabase/supabase-js";
import type { StorageAdapter, Workflow, WorkflowInput, WorkflowUpdate } from "@flowlens/core";
export declare class SupabaseStorageAdapter implements StorageAdapter {
    private db;
    constructor(db: SupabaseClient);
    createWorkflow(teamId: string, data: WorkflowInput): Promise<Workflow>;
    getWorkflow(teamId: string, id: string): Promise<Workflow | null>;
    listWorkflows(teamId: string): Promise<Workflow[]>;
    updateWorkflow(teamId: string, id: string, data: WorkflowUpdate): Promise<Workflow>;
    deleteWorkflow(teamId: string, id: string): Promise<void>;
}
//# sourceMappingURL=workflows.d.ts.map