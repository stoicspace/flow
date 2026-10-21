import { Inter, Outfit } from "next/font/google";
import "./demo/demo.css";
import Navbar from "@/components/demo/Navbar";
import Hero from "@/components/demo/Hero";
import ProductMockup from "@/components/demo/ProductMockup";
import ChangeChips from "@/components/demo/ChangeChips";
import ValueStatement from "@/components/demo/ValueStatement";
import Problem from "@/components/demo/Problem";
import HowItWorks from "@/components/demo/HowItWorks";
import BringYourOwnKey from "@/components/demo/BringYourOwnKey";
import Integrations from "@/components/demo/Integrations";
import FAQ from "@/components/demo/FAQ";
import CallCTA from "@/components/demo/CallCTA";
import Footer from "@/components/demo/Footer";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const outfit = Outfit({
  subsets: ["latin"],
  variable: "--font-outfit",
  display: "swap",
});

export default function LandingPage() {
  return (
    <div
      className={`${inter.variable} ${outfit.variable} demo-scope font-sans min-h-screen bg-surface text-text-primary`}
    >
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "SoftwareApplication",
            name: "FlowLens",
            applicationCategory: "DeveloperApplication",
            operatingSystem: "Web",
            description:
              "AI-powered version history and failure explanations for n8n, Zapier, and Make. Bring your own AI key. Your key. Your infrastructure. Your call.",
            offers: {
              "@type": "Offer",
              price: "0",
              priceCurrency: "USD",
            },
          }),
        }}
      />
      <Navbar pill />
      <main>
        <Hero />
        <ProductMockup />
        <ChangeChips />
        <ValueStatement />
        <Problem />
        <HowItWorks />
        <BringYourOwnKey />
        <Integrations />
        <FAQ />
        <CallCTA />
      </main>
      <Footer  />
    </div>
  );
}
