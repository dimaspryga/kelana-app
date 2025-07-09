"use client";

import React from "react";
import { AppSidebar } from "@/components/app-sidebar";
import { SiteHeader } from "@/components/site-header";

export default function AdminLayout({ children }) {
  return (
    <div className="flex min-h-screen bg-white">
      <AppSidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <SiteHeader />
        <main className="flex-1 bg-white">
          {children}
        </main>
      </div>
    </div>
  );
}
