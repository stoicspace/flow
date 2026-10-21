import { ArrowRight } from "lucide-react";
import FadeUp from "./FadeUp";

export default function ValueStatement() {
  return (
    <section className="px-4 py-20 sm:px-6 md:pb-24 md:pt-16">
      <div className="mx-auto max-w-5xl">
        <FadeUp>
          <h2 className="font-heading mx-auto max-w-5xl text-center text-2xl font-normal leading-[1.3] text-text-primary sm:text-3xl md:text-[40px] md:leading-[56px]">
            FlowLens keeps a version history of your n8n, Zapier, and Make
            workflows, diffs them automatically, and explains{" "}
            <em className="font-bold not-italic text-accent-text">
              in plain language
            </em>{" "}
            what changed and why it matters.
          </h2>
        </FadeUp>

        <FadeUp delay={0.12}>
          <div className="mt-6 grid items-stretch gap-4 md:grid-cols-[1fr_auto_1.4fr]">
            {/* NOT */}
            <div className="flex flex-col justify-center rounded-2xl border border-border bg-surface-2 p-5">
              <span className="text-[12px] font-semibold uppercase tracking-[0.2em] text-text-muted">
                Not
              </span>
              <p className="mt-2.5 font-mono text-[14px] text-text-secondary">
                &quot;Node &apos;HTTP Request 3&apos; modified.&quot;
              </p>
            </div>

            {/* Arrow */}
            <div className="flex items-center justify-center">
              <span className="flex h-11 w-11 items-center justify-center rounded-full border border-border-strong bg-surface">
                <ArrowRight size={18} className="text-accent-text" />
              </span>
            </div>

            {/* Something closer to */}
            <div className="rounded-2xl border border-border-warm bg-surface-4 p-5">
              <span className="text-[12px] font-semibold uppercase tracking-[0.2em] text-accent-text">
                Something closer to
              </span>
              <p className="mt-2.5 text-[15px] italic leading-[24px] text-text-secondary">
                this change removed the retry on your payment webhook, which
                means a failed charge no longer gets retried before the customer
                sees an error.
              </p>
            </div>
          </div>
        </FadeUp>
      </div>
    </section>
  );
}
