import { ipcMain } from "electron";
import { checkLicense, saveLicense, removeLicense } from "../license/manager";

export function registerLicenseIpcHandlers() {
  ipcMain.handle("license:validate", async (_event, key: string) => {
    if (typeof key !== "string") return { valid: false, error: "Invalid key format" };
    return saveLicense(key);
  });

  ipcMain.handle("license:getStatus", async () => {
    const state = await checkLicense();
    return {
      licensed: state.licensed,
      plan: state.plan,
      expiresAt: state.expiresAt,
    };
  });

  ipcMain.handle("license:remove", async () => {
    await removeLicense();
    return { ok: true };
  });
}
