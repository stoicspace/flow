"use strict";
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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ElectronKeyStore = void 0;
const keytar_1 = __importDefault(require("keytar"));
const SERVICE_NAME = "FlowLens";
class ElectronKeyStore {
    async saveKey(providerId, apiKey) {
        await keytar_1.default.setPassword(SERVICE_NAME, providerId, apiKey);
    }
    async getKey(providerId) {
        return keytar_1.default.getPassword(SERVICE_NAME, providerId);
    }
    async deleteKey(providerId) {
        await keytar_1.default.deletePassword(SERVICE_NAME, providerId);
    }
    async hasKey(providerId) {
        return (await keytar_1.default.getPassword(SERVICE_NAME, providerId)) !== null;
    }
}
exports.ElectronKeyStore = ElectronKeyStore;
