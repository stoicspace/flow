import { FileJson, RefreshCw, Link2 } from "lucide-react";
import Eyebrow from "./Eyebrow";
import FadeUp from "./FadeUp";
import Logo from "./Logo";

const platforms = [
  { name: "n8n", note: "cloud · self-hosted" },
  { name: "Zapier", note: "Zaps" },
  { name: "Make", note: "Scenarios" },
];

const methods = [
  {
    icon: FileJson,
    title: "Paste its JSON",
    note: "Drop an export in",
  },
  {
    icon: Link2,
    title: "Connect directly",
    note: "Link your account or instance",
  },
  {
    icon: RefreshCw,
    title: "Sync automatically",
    note: "Every change becomes a snapshot",
  },
];

export default function Integrations() {
  return (
    <section id="integrations" className="px-4 pb-28 pt-2 sm:px-6">
      <div className="mx-auto max-w-6xl">
        <FadeUp>
          <div className="text-center">
            <Eyebrow>Integrations</Eyebrow>
            <h2 className="font-heading mt-6 text-3xl font-bold text-text-primary sm:text-4xl md:text-[42px] md:leading-[54px]">
              Works with the platforms
              <br className="hidden sm:block" /> you&apos;re already using
            </h2>
            <p className="mx-auto mt-5 max-w-2xl text-[15px] leading-[21px] text-text-secondary sm:text-[17px] sm:leading-[24px]">
              FlowLens connects to{" "}
              <strong className="font-semibold text-text-primary">n8n</strong>,{" "}
              <strong className="font-semibold text-text-primary">Zapier</strong>
              , and{" "}
              <strong className="font-semibold text-text-primary">Make</strong>.
              Import a workflow by pasting its JSON,{" "}
              <span className="text-accent-text underline underline-offset-2">
                connecting directly
              </span>
              , or syncing automatically, no migration, no rebuilding anything
              in a new tool.
            </p>
          </div>
        </FadeUp>

        <div className="mx-auto mt-14 grid max-w-[980px] items-start gap-8 lg:grid-cols-[240px_1fr_300px] lg:gap-14">
          {/* Platform cards */}
          <div className="flex flex-col gap-2.5">
            {platforms.map((p, i) => (
              <FadeUp key={p.name} delay={i * 0.06}>
                <div className="flex h-16 items-center justify-between rounded-xl border border-border-strong bg-surface-2 px-5">
                  <span className="font-heading text-[17px] font-bold text-text-primary">
                    {p.name}
                  </span>
                  <span className="text-[13px] text-text-muted">{p.note}</span>
                </div>
              </FadeUp>
            ))}
          </div>

          {/* Center logo tile */}
          <FadeUp delay={0.15}>
            <div className="flex items-center justify-center">
              <div className="relative flex h-[189px] w-[189px] items-center justify-center overflow-hidden rounded-3xl border border-border-strong bg-island">
                <div
                  aria-hidden="true"
                  className="glow-strong absolute inset-0 opacity-80"
                />
                <Logo size={110} className="relative" />
              </div>
            </div>
          </FadeUp>

          {/* Methods */}
          <FadeUp delay={0.2}>
            <div className="flex flex-col gap-2.5">
              {methods.map((m) => (
                <div
                  key={m.title}
                  className="flex items-center gap-3 rounded-xl border border-border-strong bg-surface-2 px-4 py-3"
                >
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-chip text-accent-text">
                    <m.icon size={16} />
                  </span>
                  <div>
                    <p className="text-[15px] font-bold text-text-primary">
                      {m.title}
                    </p>
                    <p className="mt-0.5 text-[13px] text-text-muted">
                      {m.note}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </FadeUp>
        </div>
      </div>
    </section>
  );
}
