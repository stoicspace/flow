// ─────────────────────────────────────────────────────────────
// src/components/import/TrustBadges.tsx
// ─────────────────────────────────────────────────────────────

"use client";
import { useState, useEffect } from "react";
import { ShieldCheck, History, GitBranch, Sparkles } from "lucide-react";
import Link from "next/link";

interface AISettings {
  workflow_data_processing: boolean;
  privacy_mode: "standard" | "strict";
  processing_location: "cloud" | "local" | "self_hosted";
}

const locationLabel: Record<string, string> = {
  cloud: "cloud",
  local: "local device",
  self_hosted: "your self-hosted endpoint",
};

export default function TrustBadges() {
  const [settings, setSettings] = useState<AISettings | null>(null);

  useEffect(() => {
    fetch("/api/settings/ai")
      .then(r => r.json())
      .then(data => setSettings(data.settings))
      .catch(() => {});
  }, []);

  const badges = [
    { icon: ShieldCheck, label: "End-to-end encryption active" },
    { icon: History, label: "Auto-versioning enabled" },
    { icon: GitBranch, label: "Supports OpenAPI v3 & JSON Schema" },
  ];

  // Reflect the person's actual AI/privacy settings instead of a fixed
  // disclosure — what gets sent, where, and under which privacy mode.
  const location = settings ? locationLabel[settings.processing_location] : "cloud";
  const privacyLine = settings?.workflow_data_processing === false
    ? "AI analysis is off for this team — workflow data is not sent anywhere for AI processing."
    : `Node names and structure are sent to FlowLens Copilot (${location}) for AI analysis in ${settings?.privacy_mode || "standard"} privacy mode. Credentials are never included.`;

  return (
    <div className="flex flex-col items-center gap-3 mt-8">
      <div className="flex items-center justify-center gap-8 flex-wrap">
        {badges.map(({ icon: Icon, label }) => (
          <span key={label} className="flex items-center gap-2 text-xs text-text-muted">
            <Icon size={13} />
            {label}
          </span>
        ))}
      </div>

      <p className="flex items-center gap-1.5 text-[11px] text-text-muted text-center max-w-md">
        <Sparkles size={12} className="text-brand-orange flex-shrink-0" />
        {privacyLine}
        {" "}
        <Link href="/settings" className="text-brand-orange hover:underline whitespace-nowrap">
          Manage AI & privacy settings
        </Link>
      </p>
    </div>
  );
}
