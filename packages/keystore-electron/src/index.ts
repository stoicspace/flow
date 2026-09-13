// ─────────────────────────────────────────────────────────────
// packages/keystore-electron/src/index.ts
// Electron implementation of the KeyStore interface — OS keychain via
// `keytar`, never a plaintext file. For the future apps/desktop app; not
// wired into anything yet since Electron doesn't exist in this repo.
//
// This must only ever be imported from Electron's MAIN process, never the
// renderer. keytar itself requires native bindings that don't run inside
// a sandboxed Chromium renderer — and even if it could, a decrypted key
// has no business being reachable from renderer-side JS at all. The
// renderer should only ever call an IPC channel like `ai:getKeyStatus`
// that returns a boolean, never the key itself.
// ─────────────────────────────────────────────────────────────

import keytar from "keytar";
import type { KeyStore } from "@flowlens/core";

const SERVICE_NAME = "FlowLens";

export class ElectronKeyStore implements KeyStore {
  async saveKey(providerId: string, apiKey: string): Promise<void> {
    await keytar.setPassword(SERVICE_NAME, providerId, apiKey);
  }

  async getKey(providerId: string): Promise<string | null> {
    return keytar.getPassword(SERVICE_NAME, providerId);
  }

  async deleteKey(providerId: string): Promise<void> {
    await keytar.deletePassword(SERVICE_NAME, providerId);
  }

  async hasKey(providerId: string): Promise<boolean> {
    return (await keytar.getPassword(SERVICE_NAME, providerId)) !== null;
  }
}
