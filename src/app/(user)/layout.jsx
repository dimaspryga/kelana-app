"use client";

import React from "react";
import Navbar from "@/components/layout/navbar"; // Pastikan path ini benar
import Footer from "@/components/layout/footer"; // Pastikan path ini benar

export default function UserLayout({ children }) {
  // Layout ini sekarang secara otomatis hanya berlaku untuk halaman di dalam grup (user).
  // Tidak perlu lagi memeriksa pathname untuk menampilkan/menyembunyikan navbar atau footer.
  return (
    <div>
      <Navbar />
      {/* Padding top ditambahkan di sini untuk memberi ruang bagi navbar yang fixed */}
      <main className="pt-20">
        {children}
      </main>
      <Footer />
    </div>
  );
}
