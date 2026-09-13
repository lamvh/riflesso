import type { Metadata } from "next";
import { connection } from "next/server";

import { AdminChrome } from "@/components/dashboard/admin-chrome";
import { AdminProvider } from "@/components/dashboard/admin-store";
import { DashboardHeader } from "@/components/dashboard/dashboard-header";
import { DashboardSidebar } from "@/components/dashboard/dashboard-sidebar";
import { loadDashboardContent } from "@/lib/content/load-dashboard-content";

export const metadata: Metadata = {
  title: "Content admin — Riflesso Studio",
  description: "Content dashboard for the Riflesso site.",
  robots: { index: false, follow: false },
};

/**
 * One provider for the whole dashboard, mounted above the router outlet, so the
 * working draft survives navigation between screens. Content is read fresh on
 * every request — drafts included — never from the public cache.
 */
export default async function DashboardLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  await connection();
  const initial = await loadDashboardContent();

  return (
    <AdminProvider initial={initial}>
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
