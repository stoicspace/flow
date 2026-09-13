import type { Metadata } from "next";
import { Inter, Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/ui/theme-provider/page";

// Define your font
const geist = Geist({
  subsets: ["latin"],
  variable: "--font-geist",
});



export const metadata: Metadata = {
  title: {
    default: "FlowLens — Debug n8n, Zapier & Make Workflows",
    template: "%s | FlowLens",
  },
  description:
    "FlowLens shows you exactly what changed in your n8n, Zapier, or Make workflow and why it broke — with AI-proposed fixes you review before applying.",
  metadataBase: new URL("https://flowlens-saas.vercel.app"), // ← replace with real domain
  openGraph: {
    title: "FlowLens — Debug n8n, Zapier & Make Workflows",
    description:
      "Find out exactly what changed in your automation and why it failed — before you spend hours reading logs.",
    url: "https://flowlens-saas.vercel.app",
    siteName: "FlowLens",
    images: [{ url: "/og-image.png", width: 1200, height: 630 }],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "FlowLens — Debug n8n, Zapier & Make Workflows",
    description: "Know exactly why your workflow broke.",
    images: ["/og-image.png"],
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={`${geist.variable} font-sans antialiased`}>
        <ThemeProvider>
        {children}
        </ThemeProvider>
      </body>
      
    </html>
  );
}