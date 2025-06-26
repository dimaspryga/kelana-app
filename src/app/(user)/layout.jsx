"use client";

import React from "react";
import Navbar from "@/components/layout/navbar";
import Footer from "@/components/layout/footer";

export default function UserLayout({ children }) {

  return (
    <div>
      <Navbar />
      <main className="pt-20">
        {children}
      </main>
      <Footer />
    </div>
  );
}
