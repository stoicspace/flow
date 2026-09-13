// ─────────────────────────────────────────────────────────────
// src/lib/services/crypto.ts
// Symmetric encryption for secrets stored at rest (currently:
// flowlens_platforms.api_key, which was previously stored in plaintext).
//
// Requires FLOWLENS_ENCRYPTION_KEY in the environment — a 32-byte key,
// base64-encoded. Generate one with:
//   node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
//
// Backward-compatible on purpose: decrypt() falls back to returning the
// input unchanged if it doesn't look like our ciphertext format, so
// connections created before this fix (plaintext api_key already in the
// DB) keep working rather than breaking outright. Those should still be
// reconnected at some point so they get encrypted going forward — see the
// migration note in supabase/migrations/.
// ─────────────────────────────────────────────────────────────

import crypto from "crypto";

const ALGORITHM = "aes-256-gcm";
const PREFIX = "flv1:"; // marks a value as our encrypted format

function getKey(): Buffer {
  const raw = process.env.FLOWLENS_ENCRYPTION_KEY;
  if (!raw) {
    throw new Error(
      "FLOWLENS_ENCRYPTION_KEY is not set — required to store platform API keys securely."
    );
  }
  const key = Buffer.from(raw, "base64");
  if (key.length !== 32) {
    throw new Error("FLOWLENS_ENCRYPTION_KEY must decode to exactly 32 bytes (base64-encoded).");
  }
  return key;
}

export function encrypt(plaintext: string): string {
  const key = getKey();
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv(ALGORITHM, key, iv);
  const ciphertext = Buffer.concat([cipher.update(plaintext, "utf8"), cipher.final()]);
  const authTag = cipher.getAuthTag();

  return PREFIX + Buffer.concat([iv, authTag, ciphertext]).toString("base64");
}

export function decrypt(stored: string): string {
  if (!stored || !stored.startsWith(PREFIX)) {
    // Not our format — either null/empty, or a legacy plaintext value
    // written before encryption was added. Return as-is rather than throw,
    // so existing connections don't break.
    return stored;
  }

  try {
    const key = getKey();
    const data = Buffer.from(stored.slice(PREFIX.length), "base64");
    const iv = data.subarray(0, 12);
    const authTag = data.subarray(12, 28);
    const ciphertext = data.subarray(28);

    const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);
    decipher.setAuthTag(authTag);
    return Buffer.concat([decipher.update(ciphertext), decipher.final()]).toString("utf8");
  } catch (e) {
    console.error("Decrypting stored secret failed:", e);
    throw new Error("Could not decrypt stored credential — it may have been encrypted with a different key.");
  }
}
