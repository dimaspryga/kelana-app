"use client"

import { Suspense } from "react"
import { useAuth } from "@/context/AuthContext"
import { motion } from "framer-motion"
import { Skeleton } from "@/components/ui/skeleton"
import dynamic from "next/dynamic"

// Lazy load components for better performance
const HeroSection = dynamic(() => import("@/components/ui/user/HeroSection"), {
  loading: () => <Skeleton className="w-full h-[80vh]" />,
})

const BannerSection = dynamic(() => import("@/components/ui/user/BannerSection"), {
  loading: () => <Skeleton className="w-full h-64" />,
})

const CategorySection = dynamic(() => import("@/components/ui/user/CategorySection"), {
  loading: () => <Skeleton className="w-full h-96" />,
})

const ActivitySection = dynamic(() => import("@/components/ui/user/ActivitySection"), {
  loading: () => <Skeleton className="w-full h-96" />,
})

const PromoSection = dynamic(() => import("@/components/ui/user/PromoSection"), {
  loading: () => <Skeleton className="w-full h-96" />,
})

const ActivityDiscountSection = dynamic(() => import("@/components/ui/user/ActivityDiscountSection"), {
  loading: () => <Skeleton className="w-full h-96" />,
})

const TestimonialSection = dynamic(() => import("@/components/ui/user/TestimonialSection"), {
  loading: () => <Skeleton className="w-full h-96" />,
})

const SubscribeSection = dynamic(() => import("@/components/ui/user/SubscribeSection"), {
  loading: () => <Skeleton className="w-full h-64" />,
})

const LoadingSkeleton = () => (
  <div className="space-y-8">
    <Skeleton className="w-full h-[80vh]" />
    <div className="container px-4 mx-auto space-y-8 max-w-7xl sm:px-6 lg:px-8">
      <Skeleton className="w-full h-64" />
      <Skeleton className="w-full h-96" />
      <Skeleton className="w-full h-96" />
    </div>
  </div>
)

export default function Home() {
  const { loading: isAuthLoading } = useAuth()

  if (isAuthLoading) {
    return <LoadingSkeleton />
  }

  return (
    <motion.main initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3 }}>
      <Suspense fallback={<Skeleton className="w-full h-[80vh]" />}>
        <HeroSection />
      </Suspense>
      
      <Suspense fallback={<Skeleton className="w-full h-16" />}>
        <CategorySection />
      </Suspense>

      <Suspense fallback={<Skeleton className="w-full h-64" />}>
        <BannerSection />
      </Suspense>

      <Suspense fallback={<Skeleton className="w-full h-96" />}>
        <ActivitySection />
      </Suspense>

      <Suspense fallback={<Skeleton className="w-full h-96" />}>
        <ActivityDiscountSection />
      </Suspense>

      <Suspense fallback={<Skeleton className="w-full h-96" />}>
        <PromoSection />
      </Suspense>

      <Suspense fallback={<Skeleton className="w-full h-96" />}>
        <TestimonialSection />
      </Suspense>

      <Suspense fallback={<Skeleton className="w-full h-64" />}>
        <SubscribeSection />
      </Suspense>
    </motion.main>
  )
}
