import { CheckCircle2, XCircle } from "lucide-react";
import Eyebrow from "./Eyebrow";

const rows: [string, string][] = [
  ["Stack traces", "AI-powered root cause analysis"],
  ["Error logs", "Plain-English explanations"],
  ["Execution failures", "Workflow version history"],
  ["Raw JSON differences", "Impact analysis"],
  ["Manual investigation", "AI-proposed fixes, you approve"],
];

export default function WhyFlowLens() {
  return (
    <section className="py-20 sm:py-24 md:py-32" id="whyus">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="text-center">
          <Eyebrow><p className="text-status-warning">Why FlowLens</p></Eyebrow>

          <h2 className="mt-8 text-3xl sm:text-4xl md:text-5xl font-bold text-text-primary">
            Most debugging tools
            <br />
            tell you what failed.
          </h2>

          <h2 className="mt-3 sm:mt-4 text-3xl sm:text-4xl md:text-5xl font-bold text-brand-orange">
            FlowLens tells you why.
          </h2>
        </div>

        <div className="mt-12 sm:mt-16 md:mt-20 rounded-3xl border border-border overflow-hidden text-text-primary">
          <div className="grid grid-cols-2 bg-surface-2 p-3 sm:p-6 text-sm sm:text-base font-semibold">
            <div>Traditional Tools</div>
            <div>FlowLens</div>
          </div>

          {rows.map((row) => (
            <div
              key={row[0]}
              className="grid grid-cols-2 border-t border-border"
            >
              <div className="flex items-center gap-2 sm:gap-3 p-3 sm:p-6 text-sm sm:text-base bg-surface-2">
                <XCircle className="text-status-error shrink-0" />
                {row[0]}
              </div>

              <div className="flex items-center gap-2 sm:gap-3 p-3 sm:p-6 text-sm sm:text-base bg-surface-2">
                <CheckCircle2 className="text-status-success shrink-0" />
                {row[1]}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
