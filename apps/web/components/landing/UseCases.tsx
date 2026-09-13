import {
  Bot,
  Workflow,
  Trash2,
  Database,
  Webhook,
  Link2,
  LucideIcon,
} from "lucide-react";
import Eyebrow from "./Eyebrow";
import Card from "./Card";

interface UseCase {
  icon: LucideIcon;
  title: string;
  desc: string;
}

const cases: UseCase[] = [
  {
    icon: Workflow,
    title: "Workflow suddenly stopped",
    desc: "Yesterday everything worked. Today it doesn't.",
  },
  {
    icon: Bot,
    title: "Prompt update broke AI",
    desc: "A small prompt change caused unexpected responses.",
  },
  {
    icon: Trash2,
    title: "Deleted workflow node",
    desc: "Someone accidentally removed a critical step.",
  },
  {
    icon: Database,
    title: "CRM fields changed",
    desc: "Your mappings no longer match incoming data.",
  },
  {
    icon: Webhook,
    title: "Webhook payload changed",
    desc: "External APIs returned a different structure.",
  },
  {
    icon: Link2,
    title: "Multiple workflows failed",
    desc: "One small update broke your entire automation chain.",
  },
];

export default function UseCases() {
  return (
    <section className="py-20 sm:py-24 md:py-32 bg-surface-deep" id="usecases">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center">
          <Eyebrow>Common Problems</Eyebrow>

          <h2 className="mt-8 text-3xl sm:text-4xl md:text-5xl font-bold">
            When FlowLens becomes
            <span className="text-brand-orange"> indispensable.</span>
          </h2>

          <p className="mt-6 text-sm sm:text-base text-text-muted max-w-2xl mx-auto">
            These are the issues automation teams face every week. FlowLens
            helps you solve them in minutes instead of hours.
          </p>
        </div>

        <div className="mt-12 sm:mt-16 md:mt-20 grid gap-6 sm:gap-8 md:grid-cols-2 lg:grid-cols-3">
          {cases.map((item) => (
            <Card
              key={item.title}
              icon={item.icon}
              title={item.title}
              description={item.desc}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
