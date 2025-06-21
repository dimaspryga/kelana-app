'use client';

import { use, useState } from "react";
import Link from "next/link";
import { useDetailBanner } from "@/hooks/useDetailBanner";
import { useActivity } from "@/hooks/useActivity";
import { useAuth } from "@/context/AuthContext";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Frown, ChevronRight } from "lucide-react";
import { motion } from "framer-motion";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";


const DEFAULT_ACTIVITY_IMAGE = "/assets/banner-authpage.png";

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

const DetailBanner = ({ params }) => {
  const resolvedParams = use(params);
  const id = resolvedParams?.id;
  const { detailBanner, isLoading: isBannerLoading, error } = useDetailBanner(id);
  const { activity, isLoading: isActivityLoading } = useActivity();
  const { loading: isAuthLoading } = useAuth();

  const isLoading = isBannerLoading || isActivityLoading || isAuthLoading;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="container px-4 py-8 mx-auto max-w-7xl">
            <Skeleton className="w-1/2 h-6 mb-8" />
            <div className="flex flex-col gap-8 lg:flex-row">
                <div className="w-full space-y-6 lg:w-2/3">
                    <Skeleton className="w-full rounded-lg h-96" />
                    <div className="space-y-4">
                        <Skeleton className="w-3/4 h-10" />
                        <Skeleton className="w-full h-24" />
                    </div>
                </div>
                <div className="w-full lg:w-1/3">
                    <div className="sticky top-24">
                        <Skeleton className="w-full h-48 rounded-lg" />
                    </div>
                </div>
            </div>
            <div className="mt-12">
                <Skeleton className="w-1/3 h-8 mb-6" />
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-64 rounded-lg"/>)}
                </div>
            </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
        <Frown className="w-16 h-16 text-red-500" />
        <h2 className="mt-4 text-2xl font-bold">Failed to Load Banner</h2>
        <p className="mt-2 text-muted-foreground">{error.message}</p>
      </div>
    );
  }

  if (!id || !detailBanner) {
    return (
      <div className="container px-4 py-6 mx-auto text-center">
        Banner detail not found or ID is invalid.
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.75 }}
      className="min-h-screen bg-gray-50"
    >
      <div className="container px-4 py-8 mx-auto max-w-7xl">
        <Breadcrumb className="mb-8">
            <BreadcrumbList>
                <BreadcrumbItem>
                    <BreadcrumbLink asChild><Link href="/">Home</Link></BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator><ChevronRight /></BreadcrumbSeparator>
                <BreadcrumbItem>
                    <BreadcrumbLink asChild><Link href="/banner">Banners</Link></BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator><ChevronRight /></BreadcrumbSeparator>
                <BreadcrumbItem>
                    <BreadcrumbPage>{detailBanner.name}</BreadcrumbPage>
                </BreadcrumbItem>
            </BreadcrumbList>
        </Breadcrumb>
        <div className="flex flex-col gap-8 lg:flex-row">
          <div className="w-full lg:w-2/3">
            <div className="overflow-hidden bg-white border border-gray-200 rounded-lg shadow-sm">
              <div className="relative w-full h-80 md:h-96">
                <img
                  src={detailBanner.imageUrl}
                  alt={detailBanner.name || "Banner image"}
                  onError={(e) => {
                    e.currentTarget.onerror = null;
                    e.currentTarget.src = "/assets/error.png";
                  }}
                  className="object-cover w-full h-full"
                />
              </div>
            </div>

            <div className="p-6 mt-6 bg-white border border-gray-200 rounded-lg shadow-sm">
              <h1 className="mb-2 text-3xl font-bold text-gray-900">
                {detailBanner.name}
              </h1>
              <p className="text-gray-700">
                From breathtaking natural wonders to world-famous attractions,
                explore everything your dream destination has to offer, all in one place.
              </p>
            </div>
          </div>

          <div className="w-full lg:w-1/3">
            <div className="sticky top-24">
              <div className="p-6 text-center bg-white border border-gray-200 rounded-lg shadow-lg">
                <h2 className="mb-4 text-xl font-bold text-gray-800">
                  Ready for an Adventure?
                </h2>
                <p className="text-sm text-gray-600">
                  Check out all the exciting activities available now!
                </p>
                <Button asChild className="w-full py-3 mt-6 text-lg font-bold text-white transition duration-300 bg-blue-500 rounded-lg shadow-md hover:bg-blue-600">
                  <Link href="/activities">View All Activities</Link>
                </Button>
              </div>
            </div>
          </div>
        </div>

        {activity && activity.length > 0 && (
          <div className="mt-12">
            <h2 className="mb-6 text-2xl font-bold text-gray-800">
              Related Activities
            </h2>
            <motion.div variants={containerVariants} initial="hidden" animate="visible">
                <Carousel opts={{ align: "start", loop: activity.length > 3 }} className="w-full">
                <CarouselContent className="-ml-2 md:-ml-4">
                    {activity.map((rec) => (
                    <CarouselItem key={rec.id} className="pl-2 md:pl-4 basis-full sm:basis-1/2 lg:basis-1/3 xl:basis-1/4">
                        <motion.div variants={cardVariants}>
                            <Link href={`/activities/${rec.id}`} className="block h-full group">
                                <div className="flex flex-col h-full overflow-hidden transition-shadow bg-white rounded-lg shadow-md hover:shadow-xl">
                                    <div className="relative w-full h-40">
                                        <img
                                        src={rec.imageUrls?.[0] || DEFAULT_ACTIVITY_IMAGE}
                                        alt={rec.title || "Activity"}
                                        className="absolute inset-0 object-cover w-full h-full"
                                        onError={(e) => {
                                            e.currentTarget.onerror = null;
                                            e.currentTarget.src = "/assets/error.png";
                                        }}
                                        />
                                    </div>
                                    <div className="flex flex-col flex-grow p-4">
                                        <h3 className="font-semibold text-gray-800 truncate group-hover:text-blue-600">
                                            {rec.title || "Name Not Available"}
                                        </h3>
                                    </div>
                                </div>
                            </Link>
                        </motion.div>
                    </CarouselItem>
                    ))}
                </CarouselContent>
                {activity.length > 3 && (
                    <>
                    <CarouselPrevious className="absolute left-[-20px] md:left-[-25px] top-1/2 -translate-y-1/2 z-10 hidden sm:flex" />
                    <CarouselNext className="absolute right-[-20px] md:right-[-25px] top-1/2 -translate-y-1/2 z-10 hidden sm:flex" />
                    </>
                )}
                </Carousel>
            </motion.div>
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default DetailBanner;
