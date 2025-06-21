"use client";

import React, { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { usePromo } from "@/hooks/usePromo";
import { useAuth } from "@/context/AuthContext";
import { Skeleton } from "@/components/ui/skeleton";
import { CheckCircle2, Ticket, Frown, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { motion } from "framer-motion";
import PromoBannerSection from "@/components/ui/user/PromoBannerSection";
import ActivitySection from "@/components/ui/user/ActivitySection";

// Helper function for currency formatting
const formatCurrency = (amount) =>
  new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(amount);

// Variants for Framer Motion animations
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const cardVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: {
      duration: 0.5,
      ease: "easeOut",
    },
  },
};

const PromoPage = () => {
  const router = useRouter();
  const { promo, isLoading: isPromoLoading, error } = usePromo();
  const { loading: isAuthLoading } = useAuth();

  const [searchQuery, setSearchQuery] = useState("");

  const handleViewDetail = (id) => {
    router.push(`/promo/${id}`);
  };
  
  // Filter promos based on the search query
  const filteredPromos = useMemo(() => {
    if (!promo) return [];
    if (!searchQuery) return promo;
    return promo.filter(p =>
      p.title.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [promo, searchQuery]);

  const isLoading = isPromoLoading || isAuthLoading;

  if (isLoading) {
    return (
      <div className="bg-gray-50">
        <Skeleton className="w-full h-[400px]" />
        <div className="px-4 py-12 mx-auto max-w-7xl sm:px-6 lg:px-8">
          <Skeleton className="w-1/2 h-10 mx-auto mb-4" />
          <Skeleton className="w-2/3 h-8 mx-auto mb-12" />
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, index) => (
              <Skeleton key={index} className="h-44 rounded-2xl" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
        <Frown className="w-16 h-16 text-red-500" />
        <h2 className="mt-4 text-2xl font-bold">Failed to Load Promos</h2>
        <p className="mt-2 text-muted-foreground">{error.message}</p>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.75 }}
    >
      <PromoBannerSection />
      <div className="bg-gray-50">
        <div className="px-4 py-12 mx-auto max-w-7xl sm:px-6 lg:px-8">
          <div className="mb-12 text-center">
            <h1 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
              Save More with Promo Codes
            </h1>
            <p className="mt-4 text-lg text-gray-600">
              Use the promos below to get special discounts!
            </p>
          </div>

          {/* Search Bar */}
          <div className="relative w-full max-w-lg mx-auto mb-12">
            <Search className="absolute text-gray-400 -translate-y-1/2 left-4 top-1/2" />
            <Input 
                type="text"
                placeholder="Search for a promo by title..."
                className="w-full py-6 pl-12 pr-4 text-base border-gray-200 rounded-full shadow-sm focus-visible:ring-blue-500"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          {filteredPromos.length === 0 ? (
            <div className="py-16 text-center">
                <p className="text-xl text-gray-600">
                    {searchQuery ? `No promos found for "${searchQuery}".` : "No promos available at the moment."}
                </p>
            </div>
          ) : (
            <motion.div
                className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3"
                variants={containerVariants}
                initial="hidden"
                animate="visible"
            >
                {filteredPromos.map((item) => {
                const discountValue = item.promo_discount_percentage
                    ? `${item.promo_discount_percentage}%`
                    : formatCurrency(item.promo_discount_price);

                const expiryDate = item.endDate
                    ? new Date(item.endDate).toLocaleDateString("en-US", {
                        day: "numeric",
                        month: "long",
                        year: "numeric",
                    })
                    : "31 Dec 2025";

                return (
                    <motion.div variants={cardVariants} key={item.id} className="h-full">
                    <div className="relative flex flex-col h-full overflow-hidden text-white transition-transform duration-300 transform shadow-lg bg-gradient-to-r from-blue-500 to-blue-600 rounded-2xl hover:-translate-y-1">
                        <div className="flex w-full">
                        <div className="absolute w-6 h-6 -translate-y-1/2 rounded-full top-1/2 -left-3 bg-gray-50"></div>
                        <div className="absolute w-6 h-6 -translate-y-1/2 rounded-full top-1/2 -right-3 bg-gray-50"></div>
                        <div className="flex flex-col items-center justify-center w-1/3 p-4 border-r-2 border-dashed border-white/30">
                            <Ticket className="w-6 h-6 mb-1 opacity-70" />
                            <p className="text-xl font-bold tracking-tighter lg:text-xl">
                            {discountValue}
                            </p>
                            <p className="text-xs opacity-80">Discount</p>
                        </div>
                        <div className="flex flex-col w-2/3 p-4">
                            <h3 className="h-10 text-sm font-bold leading-tight lg:text-base line-clamp-2">
                            {item.title || "Special Promo"}
                            </h3>
                            <div className="mt-2 space-y-1 text-xs font-medium lg:text-sm opacity-90">
                            <p className="flex items-center gap-2">
                                <CheckCircle2 className="w-3 h-3 text-green-300" />
                                <span>
                                Min. {formatCurrency(item.minimum_claim_price)}
                                </span>
                            </p>
                            <p className="flex items-center gap-2">
                                <CheckCircle2 className="w-3 h-3 text-green-300" />
                                <span>Valid until {expiryDate}</span>
                            </p>
                            <p className="flex items-center gap-2">
                                <CheckCircle2 className="w-3 h-3 text-green-300" />
                                <span>
                                Max. Discount:{" "}
                                {item.max_discount
                                    ? formatCurrency(item.max_discount)
                                    : "Unlimited"}
                                </span>
                            </p>
                            </div>
                        </div>
                        </div>
                        <div className="flex-grow"></div>
                        <div className="flex items-center gap-2 p-4 pt-0 mt-auto">
                        <div className="flex-grow p-2 text-center border-2 border-dashed rounded-md bg-white/20 border-white/50">
                            <span className="font-mono text-sm tracking-widest">
                            {item.promo_code}
                            </span>
                        </div>
                        <Button
                            onClick={() => handleViewDetail(item.id)}
                            className="text-xs font-bold text-white bg-slate-800 hover:bg-slate-600 shrink-0"
                        >
                            View Details
                        </Button>
                        </div>
                    </div>
                    </motion.div>
                );
                })}
            </motion.div>
          )}
        </div>
      </div>
      <ActivitySection />
    </motion.div>
  );
};

export default PromoPage;
