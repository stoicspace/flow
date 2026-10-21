import { Inter, Outfit } from "next/font/google";
import "../demo/demo.css";

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

export default function ContactLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div
      className={`${inter.variable} ${outfit.variable} demo-scope font-sans min-h-screen bg-surface text-text-primary`}
    >
      {children}
    </div>
  );
}
