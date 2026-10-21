"use client";

import { useState } from "react";
import { Minus, Plus } from "lucide-react";

interface FaqItem {
  id: string;
  question: string;
  answer: string;
}

const faqs: FaqItem[] = [
  {
    id: "why-broke",
    question: "Why did my n8n workflow stop working?",
    answer:
      "Usually because something changed: a node parameter, a connection, a credential reference, and the change didn't surface anywhere obvious. FlowLens compares your current workflow against its last known-good version and shows you exactly what's different, instead of leaving you to scroll through the whole JSON tree manually.",
  },
  {
    id: "replace-error-handling",
    question:
      "Does FlowLens replace n8n, Zapier, or Make's built-in error handling?",
    answer:
      "No. It sits alongside your existing error workflows and execution logs. Think of it as the layer that explains why an execution failed and what changed, not a replacement for triggers, retries, or your automation platform itself.",
  },
  {
    id: "own-data",
    question:
      "Can I use FlowLens without sending data to OpenAI or Anthropic?",
    answer:
      "Yes, you can point FlowLens at your own API key for any OpenAI-compatible or Anthropic-compatible endpoint, including a self-hosted model if you run one. Nothing requires a shared, FlowLens-operated AI service.",
  },
  {
    id: "self-hosted-n8n",
    question: "Does it work with self-hosted n8n?",
    answer:
      "Yes. FlowLens doesn't care whether your n8n instance is cloud or self-hosted. It connects the same way either way.",
  },
  {
    id: "unwanted-fix",
    question: "What happens if the AI suggests a fix I don't want to apply?",
    answer:
      "Nothing: suggestions are proposals, not automatic changes. You review the diff and the suggested fix before anything is applied to the live workflow.",
  },
];

export default function FAQ() {
  const [openId, setOpenId] = useState<string | null>(faqs[0].id);

  return (
    <section id="faq" className="px-4 pb-24 sm:px-6">
      <div className="mx-auto grid max-w-[1200px] gap-10 lg:grid-cols-[1fr_1.15fr] lg:gap-24">
        {/* Left */}
        <div>
          <span className="text-[13px] font-medium text-text-secondary">
            FAQ
          </span>
          <h2 className="font-heading mt-6 text-3xl font-bold text-text-primary sm:text-4xl md:text-[42px] md:leading-[54px]">
            Questions,
            <br />
            answered straight.
          </h2>
          <p className="mt-5 max-w-sm text-[15px] leading-[22px] text-text-secondary">
            Something not covered here?{" "}
            <a
              href="/contact"
              className="font-semibold text-accent-text underline underline-offset-2"
            >
              Reach out
            </a>{" "}
            rather than guessing from the docs.
          </p>
        </div>

        {/* Right: accordion */}
        <div className="flex flex-col gap-3">
          {faqs.map((faq) => {
            const isOpen = openId === faq.id;
            const panelId = `faq-panel-${faq.id}`;
            const buttonId = `faq-button-${faq.id}`;

            return (
              <div
                key={faq.id}
                className={`rounded-2xl border border-border transition-colors duration-200 ${
                  isOpen ? "bg-surface-2" : "bg-surface-2/60"
                }`}
              >
                <button
                  id={buttonId}
                  aria-expanded={isOpen}
                  aria-controls={panelId}
                  onClick={() => setOpenId(isOpen ? null : faq.id)}
                  className="flex w-full cursor-pointer items-center justify-between gap-4 px-6 py-5 text-left"
                >
                  <span className="font-heading text-[16px] font-bold leading-snug text-text-primary sm:text-[17px]">
                    {faq.question}
                  </span>
                  <span
                    className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full transition-colors duration-200 ${
                      isOpen
                        ? "bg-btn-primary-bg text-btn-primary-text"
                        : "border border-border-strong bg-surface text-text-muted"
                    }`}
                  >
                    {isOpen ? <Minus size={14} /> : <Plus size={14} />}
                  </span>
                </button>
                <div
                  id={panelId}
                  role="region"
                  aria-labelledby={buttonId}
                  hidden={!isOpen}
                  className="px-6 pb-6 text-[15px] leading-[25px] text-text-secondary"
                >
                  {faq.answer}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
