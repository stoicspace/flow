import { createHash } from "crypto";
import { existsSync, readFileSync } from "fs";
import path from "path";
import { app } from "electron";

export function verifyIntegrity(): boolean {
  if (!app.isPackaged) return true;

  const resourcesPath = process.resourcesPath;
  const asarPath = path.join(resourcesPath, "app.asar");

  if (!existsSync(asarPath)) return true;

  try {
    const expectedHashPath = path.join(resourcesPath, "integrity-hashes.json");
    if (!existsSync(expectedHashPath)) return true;

    const expected = JSON.parse(readFileSync(expectedHashPath, "utf8"));
    const actualHash = "sha256:" + createHash("sha256").update(readFileSync(asarPath)).digest("hex");

    if (expected["app.asar"] && expected["app.asar"] !== actualHash) {
      console.error("ASAR integrity check failed");
      return false;
    }

    return true;
  } catch {
    return true;
  }
}
