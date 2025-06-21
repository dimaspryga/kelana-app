'use client';

import React, { use, useState } from "react";
import Link from "next/link";
import { useDetailPromo } from "@/hooks/useDetailPromo";
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
import { Copy, Frown, ChevronRight } from "lucide-react";
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


const DetailPromo = ({ params }) => {
  const resolvedParams = use(params);
  const id = resolvedParams?.id;
  
  const { detailPromo, isLoading: isPromoLoading, error } = useDetailPromo(id);
  const { activity, isLoading: isActivityLoading } = useActivity();
  const { loading: isAuthLoading } = useAuth(); // Get loading state from AuthContext

  const [copyStatus, setCopyStatus] = useState("Copy");

  const handleCopy = () => {
    if (detailPromo?.promo_code) {
      navigator.clipboard.writeText(detailPromo.promo_code);
      toast.success("Promo code copied!");
      setCopyStatus("Copied!");
      setTimeout(() => setCopyStatus("Copy"), 2000);
    }
  };

  const isLoading = isPromoLoading || isActivityLoading || isAuthLoading;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
          <div className="container px-4 py-8 mx-auto max-w-7xl">
            <Skeleton className="w-1/2 h-6 mb-8" />
            <div className="flex flex-col gap-8 lg:flex-row">
                <div className="w-full space-y-6 lg:w-2/3">
                    <Skeleton className="w-full rounded-lg h-96" />
                    <Skeleton className="w-full h-48 rounded-lg" />
                    <Skeleton className="w-full h-32 rounded-lg" />
                </div>
                <div className="w-full lg:w-1/3">
                    <div className="sticky top-24">
                        <Skeleton className="w-full h-64 rounded-lg" />
                    </div>
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
            <h2 className="mt-4 text-2xl font-bold">Failed to Load Promo</h2>
            <p className="mt-2 text-muted-foreground">{error.message}</p>
        </div>
    );
  }
  if (!id || !detailPromo) {
    return (
      <div className="container px-4 py-6 mx-auto text-center">
        Promo detail not found or ID is invalid.
      </div>
    );
  }

  return (
    <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.75 }}
        className="bg-gray-50"
    >
      <div className="container px-4 py-8 mx-auto max-w-7xl">
        <Breadcrumb className="mb-8">
            <BreadcrumbList>
                <BreadcrumbItem>
                    <BreadcrumbLink asChild><Link href="/">Home</Link></BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator><ChevronRight /></BreadcrumbSeparator>
                <BreadcrumbItem>
                    <BreadcrumbLink asChild><Link href="/promo">Promos</Link></BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator><ChevronRight /></BreadcrumbSeparator>
                <BreadcrumbItem>
                    <BreadcrumbPage>{detailPromo.title}</BreadcrumbPage>
                </BreadcrumbItem>
            </BreadcrumbList>
        </Breadcrumb>
        <div className="flex flex-col gap-8 lg:flex-row">
          {/* Left Column (Main Content) */}
          <div className="w-full lg:w-2/3">
            <div className="overflow-hidden bg-white border border-gray-200 rounded-lg shadow-sm">
              <div className="relative w-full h-80 md:h-96">
                <img
                  src={detailPromo.imageUrl}
                  alt={detailPromo.title || "Promo image"}
                  className="object-cover w-full h-full"
                  onError={(e) => {e.currentTarget.onerror = null; e.currentTarget.src = "/assets/error.png";}}
                />
              </div>
            </div>

            <div className="p-6 mt-6 bg-white border border-gray-200 rounded-lg shadow-sm">
              <h1 className="mb-4 text-3xl font-bold text-gray-900">
                {detailPromo.title}
              </h1>
              <div className="prose text-gray-700 max-w-none">
                <p>{detailPromo.description}</p>
              </div>
            </div>

            <div className="mt-6 bg-white border border-gray-200 rounded-lg shadow-sm">
              <div className="border-b border-gray-200">
                <div className="px-6 py-4">
                  <h2 className="text-xl font-bold text-gray-900">
                    Terms and Conditions
                  </h2>
                </div>
              </div>
              <div className="p-6 prose-sm text-gray-600 max-w-none">
                <p>{detailPromo.terms_condition}</p>
              </div>
            </div>
          </div>

          {/* Right Column (Sticky) */}
          <div className="w-full lg:w-1/3">
            <div className="sticky top-24">
              <div className="p-6 bg-white border border-gray-200 rounded-lg shadow-lg">
                <h3 className="text-lg font-bold text-gray-900">
                  Use this promo code
                </h3>

                <div className="flex items-center justify-between p-3 mt-4 border-2 border-dashed rounded-lg bg-blue-50/50">
                  <span className="text-xl font-bold tracking-wider text-blue-600">
                    {detailPromo.promo_code || "PROMOCODE"}
                  </span>
                  <button
                    onClick={handleCopy}
                    className="flex items-center px-3 py-1 text-sm font-semibold text-blue-600 transition-colors duration-200 bg-transparent rounded-md hover:bg-blue-100"
                  >
                    <Copy size={14} className="mr-2" />
                    {copyStatus}
                  </button>
                </div>

                <Button asChild className="w-full py-3 mt-6 text-lg font-bold text-white transition duration-300 bg-blue-500 rounded-lg shadow-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-opacity-50">
                    <Link href="/activities">View Activities</Link>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* "You Might Also Like" Carousel */}
      {activity && activity.length > 0 && (
        <div className="container px-4 py-8 mx-auto max-w-7xl">
          <h2 className="mb-6 text-2xl font-bold text-gray-800">
            You Might Also Like This
          </h2>
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            <Carousel opts={{ align: "start", loop: true }} className="w-full">
                <CarouselContent className="-ml-2 md:-ml-4">
                {activity.map((rec) => (
                    <CarouselItem
                    key={rec.id}
                    className="pl-2 md:pl-4 basis-full sm:basis-1/2 lg:basis-1/3 xl:basis-1/4"
                    >
                    <motion.div variants={cardVariants}>
                        <Link
                            href={`/activities/${rec.id}`}
                            className="block h-full p-1 transition-transform duration-300 ease-in-out cursor-pointer hover:-translate-y-2"
                        >
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
                                <h3 className="font-semibold text-gray-800 truncate">
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
    </motion.div>
  );
};

export default DetailPromo;
