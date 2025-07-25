

import { Inter } from "next/font/google";
import "./globals.css";
import { Toaster } from "sonner";
import { AuthProvider } from "@/context/AuthContext";
import { CartProvider } from "@/context/CartContext";
import { cn } from "@/lib/utils";
import { TransactionProvider } from "@/context/TransactionContext";
import { Analytics } from "@vercel/analytics/next"

const fontSans = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});


export const metadata = {
  title: "Kelana",
  description: "Your next adventure starts here.",
  icons: {
    icon: "/assets/kelana-ico.png",
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head />
      <body
        className={cn(
          "min-h-screen bg-background font-inter antialiased",
          fontSans.variable
        )}
      >
        <AuthProvider>
          <CartProvider>
            <TransactionProvider>
              {children}
              <Analytics />
              <Toaster richColors position="top-center" duration={3000} />
            </TransactionProvider>
          </CartProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
