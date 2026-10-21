import type { Metadata } from "next";
import Navbar from "@/components/demo/Navbar";
import Footer from "@/components/demo/Footer";
import ContactHero from "@/components/contact/ContactHero";
import ContactForm from "@/components/contact/ContactForm";

const navLinks = [
      { href: "/", label: "Product" },
  { href: "/integrations", label: "Integrations" },
  { href: "/pricing", label: "Pricing" },
  { href: "/docs", label: "Docs" },
  { href: "/about", label: "About" },
];

export const metadata: Metadata = {
  title: "Contact | FlowLens",
  description:
    "Questions about how FlowLens handles your workflow data, which AI providers it supports, or whether it fits your setup. Send them over.",
};

export default function ContactPage() {
  return (
    <>
      <Navbar links={navLinks} pill />
      <main className="relative px-6 pt-44 pb-24">
        <div
          aria-hidden="true"
          className="glow-soft pointer-events-none absolute -left-40 -top-48 h-[520px] w-[640px] opacity-70"
        />
        <div className="relative mx-auto grid max-w-[1200px] items-start gap-16 lg:grid-cols-2">
          <ContactHero />
          <ContactForm />
        </div>
      </main>
      <Footer />
    </>
  );
}
