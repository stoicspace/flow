"use client";

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
          <span className="rounded-full border border-brand-orange/20 bg-brand-orange-orange/10 px-4 py-2 text-sm sm:text-base text-orange-400">
            Built For
          </span>

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

        <div className="mt-12 sm:mt-16 md:mt-20 grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 md:gap-8">
          {audience.map((item) => {
            const Icon = item.icon;

            return (
              <div
                key={item.title}
                className="group rounded-3xl border border-border bg-surface p-6 sm:p-8 transition hover:-translate-y-2 hover:border-brand-orange/40"
              >
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-orange-orange/10">
                  <Icon className="text-brand-orange" size={28} />
                </div>

                <h3 className="mt-8 text-xl font-semibold">{item.title}</h3>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}