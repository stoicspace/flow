import { Check } from "lucide-react";
import FadeUp from "./FadeUp";

const providers = [
  { name: "OpenAI", note: "Your API key", selected: true },
  { name: "Anthropic", note: "Your API key", selected: false },
  { name: "OpenAI-compatible", note: "Any endpoint you choose", selected: false },
  { name: "Self-hosted model", note: "Never leaves your infra", selected: false },
];

export default function BringYourOwnKey() {
  return (
    <section id="byok" className="relative overflow-hidden">
      {/* coral glow bleeding from the left */}
      <div
        aria-hidden="true"
        className="glow-strong pointer-events-none absolute -bottom-24 -left-32 h-[480px] w-[480px] opacity-50"
      />

      <div className="relative bg-island px-4 py-20 sm:px-6 md:pb-56 md:pt-32">
        <div className="mx-auto max-w-6xl">
          <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-16">
            {/* Left: copy */}
            <div>
              <FadeUp>
                <span className="inline-flex rounded-full border border-island-border px-4 py-2 text-[13px] text-island-muted">
                  Your data, your model
                </span>
                <h2 className="font-heading mt-5 text-3xl font-bold leading-[1.25] text-island-text sm:text-4xl md:text-5xl">
                  Bring your own key.
                  <br />
                  <span className="text-accent-soft">Run it your way.</span>
                </h2>

                <div className="mt-7 space-y-5 text-[15px] leading-[21px] text-island-muted sm:text-[17px] sm:leading-[25px]">
                  <p>
                    FlowLens doesn&apos;t require you to route your workflow
                    data through a shared AI service you don&apos;t control.
                    You can point it at your own OpenAI, Anthropic, or any
                    OpenAI-compatible endpoint: your key, your usage, your
                    cost. If you&apos;d rather not send workflow data to a
                    third-party model provider at all, the{" "}
                    <span className="text-island-accent underline underline-offset-2">
                      self-hosted path
                    </span>{" "}
                    exists for exactly that reason.
                  </p>
                  <p>
                    This isn&apos;t a compliance checkbox. It&apos;s because
                    workflow JSON often contains the shape of your actual
                    business logic: which systems talk to which, what
                    triggers what, and that&apos;s not something every team
                    wants living in someone else&apos;s analytics pipeline by
                    default.
                  </p>
                </div>
              </FadeUp>
            </div>

            {/* Right: settings card */}
            <FadeUp delay={0.12}>
              <div className="shadow-mockup rounded-3xl border border-border-warm/40 bg-surface p-6 sm:p-7">
                <div className="flex items-center justify-between">
                  <span className="text-[15px] font-semibold text-text-primary">
                    AI provider
                  </span>
                  <span className="text-[12px] text-text-muted">
                    Settings › Model
                  </span>
                </div>

                {/* Provider picker */}
                <div className="mt-5 grid grid-cols-1 gap-2.5 sm:grid-cols-2">
                  {providers.map((p) => (
                    <div
                      key={p.name}
                      className={`flex items-start gap-2.5 rounded-xl border p-3.5 transition-colors duration-200 ${
                        p.selected
                          ? "border-2 border-accent bg-surface-4"
                          : "border-border-strong bg-surface-3"
                      }`}
                    >
                      <span
                        className={`mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full border ${
                          p.selected
                            ? "border-accent bg-accent"
                            : "border-border-strong"
                        }`}
                      >
                        {p.selected && (
                          <span className="h-1.5 w-1.5 rounded-full bg-island" />
                        )}
                      </span>
                      <div>
                        <p className="text-[13px] font-semibold text-text-primary">
                          {p.name}
                        </p>
                        <p className="mt-0.5 text-[11px] text-text-muted">
                          {p.note}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Fields */}
                <div className="mt-5 space-y-3">
                  <div>
                    <label
                      htmlFor="fl-endpoint"
                      className="text-[12px] font-medium text-text-secondary"
                    >
                      Endpoint
                    </label>
                    <div
                      id="fl-endpoint"
                      className="mt-1.5 rounded-xl border border-border-strong bg-surface-3 px-3.5 py-2.5 font-mono text-[12px] text-text-secondary"
                    >
                      https://api.openai.com/v1
                    </div>
                  </div>
                  <div>
                    <label
                      htmlFor="fl-apikey"
                      className="text-[12px] font-medium text-text-secondary"
                    >
                      API key
                    </label>
                    <div
                      id="fl-apikey"
                      className="mt-1.5 rounded-xl border border-border-strong bg-surface-3 px-3.5 py-2.5 font-mono text-[12px] tracking-widest text-text-muted"
                    >
                      sk-••••••••••••••••
                    </div>
                  </div>
                </div>

                {/* Green note */}
                <div className="mt-5 flex items-start gap-2.5 rounded-xl bg-success-bg px-3.5 py-3">
                  <Check size={15} className="mt-0.5 shrink-0 text-success-text" />
                  <p className="text-[12px] leading-relaxed text-success-text">
                    Your key, your usage, your cost. Nothing requires a shared,
                    FlowLens-operated AI service.
                  </p>
                </div>
              </div>
            </FadeUp>
          </div>
        </div>
      </div>
    </section>
  );
}
