// src/app/(dashboard)/layout.tsx
import Sidebar from "@/components/ui/sidebar/page";
import Navbar from "@/components/ui/navbar/page";
import { TitleProvider } from "@/components/providers/Titleproviders";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <TitleProvider>
    <div className="flex h-screen overflow-hidden bg-surface scrollbar">
      <Sidebar />

      <div className="flex flex-1 flex-col overflow-hidden">
        <Navbar />

        <main className="flex-1 overflow-y-auto p-6 md:p-8">
          {children}
        </main>
      </div>
    </div>
    </TitleProvider>
  );
}