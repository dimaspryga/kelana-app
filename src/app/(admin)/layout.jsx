"use client";

import React from "react";
import { AppSidebar } from "@/components/ui/admin/app-sidebar";
import { SiteHeader } from "@/components/ui/admin/site-header";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";


// Anda bisa membuat AdminSidebar atau komponen layout admin lainnya di sini

export default function AdminLayout({ children }) {
  return (
    <SidebarProvider
      style={{
        "--sidebar-width": "calc(var(--spacing) * 72)",
        "--header-height": "calc(var(--spacing) * 12)",
      }}
    >
      <AppSidebar variant="inset" />
      <SidebarInset>
        <SiteHeader />
        <div className="flex flex-col flex-1">
          <div className="@container/main flex flex-1 flex-col gap-2">
            <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
              {children}
            </div>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
