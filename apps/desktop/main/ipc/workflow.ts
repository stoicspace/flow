import { ipcMain, app } from "electron";
import { storage } from "../index";
import { normalise, detectPlatform } from "@flowlens/core";

const TEAM_ID = "local";

export function registerWorkflowIpcHandlers() {
  ipcMain.handle("workflow:import", async (_event, json: unknown) => {
    try {
      const raw = json as any;
      const platform = detectPlatform(raw);
      const normalised = normalise(platform, raw);

      const workflow = await storage.createWorkflow(TEAM_ID, {
        name: raw.name || raw.title || "Imported Workflow",
        platform,
        external_id: raw.id?.toString() || raw.externalId?.toString() || null,
      });

      await storage.createSnapshot(TEAM_ID, {
        workflow_id: workflow.id,
        normalised,
        raw,
        source: "import",
        created_by: "user",
      });

      return { ok: true, workflowId: workflow.id };
    } catch (e: any) {
      return { ok: false, error: e.message };
    }
  });

  ipcMain.handle("workflow:export", async (_event, id: string) => {
    try {
      if (typeof id !== "string") throw new Error("Invalid workflow ID");
      const workflow = await storage.getWorkflow(TEAM_ID, id);
      if (!workflow) throw new Error("Workflow not found");

      const snapshots = await storage.listSnapshots(TEAM_ID, id, 1);
      const latest = snapshots[0];
      const snapshot = latest ? await storage.getSnapshot(TEAM_ID, latest.id) : null;

      return {
        ok: true,
        data: {
          workflow,
          normalised: snapshot?.normalised || null,
          raw: snapshot?.raw || null,
        },
      };
    } catch (e: any) {
      return { ok: false, error: e.message };
    }
  });

  ipcMain.handle("app:version", () => {
    return app.getVersion();
  });
}
