import * as ed from "@noble/ed25519";

export interface LicensePayload {
  plan: "free" | "pro" | "lifetime";
  email: string;
  issuedAt: number;
  expiresAt: number | null;
}

// Hardcode the public key hex here after running keys.ts once.
// This is NOT a secret — it's what the app uses to verify signatures
// your license server produces with the private key.
const PUBLIC_KEY_HEX = "PASTE_YOUR_PUBLIC_KEY_HEX_HERE";

export async function validateLicenseOffline(
  licenseKey: string
): Promise<{ valid: boolean; payload?: LicensePayload; reason?: string }> {
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

    const valid = await ed.verifyAsync(signature, message, Buffer.from(PUBLIC_KEY_HEX, "hex"));

    if (!valid) {
      return { valid: false, reason: "Invalid signature" };
    }

    const payload: LicensePayload = JSON.parse(message.toString("utf8"));

    if (payload.expiresAt && Date.now() > payload.expiresAt) {
      return { valid: false, payload, reason: "License expired" };
    }

    return { valid: true, payload };
  } catch (e: any) {
    return { valid: false, reason: e.message };
  }
}

export async function validateLicenseOnline(
  licenseKey: string
): Promise<{ valid: boolean; revoked?: boolean; error?: string }> {
  try {
    const res = await fetch("https://license.flowlens.app/api/check", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ licenseKey }),
      signal: AbortSignal.timeout(10000),
    });
    const data: unknown = await res.json();

    // Fail closed on a malformed response rather than trusting its shape —
    // a license check should never accidentally validate because the
    // server (or a network intermediary) returned something unexpected.
    if (
      !data ||
      typeof data !== "object" ||
      typeof (data as { valid?: unknown }).valid !== "boolean"
    ) {
      return { valid: false, error: "Invalid response from license server" };
    }

    return data as { valid: boolean; revoked?: boolean; error?: string };
  } catch (e: any) {
    return { valid: false, error: e.message };
  }
}
