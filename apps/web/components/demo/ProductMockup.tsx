"use client";

import { useState } from "react";
import {
  ChevronRight,
  GitBranch,
  Globe,
  Link,
  Play,
  Webhook,
} from "lucide-react";
import FadeUp from "./FadeUp";
import Logo from "./Logo";

const versions = [
  { id: "v38", state: "neutral" },
  { id: "v39", state: "neutral" },
  { id: "v40", state: "neutral" },
  { id: "v41", state: "ok" },
  { id: "v42", state: "fail" },
] as const;

function Node({
  icon: Icon,
  label,
  changed = false,
  faded = false,
  tag,
}: {
  icon: React.ComponentType<{ size?: number; className?: string }>;
  label: string;
  changed?: boolean;
  faded?: boolean;
  tag?: string;
}) {
  if (faded) {
    return (
      <div className="flex items-center gap-2 rounded-xl border border-border-strong bg-surface-2/70 px-3 py-1.5">
        <Icon size={12} className="text-text-muted" />
        <span className="whitespace-nowrap text-[13px] font-medium text-text-secondary">
          {label}
        </span>
      </div>
    );
  }
  return (
    <div
      className={`flex items-center gap-2 rounded-xl border bg-surface-2 px-3.5 py-2.5 ${
        changed
          ? "border-2 border-accent shadow-[0_0_16px_rgba(200,104,74,0.35)]"
          : "border-border-strong"
      }`}
    >
      <Icon size={16} className={changed ? "text-accent" : "text-text-secondary"} />
      <span className="whitespace-nowrap text-[15px] font-medium text-text-primary">
        {label}
      </span>
      {tag && (
        <span className="ml-0.5 rounded-md bg-accent px-2 py-0.5 text-[10px] font-semibold tracking-wide text-white">
          {tag}
        </span>
      )}
    </div>
  );
}

function Arrow() {
  return (
    <ChevronRight size={16} className="shrink-0 text-text-muted" aria-hidden="true" />
  );
}

export default function ProductMockup() {
  const [tab, setTab] = useState<"explain" | "diff">("explain");

  return (
    <section
      className="relative px-4 pb-5 sm:px-6"
      aria-label="Product preview"
    >
      {/* coral glow behind the mockup */}
      <div
        aria-hidden="true"
        className="glow-soft pointer-events-none absolute left-1/2 top-1/4 h-[420px] w-[72%] -translate-x-1/2 opacity-45"
      />

      <FadeUp>
        <div className="relative mx-auto max-w-[1200px]">
          {/* Card */}
          <div className="shadow-mockup overflow-hidden rounded-3xl border border-border bg-surface">
            {/* Title bar */}
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border px-6 py-4 sm:px-8 sm:py-5">
              <div className="flex items-center gap-3">
                <Logo size={22} />
                <span className="text-[15px] font-semibold text-text-primary">
                  Payment webhook → Order fulfillment
                </span>
                <span className="text-[12px] text-text-muted">n8n</span>
              </div>
              <div className="flex items-center gap-3 text-[13px] font-medium">
                <span className="rounded-full bg-success-bg px-4 py-2 text-success-text">
                  v41 · last good
                </span>
                <span className="text-text-muted">→</span>
                <span className="rounded-full bg-error-bg px-4 py-2 text-error-text">
                  v42 · today
                </span>
              </div>
            </div>

            <div className="grid lg:grid-cols-2">
              {/* Left: workflow canvas */}
              <div className="fl-canvas-dots flex min-h-[420px] flex-col justify-center border-b border-border px-6 py-10 lg:border-b-0 lg:border-r">
                {/* Row 1: horizontal flow */}
                <div className="flex flex-wrap items-center justify-center gap-y-6">
                  <Node icon={Webhook} label="Webhook" />
                  <Arrow />
                  <Node
                    icon={Globe}
                    label="HTTP Request 3"
                    changed
                    tag="CHANGED"
                  />
                  <Arrow />
                  <Node icon={GitBranch} label="IF paid?" />
                </div>

                {/* Elbow connector down to row 2 */}
                <div
                  className="mx-auto h-6 w-px bg-border-strong"
                  aria-hidden="true"
                />

                {/* Row 2: downstream (faded) */}
                <div className="flex flex-wrap items-center justify-center gap-4">
                  <Node icon={Play} label="Fulfill order" faded />
                  <Node icon={Play} label="Notify Slack" faded />
                </div>

                {/* Versions */}
                <div className="mt-14 flex items-center gap-3">
                  <span className="text-[13px] text-text-muted">Versions</span>
                  <div className="flex items-center gap-2.5">
                    {versions.map((v) => (
                      <span
                        key={v.id}
                        className={`rounded-full border px-3 py-1 text-[13px] font-medium ${
                          v.state === "ok"
                            ? "border-success/40 bg-success-bg text-success-text"
                            : v.state === "fail"
                              ? "border-error/40 bg-error-bg text-error-text"
                              : "border-border-strong text-text-secondary"
                        }`}
                      >
                        {v.id}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Right: explanation panel */}
              <div className="p-6 sm:p-7">
                {/* Tabs */}
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => setTab("explain")}
                    className={`rounded-xl px-5 py-3 text-[15px] font-semibold transition-colors duration-200 ${
                      tab === "explain"
                        ? "bg-btn-primary-bg text-btn-primary-text"
                        : "text-text-muted hover:text-text-primary"
                    }`}
                  >
                    FlowLens explanation
                  </button>
                  <button
                    onClick={() => setTab("diff")}
                    className={`rounded-xl px-5 py-3 text-[15px] font-medium transition-colors duration-200 ${
                      tab === "diff"
                        ? "bg-btn-primary-bg text-btn-primary-text"
                        : "text-text-muted hover:text-text-primary"
                    }`}
                  >
                    Raw diff
                  </button>
                </div>

                {tab === "explain" ? (
                  <div className="mt-6">
                    <div className="flex flex-wrap items-center gap-3">
                      <span className="rounded-lg bg-error-bg px-3.5 py-1.5 text-[13px] font-semibold text-error-text">
                        Error handling removed
                      </span>
                      <span className="text-[14px] text-text-muted">
                        HTTP Request 3 · 3 parameters
                      </span>
                    </div>

                    <p className="mt-4 text-[15px] leading-[22px] text-text-secondary sm:text-[17px] sm:leading-[24px]">
                      This change{" "}
                      <strong className="font-semibold text-text-primary">
                        removed the retry on your payment webhook
                      </strong>
                      , which means a failed charge no longer gets retried
                      before the customer sees an error.
                    </p>

                    {/* Proposed fix */}
                    <div className="mt-6 rounded-xl border border-border-strong p-5">
                      <div className="flex items-center gap-2">
                        <Link size={14} className="text-accent-soft" />
                        <span className="text-[15px] font-semibold text-accent-text">
                          Proposed fix
                        </span>
                      </div>
                      <div className="mt-3.5 space-y-1.5 font-mono text-[14px] text-success">
                        <p>+ retryOnFail: true</p>
                        <p>+ maxTries: 3</p>
                        <p>+ waitBetweenTries: 1000</p>
                      </div>
                      <div className="mt-5 flex flex-wrap items-center gap-3">
                        <button className="rounded-lg bg-island-dim px-5 py-2.5 text-[14px] font-semibold text-white transition-opacity hover:opacity-90">
                          Review fix
                        </button>
                        <button className="rounded-lg border border-border-strong px-4 py-2.5 text-[14px] font-medium text-text-secondary transition-colors hover:text-text-primary">
                          Dismiss
                        </button>
                        <span className="text-[13px] text-text-muted">
                          Nothing applies until you approve.
                        </span>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="mt-6 rounded-xl border border-border-strong p-5 font-mono text-[13px] leading-relaxed">
                    <p className="text-text-muted">
                      --- a/workflows/payment.json
                    </p>
                    <p className="text-text-muted">
                      +++ b/workflows/payment.json
                    </p>
                    <p className="mt-2 text-error">
                      - &quot;retryOnFail&quot;: true,
                    </p>
                    <p className="text-error">
                      - &quot;maxTries&quot;: 3,
                    </p>
                    <p className="text-error">
                      - &quot;waitBetweenTries&quot;: 1000,
                    </p>
                    <p className="text-success">
                      + &quot;onError&quot;: &quot;continueRegularOutput&quot;
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </FadeUp>
    </section>
  );
}
