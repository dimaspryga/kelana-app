"use client";

import React from "react";
import { usePathname } from "next/navigation";
import { DashboardSidebar } from "@/components/ui/admin/dashboard-sidebar"; // Komponen sidebar baru
import { DashboardHeader } from "@/components/ui/admin/dashboard-header"; // Komponen header baru

export default function AdminLayout({ children }) {
  // Mengambil path URL saat ini untuk menentukan item sidebar yang aktif
  const pathname = usePathname();

  return (
    <div className="grid min-h-screen w-full md:grid-cols-[220px_1fr] lg:grid-cols-[280px_1fr]">
      {/* Sidebar sekarang menerima path aktif */}
      <DashboardSidebar activePath={pathname} />
      <div className="flex flex-col">
        {/* Header sekarang menerima path aktif untuk breadcrumbs */}
        <DashboardHeader activePath={pathname} />
        <main className="flex flex-col flex-1 gap-4 p-4 lg:gap-6 lg:p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
