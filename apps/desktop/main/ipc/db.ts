import { ipcMain } from "electron";
import { storage } from "../index";
import type { IncidentFilter } from "@flowlens/core";

const TEAM_ID = "local";

const VALID_INCIDENT_STATUSES = new Set<IncidentFilter["status"]>(["open", "resolved", "dismissed"]);

function toIncidentFilter(raw: unknown): IncidentFilter {
  if (!raw || typeof raw !== "object") return {};
  const { status, workflowId } = raw as { status?: unknown; workflowId?: unknown };

  const filter: IncidentFilter = {};
  if (typeof status === "string" && VALID_INCIDENT_STATUSES.has(status as IncidentFilter["status"])) {
    filter.status = status as IncidentFilter["status"];
  }
  if (typeof workflowId === "string") {
    filter.workflowId = workflowId;
  }
  return filter;
}

export function registerDbIpcHandlers() {
  ipcMain.handle("db:listWorkflows", async () => {
    return storage.listWorkflows(TEAM_ID);
  });

  ipcMain.handle("db:getWorkflow", async (_event, id: string) => {
    if (typeof id !== "string") return null;
    return storage.getWorkflow(TEAM_ID, id);
  });

  ipcMain.handle("db:listSnapshots", async (_event, workflowId: string) => {
    if (typeof workflowId !== "string") return [];
    return storage.listSnapshots(TEAM_ID, workflowId);
  });

  ipcMain.handle("db:getSnapshot", async (_event, id: string) => {
    if (typeof id !== "string") return null;
    return storage.getSnapshot(TEAM_ID, id);
  });

  // filter arrives over IPC as `unknown` — never trust its shape, even
  // though this is same-app IPC rather than a network boundary. Malformed
  // input here just falls back to "no filter" rather than throwing.
  ipcMain.handle("db:listIncidents", async (_event, filter?: unknown) => {
    return storage.listIncidents(TEAM_ID, toIncidentFilter(filter));
  });

  ipcMain.handle("db:getIncident", async (_event, id: string) => {
    if (typeof id !== "string") return null;
    return storage.getIncident(TEAM_ID, id);
  });
}
