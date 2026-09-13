// ─────────────────────────────────────────────────────────────
// packages/core/src/ai/keyEncryption.ts
// Encrypts/decrypts BYOK API keys using AES-256-GCM.
//
// Unlike the web app version (which reads from process.env), this
// accepts the secret as a parameter so it works in both Node.js server
// routes and Electron's main process without env coupling.
//
// Generate a secret:
//   node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
// ─────────────────────────────────────────────────────────────

import { createCipheriv, createDecipheriv, randomBytes } from "crypto";

const ALGO = "aes-256-gcm";

function resolveSecret(secret?: string): Buffer {
  const hex = secret || process.env.KEY_ENCRYPTION_SECRET;
  if (!hex || hex.length !== 64) {
    throw new Error(
      "KEY_ENCRYPTION_SECRET is missing or not a 32-byte hex string. " +
      "Generate one with `node -e \"console.log(require('crypto').randomBytes(32).toString('hex'))\"` " +
      "and set it in your environment."
    );
  }
  return Buffer.from(hex, "hex");
}

export function encryptApiKey(plain: string, secret?: string): string {
  const iv = randomBytes(12);
  const cipher = createCipheriv(ALGO, resolveSecret(secret), iv);
  const enc = Buffer.concat([cipher.update(plain, "utf8"), cipher.final()]);
  return `${iv.toString("hex")}:${cipher.getAuthTag().toString("hex")}:${enc.toString("hex")}`;
}

export function decryptApiKey(payload: string, secret?: string): string {
  const [ivHex, tagHex, dataHex] = payload.split(":");
  if (!ivHex || !tagHex || !dataHex) throw new Error("Malformed encrypted key payload.");
  const decipher = createDecipheriv(ALGO, resolveSecret(secret), Buffer.from(ivHex, "hex"));
  decipher.setAuthTag(Buffer.from(tagHex, "hex"));
  return Buffer.concat([
    decipher.update(Buffer.from(dataHex, "hex")),
    decipher.final(),
  ]).toString("utf8");
}

export function maskApiKey(plain: string): string {
  if (plain.length <= 4) return "••••";
  return `••••••••${plain.slice(-4)}`;
}
