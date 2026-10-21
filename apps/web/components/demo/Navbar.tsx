"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowRight, Menu, X } from "lucide-react";
import Logo from "./Logo";
import ThemeToggle from "@/components/ui/theme-toggle/page";

const links = [
  { href: "#how", label: "How it works" },
  { href: "/integrations", label: "Integrations" },
  { href: "/pricing", label: "Pricing" },
  { href: "/docs", label: "Docs" },
  { href: "/about", label: "About" },
];

interface NavbarProps {
  links?: { href: string; label: string }[];
  active?: string;
  pill?: boolean;
}

export default function Navbar({ links: linkList = links, active, pill }: NavbarProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <header className="fixed inset-x-0 top-4 z-50 px-4 sm:px-6">
      <nav className="mx-auto flex max-w-[1200px] items-center justify-between rounded-2xl border border-border/70 bg-surface/70 px-6 py-3 backdrop-blur-xl">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2.5">
          <Logo size={30} />
          <span className="font-heading text-[22px] font-bold tracking-tight text-text-primary">
            FlowLens
          </span>
        </Link>

        {/* Desktop links */}
        <ul className="hidden items-center gap-8 md:flex">
          {linkList.map((link) => (
            <li key={link.href}>
              <a
                href={link.href}
                className={`text-[15px] transition-colors duration-200 hover:text-text-primary ${
                  active === link.href
                    ? "font-semibold text-text-primary"
                    : "text-text-secondary"
                }`}
              >
                {link.label}
              </a>
            </li>
          ))}
        </ul>

        {/* Desktop actions */}
        <div className="hidden items-center gap-3 md:flex">
          <ThemeToggle />
          <Link
            href="/login"
            className="px-2 py-2 text-[15px] text-text-secondary transition-colors duration-200 hover:text-text-primary"
          >
            Sign in
          </Link>
          <Link
            href="/signup"
            className={`shadow-btn inline-flex items-center gap-2 ${
              pill ? "rounded-full" : "rounded-xl"
            } bg-btn-primary-bg px-5 py-2.5 text-[15px] font-semibold text-btn-primary-text transition-opacity duration-200 hover:opacity-90`}
          >
            Start free
            <ArrowRight size={16} />
          </Link>
        </div>

        {/* Mobile controls */}
        <div className="flex items-center gap-3 md:hidden">
          <ThemeToggle />
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="flex h-10 w-10 items-center justify-center rounded-xl border border-border text-text-primary"
            aria-label="Toggle menu"
            aria-expanded={isOpen}
          >
            {isOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>

        {/* Mobile menu */}
        <div
          className={`absolute inset-x-0 top-full overflow-hidden transition-all duration-300 md:hidden ${
            isOpen ? "mt-2 max-h-96" : "max-h-0"
          }`}
        >
          <div className="rounded-2xl border border-border-strong/60 bg-surface/95 p-6 backdrop-blur-xl shadow-card">
            <ul className="flex flex-col gap-4">
              {linkList.map((link) => (
                <li key={link.href}>
                  <a
                    href={link.href}
                    onClick={() => setIsOpen(false)}
                    className={`block text-[15px] transition-colors duration-200 hover:text-text-primary ${
                      active === link.href
                        ? "font-semibold text-text-primary"
                        : "text-text-secondary"
                    }`}
                  >
                    {link.label}
                  </a>
                </li>
              ))}
              <li>
                <Link
                  href="/login"
                  onClick={() => setIsOpen(false)}
                  className="block text-[15px] text-text-secondary transition-colors duration-200 hover:text-text-primary"
                >
                  Sign in
                </Link>
              </li>
            </ul>
            <Link
              href="/signup"
              onClick={() => setIsOpen(false)}
              className={`shadow-btn mt-6 flex items-center justify-center gap-2 bg-btn-primary-bg px-5 py-3 text-[15px] font-semibold text-btn-primary-text ${pill ? "rounded-full" : "rounded-xl"}`}
            >
              Start free
              <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      </nav>
    </header>
  );
}
