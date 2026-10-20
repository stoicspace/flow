import type { SupabaseClient } from "@supabase/supabase-js";
import type { Snapshot, SnapshotInput, SnapshotSummary, SnapshotUpdate } from "@flowlens/core";
export declare class SupabaseSnapshotStore {
    private db;
    constructor(db: SupabaseClient);
    createSnapshot(teamId: string, data: SnapshotInput): Promise<Snapshot>;
    getSnapshot(teamId: string, id: string): Promise<Snapshot | null>;
    listSnapshots(teamId: string, workflowId: string, limit?: number): Promise<SnapshotSummary[]>;
    updateSnapshot(teamId: string, id: string, data: SnapshotUpdate): Promise<Snapshot>;
    getLatestSuccessfulSnapshot(teamId: string, workflowId: string): Promise<Snapshot | null>;
    getLatestSnapshot(teamId: string, workflowId: string): Promise<Snapshot | null>;
}
//# sourceMappingURL=snapshots.d.ts.map