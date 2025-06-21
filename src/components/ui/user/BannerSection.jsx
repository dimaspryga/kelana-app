"use client";

import React, { useRef } from "react";
import Link from "next/link";
import { useBanner } from "@/hooks/useBanner";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { Button } from "@/components/ui/button";
import Autoplay from "embla-carousel-autoplay"; // 1. Impor plugin autoplay

const BannerSection = () => {
  const { banner, isLoading } = useBanner();

  // 2. Buat referensi untuk plugin autoplay
  const plugin = useRef(Autoplay({ delay: 4000, stopOnInteraction: false }));

  return (
    <div className="py-16 bg-gray-50">
      <div className="px-4 mx-auto max-w-7xl sm:px-6 lg:px-8">
        <Carousel
          opts={{
            align: "start",
            loop: true,
          }}
          // 3. Tambahkan plugin ke carousel
          plugins={[plugin.current]}
          onMouseEnter={plugin.current.stop}
          onMouseLeave={plugin.current.reset}
          className="w-full"
        >
          <CarouselContent className="-ml-4">
            {isLoading ? (
              // Tampilkan satu skeleton jika sedang loading
              <CarouselItem className="pl-4 basis-full">
                <Skeleton className="w-full rounded-xl aspect-[16/7]" />
              </CarouselItem>
            ) : (
              (banner || []).map((banner) => (
                // 4. Ubah `basis` menjadi `basis-full` agar setiap item mengambil lebar penuh
                <CarouselItem key={banner.id} className="pl-4 basis-full">
                  <Link href={`/banner/${banner.id}`}>
                    <div className="relative overflow-hidden transition-shadow duration-300 rounded-xl group">
                      <img
                        src={banner.imageUrl}
                        alt={banner.name}
                        className="w-full aspect-[26/10] object-cover" // Ubah rasio aspek agar lebih lebar
                      />
                      <div className="absolute inset-0 flex flex-col items-start justify-end p-8 bg-gradient-to-t from-black/60 to-transparent">
                        <h3 className="text-4xl font-bold text-white shadow-lg">
                          {banner.name}
                        </h3>
                      </div>
                    </div>
                  </Link>
                </CarouselItem>
              ))
            )}
          </CarouselContent>
          {/* 5. Pindahkan tombol navigasi agar lebih modern */}
          <CarouselPrevious className="absolute text-white -translate-y-1/2 border-none left-4 top-1/2 bg-black/30 hover:bg-black/50" />
          <CarouselNext className="absolute text-white -translate-y-1/2 border-none right-4 top-1/2 bg-black/30 hover:bg-black/50" />
        </Carousel>
      </div>
    </div>
  );
};

export default BannerSection;
