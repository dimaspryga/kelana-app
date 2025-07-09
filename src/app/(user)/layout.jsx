"use client"
import Navbar from "@/components/layout/navbar"
import Footer from "@/components/layout/footer"

export default function UserLayout({ children }) {
  return (
    <div className="flex flex-col min-h-screen bg-white">
      <Navbar />
      <main className="flex-1 pt-20" role="main">
        {children}
      </main>
      <Footer />
    </div>
  )
}
