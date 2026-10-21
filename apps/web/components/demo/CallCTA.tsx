import { ArrowUpRight } from "lucide-react";
import FadeUp from "./FadeUp";
import Logo from "./Logo";

export default function CallCTA() {
  return (
    <section id="cta" className="px-4 pb-24 pt-0 sm:px-6">
      <div className="mx-auto max-w-[1200px]">
        <FadeUp>
          <div className="relative overflow-hidden rounded-[32px] bg-island px-8 py-20 text-center sm:px-12">
            {/* coral glow */}
            <div
              aria-hidden="true"
              className="glow-strong pointer-events-none absolute left-1/2 top-0 h-[420px] w-[75%] -translate-x-1/2 -translate-y-1/2 opacity-75"
            />

            <div className="relative">
              <div className="mx-auto mb-12 flex h-[130px] w-[130px] items-center justify-center">
                <Logo size={120} />
              </div>

              <h2 className="font-heading mx-auto max-w-[900px] text-3xl font-bold leading-[1.1] text-island-text sm:text-4xl md:text-5xl lg:text-[64px] lg:leading-[68px]">
                See what changed in your last broken workflow.
              </h2>

              <p className="mx-auto mt-5 max-w-[400px] text-[15px] leading-[21px] text-island-muted sm:text-[17px] sm:leading-[24px]">
                Import it, compare it with its last good version, and read what
                actually changed.
              </p>

              <div className="mt-7 flex flex-col items-center justify-center gap-4 sm:flex-row">
                <a
                  href="/signup"
                  className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-accent-soft px-8 py-4 text-[15px] font-semibold text-island transition-opacity duration-200 hover:opacity-90 sm:w-auto"
                >
                  Start free, no credit card
                  <ArrowUpRight size={16} />
                </a>
                <a
                  href="/docs"
                  className="inline-flex w-full items-center justify-center rounded-full border border-island-border px-8 py-4 text-[15px] font-semibold text-island-text transition-colors duration-200 hover:border-accent/60 sm:w-auto"
                >
                  Read the self-hosted docs
                </a>
              </div>
            </div>
          </div>
        </FadeUp>
      </div>
    </section>
  );
}
