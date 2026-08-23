import type { Metadata } from "next";

import { AdminChrome } from "@/components/dashboard/admin-chrome";
import { AdminProvider } from "@/components/dashboard/admin-store";
import { DashboardHeader } from "@/components/dashboard/dashboard-header";
import { DashboardSidebar } from "@/components/dashboard/dashboard-sidebar";

export const metadata: Metadata = {
  title: "Content admin — Riflesso Studio",
  description: "Content dashboard for the Riflesso site.",
  robots: { index: false, follow: false },
};

/**
 * One provider for the whole dashboard, mounted above the router outlet, so the
 * working draft survives navigation between screens.
 */
export default function DashboardLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <AdminProvider>
      <div className="flex min-h-svh bg-paper">
        <DashboardSidebar />
        <main className="ml-[236px] min-w-[1100px] flex-1">
          <DashboardHeader />
          {children}
        </main>
      </div>
      <AdminChrome />
    </AdminProvider>
  );
}
