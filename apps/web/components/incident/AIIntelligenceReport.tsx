// ─────────────────────────────────────────────────────────────
// src/components/incident/AIIntelligenceReport.tsx
// Central incident view: Problem → Root Cause → Business Impact →
// What Changed → Fix → Recovery.
// ─────────────────────────────────────────────────────────────

"use client";
import Image from "next/image";
import type { ReactNode } from "react";
import logo from "@/public/logo.png";

interface RecommendedAction {
  icon: "fix" | "rollback";
  title: string;
  description: string;
  onClick: () => void;
  loading?: boolean;
}

interface Props {
  problem?: string;
  rootCause: string;
  confidence: number;
  impact: "low" | "medium" | "high";
  businessImpact?: string;
  whatChanged?: string;
  explanation: string;
  executionEvidence?: string;
  recoverySteps?: string[];
  actions: RecommendedAction[];
  onApplyFix: () => void;
  onRestore: () => void;
  applyingFix?: boolean;
  restoring?: boolean;
}

const impactStyle: Record<string, string> = {
  low: "bg-status-success/15 text-status-success",
  medium: "bg-amber-400/15 text-amber-400",
  high: "bg-status-error/15 text-status-error",
};

const actionIcon: Record<string, string> = {
  fix: "✨",
  rollback: "↺",
};

// Small, reused section shell for the Problem / Business Impact / What
// Changed rows so the framing stays visually consistent without repeating
// the same header markup four times.
function InfoRow({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="mb-3">
      <p className="text-[11px] font-semibold tracking-wide text-text-muted uppercase mb-1">
        {label}
      </p>
      <p className="text-sm text-text-muted leading-relaxed">{children}</p>
    </div>
  );
}

export default function AIIntelligenceReport({
  problem,
  rootCause,
  confidence,
  impact,
  businessImpact,
  whatChanged,
  explanation,
  executionEvidence,
  recoverySteps = [],
  actions,
  onApplyFix,
  onRestore,
  applyingFix,
  restoring,
}: Props) {
  return (
    <div className="w-full">
      {/* Header badge */}
      <div className="flex items-center gap-2 bg-brand-orange border border-brand-orange rounded-lg px-3.5 py-2 mb-5 w-fit">
        <span className="text-brand-orange">
          <Image src={logo} alt="FlowLens" />
        </span>
        <span className="text-xs font-bold tracking-wider text-brand-orange">
          AI INTELLIGENCE REPORT
        </span>
      </div>

      {/* Problem */}
      {problem && (
        <div className="bg-surface-2 border border-border rounded-xl p-5 mb-4">
          <InfoRow label="Problem">{problem}</InfoRow>
        </div>
      )}

      {/* Root cause card */}
      <div className="bg-surface-2 border border-border rounded-xl p-5 mb-4">
        <p className="text-[11px] font-semibold tracking-wide text-text-muted uppercase mb-2">
          Root Cause Identified
        </p>
        <h2 className="text-xl font-semibold text-text-primary mb-4 leading-snug">
          '{rootCause}'
        </h2>

        <div className="flex items-center justify-between mb-3">
          <span className="text-sm text-text-muted">Confidence</span>
          <div className="flex items-center gap-2">
            <div className="w-28 h-1.5 bg-surface rounded-full overflow-hidden">
              <div
                className="h-full bg-brand-orange rounded-full"
                style={{ width: `${Math.round(confidence * 100)}%` }}
              />
            </div>
            <span className="text-sm font-semibold text-brand-orange">
              {Math.round(confidence * 100)}%
            </span>
          </div>
        </div>

        <div className="flex items-center justify-between mb-4">
          <span className="text-sm text-text-muted">Impact</span>
          <span
            className={`text-[11px] font-bold tracking-wide rounded px-2.5 py-1 ${impactStyle[impact]}`}
          >
            {impact.toUpperCase()}
          </span>
        </div>

        <p className="text-sm text-text-muted leading-relaxed italic">
          "{explanation}"
        </p>
      </div>

      {/* Business impact + what changed */}
      {(businessImpact || whatChanged) && (
        <div className="bg-surface-2 border border-border rounded-xl p-5 mb-4">
          {businessImpact && <InfoRow label="Business Impact">{businessImpact}</InfoRow>}
          {whatChanged && <InfoRow label="What Changed">{whatChanged}</InfoRow>}
        </div>
      )}

      {/* Execution evidence */}
      {executionEvidence && (
        <div className="bg-surface rounded-lg border border-border-light px-4 py-3 mb-5 font-mono text-xs text-text-muted">
          {executionEvidence}
        </div>
      )}

      {/* Recommended actions */}
      <p className="text-sm font-semibold text-text-primary mb-3">Recommended Actions</p>
      <div className="space-y-2 mb-5">
        {actions.map((action, i) => (
          <button
            key={i}
            onClick={action.onClick}
            disabled={action.loading}
            className="w-full flex items-start gap-3 bg-surface-2 border border-border rounded-xl p-4 text-left hover:border-brand-orange/30 transition-colors disabled:opacity-60"
          >
            <span className="w-9 h-9 rounded-lg bg-surface-3 border border-border flex items-center justify-center text-base flex-shrink-0">
              {actionIcon[action.icon]}
            </span>
            <div>
              <p className="text-sm font-medium text-text-primary">{action.title}</p>
              <p className="text-xs text-text-muted mt-0.5">{action.description}</p>
            </div>
          </button>
        ))}
      </div>

      {/* Recovery */}
      {recoverySteps.length > 0 && (
        <div className="bg-surface-2 border border-border rounded-xl p-5 mb-5">
          <p className="text-[11px] font-semibold tracking-wide text-text-muted uppercase mb-2.5">
            Recovery
          </p>
          <ol className="space-y-1.5">
            {recoverySteps.map((step, i) => (
              <li key={i} className="flex gap-2 text-sm text-text-muted leading-relaxed">
                <span className="text-brand-orange font-medium flex-shrink-0">{i + 1}.</span>
                {step}
              </li>
            ))}
          </ol>
        </div>
      )}

      {/* Primary actions */}
      <button
        onClick={onApplyFix}
        disabled={applyingFix}
        className="w-full bg-brand-orange hover:bg-brand-orange text-text-primary font-semibold rounded-xl py-3.5 mb-3 transition-colors disabled:opacity-60"
      >
        {applyingFix ? "Applying Fix..." : "Apply Fix"}
      </button>
      <button
        onClick={onRestore}
        disabled={restoring}
        className="w-full bg-surface-2 border border-border text-text-primary font-semibold rounded-xl py-3.5 hover:border-gray-500 transition-colors disabled:opacity-60"
      >
        {restoring ? "Restoring..." : "Restore Yesterday's State"}
      </button>
    </div>
  );
}
