"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";
import Eyebrow from "./Eyebrow";

interface FaqItem {
  id: string;
  question: string;
  answer: string;
}

const faqs: FaqItem[] = [
  {
    id: "logs",
    question: "How is FlowLens different from logs?",
    answer:
      "Logs tell you where execution stopped. FlowLens explains why it failed, what changed, and how to fix it.",
  },
  {
    id: "n8n",
    question: "Does FlowLens support n8n?",
    answer:
      "Yes. FlowLens is designed for n8n first and support for Zapier, Make and custom workflow engines is planned.",
  },
  {
    id: "versions",
    question: "Can FlowLens compare workflow versions?",
    answer:
      "Yes. Every version is analyzed so you can immediately see node, variable, prompt and connection changes.",
  },
  {
    id: "monitoring",
    question: "Does it replace monitoring tools?",
    answer:
      "No. Monitoring tells you something failed. FlowLens tells you why it failed.",
  },
  {
    id: "security",
    question: "Is my workflow data secure?",
    answer:
      "Security comes first. Workflow analysis is designed with privacy, encryption and secure handling in mind.",
  },
];

export default function FAQ() {
  const [openId, setOpenId] = useState<string | null>(faqs[0].id);

  return (
    <section className="py-20 sm:py-24 md:py-32" id="faq">
      <div className="max-w-5xl mx-auto px-4 sm:px-6">
        <div className="text-center">
          <Eyebrow>FAQ</Eyebrow>

          <h2 className="mt-8 text-3xl sm:text-4xl md:text-5xl font-bold">
            Frequently Asked Questions
          </h2>
        </div>

        <div className="mt-16 space-y-5">
          {faqs.map((faq) => {
            const isOpen = openId === faq.id;
            const panelId = `faq-panel-${faq.id}`;
            const buttonId = `faq-button-${faq.id}`;

            return (
              <div
                key={faq.id}
                className="rounded-2xl border border-border bg-surface"
              >
                <button
                  id={buttonId}
                  aria-expanded={isOpen}
                  aria-controls={panelId}
                  onClick={() => setOpenId(isOpen ? null : faq.id)}
                  className="w-full flex justify-between items-center gap-3 p-4 sm:p-6 text-left"
                >
                  <span className="font-semibold text-base sm:text-lg pr-4">
                    {faq.question}
                  </span>

                  <ChevronDown
                    aria-hidden="true"
                    className={`shrink-0 transition-transform duration-300 ${
                      isOpen ? "rotate-180" : ""
                    }`}
                  />
                </button>

                <div
                  id={panelId}
                  role="region"
                  aria-labelledby={buttonId}
                  hidden={!isOpen}
                  className="px-4 sm:px-6 pb-4 sm:pb-6 text-sm sm:text-base text-text-muted leading-7 sm:leading-8"
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
