"use client";

import React from "react";
import Link from "next/link";
import { useCategory } from "@/hooks/useCategory";
import { useAuth } from "@/context/AuthContext";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

// Variants for Framer Motion animations
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.08 },
  },
};

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: { y: 0, opacity: 1 },
};

const CategorySection = ({ className }) => {
  const { category, isLoading: isCategoryLoading } = useCategory();
  const { loading: isAuthLoading } = useAuth();

  const isLoading = isCategoryLoading || isAuthLoading;

  return (
    <div className={cn("bg-white", className)}>
      <div className="px-4 py-16 mx-auto max-w-7xl sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-3xl font-bold text-gray-900">
              Explore <span className="text-blue-600">Categories</span>
            </h2>
            <p className="mt-2 text-lg text-gray-600">
              Find amazing experiences and activities by category.
            </p>
          </div>
          <Button asChild variant="outline" className="hidden sm:flex">
            <Link href="/category">View All</Link>
          </Button>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-2 gap-4 mt-10 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
            {Array.from({ length: 6 }).map((_, index) => (
              <div key={index} className="space-y-3">
                <Skeleton className="w-full h-56 rounded-xl" />
              </div>
            ))}
          </div>
        ) : (
          <Carousel
            opts={{ align: "start", loop: category.length > 6 }}
            className="w-full"
          >
            <motion.div
              variants={containerVariants}
              initial="hidden"
              animate="visible"
            >
              <CarouselContent className="-ml-4">
                {(category || []).map((cat) => (
                  <CarouselItem
                    key={cat.id}
                    className="pl-4 basis-1/2 sm:basis-1/3 md:basis-1/4 lg:basis-1/6"
                  >
                    <motion.div variants={itemVariants}>
                      <Link
                        href={`/category/${cat.id}`}
                        className="block group"
                      >
                        <div className="space-y-3">
                          <div className="relative overflow-hidden shadow-md rounded-xl">
                            <img
                              src={cat.imageUrl}
                              alt={cat.name}
                              className="object-cover w-full h-56 transition-transform duration-300 ease-in-out group-hover:scale-105"
                              onError={(e) => {
                                e.currentTarget.onerror = null;
                                e.currentTarget.src = "/assets/error.png";
                              }}
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                            <div className="absolute bottom-4 left-4">
                              <h3 className="text-xl font-bold text-white drop-shadow-lg">
                                {cat.name}
                              </h3>
                            </div>
                          </div>
                        </div>
                      </Link>
                    </motion.div>
                  </CarouselItem>
                ))}
              </CarouselContent>
            </motion.div>
            <CarouselPrevious className="hidden sm:flex" />
            <CarouselNext className="hidden sm:flex" />
          </Carousel>
        )}
      </div>
    </div>
  );
};

export default CategorySection;
