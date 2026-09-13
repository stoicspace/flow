import {
  Bot,
  Workflow,
  Building2,
  Users,
  Rocket,
  Cpu,
  Briefcase,
  Network,
  Database,
  LucideIcon,
} from "lucide-react";
import Eyebrow from "./Eyebrow";
import Card from "./Card";

interface AudienceItem {
  icon: LucideIcon;
  title: string;
}

const audience: AudienceItem[] = [
  { icon: Workflow, title: "Automation Engineers" },
  { icon: Bot, title: "AI Workflow Builders" },
  { icon: Rocket, title: "Startup Teams" },
  { icon: Building2, title: "SaaS Companies" },
  { icon: Briefcase, title: "Agencies" },
  { icon: Network, title: "n8n Users" },
  { icon: Database, title: "Zapier Users" },
  { icon: Cpu, title: "Make Users" },
  { icon: Users, title: "Operations Teams" },
];

export default function Audience() {
  return (
    <section className="py-20 sm:py-24 md:py-32" id="audience">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center">
          <Eyebrow>Built For</Eyebrow>

          <h2 className="mt-8 text-3xl sm:text-4xl md:text-5xl font-bold">
            Teams that run
            <br />
            on automation.
          </h2>

          <p className="mt-6 text-text-muted">
            Whether you&apos;re shipping AI agents, automating operations, or
            running production workflows, FlowLens helps you debug faster.
          </p>
        </div>

        <div className="mt-12 sm:mt-16 md:mt-20 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 md:gap-8">
          {audience.map((item) => (
            <Card key={item.title} icon={item.icon} title={item.title} />
          ))}
        </div>
      </div>
    </section>
  );
}
