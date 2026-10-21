import FadeUp from "./FadeUp";

const downstream = [
  "A Slack message doesn't go out.",
  "An order doesn't get fulfilled.",
  "A lead doesn't land in the CRM.",
];

export default function Problem() {
  return (
    <section id="problem" className="px-4 pb-20 sm:px-6 md:pb-36">
      <div className="mx-auto max-w-6xl">
        <FadeUp>
          <div className="relative overflow-hidden rounded-3xl bg-island px-6 py-12 sm:px-10 md:px-14 md:py-16">
            {/* subtle warm glow */}
            <div
              aria-hidden="true"
              className="glow-strong pointer-events-none absolute -right-24 top-0 h-96 w-96 opacity-40"
            />

            <div className="relative grid gap-12 lg:grid-cols-[1.15fr_1fr] lg:gap-16">
              {/* Left: copy */}
              <div>
                <span className="text-[11px] font-semibold uppercase tracking-[0.22em] text-island-dim">
                  The actual problem
                </span>
                <h2 className="font-heading mt-5 text-3xl font-bold leading-[1.1] text-island-text sm:text-4xl md:text-5xl">
                  The actual problem{" "}
                  <span className="text-island-dim">
                    (not the abstract one)
                  </span>
                </h2>

                <div className="mt-8 space-y-5 text-[15px] leading-[19px] text-island-muted sm:text-[17px] sm:leading-[21px]">
                  <p>
                    Most teams don&apos;t find out a workflow broke until
                    someone downstream complains. A Slack message doesn&apos;t
                    go out. An order doesn&apos;t get fulfilled. A lead
                    doesn&apos;t land in the CRM. By the time anyone opens the
                    workflow to look, they&apos;re staring at a JSON tree with
                    forty nodes, no idea which one changed, and no record of
                    what it looked like last week.
                  </p>
                  <p>
                    n8n, Zapier, and Make all show you{" "}
                    <em className="font-medium not-italic text-island-text">
                      that
                    </em>{" "}
                    a run failed. None of them tell you{" "}
                    <em className="font-medium not-italic text-island-text">
                      what changed since the last time it worked
                    </em>
                    , and reconstructing that by hand, node by node, is the
                    part that actually eats an afternoon.
                  </p>
                </div>
              </div>

              {/* Right: timeline + boxes */}
              <div>
                <div className="space-y-0">
                  {downstream.map((item, i) => (
                    <div key={item} className="flex gap-4">
                      <div className="flex flex-col items-center">
                        <span className="mt-1.5 h-3 w-3 shrink-0 rounded-full border-2 border-island-dim" />
                        {i < downstream.length && (
                          <span
                            className="w-px flex-1 bg-island-border"
                            aria-hidden="true"
                          />
                        )}
                      </div>
                      <div className="pb-7">
                        <span className="text-[11px] uppercase tracking-[0.18em] text-island-dim">
                          Downstream
                        </span>
                        <p className="mt-1 text-[15px] text-island-muted">
                          {item}
                        </p>
                      </div>
                    </div>
                  ))}
                  <div className="flex gap-4">
                    <div className="flex flex-col items-center">
                      <span className="mt-1.5 h-3 w-3 shrink-0 rounded-full bg-accent" />
                    </div>
                    <div className="pb-7">
                      <p className="mt-0.5 text-[15px] font-semibold text-island-accent">
                        Then someone opens the workflow
                      </p>
                    </div>
                  </div>
                </div>

                <div className="mt-2 space-y-3">
                  {/* What your platform shows */}
                  <div className="rounded-2xl border border-dashed border-island-border p-4">
                    <span className="text-[11px] uppercase tracking-[0.18em] text-island-dim">
                      What your platform shows
                    </span>
                    <p className="mt-1.5 text-[15px] text-island-error">
                      ✕ Execution failed
                    </p>
                  </div>

                  {/* What you actually need */}
                  <div className="rounded-2xl border border-island-border bg-island-soft p-4">
                    <span className="text-[11px] uppercase tracking-[0.18em] text-island-dim">
                      What you actually need
                    </span>
                    <p className="mt-1.5 text-[15px] font-bold text-island-text">
                      What changed since it last worked
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </FadeUp>
      </div>
    </section>
  );
}
