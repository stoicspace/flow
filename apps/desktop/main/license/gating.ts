import { checkLicense } from "./manager";

export type Feature =
  | "import"
  | "workflows"
  | "ai_analysis"
  | "ai_fix"
  | "byok"
  | "export"
  | "n8n_sync";

const FREE_FEATURES = new Set<Feature>(["import", "export"]);

export async function isFeatureAllowed(
  feature: Feature
): Promise<{ allowed: boolean; reason?: string }> {
  const license = await checkLicense();

  if (!license.licensed) {
    if (FREE_FEATURES.has(feature)) {
      return { allowed: true };
    }
    return {
      allowed: false,
      reason: "This feature requires a Pro license. Visit flowlens.app/pricing to upgrade.",
    };
  }

  return { allowed: true };
}

export async function getWorkflowLimit(): Promise<number> {
  const license = await checkLicense();
  return license.licensed ? Infinity : 3;
}
