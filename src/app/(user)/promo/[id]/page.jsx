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
import { Copy, Frown, ChevronRight, Star, MapPin, Sparkles } from "lucide-react";
import { motion } from "framer-motion";
import { toast } from "sonner";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";

const DEFAULT_ACTIVITY_IMAGE = "/assets/banner-authpage.png";

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

const formatCurrency = (amount) =>
  new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(amount);

const DetailPromo = ({ params }) => {
  const resolvedParams = use(params);
  const id = resolvedParams?.id;
  
  const { detailPromo, isLoading: isPromoLoading, error } = useDetailPromo(id);
  const { activity, isLoading: isActivityLoading } = useActivity();
  const { loading: isAuthLoading } = useAuth();

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
      <div className="min-h-screen bg-white">
          <div className="container px-4 py-8 mx-auto max-w-7xl">
            <Skeleton className="w-1/2 h-5 mb-6 rounded-lg" />
            <div className="flex flex-col gap-6 lg:flex-row">
                <div className="w-full space-y-4 lg:w-2/3">
                    <Skeleton className="w-full border border-gray-200 bg-white rounded-lg h-64" />
                    <Skeleton className="w-full border border-gray-200 bg-white rounded-lg h-32" />
                    <Skeleton className="w-full border border-gray-200 bg-white rounded-lg h-20" />
                </div>
                <div className="w-full lg:w-1/3">
                    <div className="sticky top-24">
                        <Skeleton className="w-full border border-gray-200 bg-white rounded-lg h-48" />
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
            <h2 className="mt-4 text-xl font-bold md:text-2xl tracking-tight">Failed to Load Promo</h2>
            <p className="mt-2 text-muted-foreground">{error.message}</p>
        </div>
    );
  }
  if (!id || !detailPromo) {
    return (
      <div className="container px-4 py-6 mx-auto text-center">
        <div className="flex flex-col items-center justify-center min-h-[60vh]">
          <div className="flex items-center justify-center w-24 h-24 mx-auto mb-6 bg-blue-100 rounded-full">
            <svg className="w-12 h-12 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
              />
            </svg>
          </div>
          <h1 className="mb-4 text-2xl font-bold text-gray-900 md:text-3xl tracking-tight">Promo Not Found</h1>
          <p className="text-gray-600">Promo detail not found or ID is invalid.</p>
        </div>
      </div>
    );
  }

  return (
    <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.75 }}
        className="bg-gradient-to-br from-blue-50 via-white to-blue-50"
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
          <div className="w-full lg:w-2/3">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="overflow-hidden border border-blue-100 shadow-2xl bg-white/90 backdrop-blur-sm rounded-3xl"
            >
              <div className="relative w-full h-80 md:h-96">
                <img
                  src={detailPromo.imageUrl}
                  alt={detailPromo.title || "Promo image"}
                  className="object-cover w-full h-full"
                  onError={(e) => {e.currentTarget.onerror = null; e.currentTarget.src = "/assets/error.png";}}
                />
              </div>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="p-8 mt-6 border border-blue-100 shadow-xl bg-white/80 backdrop-blur-sm rounded-3xl"
            >
              <h1 className="mb-6 text-2xl font-bold text-gray-900 md:text-3xl lg:text-4xl tracking-tight">
                {detailPromo.title}
              </h1>
              <div className="prose text-gray-700 max-w-none leading-relaxed">
                <p>{detailPromo.description}</p>
              </div>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="mt-6 border border-blue-100 shadow-xl bg-white/80 backdrop-blur-sm rounded-3xl"
            >
              <div className="border-b border-blue-100">
                <div className="px-8 py-6">
                  <h2 className="text-xl font-bold text-gray-900 md:text-2xl lg:text-3xl tracking-tight">
                    Terms and Conditions
                  </h2>
                </div>
              </div>
              <div className="p-8 prose-sm text-gray-600 max-w-none leading-relaxed">
                <p>{detailPromo.terms_condition}</p>
              </div>
            </motion.div>
          </div>

          <div className="w-full lg:w-1/3">
            <div className="sticky top-24">
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.3 }}
                className="p-8 border border-blue-100 shadow-2xl bg-white/90 backdrop-blur-sm rounded-3xl"
              >
                <h3 className="text-lg font-bold text-gray-900 mb-6 md:text-xl tracking-tight">
                  Use this promo code
                </h3>

                <div className="flex items-center justify-between p-4 border-2 border-dashed border-blue-200 rounded-xl bg-gradient-to-r from-blue-50 to-blue-100">
                  <span className="text-xl font-bold tracking-wider text-blue-600">
                    {detailPromo.promo_code || "PROMOCODE"}
                  </span>
                  <button
                    onClick={handleCopy}
                    className="flex items-center px-3 py-1 text-sm font-semibold text-blue-600 transition-all duration-200 bg-transparent rounded-lg hover:bg-blue-100 hover:shadow-md"
                  >
                    <Copy size={14} className="mr-2" />
                    {copyStatus}
                  </button>
                </div>

                <Button asChild className="w-full py-4 mt-6 text-lg font-bold text-white transition-all duration-300 bg-blue-600 hover:bg-blue-700 shadow-lg hover:shadow-xl rounded-xl">
                    <Link href="/activity">View Activities</Link>
                </Button>
              </motion.div>
            </div>
          </div>
        </div>
      </div>

      {activity && activity.length > 0 && (
        <div className="container px-4 py-8 mx-auto max-w-7xl">
          <h2 className="mb-8 text-xl font-bold text-gray-900 md:text-2xl lg:text-3xl tracking-tight">
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
                            href={`/activity/${rec.id}`}
                            className="block h-full group"
                        >
                            <div className="flex flex-col h-full overflow-hidden transition-all duration-300 border border-blue-100 shadow-lg bg-white/90 backdrop-blur-sm rounded-3xl hover:shadow-2xl hover:border-blue-300 hover:-translate-y-2">
                            <div className="relative w-full h-48 overflow-hidden rounded-t-3xl">
                                <img
                                src={rec.imageUrls?.[0] || DEFAULT_ACTIVITY_IMAGE}
                                alt={rec.title || "Activity"}
                                className="absolute inset-0 object-cover w-full h-full transition-transform duration-500 group-hover:scale-110"
                                onError={(e) => {
                                    e.currentTarget.onerror = null;
                                    e.currentTarget.src = "/assets/error.png";
                                }}
                                />
                                <div className="absolute p-2 transition-opacity duration-300 rounded-full shadow-lg opacity-0 top-3 right-3 bg-white/90 backdrop-blur-sm group-hover:opacity-100">
                                    <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                                </div>
                            </div>
                            <div className="flex flex-col flex-grow p-6">
                                <div className="flex items-center gap-2 mb-3 text-sm">
                                    <div className="flex items-center text-yellow-500">
                                        <Star size={16} className="mr-1 fill-current" />
                                        <span className="font-bold text-gray-800">{rec.rating || "-"}</span>
                                    </div>
                                    <span className="text-gray-500">({rec.total_reviews || "0"} reviews)</span>
                                </div>
                                <h3 className="h-12 mb-3 text-lg font-bold text-gray-900 transition-colors duration-200 line-clamp-2 group-hover:text-blue-600" title={rec.title}>
                                    {rec.title || "Name Not Available"}
                                </h3>
                                <div className="flex items-center mb-4 text-sm text-gray-500">
                                    <MapPin size={16} className="flex-shrink-0 mr-2 text-blue-500" />
                                    <p className="truncate">{rec.city || rec.address || "Location Not Available"}</p>
                                </div>
                                <div className="flex-grow" />
                                <div className="flex items-center justify-between pt-4 border-t border-blue-50">
                                    <p className="text-xl font-bold text-blue-600">
                                        {formatCurrency(rec.price ?? 0)}
                                    </p>
                                    <div className="inline-flex items-center px-3 py-1 text-xs font-semibold text-white bg-blue-600 rounded-full">
                                        <Sparkles className="w-3 h-3 mr-1" />
                                        Activity
                                    </div>
                                </div>
                            </div>
                            </div>
                        </Link>
                    </motion.div>
                    </CarouselItem>
                ))}
                </CarouselContent>
                {activity.length > 3 && (
                <>
                    <CarouselPrevious className="absolute left-[-20px] md:left-[-25px] top-1/2 -translate-y-1/2 z-10 hidden sm:flex border-blue-200 hover:border-blue-300 bg-white/90 backdrop-blur-sm" />
                    <CarouselNext className="absolute right-[-20px] md:right-[-25px] top-1/2 -translate-y-1/2 z-10 hidden sm:flex border-blue-200 hover:border-blue-300 bg-white/90 backdrop-blur-sm" />
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
