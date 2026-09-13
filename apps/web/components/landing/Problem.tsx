import { AlertTriangle, FileText, Search, GitCompare, Bot } from "lucide-react";

export default function Problem() {
  return (
    <section className="py-20 sm:py-24 md:py-32" id="problem">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 grid lg:grid-cols-2 gap-10 sm:gap-12 lg:gap-16 items-center">
        {/* Left */}
        <div>
          <h2 className="mt-8 text-3xl sm:text-4xl md:text-5xl font-bold leading-tight text-text-primary">
            Debugging workflows
            <br />
            shouldn&apos;t feel like
            <br />
            <span className="text-brand-orange">detective work.</span>
          </h2>

          <div className="mt-8 sm:mt-10 space-y-4 sm:space-y-5 text-base sm:text-lg text-text-muted">
            <p>Your automation suddenly stops working.</p>
            <p>Customers stop receiving emails.</p>
            <p>Orders stop syncing.</p>
            <p>Your AI agent starts returning errors.</p>
          </div>

          <div className="mt-8 sm:mt-10 rounded-2xl border border-status-error/20 bg-status-error/10 p-5 sm:p-6">
            <p className="text-status-error font-semibold text-lg sm:text-xl flex items-center gap-2">
              <AlertTriangle size={20} /> Execution Failed
            </p>
          </div>

          <div className="mt-10 space-y-5 text-text-primary">
            <div className="flex gap-4">
              <FileText className="text-brand-orange mt-1" />
              <span>Read hundreds of log lines</span>
            </div>

            <div className="flex gap-4">
              <GitCompare className="text-brand-orange mt-1" />
              <span>Compare workflow JSON files</span>
            </div>

            <div className="flex gap-4">
              <Bot className="text-brand-orange mt-1" />
              <span>Ask ChatGPT what changed</span>
            </div>

            <div className="flex gap-4">
              <Search className="text-brand-orange mt-1" />
              <span>Test random fixes until something works</span>
            </div>
          </div>

          <p className="mt-8 sm:mt-10 text-xl sm:text-2xl font-semibold text-text-primary">Hours later...</p>

          <p className="mt-4 text-lg sm:text-xl text-text-muted">
            You discover someone renamed
            <span className="text-brand-orange"> one field yesterday.</span>
          </p>

          <p className="mt-6 sm:mt-8 text-2xl sm:text-3xl font-bold text-text-primary">
            There has to be a better way.
          </p>
        </div>

        {/* Right */}
        <div className="relative">
          <div className="absolute inset-0 bg-status-error/10 blur-[100px]" />

          <div className="relative rounded-3xl border border-border bg-surface p-6 sm:p-8">
            <img
  src="/hero.png"
  alt="FlowLens Logo"
  
/>
          </div>
        </div>
      </div>
    </section>
  );
}