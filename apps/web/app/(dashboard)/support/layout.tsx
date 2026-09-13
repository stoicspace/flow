import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Support",
  description: "Get help with FlowLens — search your workflows or reach the team directly.",
};

export default function SupportLayout({ children }: { children: React.ReactNode }) {
  return children;
}