"use client";

import { useState } from "react";
import Eyebrow from "@/components/demo/Eyebrow";
import FadeUp from "@/components/demo/FadeUp";

export default function PricingHero() {
  const [billing, setBilling] = useState<"monthly" | "annual">("monthly");

  return (
    <section className="px-4 pb-12 pt-36 sm:px-6 md:pt-40">
      <div className="mx-auto max-w-4xl px-4 text-center sm:px-6">
        <FadeUp>
          <Eyebrow>Pricing</Eyebrow>
        </FadeUp>

        <FadeUp delay={0.08}>
          <h1 className="font-heading mx-auto mt-7 max-w-[820px] text-4xl font-bold text-text-primary sm:text-5xl md:text-6xl lg:text-[68px] lg:leading-[80px]">
            Start free. Keep your{" "}
            <span className="text-accent-text">AI costs yours.</span>
          </h1>
        </FadeUp>

        <FadeUp delay={0.16}>
          <p className="mx-auto mt-5 max-w-[600px] text-[15px] leading-[21px] text-text-secondary sm:text-base sm:leading-[22px]">
            You bring your own AI key, so model usage is billed by your
            provider: your key, your usage, your cost. FlowLens plans cover the
            version history, diffs and explanations.
          </p>
        </FadeUp>

        <FadeUp delay={0.24}>
          <div className="mt-8 inline-flex items-center gap-1 rounded-full border border-border bg-surface p-1">
            <button
              onClick={() => setBilling("monthly")}
              className={`rounded-full px-5 py-2 text-[14px] font-semibold transition-colors duration-200 ${
                billing === "monthly"
                  ? "bg-btn-primary-bg text-btn-primary-text"
                  : "text-text-secondary hover:text-text-primary"
              }`}
            >
              Monthly
            </button>
            <button
              onClick={() => setBilling("annual")}
              className={`rounded-full px-5 py-2 text-[14px] font-semibold transition-colors duration-200 ${
                billing === "annual"
                  ? "bg-btn-primary-bg text-btn-primary-text"
                  : "text-text-secondary hover:text-text-primary"
              }`}
            >
              Annual{" "}
              <span className="text-accent-text">[SAVE %]</span>
            </button>
          </div>
        </FadeUp>
      </div>
    </section>
  );
}
