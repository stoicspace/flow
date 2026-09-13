import { ipcMain } from "electron";
import { keyStore } from "../index";

export function registerAiIpcHandlers() {
  ipcMain.handle("ai:saveKey", async (_event, provider: string, key: string) => {
    if (typeof provider !== "string" || typeof key !== "string") {
      return { ok: false, error: "Invalid arguments" };
    }
    if (!key.trim()) {
      return { ok: false, error: "API key cannot be empty" };
    }
    try {
      await keyStore.saveKey(provider, key);
      return { ok: true };
    } catch (e: any) {
      return { ok: false, error: e.message };
    }
  });

  ipcMain.handle("ai:getKeyStatus", async (_event, provider: string) => {
    if (typeof provider !== "string") return { hasKey: false };
    const hasKey = await keyStore.hasKey(provider);
    return { hasKey };
  });

  ipcMain.handle("ai:deleteKey", async (_event, provider: string) => {
    if (typeof provider !== "string") return { ok: false };
    try {
      await keyStore.deleteKey(provider);
      return { ok: true };
    } catch (e: any) {
      return { ok: false, error: e.message };
    }
  });

  ipcMain.handle("ai:healthCheck", async () => {
    try {
      const key = await keyStore.getKey("custom");
      if (!key) return { ok: false, latencyMs: 0, error: "No API key configured" };
      return { ok: true, latencyMs: 0 };
    } catch (e: any) {
      return { ok: false, latencyMs: 0, error: e.message };
    }
  });
}
