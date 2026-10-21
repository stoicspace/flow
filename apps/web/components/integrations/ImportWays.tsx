"use client";

import { useState } from "react";
import Link from "next/link";
import Eyebrow from "@/components/demo/Eyebrow";

const steps = [
  {
    title: "Paste its JSON",
    body: "Export a workflow from n8n and paste it in. Your history starts there.",
  },
  {
    title: "Connect directly",
    body: "Link n8n Cloud or your self-hosted instance and pick workflows to track.",
  },
  {
    title: "Sync automatically",
    body: "Every change or run becomes a snapshot, no manual exports.",
  },
];

const syncRows = [
  { lead: "On save", rest: "a fresh snapshot of the workflow" },
  { lead: "On run", rest: "an execution snapshot, kept beside it" },
  { lead: "Either way", rest: "no manual exports, ever" },
];

function PanelFooter({ note, cta }: { note: string; cta: string }) {
  return (
    <div className="mt-auto flex items-center justify-between gap-4 pt-4">
      <span className="text-[13px] text-text-muted">{note}</span>
      <Link
        href="/signup"
        className="shrink-0 rounded-xl bg-btn-primary-bg px-4 py-2.5 text-[14px] font-semibold text-btn-primary-text transition-opacity hover:opacity-90"
      >
        {cta}
      </Link>
    </div>
  );
}

export default function ImportWays() {
  const [active, setActive] = useState(0);
  const [json, setJson] = useState("");

  return (
    <section className="px-6 py-24">
      <div className="mx-auto max-w-[1200px]">
        <div className="flex flex-col items-center gap-4 text-center">
          <Eyebrow>Three ways in</Eyebrow>
          <h2 className="font-heading text-[34px] font-bold tracking-tight text-text-primary sm:text-[44px] lg:text-[48px]">
            Import a workflow your way
          </h2>
          <p className="text-[15px] text-text-muted">
            No migration, no rebuilding anything in a new tool.
          </p>
        </div>

        <div className="mt-12 grid items-start gap-5 lg:grid-cols-2">
          <div className="space-y-5">
            {steps.map((step, i) => (
              <button
                key={step.title}
                onClick={() => setActive(i)}
                className={`flex w-full items-start gap-4 rounded-2xl border p-6 text-left transition-all ${
                  active === i
                    ? "border-accent bg-surface-4 shadow-card"
                    : "border-border bg-surface-2 hover:border-border-strong"
                }`}
              >
                <span
                  className={`mt-0.5 grid h-[26px] w-[26px] shrink-0 place-items-center rounded-full text-[12px] font-bold ${
                    active === i
                      ? "bg-accent text-white"
                      : "bg-surface-3 text-text-muted"
                  }`}
                >
                  {i + 1}
                </span>
                <span>
                  <span className="block text-[15px] font-bold text-text-primary">
                    {step.title}
                  </span>
                  <span className="mt-1 block text-[14px] leading-[20px] text-text-muted">
                    {step.body}
                  </span>
                </span>
              </button>
            ))}
          </div>

          <div className="flex min-h-[420px] flex-col rounded-2xl border border-accent/40 bg-surface p-6 shadow-card">
            {active === 0 && (
              <>
                <h3 className="text-[15px] font-bold text-text-primary">
                  Paste workflow JSON
                </h3>
                <textarea
                  value={json}
                  onChange={(e) => setJson(e.target.value)}
                  spellCheck={false}
                  placeholder={'{ "name": "Payment webhook → Order fulfillment", "nodes": [ ... ], "connections": { ... } }'}
                  className="mt-4 min-h-[236px] flex-1 resize-none rounded-xl border border-border bg-surface-3 p-4 font-mono text-[13px] leading-[20px] text-text-secondary placeholder:text-text-muted focus:border-accent focus:outline-none"
                />
                <PanelFooter note="Export from n8n, paste here." cta="Create history" />
              </>
            )}

            {active === 1 && (
              <>
                <h3 className="text-[15px] font-bold text-text-primary">
                  Connect your n8n instance
                </h3>
                <div className="mt-5 space-y-4">
                  <div>
                    <label
                      htmlFor="n8n-url"
                      className="mb-2 block text-[13px] text-text-secondary"
                    >
                      Instance URL
                    </label>
                    <input
                      id="n8n-url"
                      placeholder="https://your-instance.n8n.cloud"
                      className="w-full rounded-xl border border-border bg-surface-3 px-4 py-3 font-mono text-[13.5px] text-text-secondary placeholder:text-text-muted focus:border-accent focus:outline-none"
                    />
                  </div>
                  <div>
                    <label
                      htmlFor="n8n-key"
                      className="mb-2 block text-[13px] text-text-secondary"
                    >
                      API key
                    </label>
                    <input
                      id="n8n-key"
                      type="password"
                      placeholder="[YOUR_N8N_API_KEY]"
                      className="w-full rounded-xl border border-border bg-surface-3 px-4 py-3 font-mono text-[13.5px] text-text-secondary placeholder:text-text-muted focus:border-accent focus:outline-none"
                    />
                  </div>
                </div>
                <PanelFooter note="Cloud or self-hosted, one connection." cta="Connect n8n" />
              </>
            )}

            {active === 2 && (
              <>
                <h3 className="text-[15px] font-bold text-text-primary">
                  Snapshots on every change
                </h3>
                <div className="mt-5 space-y-2.5">
                  {syncRows.map((row) => (
                    <div
                      key={row.lead}
                      className="flex items-center gap-2.5 rounded-xl border border-border bg-surface-3 px-4 py-3.5 text-[14px] text-text-muted"
                    >
                      <span className="font-semibold text-text-primary">
                        {row.lead},
                      </span>
                      <span>{row.rest}</span>
                    </div>
                  ))}
                </div>
                <PanelFooter note="Runs and edits, both captured." cta="Start free" />
              </>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
