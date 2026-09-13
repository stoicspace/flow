import type { KeyStore } from "@flowlens/core";
export declare class ElectronKeyStore implements KeyStore {
    saveKey(providerId: string, apiKey: string): Promise<void>;
    getKey(providerId: string): Promise<string | null>;
    deleteKey(providerId: string): Promise<void>;
    hasKey(providerId: string): Promise<boolean>;
}
//# sourceMappingURL=index.d.ts.map