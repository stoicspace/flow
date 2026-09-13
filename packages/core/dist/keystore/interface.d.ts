export interface KeyStore {
    saveKey(providerId: string, apiKey: string): Promise<void>;
    getKey(providerId: string): Promise<string | null>;
    deleteKey(providerId: string): Promise<void>;
    hasKey(providerId: string): Promise<boolean>;
}
//# sourceMappingURL=interface.d.ts.map