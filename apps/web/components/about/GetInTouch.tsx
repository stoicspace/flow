import { ArrowUpRight } from "lucide-react";
import Link from "next/link";
import FadeUp from "@/components/demo/FadeUp";

export default function GetInTouch() {
  return (
    <section className="px-4 pb-24 sm:px-6">
      <div className="mx-auto max-w-6xl">
        <FadeUp>
          <div className="relative overflow-hidden rounded-3xl bg-surface-2 px-8 py-12 sm:px-12 sm:py-14">
            <div
              aria-hidden="true"
              className="glow-soft pointer-events-none absolute -right-20 -top-24 h-80 w-80 opacity-50"
            />
            <div className="relative flex flex-col items-start gap-8 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <h2 className="font-heading text-3xl font-bold text-text-primary sm:text-4xl">
                  Get in touch
                </h2>
                <p className="mt-4 max-w-[520px] text-[15px] leading-[23px] text-text-secondary">
                  Questions about how FlowLens handles your workflow data, which
                  AI providers it supports, or whether it fits your setup: reach
                  out rather than guessing from the docs.
                </p>
              </div>
              <div className="flex shrink-0 flex-wrap gap-3">
                <Link
                  href="/contact"
                  className="shadow-btn inline-flex items-center gap-2 rounded-full bg-btn-primary-bg px-6 py-3 text-[15px] font-semibold text-btn-primary-text transition-opacity duration-200 hover:opacity-90"
                >
                  Reach out
                  <ArrowUpRight size={16} />
                </Link>
                <Link
                  href="/"
                  className="inline-flex items-center rounded-full border border-border-strong bg-surface px-6 py-3 text-[15px] font-semibold text-text-primary transition-colors duration-200 hover:border-accent/50"
                >
                  See how FlowLens works
                </Link>
              </div>
            </div>
          </div>
        </FadeUp>
      </div>
    </section>
  );
}
