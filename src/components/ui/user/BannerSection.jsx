'use client';

import React, { useRef } from 'react';
import Link from "next/link";
import { useBanner } from "@/hooks/useBanner";
import { useAuth } from "@/context/AuthContext";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
} from "@/components/ui/carousel";
import Autoplay from "embla-carousel-autoplay"; 
import { motion, AnimatePresence } from "framer-motion";

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.2,
    },
  },
};

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: {
      duration: 0.6,
      ease: "easeOut",
    },
  },
};

const BannerSectionSkeleton = () => (
    <div className="py-8 bg-gray-50">
        <div className="px-4 mx-auto max-w-7xl sm:px-6 lg:px-8">
            <Skeleton className="w-full rounded-xl aspect-[21/7]" />
        </div>
    </div>
);

const BannerSection = () => {
  const { banner, isLoading: isBannerLoading } = useBanner();
  const { loading: isAuthLoading } = useAuth();

  const plugin = useRef(Autoplay({ delay: 4000, stopOnInteraction: false }));

  const isLoading = isBannerLoading || isAuthLoading;

  return (
    <div className="py-8 bg-gray-50">
      <div className="px-4 mx-auto max-w-7xl sm:px-6 lg:px-8">
        <AnimatePresence mode="wait">
          {isLoading ? (
            <motion.div
              key="skeleton"
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
            >
              <BannerSectionSkeleton />
            </motion.div>
          ) : (
            <motion.div
              key="content"
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              exit="hidden"
            >
              <Carousel
                opts={{
                  align: "start",
                  loop: true,
                }}
                plugins={[plugin.current]}
                onMouseEnter={plugin.current.stop}
                onMouseLeave={plugin.current.reset}
                className="w-full"
              >
                <CarouselContent className="-ml-4">
                  {(banner || []).map((bannerItem) => (
                    <CarouselItem key={bannerItem.id} className="pl-4 basis-full">
                      <motion.div variants={itemVariants}>
                        <Link href={`/banner/${bannerItem.id}`}>
                          <div className="relative overflow-hidden transition-shadow duration-300 rounded-xl group">
                            <img
                              src={bannerItem.imageUrl}
                              alt={bannerItem.name}
                              className="w-full aspect-[21/7] object-cover" 
                              onError={(e) => { e.currentTarget.onerror = null; e.currentTarget.src = "/assets/error.png"; }}
                            />
                            <div className="absolute inset-0 flex flex-col items-start justify-end p-8 bg-gradient-to-t from-black/60 to-transparent">
                              <h3 className="text-4xl font-bold text-white shadow-lg">
                                {bannerItem.name}
                              </h3>
                            </div>
                          </div>
                        </Link>
                      </motion.div>
                    </CarouselItem>
                  ))}
                </CarouselContent>
              </Carousel>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default BannerSection;
