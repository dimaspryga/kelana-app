"use client";

import { Inter } from "next/font/google";
import "./globals.css";
import { Toaster } from "sonner";
import Navbar from "@/components/common/navbar";
import { usePathname } from "next/navigation";
import { CartProvider } from "@/context/CartContext"; // <-- Import CartProvider
import { TransactionProvider } from "@/context/TransactionContext";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const disableNavbar = ["/login", "/register"];

export default function RootLayout({ children }) {
  const pathname = usePathname();
  return (
    <html lang="en">
      <body className={`${inter.variable} antialiased`}>
        <CartProvider>
          <TransactionProvider>
          {!disableNavbar.includes(pathname) && <Navbar />}
          {children}
          <Toaster richColors position="top-center" duration={3000} />
          </TransactionProvider>
        </CartProvider>
      </body>
    </html>
  );
}
