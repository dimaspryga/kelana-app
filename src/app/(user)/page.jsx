"use client";

import React from "react";
import { useAuth } from "@/context/AuthContext";
import { motion, AnimatePresence } from "framer-motion";
import { Skeleton } from "@/components/ui/skeleton";
import HeroSection from "@/components/ui/user/HeroSection";
import PromoSection from "@/components/ui/user/PromoSection";
import CategorySection from "@/components/ui/user/CategorySection";
import ActivitySection from "@/components/ui/user/ActivitySection";
import BannerSection from "@/components/ui/user/BannerSection";
import ActivityDiscountSection from "@/components/ui/user/ActivityDiscountSection";
import TestimonialSection from "@/components/ui/user/TestimonialSection";
import SubscribeSection from "@/components/ui/user/SubscribeSection";

// Skeleton Loader for the Home Page
const HomeSkeleton = () => (
  <div className="space-y-16">
    <Skeleton className="w-full h-[80vh]" />
    <div className="container px-4 mx-auto max-w-7xl sm:px-6 lg:px-8">
      <Skeleton className="w-full h-64 rounded-xl" />
    </div>
    <div className="container px-4 mx-auto max-w-7xl sm:px-6 lg:px-8">
      <Skeleton className="w-1/3 h-10 mb-8" />
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="flex flex-col items-center space-y-3">
            <Skeleton className="w-20 h-20 rounded-full" />
            <Skeleton className="w-24 h-5" />
          </div>
        ))}
      </div>
    </div>
    <div className="container px-4 mx-auto max-w-7xl sm:px-6 lg:px-8">
      <Skeleton className="w-1/3 h-10 mb-8" />
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="space-y-3">
            <Skeleton className="w-full h-48 rounded-xl" />
            <Skeleton className="w-5/6 h-6" />
            <Skeleton className="w-3/4 h-5" />
          </div>
        ))}
      </div>
    </div>
  </div>
);

export default function Home() {
  const { loading: isAuthLoading } = useAuth();

  return (
    <AnimatePresence mode="wait">
      {isAuthLoading ? (
        <motion.div key="skeleton" exit={{ opacity: 0 }}>
          <HomeSkeleton />
        </motion.div>
      ) : (
        <motion.main
          key="content"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.75 }}
        >
          <HeroSection />
          <BannerSection />
          <CategorySection />
          <ActivitySection />
          <PromoSection />
          <ActivityDiscountSection />
          <TestimonialSection />
          <SubscribeSection />
        </motion.main>
      )}
    </AnimatePresence>
  );
}
