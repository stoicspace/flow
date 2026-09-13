
// ─────────────────────────────────────────────────────────────
// src/components/import/AIInsightCard.tsx
// ─────────────────────────────────────────────────────────────
import Image from "next/image";
import logo from "@/public/logo.png";
export default function AIInsightCard() {
  return (
    <div className="bg-surface-2 border border-border rounded-xl p-5">
      <div className="flex items-center gap-2 mb-3">
        <span className="text-brand-orange text-sm">

<Image src={logo} alt="FlowLens" width={30} height={30} /></span>
        <span className="text-xs font-bold tracking-wide text-brand-orange">AI INSIGHTS</span>
      </div>
      <p className="text-sm text-text-muted leading-relaxed">
        omatically refactor your n8n or Zapier flows for better observability.
        Just connect your account to begin.
      </p>
    </div>
  );
}


