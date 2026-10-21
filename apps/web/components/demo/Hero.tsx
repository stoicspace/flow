import { ArrowRight, Check, Sparkles } from "lucide-react";
import FadeUp from "./FadeUp";

const trust = ["No credit card", "Bring your own AI key", "Fixes never auto-apply"];

function RunHistoryCard() {
  const bars = [
    "bg-accent-pale/40",
    "bg-accent-pale/40",
    "bg-accent-pale/40",
    "bg-accent-pale/40",
    "bg-accent-pale/40",
    "bg-accent-pale/40",
    "bg-accent-pale/40",
    "bg-accent-pale/40",
    "bg-accent",
    "bg-error",
    "bg-error",
  ];
  return (
    <div className="shadow-float w-[240px] rounded-2xl border border-border bg-surface p-4">
      <div className="flex items-center justify-between">
        <span className="text-[12px] font-semibold text-text-primary">
          Run history
        </span>
        <span className="text-[11px] text-text-muted">last 11</span>
      </div>
      <div className="mt-3 flex items-end gap-1" aria-hidden="true">
        {bars.map((cls, i) => (
          <span
            key={i}
            className={`w-3 rounded-sm ${cls} ${i >= 8 ? "h-5" : "h-3.5"}`}
          />
        ))}
      </div>
      <div className="mt-3 flex gap-1.5">
        <span className="rounded-full bg-success-bg px-2 py-0.5 text-[10px] font-semibold text-success-text">
          v41 ✓ ok
        </span>
        <span className="rounded-full bg-error-bg px-2 py-0.5 text-[10px] font-semibold text-error-text">
          v42 ✕ failing
        </span>
      </div>
    </div>
  );
}

function ChangeDetectedCard() {
  return (
    <div className="shadow-float w-[250px] rounded-2xl border border-border bg-surface p-4">
      <div className="flex items-center gap-2">
        <span className="fl-pulse h-2 w-2 rounded-full bg-error" />
        <span className="text-[12px] font-semibold text-text-primary">
          Change detected
        </span>
        <span className="ml-auto text-[11px] text-text-muted">2m ago</span>
      </div>
      <p className="mt-2 text-[12px] leading-[1.35] text-text-secondary">
        Retry removed on{" "}
        <strong className="font-semibold text-text-primary">
          HTTP Request 3
        </strong>
      </p>
      <div className="mt-2.5 flex gap-1.5">
        <span className="rounded-full bg-error-bg px-2 py-0.5 text-[10px] font-semibold text-error-text">
          High risk
        </span>
        <span className="rounded-full bg-chip px-2 py-0.5 text-[10px] font-semibold text-accent-text">
          Fix ready
        </span>
      </div>
    </div>
  );
}

export default function Hero() {
  return (
    <section className="relative overflow-hidden pb-14 pt-36 sm:pt-40 md:pb-12 md:pt-40">
      {/* Coral glows */}
      <div
        aria-hidden="true"
        className="glow-hero pointer-events-none absolute -top-40 left-1/2 h-[480px] w-[820px] -translate-x-1/2 opacity-70"
      />
      <div
        aria-hidden="true"
        className="glow-soft pointer-events-none absolute -top-24 left-[8%] h-72 w-72 opacity-60"
      />
      <div
        aria-hidden="true"
        className="glow-soft pointer-events-none absolute -top-28 right-[6%] h-80 w-80 opacity-50"
      />

      {/* Floating cards — flank the hero on wide screens */}
      <div className="pointer-events-none absolute left-8 top-[44%] z-10 hidden xl:block 2xl:left-14">
        <RunHistoryCard />
      </div>
      <div className="pointer-events-none absolute right-8 top-[40%] z-10 hidden xl:flex xl:flex-col xl:items-end xl:gap-3 2xl:right-14">
        <ChangeDetectedCard />
        <div className="shadow-float flex items-center gap-3 rounded-full border border-island-border bg-island px-4 py-2">
          <span className="text-[12px] font-semibold text-island-accent">
            v41 → v42
          </span>
          <span className="h-3 w-px bg-island-border" />
          <span className="text-[12px] text-island-muted">
            3 params changed
          </span>
        </div>
      </div>

      <div className="relative mx-auto max-w-4xl px-4 text-center sm:px-6">
        <FadeUp>
          <span className="inline-flex items-center gap-2.5 rounded-full border border-border bg-surface px-4 py-2 shadow-card">
            <span className="rounded-full bg-island px-2.5 py-0.5 text-[11px] font-semibold tracking-wide text-island-text">
              New
            </span>
            <Sparkles size={14} className="text-accent" />
            <span className="text-[13px] text-text-secondary">
              Plain-language diffs for n8n, Zapier &amp; Make
            </span>
          </span>
        </FadeUp>

        <FadeUp delay={0.08}>
          <h1 className="font-heading mt-8 text-4xl font-bold text-text-primary sm:text-5xl md:text-6xl lg:text-[76px] lg:leading-[96px]">
            The workflow was fine
            <br className="hidden sm:inline" />
            {" "}yesterday. Today it isn&apos;t.
            <br className="hidden sm:inline" />
            {" "}
            <span className="text-accent-text">Here&apos;s why.</span>
          </h1>
        </FadeUp>

        <FadeUp delay={0.16}>
          <p className="mx-auto mt-6 max-w-[600px] text-[15px] leading-[19px] text-text-secondary sm:text-base md:text-[18px] md:leading-[22px]">
            Something changed: a node got edited, a field got renamed, an API
            started returning a different shape, and now a workflow that ran
            for months without a problem is failing silently or doing the wrong
            thing. Nobody remembers making the change. The error message
            doesn&apos;t say which version broke it.
          </p>
        </FadeUp>

        <FadeUp delay={0.24}>
          <ul className="mt-7 flex flex-wrap items-center justify-center gap-x-7 gap-y-3">
            {trust.map((item) => (
              <li
                key={item}
                className="flex items-center gap-2 text-[14px] text-text-secondary"
              >
                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-chip">
                  <Check size={12} className="text-accent-text" />
                </span>
                {item}
              </li>
            ))}
          </ul>
        </FadeUp>

        <FadeUp delay={0.32}>
          <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <a
              href="/signup"
              className="shadow-btn inline-flex w-full items-center justify-center gap-2 rounded-full bg-btn-primary-bg px-6 py-3 text-[15px] font-semibold text-btn-primary-text transition-opacity duration-200 hover:opacity-90 sm:w-auto"
            >
              Start free
              <ArrowRight size={16} />
            </a>
            <a
              href="#how"
              className="inline-flex w-full items-center justify-center rounded-full border border-border-strong bg-surface px-6 py-3 text-[15px] font-semibold text-text-primary transition-colors duration-200 hover:border-accent/50 sm:w-auto"
            >
              See how it works
            </a>
          </div>
        </FadeUp>

        <FadeUp delay={0.4}>
          <div className="mt-11 flex flex-wrap items-center justify-center gap-x-5 gap-y-3">
            <span className="text-[14px] text-text-muted">
              Works alongside
            </span>
            <div className="flex items-center gap-6">
              {["n8n", "Zapier", "Make"].map((name) => (
                <span
                  key={name}
                  className="font-heading text-xl font-semibold text-text-muted sm:text-2xl"
                >
                  {name}
                </span>
              ))}
            </div>
            <span className="rounded-full border border-border-strong px-3.5 py-1 text-[13px] text-text-secondary">
              Cloud or self-hosted
            </span>
          </div>
        </FadeUp>
      </div>
    </section>
  );
}
