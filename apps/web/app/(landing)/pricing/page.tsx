import type { Metadata } from "next";
import Navbar from "@/components/demo/Navbar";
import Footer from "@/components/demo/Footer";
import PricingHero from "@/components/pricing/PricingHero";
import PlanCards from "@/components/pricing/PlanCards";
import ComparePlans from "@/components/pricing/ComparePlans";
import PricingFAQ from "@/components/pricing/PricingFAQ";
import PricingCTA from "@/components/pricing/PricingCTA";

const navLinks = [
      { href: "/", label: "Product" },
  { href: "/integrations", label: "Integrations" },
  { href: "/pricing", label: "Pricing" },
  { href: "/docs", label: "Docs" },
  { href: "/about", label: "About" },
];

export const metadata: Metadata = {
  title: "Pricing",
  description:
    "Start free. Bring your own AI key, so model usage is billed by your provider. FlowLens plans cover version history, diffs and explanations.",
};

export default function PricingPage() {
  return (
    <>
      <Navbar links={navLinks} active="/pricing" pill />
      <main>
        <PricingHero />
        <PlanCards />
        <ComparePlans />
        <PricingFAQ />
        <PricingCTA />
      </main>
      <Footer />
    </>
  );
}
