'use client';

import React from 'react';
import Link from "next/link";
import { useCategory } from "@/hooks/useCategory";
import { Skeleton } from "@/components/ui/skeleton";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";
import { Button } from '@/components/ui/button';
import { ArrowRight, Bookmark } from 'lucide-react';

const CategorySection = () => {
  const { category, isLoading } = useCategory();

  return (
    <div className="bg-white">
      <div className="px-4 py-16 mx-auto max-w-7xl sm:px-6 lg:px-8">
        {/* --- FIX: The <Carousel> component now wraps everything --- */}
        <Carousel
          opts={{
            align: "start",
            loop: true,
          }}
          className="w-full"
        >
          {/* Header with title and navigation buttons */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-3xl font-bold text-gray-900">Explore Categories</h2>
              <p className="mt-2 text-lg text-gray-600">Find amazing experiences and activities by category.</p>
            </div>
            <div className="items-center hidden gap-2 sm:flex">
              {/* Navigation buttons are now inside the <Carousel> */}
              <CarouselPrevious className="relative top-0 left-0 right-0 translate-y-0" />
              <CarouselNext className="relative top-0 left-0 right-0 translate-y-0" />
              <Button asChild variant="outline">
                <Link href="/category">View All</Link>
              </Button>
            </div>
          </div>
        
          <CarouselContent className="-ml-4">
            {isLoading ? (
              Array.from({ length: 5 }).map((_, index) => (
                <CarouselItem key={index} className="pl-4 basis-3/4 sm:basis-1/3 lg:basis-1/5">
                  <Skeleton className="w-full h-80 rounded-xl" />
                </CarouselItem>
              ))
            ) : (
              (category || []).map((category) => (
                <CarouselItem key={category.id} className="pl-4 basis-3/4 sm:basis-1/3 lg:basis-1/5">
                  <div className="space-y-3 group">
                    <div className="relative overflow-hidden rounded-xl">
                      <Link href={`/category/${category.id}`}>
                        <img 
                          src={category.imageUrl} 
                          alt={category.name} 
                          className="object-cover w-full transition-transform duration-300 ease-in-out h-80 group-hover:scale-105"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                        <div className="absolute bottom-4 left-4">
                          <h3 className="text-xl font-bold text-white drop-shadow-lg">{category.name}</h3>
                        </div>
                      </Link>
                    </div>
                  </div>
                </CarouselItem>
              ))
            )}
          </CarouselContent>
        </Carousel>
      </div>
    </div>
  );
};

export default CategorySection;