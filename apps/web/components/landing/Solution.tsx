import {
  Clock3,
  FileStack,
  Activity,
  WandSparklesIcon,
  LucideIcon,
} from "lucide-react";
import Eyebrow from "./Eyebrow";
import Card from "./Card";

interface SolutionItem {
  icon: LucideIcon;
  title: string;
  description: string;
}

const items: SolutionItem[] = [
  {
    icon: Clock3,
    title: "Understand What Changed",
    description:
      "Time-travel through every execution. Pinpoint the exact second your logic diverged from expectation.",
  },
  {
    icon: Activity,
    title: "Find Root Cause",
    description:
      "No more 'Undefined' errors. FlowLens trace depth goes into 3rd party APIs to find the true culprit.",
  },
  {
    icon: FileStack,
    title: "Visual Workflow Comparison",
    description:
      "Diff views that actually make sense. See changes in your workflow nodes and data flows side-by-side.",
  },
  {
    icon: WandSparklesIcon,
    title: "AI-powered recovery",
    description:
      "Get instant code fixes or logic adjustments. Recover failed runs with a single click of the AI assistant.",
  },
];

export default function Solution() {
  return (
    <section className="py-20 sm:py-24 md:py-32" id="solution">
      <div className="max-w-7xl mx-auto px-6">
              <div className="text-center text-text-primary">
                <Eyebrow ><p className="text-brand-orange">The Solution</p></Eyebrow>

          <h2 className="mt-8 text-2xl sm:text-3xl md:text-5xl font-bold leading-tight text-text-primary">
            Today debugging looks like Logs, Backups, Trial and Error.
          </h2>

          <p className="mx-auto mt-6 sm:mt-8 max-w-3xl text-base sm:text-lg md:text-xl leading-7 sm:leading-8 text-text-muted">
            Instead: FlowLens investigates <span className="text-brand-orange">automatically</span>.
          </p>
        </div>

        <div className="mt-12 sm:mt-16 md:mt-20 grid gap-6 md:grid-cols-2 lg:grid-cols-4 text-text-primary" >
          {items.map((item) => (
            <Card
              key={item.title}
              icon={item.icon}
              title={item.title}
              description={item.description}
              tone="success"
            />
          ))}
        </div>

        <div className="mt-12 sm:mt-16 md:mt-20 rounded-3xl border border-success/20 bg-gradient-to-r from-success/10 to-transparent p-6 sm:p-8 md:p-10 text-text-primary">
          <h3 className="text-xl sm:text-2xl md:text-3xl font-bold">
            No guessing.
          </h3>
          <h3 className="mt-3 text-xl sm:text-2xl md:text-3xl font-bold">
            No endless debugging.
          </h3>
          <h3 className="mt-3 text-2xl sm:text-3xl md:text-4xl font-bold text-brand-orange">
            Just answers.
          </h3>
        </div>
      </div>
    </section>
  );
}
