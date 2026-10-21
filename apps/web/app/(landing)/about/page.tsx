import type { Metadata } from "next";
import Navbar from "@/components/demo/Navbar";
import Footer from "@/components/demo/Footer";
import AboutHero from "@/components/about/AboutHero";
import Origin from "@/components/about/Origin";
import Believe from "@/components/about/Believe";
import Status from "@/components/about/Status";
import GetInTouch from "@/components/about/GetInTouch";

const navLinks = [
      { href: "/", label: "Product" },
  { href: "/integrations", label: "Integrations" },
  { href: "/pricing", label: "Pricing" },
  { href: "/docs", label: "Docs" },
  { href: "/about", label: "About" },
];

export const metadata: Metadata = {
  title: "About",
  description:
    "Why FlowLens exists, what we believe about owning your own AI and your own workflow data, and where things stand today.",
};

export default function AboutPage() {
  return (
    <>
      <Navbar links={navLinks} active="/about" pill />
      <main>
        <AboutHero />
        <Origin />
        <Believe />
        <Status />
        <GetInTouch />
      </main>
      <Footer />
    </>
  );
}
