"use strict";
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
Object.defineProperty(exports, "__esModule", { value: true });
exports.encryptApiKey = encryptApiKey;
exports.decryptApiKey = decryptApiKey;
exports.maskApiKey = maskApiKey;
const crypto_1 = require("crypto");
const ALGO = "aes-256-gcm";
function resolveSecret(secret) {
    const hex = secret || process.env.KEY_ENCRYPTION_SECRET;
    if (!hex || hex.length !== 64) {
        throw new Error("KEY_ENCRYPTION_SECRET is missing or not a 32-byte hex string. " +
            "Generate one with `node -e \"console.log(require('crypto').randomBytes(32).toString('hex'))\"` " +
            "and set it in your environment.");
    }
    return Buffer.from(hex, "hex");
}
function encryptApiKey(plain, secret) {
    const iv = (0, crypto_1.randomBytes)(12);
    const cipher = (0, crypto_1.createCipheriv)(ALGO, resolveSecret(secret), iv);
    const enc = Buffer.concat([cipher.update(plain, "utf8"), cipher.final()]);
    return `${iv.toString("hex")}:${cipher.getAuthTag().toString("hex")}:${enc.toString("hex")}`;
}
function decryptApiKey(payload, secret) {
    const [ivHex, tagHex, dataHex] = payload.split(":");
    if (!ivHex || !tagHex || !dataHex)
        throw new Error("Malformed encrypted key payload.");
    const decipher = (0, crypto_1.createDecipheriv)(ALGO, resolveSecret(secret), Buffer.from(ivHex, "hex"));
    decipher.setAuthTag(Buffer.from(tagHex, "hex"));
    return Buffer.concat([
        decipher.update(Buffer.from(dataHex, "hex")),
        decipher.final(),
    ]).toString("utf8");
}
function maskApiKey(plain) {
    if (plain.length <= 4)
        return "••••";
    return `••••••••${plain.slice(-4)}`;
}
