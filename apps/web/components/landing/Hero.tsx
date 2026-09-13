import { AlertTriangle, ArrowRight, Sparkles } from "lucide-react";

export default function Hero() {
  return (
    <section className="relative pt-40 pb-20 sm:pt-44 sm:pb-24 md:pt-56 md:pb-32">
      <div className="absolute inset-x-0 top-0 h-[500px] bg-brand-orange/10 blur-[140px] -z-10" />

      <div className="max-w-5xl mx-auto px-4 sm:px-6 text-center text-text-primary">
        <span className="inline-flex items-center gap-2 rounded-full border border-text-primary bg-brand-orange/10 px-4 py-2 text-sm text-brand-orange">
          <Sparkles size={16} />
          AI Workflow Copilot
        </span>

        <h1 className="mt-8 text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold leading-tight">
          Know exactly why your
          <br className="hidden sm:block " /> workflow{" "}
          <span className="text-brand-orange">broke.</span>
        </h1>

        <p className="mx-auto mt-6 max-w-2xl text-base sm:text-lg md:text-xl text-text-muted">
          FlowLens watches every version of your automation and tells you, in plain English, what changed, why it failed, and proposes a fix you can review ; before your customers notice
        </p>

        <div className="mt-10 flex flex-col sm:flex-row justify-center items-center gap-4">
  <a href="/login" className="w-full sm:w-auto">
    <button
      className="w-full sm:w-auto rounded-xl bg-brand-orange px-8 py-4 font-semibold text-white transition hover:brightness-110 disabled:opacity-50"
    >
      Get Started
    </button>
  </a>

  <a href="#problem" className="w-full sm:w-auto">
    <button
      className="w-full sm:w-auto rounded-xl border border-brand-orange/40 bg-transparent px-8 py-4 font-semibold text-text-primary transition hover:border-white/30"
    >
      See the problem
    </button>
  </a>
</div>

        {/* Signature element: a live-looking failed execution card */}
        <div className="mt-16 sm:mt-20 mx-auto max-w-xl rounded-2xl border border-border bg-surface p-5 sm:p-6 text-left">
          <div className="flex items-center justify-between border-b border-border pb-4">
            <span className="text-sm text-text-muted">Workflow Execution</span>
            <span className="flex items-center gap-1.5 text-xs text-status-error">
              <AlertTriangle size={14} /> Failed
            </span>
          </div>
          <div className="mt-4 space-y-1.5 font-mono text-xs sm:text-sm text-gray-500">
            <p>[ERROR] Invalid payload at node &quot;Send Email&quot;</p>
            <p className="text-brand-orange">
              [FlowLens] Field &quot;customer_email&quot; renamed 6h ago in v14
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
