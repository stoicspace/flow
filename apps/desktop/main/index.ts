import { app, BrowserWindow, shell } from "electron";
import path from "path";
import { SQLiteStorageAdapter } from "@flowlens/storage-sqlite";
import { ElectronKeyStore } from "@flowlens/keystore-electron";
import { registerAiIpcHandlers } from "./ipc/ai";
import { registerDbIpcHandlers } from "./ipc/db";
import { registerWorkflowIpcHandlers } from "./ipc/workflow";
import { registerLicenseIpcHandlers } from "./ipc/license";
import { registerConnectionIpcHandlers } from "./ipc/connections";
import { verifyIntegrity } from "./integrity";
import { createLocalServer } from "./server";

const isDev = !app.isPackaged;

// ── Single instance lock ────────────────────────────────────────
const gotLock = app.requestSingleInstanceLock();
if (!gotLock) {
  app.quit();
} else {
  app.on("second-instance", () => {
    if (mainWindow) {
      if (mainWindow.isMinimized()) mainWindow.restore();
      mainWindow.focus();
    }
  });
}

// ── Database (main process only — renderer never touches SQLite) ─
const dbPath = path.join(app.getPath("userData"), "flowlens.db");
export const storage = new SQLiteStorageAdapter(dbPath);
export const keyStore = new ElectronKeyStore();

// ── Window ─────────────────────────────────────────────────────
let mainWindow: BrowserWindow | null = null;

async function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1400,
    height: 900,
    minWidth: 1000,
    minHeight: 700,
    title: "FlowLens",
    webPreferences: {
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: true,
      preload: path.join(__dirname, "../preload/index.js"),
    },
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
      shell.openExternal(url);
    }
    return { action: "deny" };
  });
}

// ── Register IPC handlers ──────────────────────────────────────
registerAiIpcHandlers();
registerDbIpcHandlers();
registerWorkflowIpcHandlers();
registerLicenseIpcHandlers();
registerConnectionIpcHandlers();

// ── App lifecycle ──────────────────────────────────────────────
app.whenReady().then(async () => {
  // Verify integrity before doing anything else (Phase 5.4)
  if (!verifyIntegrity()) {
    console.error("Integrity check failed — app may have been tampered with.");
    // In production, you'd show a dialog and quit here.
    // For now, log and continue during development.
  }

  await createWindow();

  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") app.quit();
});

// ── Security hardening ─────────────────────────────────────────
app.on("web-contents-created", (_event, contents) => {
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
          "default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data:; connect-src 'self' https://openrouter.ai https://api.openai.com https://api.anthropic.com https://generativelanguage.googleapis.com http://localhost:*",
        ],
      },
    });
  });

  if (!isDev) {
    contents.on("before-input-event", (event, input) => {
      if (
        input.key === "F12" ||
        (input.control && input.shift && input.key === "I") ||
        (input.control && input.shift && input.key === "J") ||
        (input.control && input.key === "u")
      ) {
        event.preventDefault();
      }
    });
  }
});
