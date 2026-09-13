import {
  BrainCircuit,
  Database,
  Mail,
  Workflow as WorkflowIcon,
  ArrowRight,
} from "lucide-react";

export default function Workflow() {
  return (
    <section className="py-20 sm:py-24 md:py-32" id="workflow">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="grid lg:grid-cols-2 gap-12 sm:gap-16 lg:gap-20 items-center">
          {/* Left */}
          <div>
            <h2 className="mt-8 text-3xl sm:text-4xl md:text-5xl font-bold leading-tight">
              Build powerful workflows
              <span className="text-brand-orange"> visually</span>
            </h2>

            <p className="mt-6 sm:mt-8 text-base sm:text-lg leading-7 sm:leading-8 text-text-muted">
              Connect AI, databases, APIs and your favorite tools using an
              intuitive visual editor. Deploy anywhere in seconds.
            </p>

            <div className="mt-10 space-y-6">
              <div className="flex gap-4">
                <BrainCircuit className="text-brand-orange mt-1" />
                <div>
                  <h4 className="font-semibold text-lg sm:text-xl">AI Powered</h4>
                  <p className="text-text-muted mt-2">
                    GPT, Claude, Gemini and open-source models.
                  </p>
                </div>
              </div>

              <div className="flex gap-4">
                <WorkflowIcon className="text-brand-orange mt-1" />
                <div>
                  <h4 className="font-semibold text-lg sm:text-xl">Drag & Drop</h4>
                  <p className="text-text-muted mt-2">
                    No coding required. Design workflows visually.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Right */}
          <div className="relative">
            <div className="absolute inset-0 bg-brand-orange/10 blur-[120px]" />

            <div className="relative rounded-3xl border border-border bg-surface p-6 sm:p-8 md:p-10">
              <div className="space-y-6">
                {/* Card */}
                <div className="flex items-center justify-between rounded-2xl bg-surface-2 p-4 sm:p-5">
                  <div className="flex items-center gap-3 sm:gap-4">
                    <BrainCircuit className="text-brand-orange shrink-0" />
                    <span>AI Agent</span>
                  </div>
                  <ArrowRight />
                </div>

                <div className="flex items-center justify-between rounded-2xl bg-surface-2 p-4 sm:p-5">
                  <div className="flex items-center gap-3 sm:gap-4">
                    <Database className="text-status-success shrink-0" />
                    <span>Database</span>
                  </div>
                  <ArrowRight />
                </div>

                <div className="flex items-center justify-between rounded-2xl bg-surface-2 p-4 sm:p-5">
                  <div className="flex items-center gap-3 sm:gap-4">
                    <Mail className="text-blue-400 shrink-0" />
                    <span>Email Notification</span>
                  </div>
                  <ArrowRight />
                </div>

                <a href="/login">
                <button
                
                
                className="w-full sm:w-auto rounded-xl bg-brand-orange px-8 py-3 font-semibold text-white transition hover:brightness-110 disabled:opacity-50"
              >
                Get Started
              </button>
              </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}