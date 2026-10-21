import { ArrowRight, Lock } from "lucide-react";
import Eyebrow from "./Eyebrow";
import FadeUp from "./FadeUp";

const history = [
  { id: "v42", trigger: "on change", when: "today 14:01", state: "fail" },
  { id: "v41", trigger: "on run", when: "Oct 18 09:12", state: "ok" },
  { id: "v40", trigger: "on change", when: "Oct 12 16:40", state: "ok" },
] as const;

const diffTiles = [
  { symbol: "+", label: "Added nodes", cls: "bg-success-bg text-success-text border-success/30" },
  { symbol: "−", label: "Removed nodes", cls: "bg-error-bg text-error-text border-error/30" },
  { symbol: "~", label: "Changed parameters", cls: "bg-warn-bg text-warn-text border-warn-text/25" },
  { symbol: "↻", label: "Rewired connections", cls: "bg-surface-2 text-text-secondary border-border-strong" },
];

export default function HowItWorks() {
  return (
    <section id="how" className="px-4 pb-20 pt-6 sm:px-6 md:pb-36">
      <div className="mx-auto max-w-6xl">
        <FadeUp>
          <div className="text-center">
            <Eyebrow>How it works</Eyebrow>
            <h2 className="font-heading mt-6 text-3xl font-bold text-text-primary sm:text-4xl md:text-5xl">
              How FlowLens actually works
            </h2>
            <p className="mx-auto mt-4 max-w-xl text-[15px] leading-relaxed text-text-secondary sm:text-base">
              Four steps, from the moment a workflow changes to a fix
              you&apos;ve reviewed.
            </p>
          </div>
        </FadeUp>

        <div className="mt-12 grid gap-5 md:grid-cols-2">
          {/* 01 */}
          <FadeUp delay={0.05}>
            <div className="shadow-card flex h-full flex-col rounded-3xl border border-border bg-surface p-6 sm:p-8">
              <div className="flex items-start justify-between gap-4">
                <h3 className="font-heading text-xl font-bold leading-snug text-text-primary sm:text-[22px]">
                  It takes a snapshot every time your workflow changes or runs.
                </h3>
                <span className="mt-1 shrink-0 font-mono text-[12px] font-semibold tracking-[0.2em] text-accent-text">
                  01
                </span>
              </div>
              <p className="mt-3 text-[15px] leading-[19px] text-text-secondary">
                Import a workflow once, and FlowLens keeps a timestamped
                history, not just the current state, every prior version.
              </p>

              <div className="mt-6 rounded-2xl border border-border bg-surface-2 p-4">
                <div className="flex items-center justify-between">
                  <span className="text-[12px] font-semibold text-text-primary">
                    History
                  </span>
                  <span className="text-[11px] text-text-muted">
                    Payment webhook
                  </span>
                </div>
                <div className="mt-3 space-y-2.5">
                  {history.map((row) => (
                    <div
                      key={row.id}
                      className="flex items-center gap-2.5 text-[12px]"
                    >
                      <span
                        className={`h-2 w-2 shrink-0 rounded-full ${
                          row.state === "fail" ? "bg-error" : "bg-success"
                        }`}
                      />
                      <span className="font-semibold text-text-primary">
                        {row.id}
                      </span>
                      <span className="text-text-muted">{row.trigger}</span>
                      <span className="ml-auto text-text-muted">
                        {row.when}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </FadeUp>

          {/* 02 */}
          <FadeUp delay={0.1}>
            <div className="shadow-card flex h-full flex-col rounded-3xl border border-border bg-surface p-6 sm:p-8">
              <div className="flex items-start justify-between gap-4">
                <h3 className="font-heading text-xl font-bold leading-snug text-text-primary sm:text-[22px]">
                  It diffs two versions and tells you what moved.
                </h3>
                <span className="mt-1 shrink-0 font-mono text-[12px] font-semibold tracking-[0.2em] text-accent-text">
                  02
                </span>
              </div>
              <p className="mt-3 text-[15px] leading-[19px] text-text-secondary">
                Added nodes, removed nodes, changed parameters, rewired
                connections, structurally, not just &quot;something&apos;s
                different.&quot;
              </p>

              <div className="mt-6 grid grid-cols-2 gap-2.5">
                {diffTiles.map((tile) => (
                  <div
                    key={tile.label}
                    className={`flex items-center gap-2 rounded-xl border px-3 py-2.5 text-[12px] font-medium ${tile.cls}`}
                  >
                    <span className="text-[14px] font-bold">
                      {tile.symbol}
                    </span>
                    {tile.label}
                  </div>
                ))}
              </div>
            </div>
          </FadeUp>

          {/* 03 — stays dark */}
          <FadeUp delay={0.15}>
            <div className="flex h-full flex-col rounded-3xl border border-island-border bg-island p-6 sm:p-8">
              <div className="flex items-center justify-between">
                <span className="rounded-full bg-accent/15 px-3 py-1 text-[11px] font-semibold text-accent-soft">
                  The part that matters
                </span>
                <span className="flex h-7 w-7 items-center justify-center rounded-full border border-island-border text-[12px] text-island-dim">
                  ✦
                </span>
              </div>
              <h3 className="font-heading mt-4 text-xl font-bold leading-snug text-island-text sm:text-[22px]">
                It explains the diff in plain language.
              </h3>
              <p className="mt-3 text-[15px] leading-[19px] text-island-muted">
                Instead of a raw list of field changes, FlowLens generates a
                short explanation of what the change does functionally and what
                it puts at risk: missing error handling, a removed retry, a
                credential that&apos;s no longer referenced correctly.
              </p>

              <div className="mt-5 flex flex-wrap gap-2">
                <span className="rounded-full bg-error-bg px-3 py-1 text-[11px] font-semibold text-island-error">
                  Missing error handling
                </span>
                <span className="rounded-full bg-error-bg px-3 py-1 text-[11px] font-semibold text-island-error">
                  Removed retry
                </span>
                <span className="rounded-full bg-warn-bg px-3 py-1 text-[11px] font-semibold text-warn-text">
                  Credential reference
                </span>
              </div>

              <p className="mt-5 text-[15px] text-island-muted">
                <strong className="font-bold text-island-text">At risk:</strong>{" "}
                failed charges now reach customers without a retry.
              </p>
            </div>
          </FadeUp>

          {/* 04 */}
          <FadeUp delay={0.2}>
            <div className="shadow-card flex h-full flex-col rounded-3xl border border-border bg-surface p-6 sm:p-8">
              <div className="flex items-start justify-between gap-4">
                <h3 className="font-heading text-xl font-bold leading-snug text-text-primary sm:text-[22px]">
                  It proposes a fix, and you decide whether to apply it.
                </h3>
                <span className="mt-1 shrink-0 font-mono text-[12px] font-semibold tracking-[0.2em] text-accent-text">
                  04
                </span>
              </div>
              <p className="mt-3 text-[15px] leading-[19px] text-text-secondary">
                For common failure patterns, FlowLens suggests a specific
                repair, not a vague &quot;check your configuration,&quot; an
                actual proposed change you can review before anything touches
                your live workflow.
              </p>

              <div className="mt-6 rounded-2xl border border-border-warm bg-surface-4 p-4">
                <div className="flex items-center justify-between gap-3">
                  <span className="text-[13px] font-semibold text-text-primary">
                    Restore retry on HTTP Request 3
                  </span>
                  <span className="flex shrink-0 items-center gap-1 text-[11px] text-text-muted">
                    <Lock size={11} />
                    Live untouched
                  </span>
                </div>
                <div className="mt-4 flex gap-2.5">
                  <button className="rounded-lg border border-border-strong bg-surface px-4 py-2 text-[12px] font-semibold text-text-primary transition-colors hover:border-accent/50">
                    Review diff
                  </button>
                  <button className="rounded-lg bg-accent-soft px-4 py-2 text-[12px] font-semibold text-island transition-opacity hover:opacity-90">
                    Apply
                  </button>
                </div>
              </div>
            </div>
          </FadeUp>
        </div>

        {/* CTA bar */}
        <FadeUp delay={0.1}>
          <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <a
              href="/signup"
              className="shadow-btn inline-flex w-full items-center justify-center gap-2 rounded-full bg-btn-primary-bg px-7 py-3.5 text-[15px] font-semibold text-btn-primary-text transition-opacity duration-200 hover:opacity-90 sm:w-auto"
            >
              Point it at the workflow that broke last
              <ArrowRight size={16} />
            </a>
            <p className="text-[13px] text-text-muted">
              Free to start · No credit card
            </p>
          </div>
        </FadeUp>
      </div>
    </section>
  );
}
