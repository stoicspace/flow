import { ipcMain } from "electron";
import { keyStore, storage } from "../index";
import { normalise } from "@flowlens/core";

const TEAM_ID = "local";

interface N8nConfig {
  baseUrl: string;
  apiKey: string;
}

async function getN8nConfig(): Promise<N8nConfig | null> {
  const apiKey = await keyStore.getKey("n8n");
  const baseUrl = await keyStore.getKey("n8n baseUrl");
  if (!apiKey || !baseUrl) return null;
  return { baseUrl, apiKey };
}

async function listLocalWorkflows(config: N8nConfig) {
  const res = await fetch(`${config.baseUrl}/api/v1/workflows`, {
    headers: { "X-N8N-API-KEY": config.apiKey },
    signal: AbortSignal.timeout(10000),
  });
  if (!res.ok) throw new Error(`n8n API error: ${res.status}`);
  return res.json() as Promise<{ data: Array<{ id: string; name: string; active: boolean }> }>;
}

async function getLocalWorkflow(config: N8nConfig, id: string): Promise<Record<string, unknown>> {
  const res = await fetch(`${config.baseUrl}/api/v1/workflows/${id}`, {
    headers: { "X-N8N-API-KEY": config.apiKey },
    signal: AbortSignal.timeout(10000),
  });
  if (!res.ok) throw new Error(`n8n API error: ${res.status}`);
  return res.json() as Promise<Record<string, unknown>>;
}

export function registerConnectionIpcHandlers() {
  ipcMain.handle("connections:saveN8n", async (_event, baseUrl: string, apiKey: string) => {
    if (typeof baseUrl !== "string" || typeof apiKey !== "string") {
      return { ok: false, error: "Invalid arguments" };
    }
    await keyStore.saveKey("n8n", apiKey);
    await keyStore.saveKey("n8n baseUrl", baseUrl);
    return { ok: true };
  });

  ipcMain.handle("connections:testN8n", async () => {
    const config = await getN8nConfig();
    if (!config) return { ok: false, error: "n8n not configured" };
    try {
      await listLocalWorkflows(config);
      return { ok: true };
    } catch (e: any) {
      return { ok: false, error: e.message };
    }
  });

  ipcMain.handle("connections:syncN8n", async () => {
    const config = await getN8nConfig();
    if (!config) return { ok: false, error: "n8n not configured" };

    try {
      const { data: remoteWorkflows } = await listLocalWorkflows(config);

      for (const remote of remoteWorkflows) {
        const existing = await storage.findWorkflowByExternalId(remote.id);
        const raw = await getLocalWorkflow(config, remote.id);
        const normalised = normalise("n8n", raw);

        if (existing) {
          // n8n's "active" is an enabled/disabled toggle, not a health
          // signal — real health comes from actual execution results
          // (see the webhook flow), so a sync shouldn't overwrite status
          // based on it. Only the name is safe to sync here.
          await storage.updateWorkflow(TEAM_ID, existing.id, {
            name: remote.name,
          });
        } else {
          const workflow = await storage.createWorkflow(TEAM_ID, {
            name: remote.name,
            platform: "n8n",
            external_id: remote.id,
          });
          await storage.createSnapshot(TEAM_ID, {
            workflow_id: workflow.id,
            normalised,
            raw,
            source: "api",
            created_by: "system",
          });
        }
      }

      return { ok: true, count: remoteWorkflows.length };
    } catch (e: any) {
      return { ok: false, error: e.message };
    }
  });

  ipcMain.handle("connections:autoDetect", async () => {
    try {
      const res = await fetch("http://localhost:5678/healthz", {
        signal: AbortSignal.timeout(3000),
      });
      return { found: res.ok };
    } catch {
      return { found: false };
    }
  });
}
