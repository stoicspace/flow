// ─────────────────────────────────────────────────────────────
// src/app/(dashboard)/support/page.tsx
// ─────────────────────────────────────────────────────────────

"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Search,
  Rocket,
  BookOpen,
  Network,
  CreditCard,
  MessageSquare,
  Mail,
  ArrowRight,
  Sparkles,
  Loader2,
} from "lucide-react";

// "Getting Started" and "Integrations" link to real pages already in the
// app. "API Reference" and "Billing" have no backing page/content yet —
// marked "Coming soon" and disabled rather than pretending to work.
const topics = [
  {
    icon: Rocket,
    title: "Getting Started",
    description: "Import your first workflow and see how FlowLens tracks it.",
    action: "Import a workflow",
    href: "/import",
  },
  {
    icon: Network,
    title: "Integrations",
    description: "Connect n8n, Zapier, or Make to start syncing workflows.",
    action: "View connections",
    href: "/connections",
  },
  {
    icon: BookOpen,
    title: "API Reference",
    description: "Detailed endpoint docs for custom integrations.",
    action: "Coming soon",
    href: null,
  },
  {
    icon: CreditCard,
    title: "Billing",
    description: "Manage subscriptions and usage credits.",
    action: "Coming soon",
    href: null,
  },
];

const EMAIL = "flowlensaas@gmail.com";
const SUBJECT = "Issue - FlowLens";
const BODY = `Hi FlowLens Team,`;

const support = [
  {
    icon: MessageSquare,
    title: "Community",
    href: "https://discord.gg/f2B6hamNMX",
    description: "Active discussions and quick answers on Discord.",
    action: "Join Discord",
  },
  {
    icon: Mail,
    title: "Email Support",
    href: `mailto:${EMAIL}?subject=${encodeURIComponent(SUBJECT)}&body=${encodeURIComponent(BODY)}`,
    description: "Usually respond within 4–48 hours.",
    action: "Email us",
  },
];

const faqs = [
  {
    q: "Why did my workflow suddenly stop working?",
    a: "Open the workflow's Compare view to see exactly what changed between the last two versions, or click Fix Workflow for an AI diagnosis of the most recent failure.",
  },
  {
    q: "Does FlowLens change my live n8n/Zapier/Make workflow?",
    a: "No. Fixes are proposed and applied to a new FlowLens snapshot that you review first — nothing is pushed back to your live platform automatically.",
  },
  {
    q: "Which platforms are supported?",
    a: "n8n, Zapier, and Make today. Connect them from the Connections page, or import a workflow JSON export directly.",
  },
];

export default function SupportPage() {
  const [query, setQuery] = useState("");
  const [searching, setSearching] = useState(false);
  const [searchResult, setSearchResult] = useState<{
    answer: string;
    matches: { id: string; name: string }[];
  } | null>(null);
  const [searchError, setSearchError] = useState("");

  async function runSearch() {
    if (!query.trim()) return;
    setSearching(true);
    setSearchError("");
    setSearchResult(null);
    try {
      const res = await fetch(`/api/search?q=${encodeURIComponent(query.trim())}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Search failed.");
      setSearchResult(data);
    } catch (e: unknown) {
      setSearchError(e instanceof Error ? e.message : "Search failed.");
    } finally {
      setSearching(false);
    }
  }

  return (
    <div className="min-h-screen bg-surface text-text-primary">
      <div className="mx-auto max-w-6xl px-6 md:px-8 py-16">

        {/* Hero + search */}
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight">
            How can we help?
          </h1>
          <p className="mt-4 text-text-muted max-w-xl mx-auto">
            Search your own workflows, browse common topics, or reach the team directly.
          </p>

          <div className="mt-10 mx-auto max-w-2xl">
            <div className="flex overflow-hidden rounded-2xl border border-border bg-surface-2 focus-within:border-brand-orange/50 transition-colors">
              <div className="flex flex-1 items-center gap-3 px-5">
                <Search size={18} className="text-text-muted shrink-0" />
                <input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  onKeyDown={(e) => { if (e.key === "Enter") runSearch(); }}
                  placeholder='Ask about your workflows (e.g. "where is Stripe used")'
                  className="h-14 w-full bg-transparent outline-none text-sm text-text-primary placeholder:text-text-muted"
                />
              </div>
              <button
                onClick={runSearch}
                disabled={searching || !query.trim()}
                className="m-1.5 rounded-xl bg-brand-orange px-6 text-sm font-medium text-white transition hover:opacity-90 disabled:opacity-40 flex items-center gap-2"
              >
                {searching && <Loader2 size={14} className="animate-spin" />}
                Search
              </button>
            </div>

            {searchError && (
              <p className="mt-3 text-sm text-status-error text-center">{searchError}</p>
            )}

            {searchResult && (
              <div className="mt-5 text-left bg-surface-2 border border-border rounded-2xl p-5">
                <div className="flex items-center gap-2 mb-2">
                  <Sparkles size={15} className="text-brand-orange" />
                  <span className="text-sm font-medium text-text-primary">Answer</span>
                </div>
                <p className="text-sm text-text-muted leading-relaxed">{searchResult.answer}</p>
                {searchResult.matches?.length > 0 && (
                  <div className="mt-4 flex flex-wrap gap-2">
                    {searchResult.matches.map((m) => (
                      <Link
                        key={m.id}
                        href={`/workflows/${m.id}`}
                        className="text-xs font-medium bg-surface border border-border rounded-full px-3 py-1.5 text-text-primary hover:border-brand-orange/40 transition-colors"
                      >
                        {m.name}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Topics */}
        <section className="mb-16">
          <h2 className="mb-6 text-xl font-semibold text-text-primary">
            Common topics
          </h2>
          <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
            {topics.map((item) => {
              const Icon = item.icon;
              const inner = (
                <>
                  <div className="w-10 h-10 rounded-lg bg-surface flex items-center justify-center mb-5 group-hover:bg-brand-orange/10 transition-colors">
                    <Icon size={18} className="text-text-primary" />
                  </div>
                  <h3 className="text-text-primary text-base font-semibold">{item.title}</h3>
                  <p className="mt-2 text-sm text-text-muted leading-relaxed">{item.description}</p>
                  <span
                    className={`mt-5 flex items-center gap-1.5 text-sm font-medium ${
                      item.href ? "text-brand-orange" : "text-text-muted"
                    }`}
                  >
                    {item.action}
                    {item.href && (
                      <ArrowRight size={14} className="transition-transform group-hover:translate-x-0.5" />
                    )}
                  </span>
                </>
              );

              if (!item.href) {
                return (
                  <div
                    key={item.title}
                    className="group rounded-2xl border border-border bg-surface-2 p-6 opacity-60 cursor-not-allowed"
                    aria-disabled
                  >
                    {inner}
                  </div>
                );
              }

              return (
                <Link
                  key={item.title}
                  href={item.href}
                  className="group rounded-2xl border border-border bg-surface-2 p-6 hover:border-brand-orange/30 transition-colors block"
                >
                  {inner}
                </Link>
              );
            })}
          </div>
        </section>

        {/* FAQ */}
        <section className="mb-16">
          <h2 className="mb-6 text-xl font-semibold text-text-primary">
            Frequently asked
          </h2>
          <div className="divide-y divide-border border border-border rounded-2xl bg-surface-2 overflow-hidden">
            {faqs.map((item) => (
              <details key={item.q} className="group px-6 py-4">
                <summary className="flex items-center justify-between cursor-pointer list-none text-sm font-medium text-text-primary">
                  {item.q}
                  <span className="text-text-muted transition-transform group-open:rotate-45 text-lg leading-none">+</span>
                </summary>
                <p className="mt-3 text-sm text-text-muted leading-relaxed">{item.a}</p>
              </details>
            ))}
          </div>
        </section>

        {/* Contact */}
        <section>
          <h2 className="mb-6 text-xl font-semibold text-text-primary">
            Still need help?
          </h2>
          <div className="grid gap-5 md:grid-cols-2">
            {support.map((item) => {
              const Icon = item.icon;
              return (
                <div
                  key={item.title}
                  className="rounded-2xl border border-border bg-surface-2 p-6 flex flex-col justify-between"
                >
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-lg bg-surface flex items-center justify-center shrink-0">
                      <Icon size={18} className="text-text-primary" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-text-primary">{item.title}</h3>
                      <p className="text-sm text-text-muted mt-1">{item.description}</p>
                    </div>
                  </div>

                  <a
                    href={item.href}
                    target={item.href.startsWith("http") ? "_blank" : undefined}
                    rel={item.href.startsWith("http") ? "noopener noreferrer" : undefined}
                    className="mt-6 inline-flex w-fit items-center rounded-lg border border-border px-4 py-2 text-sm font-medium text-text-primary hover:border-brand-orange/40 hover:text-brand-orange transition-colors"
                  >
                    {item.action}
                  </a>
                </div>
              );
            })}
          </div>
        </section>

      </div>
    </div>
  );
}