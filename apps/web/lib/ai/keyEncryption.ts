// apps/web/lib/ai/keyEncryption.ts — re-export from @flowlens/core
// The canonical implementation lives in packages/core/src/ai/keyEncryption.ts.
// This file exists only so existing imports like "@/lib/ai/keyEncryption" keep working.
export { encryptApiKey, decryptApiKey, maskApiKey } from "@flowlens/core";
