"use strict";
Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });
const electron = require("electron");
const path = require("path");
const storageSqlite = require("@flowlens/storage-sqlite");
const keystoreElectron = require("@flowlens/keystore-electron");
const core = require("@flowlens/core");
const fs = require("fs");
const ed = require("@noble/ed25519");
const crypto = require("crypto");
const express = require("express");
function _interopNamespaceDefault(e) {
  const n = Object.create(null, { [Symbol.toStringTag]: { value: "Module" } });
  if (e) {
    for (const k in e) {
      if (k !== "default") {
        const d = Object.getOwnPropertyDescriptor(e, k);
        Object.defineProperty(n, k, d.get ? d : {
          enumerable: true,
          get: () => e[k]
        });
      }
    }
  }
  n.default = e;
  return Object.freeze(n);
}
const ed__namespace = /* @__PURE__ */ _interopNamespaceDefault(ed);
function registerAiIpcHandlers() {
  electron.ipcMain.handle("ai:saveKey", async (_event, provider, key) => {
    if (typeof provider !== "string" || typeof key !== "string") {
      return { ok: false, error: "Invalid arguments" };
    }
    if (!key.trim()) {
      return { ok: false, error: "API key cannot be empty" };
    }
    try {
      await keyStore.saveKey(provider, key);
      return { ok: true };
    } catch (e) {
      return { ok: false, error: e.message };
    }
  });
  electron.ipcMain.handle("ai:getKeyStatus", async (_event, provider) => {
    if (typeof provider !== "string") return { hasKey: false };
    const hasKey = await keyStore.hasKey(provider);
    return { hasKey };
  });
  electron.ipcMain.handle("ai:deleteKey", async (_event, provider) => {
    if (typeof provider !== "string") return { ok: false };
    try {
      await keyStore.deleteKey(provider);
      return { ok: true };
    } catch (e) {
      return { ok: false, error: e.message };
    }
  });
  electron.ipcMain.handle("ai:healthCheck", async () => {
    try {
      const key = await keyStore.getKey("custom");
      if (!key) return { ok: false, latencyMs: 0, error: "No API key configured" };
      return { ok: true, latencyMs: 0 };
    } catch (e) {
      return { ok: false, latencyMs: 0, error: e.message };
    }
  });
}
const TEAM_ID$2 = "local";
function registerDbIpcHandlers() {
  electron.ipcMain.handle("db:listWorkflows", async () => {
    return storage.listWorkflows(TEAM_ID$2);
  });
  electron.ipcMain.handle("db:getWorkflow", async (_event, id) => {
    if (typeof id !== "string") return null;
    return storage.getWorkflow(TEAM_ID$2, id);
  });
  electron.ipcMain.handle("db:listSnapshots", async (_event, workflowId) => {
    if (typeof workflowId !== "string") return [];
    return storage.listSnapshots(TEAM_ID$2, workflowId);
  });
  electron.ipcMain.handle("db:getSnapshot", async (_event, id) => {
    if (typeof id !== "string") return null;
    return storage.getSnapshot(TEAM_ID$2, id);
  });
  electron.ipcMain.handle("db:listIncidents", async (_event, filter) => {
    return storage.listIncidents(TEAM_ID$2, filter || {});
  });
  electron.ipcMain.handle("db:getIncident", async (_event, id) => {
    if (typeof id !== "string") return null;
    return storage.getIncident(TEAM_ID$2, id);
  });
}
const TEAM_ID$1 = "local";
function registerWorkflowIpcHandlers() {
  electron.ipcMain.handle("workflow:import", async (_event, json) => {
    try {
      const raw = json;
      const platform = core.detectPlatform(raw);
      const normalised = core.normalise(platform, raw);
      const workflow = await storage.createWorkflow(TEAM_ID$1, {
        name: raw.name || raw.title || "Imported Workflow",
        platform,
        external_id: raw.id?.toString() || raw.externalId?.toString() || null
      });
      await storage.createSnapshot(TEAM_ID$1, {
        workflow_id: workflow.id,
        normalised,
        raw,
        source: "import",
        created_by: "user"
      });
      return { ok: true, workflowId: workflow.id };
    } catch (e) {
      return { ok: false, error: e.message };
    }
  });
  electron.ipcMain.handle("workflow:export", async (_event, id) => {
    try {
      if (typeof id !== "string") throw new Error("Invalid workflow ID");
      const workflow = await storage.getWorkflow(TEAM_ID$1, id);
      if (!workflow) throw new Error("Workflow not found");
      const snapshots = await storage.listSnapshots(TEAM_ID$1, id, 1);
      const latest = snapshots[0];
      const snapshot = latest ? await storage.getSnapshot(TEAM_ID$1, latest.id) : null;
      return {
        ok: true,
        data: {
          workflow,
          normalised: snapshot?.normalised || null,
          raw: snapshot?.raw || null
        }
      };
    } catch (e) {
      return { ok: false, error: e.message };
    }
  });
  electron.ipcMain.handle("app:version", () => {
    return electron.app.getVersion();
  });
}
const PUBLIC_KEY_HEX = "PASTE_YOUR_PUBLIC_KEY_HEX_HERE";
async function validateLicenseOffline(licenseKey) {
  try {
    if (PUBLIC_KEY_HEX === "PASTE_YOUR_PUBLIC_KEY_HEX_HERE") {
      return { valid: false, reason: "License public key not configured" };
    }
    const raw = licenseKey.replace(/^FL-/, "");
    const blob = Buffer.from(raw, "base64url");
    if (blob.length < 64) {
      return { valid: false, reason: "Key too short" };
    }
    const signature = blob.subarray(blob.length - 64);
    const message = blob.subarray(0, blob.length - 64);
    const valid = await ed__namespace.verifyAsync(signature, message, Buffer.from(PUBLIC_KEY_HEX, "hex"));
    if (!valid) {
      return { valid: false, reason: "Invalid signature" };
    }
    const payload = JSON.parse(message.toString("utf8"));
    if (payload.expiresAt && Date.now() > payload.expiresAt) {
      return { valid: false, payload, reason: "License expired" };
    }
    return { valid: true, payload };
  } catch (e) {
    return { valid: false, reason: e.message };
  }
}
async function validateLicenseOnline(licenseKey) {
  try {
    const res = await fetch("https://license.flowlens.app/api/check", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ licenseKey }),
      signal: AbortSignal.timeout(1e4)
    });
    return res.json();
  } catch (e) {
    return { valid: false, error: e.message };
  }
}
const LICENSE_KEY_ACCOUNT = "license-key";
const keyStore$1 = new keystoreElectron.ElectronKeyStore();
function getLicenseFilePath() {
  return path.join(electron.app.getPath("userData"), "license.json");
}
function loadLocalState() {
  try {
    const raw = fs.readFileSync(getLicenseFilePath(), "utf8");
    return JSON.parse(raw);
  } catch {
    return {};
  }
}
function saveLocalState(state) {
  try {
    fs.writeFileSync(getLicenseFilePath(), JSON.stringify(state, null, 2));
  } catch {
  }
}
async function checkLicense() {
  const licenseKey = await keyStore$1.getKey(LICENSE_KEY_ACCOUNT);
  if (!licenseKey) {
    return { licensed: false, plan: "free", expiresAt: null, lastOnlineCheck: 0 };
  }
  const offline = await validateLicenseOffline(licenseKey);
  if (!offline.valid) {
    return { licensed: false, plan: "free", expiresAt: null, lastOnlineCheck: 0 };
  }
  const local = loadLocalState();
  const daysSinceCheck = local.lastOnlineCheck ? (Date.now() - local.lastOnlineCheck) / 864e5 : Infinity;
  if (daysSinceCheck > 7) {
    const online = await validateLicenseOnline(licenseKey).catch(() => null);
    if (online?.revoked) {
      return { licensed: false, plan: "free", expiresAt: null, lastOnlineCheck: Date.now() };
    }
    if (online) {
      saveLocalState({ lastOnlineCheck: Date.now() });
    }
  }
  return {
    licensed: true,
    plan: offline.payload.plan,
    expiresAt: offline.payload.expiresAt,
    lastOnlineCheck: local.lastOnlineCheck || 0
  };
}
async function saveLicense(licenseKey) {
  const offline = await validateLicenseOffline(licenseKey);
  if (!offline.valid) {
    return { ok: false, error: offline.reason || "Invalid license key" };
  }
  await keyStore$1.saveKey(LICENSE_KEY_ACCOUNT, licenseKey);
  saveLocalState({ lastOnlineCheck: Date.now() });
  return { ok: true };
}
async function removeLicense() {
  await keyStore$1.deleteKey(LICENSE_KEY_ACCOUNT);
  saveLocalState({ licensed: false, plan: "free", expiresAt: null, lastOnlineCheck: 0 });
}
function registerLicenseIpcHandlers() {
  electron.ipcMain.handle("license:validate", async (_event, key) => {
    if (typeof key !== "string") return { valid: false, error: "Invalid key format" };
    return saveLicense(key);
  });
  electron.ipcMain.handle("license:getStatus", async () => {
    const state = await checkLicense();
    return {
      licensed: state.licensed,
      plan: state.plan,
      expiresAt: state.expiresAt
    };
  });
  electron.ipcMain.handle("license:remove", async () => {
    await removeLicense();
    return { ok: true };
  });
}
const TEAM_ID = "local";
async function getN8nConfig() {
  const apiKey = await keyStore.getKey("n8n");
  const baseUrl = await keyStore.getKey("n8n baseUrl");
  if (!apiKey || !baseUrl) return null;
  return { baseUrl, apiKey };
}
async function listLocalWorkflows(config) {
  const res = await fetch(`${config.baseUrl}/api/v1/workflows`, {
    headers: { "X-N8N-API-KEY": config.apiKey },
    signal: AbortSignal.timeout(1e4)
  });
  if (!res.ok) throw new Error(`n8n API error: ${res.status}`);
  return res.json();
}
async function getLocalWorkflow(config, id) {
  const res = await fetch(`${config.baseUrl}/api/v1/workflows/${id}`, {
    headers: { "X-N8N-API-KEY": config.apiKey },
    signal: AbortSignal.timeout(1e4)
  });
  if (!res.ok) throw new Error(`n8n API error: ${res.status}`);
  return res.json();
}
function registerConnectionIpcHandlers() {
  electron.ipcMain.handle("connections:saveN8n", async (_event, baseUrl, apiKey) => {
    if (typeof baseUrl !== "string" || typeof apiKey !== "string") {
      return { ok: false, error: "Invalid arguments" };
    }
    await keyStore.saveKey("n8n", apiKey);
    await keyStore.saveKey("n8n baseUrl", baseUrl);
    return { ok: true };
  });
  electron.ipcMain.handle("connections:testN8n", async () => {
    const config = await getN8nConfig();
    if (!config) return { ok: false, error: "n8n not configured" };
    try {
      await listLocalWorkflows(config);
      return { ok: true };
    } catch (e) {
      return { ok: false, error: e.message };
    }
  });
  electron.ipcMain.handle("connections:syncN8n", async () => {
    const config = await getN8nConfig();
    if (!config) return { ok: false, error: "n8n not configured" };
    try {
      const { data: remoteWorkflows } = await listLocalWorkflows(config);
      for (const remote of remoteWorkflows) {
        const existing = await storage.findWorkflowByExternalId(remote.id);
        const raw = await getLocalWorkflow(config, remote.id);
        const normalised = core.normalise("n8n", raw);
        if (existing) {
          await storage.updateWorkflow(TEAM_ID, existing.id, {
            name: remote.name,
            status: remote.active ? "active" : "inactive"
          });
        } else {
          const workflow = await storage.createWorkflow(TEAM_ID, {
            name: remote.name,
            platform: "n8n",
            external_id: remote.id
          });
          await storage.createSnapshot(TEAM_ID, {
            workflow_id: workflow.id,
            normalised,
            raw,
            source: "api",
            created_by: "system"
          });
        }
      }
      return { ok: true, count: remoteWorkflows.length };
    } catch (e) {
      return { ok: false, error: e.message };
    }
  });
  electron.ipcMain.handle("connections:autoDetect", async () => {
    try {
      const res = await fetch("http://localhost:5678/healthz", {
        signal: AbortSignal.timeout(3e3)
      });
      return { found: res.ok };
    } catch {
      return { found: false };
    }
  });
}
function verifyIntegrity() {
  if (!electron.app.isPackaged) return true;
  const resourcesPath = process.resourcesPath;
  const asarPath = path.join(resourcesPath, "app.asar");
  if (!fs.existsSync(asarPath)) return true;
  try {
    const expectedHashPath = path.join(resourcesPath, "integrity-hashes.json");
    if (!fs.existsSync(expectedHashPath)) return true;
    const expected = JSON.parse(fs.readFileSync(expectedHashPath, "utf8"));
    const actualHash = "sha256:" + crypto.createHash("sha256").update(fs.readFileSync(asarPath)).digest("hex");
    if (expected["app.asar"] && expected["app.asar"] !== actualHash) {
      console.error("ASAR integrity check failed");
      return false;
    }
    return true;
  } catch {
    return true;
  }
}
function createLocalServer(port = 3200) {
  return new Promise((resolve) => {
    const app = express();
    const nextDir = path.join(__dirname, "../renderer");
    app.use(express.static(nextDir));
    app.get("*", (_req, res) => {
      res.sendFile(path.join(nextDir, "index.html"));
    });
    const server = app.listen(port, () => {
      resolve({
        url: `http://localhost:${port}`,
        close: () => server.close()
      });
    });
  });
}
const isDev = !electron.app.isPackaged;
const gotLock = electron.app.requestSingleInstanceLock();
if (!gotLock) {
  electron.app.quit();
} else {
  electron.app.on("second-instance", () => {
    if (mainWindow) {
      if (mainWindow.isMinimized()) mainWindow.restore();
      mainWindow.focus();
    }
  });
}
const dbPath = path.join(electron.app.getPath("userData"), "flowlens.db");
const storage = new storageSqlite.SQLiteStorageAdapter(dbPath);
const keyStore = new keystoreElectron.ElectronKeyStore();
let mainWindow = null;
async function createWindow() {
  mainWindow = new electron.BrowserWindow({
    width: 1400,
    height: 900,
    minWidth: 1e3,
    minHeight: 700,
    title: "FlowLens",
    webPreferences: {
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: true,
      preload: path.join(__dirname, "../preload/index.js")
    }
  });
  if (isDev) {
    mainWindow.loadURL("http://localhost:3000");
    mainWindow.webContents.openDevTools();
  } else {
    const { url } = await createLocalServer();
    mainWindow.loadURL(url);
  }
  mainWindow.on("closed", () => {
    mainWindow = null;
  });
  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    const allowed = ["https://flowlens.app", "https://docs.flowlens.app"];
    if (allowed.some((a) => url.startsWith(a))) {
      electron.shell.openExternal(url);
    }
    return { action: "deny" };
  });
}
registerAiIpcHandlers();
registerDbIpcHandlers();
registerWorkflowIpcHandlers();
registerLicenseIpcHandlers();
registerConnectionIpcHandlers();
electron.app.whenReady().then(async () => {
  if (!verifyIntegrity()) {
    console.error("Integrity check failed — app may have been tampered with.");
  }
  await createWindow();
  electron.app.on("activate", () => {
    if (electron.BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});
electron.app.on("window-all-closed", () => {
  if (process.platform !== "darwin") electron.app.quit();
});
electron.app.on("web-contents-created", (_event, contents) => {
  contents.on("will-navigate", (event, url) => {
    if (!url.startsWith("file://") && !url.startsWith("http://localhost")) {
      event.preventDefault();
    }
  });
  contents.session.webRequest.onHeadersReceived((details, callback) => {
    callback({
      responseHeaders: {
        ...details.responseHeaders,
        "Content-Security-Policy": [
          "default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data:; connect-src 'self' https://openrouter.ai https://api.openai.com https://api.anthropic.com https://generativelanguage.googleapis.com http://localhost:*"
        ]
      }
    });
  });
  if (!isDev) {
    contents.on("before-input-event", (event, input) => {
      if (input.key === "F12" || input.control && input.shift && input.key === "I" || input.control && input.shift && input.key === "J" || input.control && input.key === "u") {
        event.preventDefault();
      }
    });
  }
});
exports.keyStore = keyStore;
exports.storage = storage;
