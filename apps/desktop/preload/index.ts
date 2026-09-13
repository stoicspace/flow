import { contextBridge, ipcRenderer } from "electron";

contextBridge.exposeInMainWorld("flowlens", {
  ai: {
    saveKey: (provider: string, key: string) =>
      ipcRenderer.invoke("ai:saveKey", provider, key),
    getKeyStatus: (provider: string) =>
      ipcRenderer.invoke("ai:getKeyStatus", provider),
    deleteKey: (provider: string) =>
      ipcRenderer.invoke("ai:deleteKey", provider),
    healthCheck: () =>
      ipcRenderer.invoke("ai:healthCheck"),
  },
  db: {
    listWorkflows: () =>
      ipcRenderer.invoke("db:listWorkflows"),
    getWorkflow: (id: string) =>
      ipcRenderer.invoke("db:getWorkflow", id),
    listSnapshots: (workflowId: string) =>
      ipcRenderer.invoke("db:listSnapshots", workflowId),
    getSnapshot: (id: string) =>
      ipcRenderer.invoke("db:getSnapshot", id),
    listIncidents: (filter?: { status?: string; workflowId?: string }) =>
      ipcRenderer.invoke("db:listIncidents", filter),
    getIncident: (id: string) =>
      ipcRenderer.invoke("db:getIncident", id),
  },
  workflow: {
    import: (json: unknown) =>
      ipcRenderer.invoke("workflow:import", json),
    export: (id: string) =>
      ipcRenderer.invoke("workflow:export", id),
  },
  app: {
    version: () =>
      ipcRenderer.invoke("app:version"),
  },
  license: {
    validate: (key: string) =>
      ipcRenderer.invoke("license:validate", key),
    getStatus: () =>
      ipcRenderer.invoke("license:getStatus"),
    remove: () =>
      ipcRenderer.invoke("license:remove"),
  },
  connections: {
    saveN8n: (baseUrl: string, apiKey: string) =>
      ipcRenderer.invoke("connections:saveN8n", baseUrl, apiKey),
    testN8n: () =>
      ipcRenderer.invoke("connections:testN8n"),
    syncN8n: () =>
      ipcRenderer.invoke("connections:syncN8n"),
    autoDetect: () =>
      ipcRenderer.invoke("connections:autoDetect"),
  },
});
