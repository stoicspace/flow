import Link from "next/link";
import FadeUp from "@/components/demo/FadeUp";

export default function PricingCTA() {
  return (
    <section className="px-4 pb-24 sm:px-6">
      <div className="mx-auto max-w-[1200px]">
        <FadeUp>
          <div className="relative overflow-hidden rounded-3xl bg-island px-6 py-16 text-center sm:px-10 md:py-20">
            <div
              aria-hidden="true"
              className="glow-strong pointer-events-none absolute -top-24 left-1/2 h-72 w-[560px] -translate-x-1/2 opacity-60"
            />
            <div className="relative mx-auto max-w-[720px]">
              <h2 className="font-heading text-3xl font-bold leading-[1.15] text-island-text sm:text-4xl md:text-[48px] md:leading-[54px]">
                See what changed in your last broken workflow.
              </h2>
              <div className="mt-8">
                <Link
                  href="/signup"
                  className="inline-flex items-center rounded-full bg-accent-soft px-7 py-3 text-[15px] font-semibold text-island transition-opacity duration-200 hover:opacity-90"
                >
                  Start free, no credit card
                </Link>
              </div>
            </div>
          </div>
        </FadeUp>
      </div>
    </section>
  );
}
