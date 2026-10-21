import type { Metadata } from "next";
import Navbar from "@/components/demo/Navbar";
import Footer from "@/components/demo/Footer";
import N8nHero from "@/components/integrations/N8nHero";
import ImportWays from "@/components/integrations/ImportWays";
import Notices from "@/components/integrations/Notices";
import CrossPromo from "@/components/integrations/CrossPromo";

const navLinks = [
      { href: "/", label: "Product" },
  { href: "/integrations", label: "Integrations" },
  { href: "/pricing", label: "Pricing" },
  { href: "/docs", label: "Docs" },
  { href: "/about", label: "About" },
];

export const metadata: Metadata = {
  title: "n8n integration | FlowLens",
  description:
    "FlowLens keeps a version history of your n8n workflows, diffs them automatically, and explains what changed and why it matters.",
};

export default function IntegrationsPage() {
  return (
    <>
      <Navbar links={navLinks} active="/integrations" pill />
      <main>
        <N8nHero />
        <ImportWays />
        <Notices />
        <CrossPromo />
      </main>
      <Footer />
    </>
  );
}
