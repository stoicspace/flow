// ─────────────────────────────────────────────────────────────
// src/components/assistant/AIAssistantPanel.tsx
// The full right-side chat panel
// ─────────────────────────────────────────────────────────────

"use client";
import { useState, useRef, useEffect } from "react";
import { X, Send, Paperclip, Mic, ArrowUp } from "lucide-react";
import ChatMessageBubble from "./ChatMessageBubble";
import AIRecommendationInline from "./AIRecommendationInline";
import AssistantActions from "./AssistantActions";

interface Message {
  role: "user" | "assistant";
  content: string;
  recommendation?: string;
  showActions?: boolean;
}

interface Props4 {
  workflowId: string;
  snapshotId?: string;
  incidentContext?: string;
  onClose: () => void;
  onApplyFix?: () => void;
  onRestore?: () => void;
  onOpenCompare?: () => void;
}

export default function AIAssistantPanel({
  workflowId,
  snapshotId,
  incidentContext = "",
  onClose,
  onApplyFix,
  onRestore,
  onOpenCompare,
}: Props4) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [streaming, setStreaming] = useState(false);
  const [applyingFix, setApplyingFix] = useState(false);
  const [restoring, setRestoring] = useState(false);
  const [loadingDocumentation, setLoadingDocumentation] = useState(false);
  const [loadingDeploymentCheck, setLoadingDeploymentCheck] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const [includeContext, setIncludeContext] = useState(true);
  const [listening, setListening] = useState(false);
  const recognitionRef = useRef<any>(null);


  useEffect(() => {
    if (typeof window === "undefined") return;

    const SpeechRecognition =
      (window as any).SpeechRecognition ||
      (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) return;

    const recognition = new SpeechRecognition();

    recognition.continuous = false;
    recognition.interimResults = true;
    recognition.lang = "en-US";

    recognition.onstart = () => {
      console.log("Speech started");
      setListening(true);
    };

    recognition.onend = () => {
      console.log("Speech ended");
      setListening(false);
    };

    recognition.onresult = (event: any) => {
      console.log(event);

      let transcript = "";

      for (let i = event.resultIndex; i < event.results.length; i++) {
        transcript += event.results[i][0].transcript;
      }

      console.log("Transcript:", transcript);

      setInput(transcript);
    };

    recognition.onerror = (e: any) => {
      console.log("Speech error:", e.error);

      setListening(false);
    };

    recognitionRef.current = recognition;
  }, []);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });

  }, [messages]);


  async function send() {
    if (!input.trim() || streaming) return;
    const userMsg: Message = { role: "user", content: input };
    const history = [...messages, userMsg];
    setMessages([...history, { role: "assistant", content: "" }]);
    setInput("");
    setStreaming(true);

    const res = await fetch("/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        messages: history.map(m => ({
          role: m.role,
          content: m.content
        })),
        workflowId,
        includeContext,
        context: includeContext ? incidentContext : "",
      })
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
            setMessages(prev => [...prev.slice(0, -1), { role: "assistant", content: text }]);
          }
        } catch { }
      }
    }
    setStreaming(false);
    // Surface the action bar (Apply Fix / Restore / Compare / Docs / Deployment
    // check) under the reply so it's actually reachable — previously nothing
    // ever set showActions, so this bar never rendered.
    setMessages(prev => [
      ...prev.slice(0, -1),
      { ...prev[prev.length - 1], showActions: true },
    ]);
  }

  async function handleApplyFix() {
    setApplyingFix(true);
    try { await onApplyFix?.(); } finally { setApplyingFix(false); }
  }

  async function handleRestore() {
    setRestoring(true);
    try { await onRestore?.(); } finally { setRestoring(false); }
  }

  async function handleViewDocumentation() {
    if (!snapshotId) {
      setMessages(prev => [...prev, { role: "assistant", content: "No snapshot is selected to document yet." }]);
      return;
    }
    setLoadingDocumentation(true);
    try {
      const res = await fetch("/api/ai/document", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ snapshot_id: snapshotId }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Documentation generation failed.");

      const doc = data.documentation;
      const sections = (doc.sections || [])
        .map((s: any) => `**${s.heading}** — ${s.content}`)
        .join("\n");
      const content = `**${doc.title}**\n\n${doc.overview}${sections ? `\n\n${sections}` : ""}`;
      setMessages(prev => [...prev, { role: "assistant", content }]);
    } catch (e: any) {
      setMessages(prev => [...prev, { role: "assistant", content: `Couldn't generate documentation: ${e.message}` }]);
    } finally {
      setLoadingDocumentation(false);
    }
  }

  async function handleCheckDeploymentReadiness() {
    if (!snapshotId) {
      setMessages(prev => [...prev, { role: "assistant", content: "No snapshot is selected to check yet." }]);
      return;
    }
    setLoadingDeploymentCheck(true);
    try {
      const res = await fetch("/api/ai/deployment-check", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ snapshot_id: snapshotId }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Deployment check failed.");

      const check = data.check;
      const blocking = (check.blocking_issues || []).map((i: string) => `- ${i}`).join("\n");
      const warnings = (check.warnings || []).map((i: string) => `- ${i}`).join("\n");
      const content = `**Deployment score: ${check.score}/100 (${check.status})**` +
        (blocking ? `\n\nBlocking:\n${blocking}` : "") +
        (warnings ? `\n\nWarnings:\n${warnings}` : "") +
        (!blocking && !warnings ? "\n\nNo blocking issues or warnings found." : "");
      setMessages(prev => [...prev, { role: "assistant", content }]);
    } catch (e: any) {
      setMessages(prev => [...prev, { role: "assistant", content: `Couldn't check deployment readiness: ${e.message}` }]);
    } finally {
      setLoadingDeploymentCheck(false);
    }
  }

  async function toggleMic() {
    if (!recognitionRef.current) {
      alert("Speech recognition is not supported in this browser.");
      return;
    }

    if (listening) {
      recognitionRef.current.stop();
    } else {
      recognitionRef.current.start();
    }
  }

  return (
    <div className="fixed right-0 top-0 h-screen w-72 bg-surface-2 border-l border-border flex flex-col z-40">

      {/* Header */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-border-light">
        <div className="flex items-center gap-3">
          <span className="w-9 h-9 rounded-lg bg-brand-orange/15 border border-brand-orange/25 flex items-center justify-center text-brand-orange">
            <img src="/logo.png" alt="FlowLens" />
          </span>
          <div>
            <p className="text-sm font-semibold text-text-primary">FlowLens Copilot</p>
            <p className="text-[11px] text-status-success flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-status-success" />
              {streaming ? "Thinking..." : "Ready"}
            </p>
          </div>
        </div>
        <button onClick={onClose} className="text-text-muted hover:text-text-primary transition-colors">
          <X size={18} />
        </button>
      </div>

      {/* Messages */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto px-5 py-5 space-y-5">
        {messages.length === 0 && (
          <div className="text-center text-text-muted text-xs mt-12">
            Ask anything about this workflow.<br />
            Try "Summarize this workflow", "Why did this fail?",<br />
            or "Is this ready to deploy?"
          </div>
        )}
        {messages.map((m, i) => (
          <div key={i}>
            <ChatMessageBubble
              role={m.role}
              content={m.content}
              streaming={streaming && i === messages.length - 1 && m.role === "assistant"}
            />
            {m.recommendation && <AIRecommendationInline text={m.recommendation} />}
            {m.showActions && (
              <AssistantActions
                onApplyFix={handleApplyFix}
                onRestore={handleRestore}
                onOpenCompare={() => onOpenCompare?.()}
                applyingFix={applyingFix}
                restoring={restoring}
                onViewDocumentation={handleViewDocumentation}
                onCheckDeploymentReadiness={handleCheckDeploymentReadiness}
                loadingDocumentation={loadingDocumentation}
                loadingDeploymentCheck={loadingDeploymentCheck}
              />
            )}
          </div>
        ))}
        {!streaming && messages.length > 0 && messages[messages.length - 1].role === "assistant" && (
          <p className="text-[11px] text-text-muted -mt-2">
            FlowLens Copilot · workflow-aware
          </p>
        )}
      </div>

      {/* Input */}
      <div className="px-5 py-4 border-t border-border-light">
        <div className="flex items-center gap-2 bg-surface border border-border rounded-xl px-4 py-2.5">
          <input
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === "Enter" && send()}
            placeholder="Ask FlowLens Copilot..."
            className="flex-1 bg-transparent text-sm text-text-primary placeholder:text-text-muted outline-none"
          />
          <button onClick={send} disabled={streaming || !input.trim()} className="text-brand-orange disabled:opacity-40">
            <ArrowUp size={18} />
          </button>
        </div>
        <div className="flex items-center justify-between mt-2.5 px-1">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIncludeContext(!includeContext)}
              className={`flex items-center gap-1 text-[11px] transition
    ${includeContext
                  ? "text-brand-orange"
                  : "text-text-muted"
                }`}
            >
              <Paperclip size={11} />
              {includeContext ? "Context On" : "Context Off"}
            </button>
            <button
              onClick={toggleMic}
              className={`flex items-center gap-1 text-[11px] transition-colors ${listening
                  ? "text-status-error"
                  : "text-text-muted hover:text-brand-orange"
                }`}
            >
              <Mic size={11} />
              {listening ? "Listening..." : "Voice"}
            </button>
          </div>
          <span className="text-[11px] text-text-muted">Markdown supported</span>
        </div>
      </div>
    </div>
  );
}

