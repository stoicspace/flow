import type { SupabaseClient } from "@supabase/supabase-js";
import type { AuditLogEntry } from "@flowlens/core";
export declare class SupabaseAuditLogStore {
    private db;
    constructor(db: SupabaseClient);
    createAuditLogEntry(teamId: string, entry: AuditLogEntry): Promise<void>;
}
//# sourceMappingURL=auditLog.d.ts.map