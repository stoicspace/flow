import { AIProvider } from "./provider";
export interface ResolvedProvider {
    provider: AIProvider;
    source: "custom" | "cloud";
}
export interface ProviderSettings {
    processing_location: string;
    ai_provider_endpoint?: string;
    ai_provider_shape?: string;
    ai_provider_model?: string;
    ai_provider_key?: string;
}
export interface CloudDefaults {
    endpoint: string;
    model: string;
    apiKey: string;
}
export declare function resolveProvider(settings: ProviderSettings, cloudDefaults: CloudDefaults): ResolvedProvider;
//# sourceMappingURL=resolveProvider.d.ts.map