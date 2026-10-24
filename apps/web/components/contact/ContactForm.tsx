"use client";

import { useState, type FormEvent } from "react";
import { ChevronDown } from "lucide-react";

const topics = [
  "How my data is handled",
  "Supported AI providers",
  "Does it fit my setup?",
  "Self-hosting",
];

const platforms = [
  "n8n (cloud)",
  "n8n (self-hosted)",
  "Zapier",
  "Make",
  "Other",
];

const inputCls =
  "w-full rounded-xl border border-border bg-surface-2 px-4 py-3 text-[15px] text-text-primary placeholder:text-text-muted transition-colors focus:border-accent focus:outline-none";

export default function ContactForm() {
  const [topic, setTopic] = useState(topics[0]);

  const onSubmit = (e: FormEvent) => {
    e.preventDefault();
  };

  return (
    <form
      onSubmit={onSubmit}
      className="rounded-[22px] border border-border-warm p-2"
    >
      <div className="rounded-[16px] border border-border bg-surface px-6 py-7 shadow-card sm:px-7">
        <p className="text-[14px] font-bold text-text-primary">
          What&apos;s it about?
        </p>

        <div className="mt-3 flex flex-wrap gap-2">
          {topics.map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => setTopic(t)}
              className={`rounded-full border px-4 py-2 text-[14px] transition-colors ${
                topic === t
                  ? "border-accent bg-chip font-medium text-accent-text"
                  : "border-border text-text-secondary hover:text-text-primary"
              }`}
            >
              {t}
            </button>
          ))}
        </div>

        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="name" className="mb-2 block text-[14px] text-text-secondary">
              Name
            </label>
            <input id="name" name="name" placeholder="Your name" className={inputCls} />
          </div>
          <div>
            <label htmlFor="email" className="mb-2 block text-[14px] text-text-secondary">
              Work email
            </label>
            <input
              id="email"
              name="email"
              type="email"
              placeholder="you@company.com"
              className={inputCls}
            />
          </div>
        </div>

        <div className="mt-4">
          <label htmlFor="platform" className="mb-2 block text-[14px] text-text-secondary">
            Which platform do you use?
          </label>
          <div className="relative">
            <select
              id="platform"
              name="platform"
              defaultValue={platforms[0]}
              className={`${inputCls} cursor-pointer appearance-none pr-10`}
            >
              {platforms.map((p) => (
                <option key={p} value={p}>
                  {p}
                </option>
              ))}
            </select>
            <ChevronDown
              size={16}
              className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-text-muted"
            />
          </div>
        </div>

        <div className="mt-4">
          <label htmlFor="question" className="mb-2 block text-[14px] text-text-secondary">
            Your question
          </label>
          <textarea
            id="question"
            name="question"
            placeholder="Tell us about your setup..."
            className={`${inputCls} min-h-[130px] resize-none`}
          />
        </div>

        <button
          type="submit"
          className="mt-6 w-full rounded-full bg-btn-primary-bg py-3.5 text-[15px] font-semibold text-btn-primary-text transition-opacity hover:opacity-90"
        >
          Send message
        </button>

        <p className="mt-4 text-center text-[13px] text-text-muted">
          A person reads every message. Typical reply: 1-2 business days.
        </p>
      </div>
    </form>
  );
}
