"use client";

import React from "react";
import { usePathname } from "next/navigation";
import { DashboardSidebar } from "@/components/ui/admin/dashboard-sidebar";
import { DashboardHeader } from "@/components/ui/admin/dashboard-header";

export default function AdminLayout({ children }) {
  const pathname = usePathname();

  return (
    <div className="grid min-h-screen w-full md:grid-cols-[220px_1fr] lg:grid-cols-[280px_1fr]">
      <DashboardSidebar activePath={pathname} />
      <div className="flex flex-col">
        <DashboardHeader activePath={pathname} />
        <main className="flex flex-col flex-1 gap-4 p-4 lg:gap-6 lg:p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
