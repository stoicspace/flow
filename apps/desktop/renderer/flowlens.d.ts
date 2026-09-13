export interface FlowLensAPI {
  ai: {
    saveKey: (provider: string, key: string) => Promise<{ ok: boolean; error?: string }>;
    getKeyStatus: (provider: string) => Promise<{ hasKey: boolean }>;
    deleteKey: (provider: string) => Promise<{ ok: boolean; error?: string }>;
    healthCheck: () => Promise<{ ok: boolean; latencyMs: number; error?: string }>;
  };
  db: {
    listWorkflows: () => Promise<any[]>;
    getWorkflow: (id: string) => Promise<any | null>;
    listSnapshots: (workflowId: string) => Promise<any[]>;
    getSnapshot: (id: string) => Promise<any | null>;
    listIncidents: (filter?: { status?: string; workflowId?: string }) => Promise<any[]>;
    getIncident: (id: string) => Promise<any | null>;
  };
  workflow: {
    import: (json: unknown) => Promise<{ ok: boolean; workflowId?: string; error?: string }>;
    export: (id: string) => Promise<{ ok: boolean; data?: any; error?: string }>;
  };
  app: {
    version: () => Promise<string>;
  };
  license: {
    validate: (key: string) => Promise<{ ok: boolean; error?: string }>;
    getStatus: () => Promise<{ licensed: boolean; plan?: string; expiresAt?: number | null }>;
    remove: () => Promise<{ ok: boolean }>;
  };
  connections: {
    saveN8n: (baseUrl: string, apiKey: string) => Promise<{ ok: boolean; error?: string }>;
    testN8n: () => Promise<{ ok: boolean; error?: string }>;
    syncN8n: () => Promise<{ ok: boolean; count?: number; error?: string }>;
    autoDetect: () => Promise<{ found: boolean }>;
  };
}

declare global {
  interface Window {
    flowlens: FlowLensAPI;
  }
}
