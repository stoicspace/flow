export type ProviderShape = "openai" | "anthropic";
export interface ProviderConfig {
    endpoint: string;
    shape: ProviderShape;
    model: string;
    apiKey: string;
}
export interface ChatMessage {
    role: "user" | "assistant" | "system";
    content: string;
}
export interface CompleteOptions {
    maxTokens?: number;
    timeoutMs?: number;
}
export declare class AIProvider {
    private config;
    constructor(config: ProviderConfig);
    get model(): string;
    complete(prompt: string, options?: CompleteOptions): Promise<string>;
    chat(messages: ChatMessage[], options?: CompleteOptions): Promise<string>;
    streamChat(messages: ChatMessage[], options?: CompleteOptions): AsyncGenerator<string>;
    healthCheck(): Promise<{
        ok: boolean;
        latencyMs: number;
        error?: string;
    }>;
    validateKey(): Promise<{
        valid: boolean;
        error?: string;
    }>;
}
export declare function createProvider(config: ProviderConfig): AIProvider;
//# sourceMappingURL=provider.d.ts.map