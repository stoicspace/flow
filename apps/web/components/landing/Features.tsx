import { Bot, Workflow, Database, Shield, LucideIcon } from "lucide-react";
import Card from "./Card";

interface Feature {
  icon: LucideIcon;
  title: string;
  description: string;
}

const features: Feature[] = [
  {
    icon: Bot,
    title: "AI Root Cause Analysis",
    description:
      "FlowLens analyzes workflow changes and explains failures in plain English, so you spend less time investigating and more time building.",
  },
  {
    icon: Workflow,
    title: "Workflow Version Comparison",
    description:
      "Compare every version automatically and instantly identify changed nodes, prompts, variables, and connections.",
  },
  {
    icon: Database,
    title: "Impact Analysis",
    description:
      "Understand exactly which workflows, agents, APIs, or downstream systems are affected before customers notice.",
  },
  {
    icon: Shield,
    title: "One-Click Recovery",
    description:
      "Restore the last working version or apply AI-powered recommendations to recover quickly.",
  },
];

export default function Features() {
  return (
    <section className="py-20 sm:py-24 md:py-32" id="features">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center">
          <h2 className="mt-8 text-3xl sm:text-4xl md:text-5xl font-bold">
            Everything you need to debug AI workflows faster
          </h2>
        </div>

        <div className="mt-12 sm:mt-16 md:mt-20 grid gap-6 sm:gap-8 px-0 sm:px-4 md:px-10 md:grid-cols-2">
          {features.map((feature) => (
            <Card
              key={feature.title}
              icon={feature.icon}
              title={feature.title}
              description={feature.description}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
