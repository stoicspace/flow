import { ThemeProvider } from "@/components/ui/theme-provider/page";

export default function LandingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="bg-surface text-white min-h-screen">
        <ThemeProvider>
              {children}
              </ThemeProvider>
    </div>
  );
}