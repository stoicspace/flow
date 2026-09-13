// src/app/(dashboard)/assistant/[workflowId]/page.tsx
// Layout: workflow graph on left, chat panel fixed on right

"use client";
import { useState, useEffect, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import { X, ArrowUp, Mic, Paperclip } from "lucide-react";
import dynamic from "next/dynamic";
import type { NormalisedWorkFlow } from "@flowlens/core";
import Image from "next/image";
import logo from "@/public/logo.png";

const WorkflowGraph = dynamic(
  () => import("@/components/workflow/WorkFlowGraph"),
  { ssr: false }
);

interface Message {
  role: "user" | "assistant";
  content: string;
  timestamp?: string;
  recommendation?: string;
}

interface Workflow {
  id: string;
  name: string;
  platform: string;
  status: string;
}

interface Incident {
  id: string;
  error_message: string | null;
  root_cause: string | null;
  impact_summary: string | null;
  snapshot_before: string | null;
  snapshot_after: string | null;
}

export default function AssistantChatPage() {
  const params = useParams();
  const router = useRouter();
  const workflowId = params.id as string;

  const [workflow, setWorkflow] = useState<Workflow | null>(null);
  const [incident, setIncident] = useState<Incident | null>(null);
  const [normalisedData, setNormalisedData] = useState<NormalisedWorkFlow | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [streaming, setStreaming] = useState(false);
  const [loading, setLoading] = useState(true);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    
    async function load() {
      const [wfData, incData] = await Promise.all([
        fetch(`/api/workflows/${workflowId}`).then(r => r.json()),
        fetch(`/api/incidents?workflow_id=${workflowId}&status=open`).then(r => r.json()),
      ]);

      setWorkflow(wfData.workflow);

      const firstIncident = incData.incidents?.[0] || null;
      setIncident(firstIncident);

      // Load the latest snapshot's graph data
      const snapshotsRes = await fetch(`/api/snapshots?workflow_id=${workflowId}`).then(r => r.json());
      const latestSnapshot = snapshotsRes.snapshots?.[0];
      if (latestSnapshot) {
        const snapData = await fetch(`/api/snapshots/${latestSnapshot.id}`).then(r => r.json());
        setNormalisedData(snapData.snapshot?.normalised || null);
      }

      setLoading(false);
    }
    load();
  }, [workflowId]);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages]);

  function buildContext(): string {
    // Workflow name/platform/status and node/edge details are now built
    // server-side by /api/chat's buildWorkflowContext (keyed off workflowId
    // sent in the request body below) — this only adds incident-specific
    // context the server doesn't already know about.
    if (!incident) return "";
    let ctx = "";
    if (incident.error_message) ctx += `Error: ${incident.error_message}.`;
    if (incident.root_cause) ctx += ` Root cause: ${incident.root_cause}.`;
    if (incident.impact_summary) ctx += ` Impact: ${incident.impact_summary}.`;
    return ctx;
  }

  async function send() {
    if (!input.trim() || streaming) return;

    const now = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    const userMsg: Message = { role: "user", content: input, timestamp: now };
    const history = [...messages, userMsg];
    setMessages([...history, { role: "assistant", content: "" }]);
    setInput("");
    setStreaming(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: history.map(m => ({ role: m.role, content: m.content })),
          context: buildContext(),
          workflowId,
        }),
      });

      if (!res.body) { setStreaming(false); return; }

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let text = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        const lines = decoder.decode(value).split("\n");
        for (const line of lines) {
          if (!line.startsWith("data: ") || line === "data: [DONE]") continue;
          try {
            const parsed = JSON.parse(line.slice(6));
            if (parsed.text) {
              text += parsed.text;
              setMessages(prev => [
                ...prev.slice(0, -1),
                { role: "assistant", content: text },
              ]);
            }
          } catch {}
        }
      }
    } catch {
      setMessages(prev => [
        ...prev.slice(0, -1),
        { role: "assistant", content: "Something went wrong. Please try again." },
      ]);
    } finally {
      setStreaming(false);
    }
  }

  if (loading) {
    return <div className="p-8 text-text-muted text-sm">Loading...</div>;
  }

  if (!workflow) {
    return <div className="p-8 text-status-error text-sm">Workflow not found.</div>;
  }

  return (
    <div className="flex h-full relative overflow-hidden">

      {/* ── LEFT: Workflow graph area ── */}
      <div className="flex-1 flex flex-col overflow-hidden">

        {/* Incident banner,top left */}
        {incident && (
          <div className="absolute top-6 left-6 z-10 bg-surface-2 border border-status-error/30 rounded-xl px-5 py-3.5 max-w-xs">
            <p className="text-sm font-semibold text-status-error">
              Incident: ID-{incident.id.slice(0, 4).toUpperCase()}
            </p>
            <p className="text-xs text-text-muted mt-0.5">
              Status: {workflow.status} since {new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
            </p>
          </div>
        )}

        {/* Graph */}
        {normalisedData ? (
          <WorkflowGraph workflow={normalisedData} height={600} />
        ) : (
          <div className="flex-1 flex items-center justify-center text-text-muted text-sm">
            No graph data available
          </div>
        )}
      </div>

      {/* ── RIGHT: Chat panel ── */}
      <div className="w-[380px] flex-shrink-0 flex flex-col bg-surface border-l border-border h-full">

        {/* Chat header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-border">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-brand-orange/15 border border-brand-orange/25 flex items-center justify-center text-brand-orange text-sm">


<Image src={logo} alt="FlowLens" />
            </div>
            <div>
              <p className="text-sm font-semibold text-text-primary">FlowLens Copilot</p>
              <p className="text-[11px] flex items-center gap-1.5">
                <span className={`w-1.5 h-1.5 rounded-full ${streaming ? "bg-status-success animate-pulse" : "bg-status-success"}`} />
                <span className="text-status-success">
                  {streaming ? "THINKING" : "READY"}
                </span>
              </p>
            </div>
          </div>
          <button
            onClick={() => router.push("/assistant")}
            className="text-text-muted hover:text-text-primary transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Messages */}
        <div ref={scrollRef} className="flex-1 overflow-y-auto px-5 py-5 space-y-5">
          {messages.length === 0 && (
            <div className="text-center text-text-muted text-xs mt-8">
              Ask about this workflow — summary, review, deployment readiness, or debugging.
            </div>
          )}

          {messages.map((m, i) => (
            <div key={i}>
              {m.role === "user" ? (
                <div className="flex flex-col items-end">
                  <div className="bg-surface-2 border border-border text-text-primary text-sm rounded-2xl rounded-tr-sm px-4 py-2.5 max-w-[85%]">
                    {m.content}
                  </div>
                  {m.timestamp && (
                    <span className="text-[11px] text-text-muted mt-1">{m.timestamp}</span>
                  )}
                </div>
              ) : (
                <div className="flex gap-2.5">
                  <span className="w-7 h-7 rounded-lg bg-brand-orange/15 border border-brand-orange/20 flex items-center justify-center flex-shrink-0 text-brand-orange text-xs mt-0.5">
                    ✦
                  </span>
                  <div className="flex-1">
                    <p className="text-sm text-gray-200 leading-relaxed">
                      {m.content}
                      {streaming && i === messages.length - 1 && (
                        <span className="inline-block w-1 h-3.5 bg-gray-400 ml-0.5 animate-pulse" />
                      )}
                    </p>

                    {/* AI Recommendation box,shown on last assistant message if incident exists */}
                    {!streaming && i === messages.length - 1 && incident?.root_cause && (
                      <div className="mt-3 bg-brand-orange/10 border border-brand-orange/20 rounded-lg px-3.5 py-3">
                        <p className="text-xs font-semibold text-brand-orange mb-1">⚐ AI Recommendation</p>
                        <p className="text-xs text-text-muted leading-relaxed">
                          {incident.impact_summary || incident.root_cause}
                        </p>
                      </div>
                    )}

                    {/* Action buttons,shown after last assistant message */}
                    {!streaming && i === messages.length - 1 && m.role === "assistant" && m.content && (
                      <div className="flex flex-wrap gap-2 mt-3">
                        <button
                          onClick={async () => {
                            if (!incident) return;
                            await fetch(`/api/incidents/${incident.id}`, {
                              method: "PATCH",
                              headers: { "Content-Type": "application/json" },
                              body: JSON.stringify({ status: "resolved" }),
                            });
                            router.push(`/workflows/${workflowId}`);
                          }}
                          className="flex items-center gap-1.5 bg-surface-2 border border-border rounded-lg px-3 py-1.5 text-xs font-medium text-text-primary hover:border-brand-orange/40 transition-colors"
                        >
                          ✨ Apply AI Fix
                        </button>
                        <button
                          onClick={async () => {
                            const snapshotsRes = await fetch(`/api/snapshots?workflow_id=${workflowId}`).then(r => r.json());
                            const lastGood = snapshotsRes.snapshots?.find((s: any) => s.execution_status === "success");
                            if (!lastGood) return;
                            await fetch("/api/snapshots/restore", {
                              method: "POST",
                              headers: { "Content-Type": "application/json" },
                              body: JSON.stringify({ snapshot_id: lastGood.id, workflow_id: workflowId }),
                            });
                            router.push(`/workflows/${workflowId}`);
                          }}
                          className="flex items-center gap-1.5 bg-surface-2 border border-border rounded-lg px-3 py-1.5 text-xs font-medium text-text-primary hover:border-gray-500 transition-colors"
                        >
                          ↺ Restore Version
                        </button>
                        {incident && (
                          <button
                            onClick={() => router.push(`/workflows/${workflowId}/compare?from=${incident.snapshot_before}&to=${incident.snapshot_after}`)}
                            className="flex items-center gap-1.5 bg-surface-2 border border-border rounded-lg px-3 py-1.5 text-xs font-medium text-text-primary hover:border-gray-500 transition-colors"
                          >
                            ⇗ Open Compare
                          </button>
                        )}
                      </div>
                    )}

                    {!streaming && i === messages.length - 1 && m.role === "assistant" && m.content && (
                      <p className="text-[11px] text-text-muted mt-2">
                        FlowLens Copilot · workflow-aware
                      </p>
                    )}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Input */}
        <div className="px-4 py-4 border-t border-border">
          <div className="flex items-center gap-2 bg-surface-2 border border-border rounded-xl px-4 py-2.5">
            <input
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key === "Enter" && !e.shiftKey && send()}
              placeholder="Ask FlowLens Copilot..."
              className="flex-1 bg-transparent text-sm text-text-primary placeholder:text-text-muted outline-none"
            />
            <button
              onClick={send}
              disabled={streaming || !input.trim()}
              className="w-7 h-7 rounded-lg bg-brand-orange flex items-center justify-center disabled:opacity-40 hover:opacity-90 transition-opacity flex-shrink-0"
            >
              <ArrowUp size={13} className="text-text-primary" />
            </button>
          </div>
          <div className="flex items-center justify-between mt-2 px-1">
            <div className="flex items-center gap-3">
              <span className="flex items-center gap-1 text-[11px] text-text-muted cursor-pointer hover:text-text-muted">
                <Paperclip size={11} /> CONTEXT
              </span>
              <span className="flex items-center gap-1 text-[11px] text-text-muted cursor-pointer hover:text-text-muted">
                <Mic size={11} /> VOICE
              </span>
            </div>
            <span className="text-[11px] text-text-muted">Markdown supported</span>
          </div>
        </div>

      </div>
    </div>
  );
}