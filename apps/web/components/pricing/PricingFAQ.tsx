"use client";

import { useState } from "react";
import { Minus, Plus } from "lucide-react";
import Eyebrow from "@/components/demo/Eyebrow";
import FadeUp from "@/components/demo/FadeUp";

interface FaqItem {
  id: string;
  question: string;
  answer: string;
}

const faqs: FaqItem[] = [
  {
    id: "ai-billing",
    question: "Do I pay for AI usage through FlowLens?",
    answer:
      "No. You point FlowLens at your own OpenAI, Anthropic, or OpenAI-compatible key: your key, your usage, your cost. Your provider bills you directly.",
  },
  {
    id: "credit-card",
    question: "Do I need a credit card to start?",
    answer:
      "No. The Free plan starts without a card, and AI usage is billed by your own provider, never marked up through FlowLens.",
  },
  {
    id: "self-hosted",
    question: "Can I run FlowLens on my own infrastructure?",
    answer:
      "Yes. The Self-hosted plan runs on your infrastructure, can point at a self-hosted model, and works with self-hosted n8n.",
  },
  {
    id: "live-workflows",
    question: "Will FlowLens change my live workflows?",
    answer:
      "No. Suggestions are proposals, not automatic changes. You review the diff and the suggested fix before anything is applied to the live workflow.",
  },
];

export default function PricingFAQ() {
  const [openId, setOpenId] = useState<string | null>(faqs[0].id);

  return (
    <section id="faq" className="px-4 py-16 sm:px-6 md:py-20">
      <div className="mx-auto grid max-w-[1200px] gap-10 lg:grid-cols-[0.8fr_1.2fr] lg:gap-16">
        <FadeUp>
          <div>
            <Eyebrow>FAQ</Eyebrow>
            <h2 className="font-heading mt-6 text-3xl font-bold text-text-primary sm:text-4xl md:text-[42px] md:leading-[52px]">
              Pricing questions
            </h2>
            <p className="mt-4 text-[15px] leading-[22px] text-text-secondary">
              Not sure which plan fits your setup?{" "}
              <a
                href="/contact"
                className="text-text-primary underline underline-offset-2 hover:text-accent-text"
              >
                Reach out.
              </a>
            </p>
          </div>
        </FadeUp>

        <FadeUp delay={0.08}>
          <div className="space-y-3">
            {faqs.map((item) => {
              const open = openId === item.id;
              return (
                <div
                  key={item.id}
                  className="rounded-xl bg-surface-2 px-5 py-4 sm:px-6"
                >
                  <button
                    onClick={() => setOpenId(open ? null : item.id)}
                    className="flex w-full items-center justify-between gap-4 text-left"
                    aria-expanded={open}
                  >
                    <span className="text-[15px] font-semibold text-text-primary">
                      {item.question}
                    </span>
                    <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-btn-primary-bg text-btn-primary-text">
                      {open ? <Minus size={14} /> : <Plus size={14} />}
                    </span>
                  </button>
                  {open && (
                    <p className="mt-3 max-w-[560px] text-[14px] leading-[21px] text-text-secondary">
                      {item.answer}
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        </FadeUp>
      </div>
    </section>
  );
}
