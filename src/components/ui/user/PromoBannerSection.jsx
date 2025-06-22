"use client";

import React from "react";
import Link from "next/link";
import { usePromo } from "@/hooks/usePromo";
import { useAuth } from "@/context/AuthContext";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Tag } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const PromoBannerSection = () => {
  const { promo, isLoading: isPromoLoading } = usePromo();
  const { loading: isAuthLoading } = useAuth();

  const isLoading = isPromoLoading || isAuthLoading;

  // Ganti dengan ID promo yang ingin Anda tampilkan sebagai banner.
  const BANNER_PROMO_ID = "2919428a-7221-47a3-a7c8-4a47683997b5";

  // Cari promo berdasarkan ID, jika tidak ada, gunakan promo pertama sebagai fallback.
  const bannerPromo =
    promo?.find((p) => p.id === BANNER_PROMO_ID) || promo?.[0];

  return (
    <div className="py-16 bg-white">
      <div className="container px-4 mx-auto max-w-7xl sm:px-6 lg:px-8">
        <AnimatePresence mode="wait">
          {isLoading ? (
            <motion.div key="skeleton">
              <Skeleton className="w-full h-80 rounded-2xl" />
            </motion.div>
          ) : bannerPromo ? (
            <motion.div
              key="content"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.75 }}
            >
              <div
                className="relative flex flex-col items-center justify-center w-full px-8 py-20 overflow-hidden text-center text-white bg-blue-600 bg-center bg-cover shadow-xl rounded-2xl"
                style={{ backgroundImage: `url(${bannerPromo.imageUrl})` }}
              >
                <div className="absolute inset-0 bg-black/50"></div>

                <div className="relative z-10 flex flex-col items-center">
                  <div className="flex items-center gap-2 px-4 py-1 mb-4 text-sm font-semibold rounded-full bg-white/20 backdrop-blur-sm">
                    <Tag className="w-4 h-4" />
                    <span>Special Offer</span>
                  </div>
                  <h2 className="text-4xl font-bold tracking-tight text-white md:text-5xl drop-shadow-lg">
                    {bannerPromo.title}
                  </h2>
                  <p className="max-w-2xl mt-4 text-lg drop-shadow-md">
                    Don't miss this exclusive opportunity to save on your next
                    adventure. Use the code and enjoy the discount!
                  </p>
                  <div className="flex items-center gap-4 mt-8">
                    <div className="p-3 text-center border-2 border-dashed rounded-lg bg-white/20 border-white/50">
                      <span className="font-mono text-xl font-bold tracking-widest">
                        {bannerPromo.promo_code}
                      </span>
                    </div>
                    <Button
                      asChild
                      size="lg"
                      className="text-blue-600 bg-white hover:bg-gray-100"
                    >
                      <Link href={`/promo/${bannerPromo.id}`}>
                        View Details
                      </Link>
                    </Button>
                  </div>
                </div>
              </div>
            </motion.div>
          ) : null}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default PromoBannerSection;
