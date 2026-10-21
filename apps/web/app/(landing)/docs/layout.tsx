import { Inter, Outfit } from "next/font/google";
import "../demo/demo.css";
import DocsNavbar from "@/components/docs/DocsNavbar";
import DocsSidebar from "@/components/docs/DocsSidebar";
import DocsFooter from "@/components/docs/DocsFooter";

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

export default function DocsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div
      className={`${inter.variable} ${outfit.variable} demo-scope font-sans min-h-screen bg-surface text-text-primary`}
    >
      <DocsNavbar />
      <div className="mx-auto max-w-[1400px] px-6 pb-4 pt-28">
        <div className="grid gap-10 lg:grid-cols-[226px_minmax(0,1fr)] lg:gap-10">
          <DocsSidebar />
          <div className="min-w-0">{children}</div>
        </div>
      </div>
      <DocsFooter />
    </div>
  );
}
