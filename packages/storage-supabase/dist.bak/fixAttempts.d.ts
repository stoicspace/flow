import type { SupabaseClient } from "@supabase/supabase-js";
import type { FixAttempt, FixAttemptInput, FixAttemptUpdate } from "@flowlens/core";
export declare class SupabaseFixAttemptStore {
    private db;
    constructor(db: SupabaseClient);
    createFixAttempt(teamId: string, data: FixAttemptInput): Promise<FixAttempt>;
    getFixAttempt(teamId: string, workflowId: string, id: string): Promise<FixAttempt | null>;
    listFixAttempts(teamId: string, workflowId: string, limit?: number): Promise<FixAttempt[]>;
    updateFixAttempt(teamId: string, id: string, data: FixAttemptUpdate): Promise<FixAttempt>;
}
//# sourceMappingURL=fixAttempts.d.ts.map