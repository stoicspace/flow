import type { SupabaseClient } from "@supabase/supabase-js";
import type { Incident, IncidentInput, IncidentUpdate, IncidentFilter, IncidentWithSnapshots } from "@flowlens/core";
export declare class SupabaseIncidentStore {
    private db;
    constructor(db: SupabaseClient);
    createIncident(teamId: string, data: IncidentInput): Promise<Incident>;
    getIncident(teamId: string, id: string): Promise<Incident | null>;
    getIncidentWithSnapshots(teamId: string, id: string): Promise<IncidentWithSnapshots | null>;
    private fetchSnapshot;
    listIncidents(teamId: string, filter?: IncidentFilter): Promise<Incident[]>;
    updateIncident(teamId: string, id: string, data: IncidentUpdate): Promise<Incident>;
}
//# sourceMappingURL=incidents.d.ts.map