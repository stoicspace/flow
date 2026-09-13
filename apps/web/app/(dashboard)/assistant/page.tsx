// ─────────────────────────────────────────────────────────────
// src/app/(dashboard)/assistant/page.tsx
// Figma: AI Assistant,center hero + 4 suggestion cards + bottom input
// ─────────────────────────────────────────────────────────────

"use client";
import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { Paperclip, GitBranch, Mic, ArrowUp,  } from "lucide-react";

interface Workflow { id: string; name: string; status: string; }

const suggestions = [
  { category: "UNDERSTAND", icon: "",  title: "Summarize a workflow",        desc: `Get a plain-language summary, complexity score, and risk list for any workflow.` },
  { category: "REVIEW",     icon: "",  title: "Review my last change",       desc: "Explain what changed between two snapshots and why it matters." },
  { category: "DEPLOY",     icon: "",  title: "Am I ready to deploy?",       desc: "Check blocking issues and warnings before pushing to production." },
  { category: "OPTIMIZE",   icon: "",  title: "Find optimization opportunities", desc: "Spot redundant steps, missing error handling, and slow sequential calls." },
];

const categoryColor: Record<string, string> = {
  UNDERSTAND: "text-brand-orange",
  REVIEW:     "text-status-warning",
  DEPLOY:     "text-status-error",
  OPTIMIZE:   "text-brand-orange",
};

export default function AIAssistantIndexPage() {
  const [input, setInput] = useState("");
  const [workflows, setWorkflows] = useState<Workflow[]>([]);
  const [selectedWorkflow, setSelectedWorkflow] = useState<string>("");
  const router = useRouter();

  useEffect(() => {
    fetch("/api/workflows")
      .then(r => r.json())
      .then(data => {
        const wfs = data.workflows || [];
        setWorkflows(wfs);
        if (wfs.length > 0) setSelectedWorkflow(wfs[0].id);
      });
  }, []);

  function handleExecute() {
    if (!input.trim() || !selectedWorkflow) return;
    router.push(`/assistant/${selectedWorkflow}?q=${encodeURIComponent(input)}`);
  }

  const totalEvents = 1240;

  return (
    <div className="flex flex-col h-full">

      {/* Center hero */}
      <div className="flex-1 flex flex-col items-center justify-center px-8 pb-4">
        {/* Icon */}
        <h1 className="text-4xl font-bold text-text-primary mb-3 text-center">
          What can FlowLens Copilot help with today?
        </h1>
        <p className="text-text-muted text-center mb-10 max-w-md">
          Your AI Workflow Copilot — I understand, review, document, and optimize your
          automations, not just debug failures. I've analyzed{" "}
          <span className="text-brand-orange font-semibold">{totalEvents.toLocaleString()} events</span>{" "}
          across your active workflows in the last hour.
        </p>

        {/* Suggestion cards */}
        <div className="grid grid-cols-2 gap-3 w-full max-w-2xl mb-6">
          {suggestions.map(s => (
            <button
              key={s.title}
              onClick={() => { setInput(s.title); }}
              className="bg-surface-2 border border-border rounded-xl p-5 text-left text-text-muted hover:border-brand-blue/30 transition-colors">
              <div className="flex items-center justify-between mb-3">
                <span className="text-lg">{s.icon}</span>
                <span className={`text-[10px] font-bold tracking-wider ${categoryColor[s.category]}`}>{s.category}</span>
              </div>
              <h3 className="text-sm font-semibold text-text-primary mb-1">{s.title}</h3>
              <p className="text-xs text-text-muted leading-relaxed">{s.desc}</p>
            </button>
          ))}
        </div>
      </div>

      {/* Bottom input bar */}
      <div className="border-t border-border px-8 py-5 bg-surface">
        {/* Workflow selector */}
        {workflows.length > 0 && (
          <div className="flex items-center gap-2 mb-3">
            <span className="text-xs text-text-muted">Context:</span>
            <select
              value={selectedWorkflow}
              onChange={e => setSelectedWorkflow(e.target.value)}
              className="text-xs bg-surface-2 border border-border rounded-lg px-2 py-1 text-text-muted outline-none"
            >
              {workflows.map(w => (
                <option key={w.id} value={w.id}>{w.name}</option>
              ))}
            </select>
          </div>
        )}

        <div className="flex items-center gap-3 bg-surface-2 border border-border rounded-xl px-5 py-3.5 max-w-3xl mx-auto">
          <input
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === "Enter" && handleExecute()}
            placeholder="Ask FlowLens Copilot about your workflows..."
            className="flex-1 bg-transparent text-sm text-text-primary placeholder:text-text-muted outline-none"
          />
          <button
            onClick={handleExecute}
            disabled={!input.trim()}
            className="flex items-center gap-2 bg-brand-blue text-text-primary text-sm font-medium rounded-lg px-4 py-2 disabled:opacity-40 hover:opacity-90 transition-opacity"
          >
            Execute <ArrowUp size={14} />
          </button>
        </div>

        <div className="flex items-center justify-between mt-3 max-w-3xl mx-auto px-1">
          <div className="flex items-center gap-4 text-xs text-text-muted">
            <button className="flex items-center gap-1.5 hover:text-text-muted transition-colors"><Paperclip size={11} /></button>
            <button className="flex items-center gap-1.5 hover:text-text-muted transition-colors"><GitBranch size={11} /></button>
            <button className="flex items-center gap-1.5 hover:text-text-muted transition-colors"><Mic size={11} /></button>
            <span className="bg-surface border border-border rounded px-2 py-0.5 text-[10px] text-status-success flex items-center gap-1">
              <span className="w-1 h-1 rounded-full bg-status-success" /> Auto-pilot Context Active
            </span>
          </div>
          <span className="text-xs text-text-muted">CMD + ENTER TO SEND</span>
        </div>
      </div>
    </div>
  );
}


