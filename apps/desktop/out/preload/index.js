"use strict";
const electron = require("electron");
electron.contextBridge.exposeInMainWorld("flowlens", {
  ai: {
    saveKey: (provider, key) => electron.ipcRenderer.invoke("ai:saveKey", provider, key),
    getKeyStatus: (provider) => electron.ipcRenderer.invoke("ai:getKeyStatus", provider),
    deleteKey: (provider) => electron.ipcRenderer.invoke("ai:deleteKey", provider),
    healthCheck: () => electron.ipcRenderer.invoke("ai:healthCheck")
  },
  db: {
    listWorkflows: () => electron.ipcRenderer.invoke("db:listWorkflows"),
    getWorkflow: (id) => electron.ipcRenderer.invoke("db:getWorkflow", id),
    listSnapshots: (workflowId) => electron.ipcRenderer.invoke("db:listSnapshots", workflowId),
    getSnapshot: (id) => electron.ipcRenderer.invoke("db:getSnapshot", id),
    listIncidents: (filter) => electron.ipcRenderer.invoke("db:listIncidents", filter),
    getIncident: (id) => electron.ipcRenderer.invoke("db:getIncident", id)
  },
  workflow: {
    import: (json) => electron.ipcRenderer.invoke("workflow:import", json),
    export: (id) => electron.ipcRenderer.invoke("workflow:export", id)
  },
  app: {
    version: () => electron.ipcRenderer.invoke("app:version")
  },
  license: {
    validate: (key) => electron.ipcRenderer.invoke("license:validate", key),
    getStatus: () => electron.ipcRenderer.invoke("license:getStatus"),
    remove: () => electron.ipcRenderer.invoke("license:remove")
  },
  connections: {
    saveN8n: (baseUrl, apiKey) => electron.ipcRenderer.invoke("connections:saveN8n", baseUrl, apiKey),
    testN8n: () => electron.ipcRenderer.invoke("connections:testN8n"),
    syncN8n: () => electron.ipcRenderer.invoke("connections:syncN8n"),
    autoDetect: () => electron.ipcRenderer.invoke("connections:autoDetect")
  }
});
