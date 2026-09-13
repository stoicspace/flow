import { app } from "electron";
import path from "path";
import fs from "fs";
import { ElectronKeyStore } from "@flowlens/keystore-electron";
import { validateLicenseOffline, validateLicenseOnline } from "./validator";

const SERVICE = "FlowLens";
const LICENSE_KEY_ACCOUNT = "license-key";
const LAST_CHECK_ACCOUNT = "last-online-check";

const keyStore = new ElectronKeyStore();

export interface LicenseState {
  licensed: boolean;
  plan: string;
  expiresAt: number | null;
  lastOnlineCheck: number;
}

function getLicenseFilePath(): string {
  return path.join(app.getPath("userData"), "license.json");
}

function loadLocalState(): Partial<LicenseState> {
  try {
    const raw = fs.readFileSync(getLicenseFilePath(), "utf8");
    return JSON.parse(raw);
  } catch {
    return {};
  }
}

function saveLocalState(state: Partial<LicenseState>) {
  try {
    fs.writeFileSync(getLicenseFilePath(), JSON.stringify(state, null, 2));
  } catch {
    // Non-fatal — just means we'll re-check online sooner
  }
}

export async function checkLicense(): Promise<LicenseState> {
  const licenseKey = await keyStore.getKey(LICENSE_KEY_ACCOUNT);

  if (!licenseKey) {
    return { licensed: false, plan: "free", expiresAt: null, lastOnlineCheck: 0 };
  }

  const offline = await validateLicenseOffline(licenseKey);
  if (!offline.valid) {
    return { licensed: false, plan: "free", expiresAt: null, lastOnlineCheck: 0 };
  }

  const local = loadLocalState();
  const daysSinceCheck = local.lastOnlineCheck
    ? (Date.now() - local.lastOnlineCheck) / 86_400_000
    : Infinity;

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
    plan: offline.payload!.plan,
    expiresAt: offline.payload!.expiresAt,
    lastOnlineCheck: local.lastOnlineCheck || 0,
  };
}

export async function saveLicense(
  licenseKey: string
): Promise<{ ok: boolean; error?: string }> {
  const offline = await validateLicenseOffline(licenseKey);
  if (!offline.valid) {
    return { ok: false, error: offline.reason || "Invalid license key" };
  }
  await keyStore.saveKey(LICENSE_KEY_ACCOUNT, licenseKey);
  saveLocalState({ lastOnlineCheck: Date.now() });
  return { ok: true };
}

export async function removeLicense(): Promise<void> {
  await keyStore.deleteKey(LICENSE_KEY_ACCOUNT);
  saveLocalState({ licensed: false, plan: "free", expiresAt: null, lastOnlineCheck: 0 });
}
