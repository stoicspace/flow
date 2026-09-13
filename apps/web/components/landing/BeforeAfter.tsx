import { CheckCircle2, XCircle } from "lucide-react";
import Eyebrow from "./Eyebrow";

const before: string[] = [
  "Reading logs",
  "Comparing JSON files",
  "Manual debugging",
  "Guessing root causes",
  "Hours of investigation",
];

const after: string[] = [
  "Know exactly what changed",
  "Understand why it failed",
  "See which systems are affected",
  "Recover with confidence",
  "Fix workflows in minutes",
];

export default function BeforeAfter() {
  return (
    <section className="py-20 sm:py-24 md:py-32" id="bfaf">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center text-text-primary">
          <Eyebrow ><p className="text-brand-orange">Without vs With FlowLens</p></Eyebrow>

          <h2 className="mt-8 text-3xl sm:text-4xl md:text-5xl font-bold">
            Stop wasting hours
            <br />
            finding one tiny mistake.
          </h2>

          <p className="mt-6 text-text-muted">
            See the difference FlowLens makes.
          </p>
        </div>

        <div className="mt-12 sm:mt-16 md:mt-20 grid gap-6 sm:gap-8 lg:grid-cols-2">
          {/* Before */}
          <div className="rounded-3xl border border-status-error/20 bg-surface-2 p-6 sm:p-8 md:p-10">
            <h3 className="text-2xl sm:text-3xl font-bold text-status-error">
              Without FlowLens
            </h3>

            <div className="mt-10 space-y-6">
              {before.map((item) => (
                <div key={item} className="flex items-center gap-3 sm:gap-4 text-base sm:text-lg text-text-primary ">
                  <XCircle className="text-status-error shrink-0" />
                  {item}
                </div>
              ))}
            </div>
          </div>

          {/* After */}
          <div className="rounded-3xl border border-success/20 bg-surface-2 p-6 sm:p-8 md:p-10 text-text-primary">
            <h3 className="text-2xl sm:text-3xl font-bold text-success">
              With FlowLens
            </h3>

            <div className="mt-10 space-y-6">
              {after.map((item) => (
                <div key={item} className="flex items-center gap-3 sm:gap-4 text-base sm:text-lg">
                  <CheckCircle2 className="text-status-success shrink-0" />
                  {item}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
