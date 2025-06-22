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
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import Autoplay from "embla-carousel-autoplay"; 
import { motion, AnimatePresence } from "framer-motion";


const BannerSection = () => {
  const { banner, isLoading: isBannerLoading } = useBanner();
  const { loading: isAuthLoading } = useAuth(); //Dapatkan status loading dari AuthContext

  const plugin = useRef(Autoplay({ delay: 4000, stopOnInteraction: false }));

  const isLoading = isBannerLoading || isAuthLoading;

  return (
    <div className="py-8 bg-gray-50">
      <div className="px-4 mx-auto max-w-7xl sm:px-6 lg:px-8">
        <AnimatePresence mode="wait">
          {isLoading ? (
            // 4. Tampilkan skeleton jika sedang loading
            <motion.div key="skeleton">
              <Skeleton className="w-full rounded-xl aspect-[21/9]" />
            </motion.div>
          ) : (
            // 5. Tampilkan konten dengan animasi jika sudah selesai loading
            <motion.div
              key="content"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.75 }}
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
                  {(banner || []).map((banner) => (
                    <CarouselItem key={banner.id} className="pl-4 basis-full">
                      <Link href={`/banner/${banner.id}`}>
                        <div className="relative overflow-hidden transition-shadow duration-300 rounded-xl group">
                          <img
                            src={banner.imageUrl}
                            alt={banner.name}
                            className="w-full aspect-[21/7] object-cover" 
                          />
                          <div className="absolute inset-0 flex flex-col items-start justify-end p-8 bg-gradient-to-t from-black/60 to-transparent">
                            <h3 className="text-4xl font-bold text-white shadow-lg">
                              {banner.name}
                            </h3>
                          </div>
                        </div>
                      </Link>
                    </CarouselItem>
                  ))}
                </CarouselContent>
                <CarouselPrevious className="absolute text-white -translate-y-1/2 border-none left-4 top-1/2 bg-black/30 hover:bg-black/50" />
                <CarouselNext className="absolute text-white -translate-y-1/2 border-none right-4 top-1/2 bg-black/30 hover:bg-black/50" />
              </Carousel>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default BannerSection;
