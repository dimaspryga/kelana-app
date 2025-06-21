"use client";

import { Inter } from "next/font/google";
import "./globals.css";
import { Toaster } from "sonner";
import Navbar from "@/components/layout/navbar";
import { usePathname } from "next/navigation";
import { AuthProvider } from "@/context/AuthContext";
import { CartProvider } from "@/context/CartContext";
import { TransactionProvider } from "@/context/TransactionContext";
import Footer from "@/components/layout/footer";
import { cn } from "@/lib/utils";

const fontSans = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const disableNavbar = ["/login", "/register", "/dashboard"];
const disableFooter = ["/login", "/register", "/dashboard"];

export default function RootLayout({ children }) {
  const pathname = usePathname();
  return (
    <html lang="en" suppressHydrationWarning>
      <head />
      <body
        className={cn(
          "min-h-screen bg-background font-sans antialiased",
          fontSans.variable
        )}
      >
        <AuthProvider>
          <CartProvider>
            <TransactionProvider>
              {!disableNavbar.includes(pathname) && <Navbar />}

              <main className={!disableNavbar.includes(pathname) ? "pt-20" : ""}>
                {children}
              </main>

              {!disableFooter.includes(pathname) && <Footer />}
              <Toaster richColors position="top-center" duration={3000} />
            </TransactionProvider>
          </CartProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
