'use client';

import React from 'react';
import Link from "next/link";
import { useBanner } from "@/hooks/useBanner";
import { Skeleton } from "@/components/ui/skeleton";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";
import { ArrowRight } from "lucide-react";

const BannerSection = () => {
  const { banner, isLoading } = useBanner();

  return (
    <div className="py-16 bg-gray-50">
      <div className="px-4 mx-auto max-w-7xl sm:px-6 lg:px-8">
        <Carousel
          opts={{
            align: "start",
            loop: true,
          }}
          className="w-full"
        >
          {/* Section Header */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-3xl font-bold text-gray-900">Exclusive Offers</h2>
              <p className="mt-2 text-lg text-gray-600">Take this opportunity, don't miss out! 🔥</p>
            </div>
            <div className="items-center hidden gap-4 sm:flex">
              <div className="flex items-center gap-2">
                <CarouselPrevious className="relative top-0 left-0 right-0 translate-y-0" />
                <CarouselNext className="relative top-0 left-0 right-0 translate-y-0" />
              </div>
              {/* See All button with text style */}
              <Link href="/banner" className="flex items-center gap-1 text-sm font-semibold text-blue-600 transition-colors hover:text-blue-800">
                See All
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        
          <CarouselContent className="-ml-4">
            {isLoading ? (
              Array.from({ length: 3 }).map((_, index) => (
                <CarouselItem key={index} className="pl-4 basis-4/5 sm:basis-1/2 lg:basis-1/3">
                  <Skeleton className="w-full aspect-[4/3] rounded-xl" />
                </CarouselItem>
              ))
            ) : (
              (banner|| []).map((banner) => (
                <CarouselItem key={banner.id} className="pl-4 basis-4/5 sm:basis-1/2 lg:basis-1/3">
                  <Link href={`/banner/${banner.id}`} className="block group">
                    <div className="overflow-hidden transition-shadow duration-300 shadow-md rounded-xl hover:shadow-xl">
                      <img 
                        src={banner.imageUrl} 
                        alt={banner.name}
                        className="w-full aspect-[4/3] object-cover transition-transform duration-300 group-hover:scale-105"
                      />
                    </div>
                  </Link>
                </CarouselItem>
              ))
            )}
          </CarouselContent>
        </Carousel>
      </div>
    </div>
  );
};

export default BannerSection;