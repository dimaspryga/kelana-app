"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { useActivity } from "@/hooks/useActivity";
import { useCart } from "@/hooks/useCart";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { MapPin, Star, ShoppingCart, Loader2, Percent } from "lucide-react";
import { toast } from "sonner";
import { motion } from "framer-motion";

// Helper function to format currency
const formatCurrency = (amount) =>
  new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(amount);

// Animation variants for Framer Motion
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

// Sub-component for a cleaner, more modern card design
const ActivityCard = ({ activityItem, onAddToCart, isAdding }) => {
  return (
    <motion.div variants={itemVariants} className="h-full">
      <div className="flex flex-col h-full overflow-hidden transition-all duration-300 bg-white rounded-lg shadow-md group hover:shadow-xl hover:-translate-y-1">
        <Link href={`/activity/${activityItem.id}`} className="block">
          <div className="relative overflow-hidden">
            <img
              src={activityItem.imageUrls?.[0] || '/assets/error.png'}
              alt={activityItem.title}
              className="object-cover w-full h-40 transition-transform duration-300 group-hover:scale-105"
              onError={(e) => {
                e.currentTarget.onerror = null;
                e.currentTarget.src = "/assets/error.png";
              }}
            />
            <div className="absolute flex items-center gap-1 px-2 py-0.5 text-xs font-bold text-white bg-red-500 rounded-md top-2 left-2">
              <Percent size={12} />
              <span>HOT</span>
            </div>
          </div>
          <div className="flex flex-col flex-grow p-4">
            <h3
              className="h-12 text-base font-bold leading-tight text-gray-800 line-clamp-2 group-hover:text-blue-600"
              title={activityItem.title}
            >
              {activityItem.title}
            </h3>
            <p className="flex items-center gap-1 mt-1 text-sm text-gray-500">
              <MapPin className="w-4 h-4" /> {activityItem.city}
            </p>
            <div className="flex items-center gap-1 mt-2 text-sm">
              <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
              <span className="font-bold text-gray-700">
                {activityItem.rating}
              </span>
              <span className="text-gray-500">
                ({activityItem.total_reviews} reviews)
              </span>
            </div>
            {/* Spacer to push price to the bottom */}
            <div className="flex-grow"></div>
            <div className="flex items-end justify-between mt-4">
              <div>
                <p className="text-xs text-red-500 line-through">
                  {formatCurrency(activityItem.price)}
                </p>
                <p className="text-lg font-bold text-blue-600">
                  {formatCurrency(activityItem.price_discount)}
                </p>
              </div>
              <Button
                size="icon"
                variant="outline"
                className="text-blue-600 transition-colors duration-300 border-blue-200 hover:bg-blue-600 hover:text-white"
                onClick={(e) => onAddToCart(e, activityItem)}
                disabled={isAdding}
              >
                {isAdding ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <ShoppingCart className="w-4 h-4" />
                )}
              </Button>
            </div>
          </div>
        </Link>
      </div>
    </motion.div>
  );
};

const ActivityDiscountSection = () => {
  const { activity, isLoading: isActivityLoading } = useActivity();
  const { addToCart } = useCart();
  const { user, loading: isAuthLoading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  const [addingItemId, setAddingItemId] = useState(null);

  const handleAddToCart = async (e, activity) => {
    e.preventDefault();
    e.stopPropagation();

    if (!user) {
      toast.info("Please log in to add items to the cart.");
      router.push(`/login?redirect=${pathname}`);
      return;
    }

    setAddingItemId(activity.id);
    try {
      await addToCart(activity.id, 1);
      toast.success(`"${activity.title}" has been added to your cart!`);
    } catch (err) {
      toast.error(err.message || "Failed to add item to cart.");
    } finally {
      setAddingItemId(null);
    }
  };

  const isLoading = isActivityLoading || isAuthLoading;

  const discountedActivities = useMemo(() => {
    if (!activity) return [];
    return activity.filter(
      (item) => item.price_discount > 0 && item.price_discount < item.price
    );
  }, [activity]);

  if (isLoading) {
    return (
      <div className="py-16 bg-gray-50">
        <div className="px-4 mx-auto max-w-7xl sm:px-6 lg:px-8">
          <Skeleton className="w-1/3 h-10 mb-2" />
          <Skeleton className="w-1/2 h-8 mb-8" />
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {Array.from({ length: 4 }).map((_, index) => (
              <div key={index} className="space-y-3">
                <Skeleton className="w-full h-40 rounded-lg" />
                <Skeleton className="w-5/6 h-6" />
                <Skeleton className="w-3/4 h-5" />
                <div className="flex justify-between">
                    <Skeleton className="w-1/3 h-8" />
                    <Skeleton className="w-10 h-10" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (discountedActivities.length === 0) {
    return null;
  }

  return (
    <div className="py-16 bg-gray-50">
      <div className="px-4 mx-auto max-w-7xl sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-3xl font-bold">
              <span className="text-red-500">Hot Deals</span> &{" "}
              <span className="text-blue-500">Discounts</span>
            </h2>
            <p className="mt-2 text-lg text-gray-600">
              Special prices for your next great adventure!
            </p>
          </div>
        </div>

        <Carousel
          className="w-full"
          opts={{ align: "start", loop: discountedActivities.length > 4 }}
        >
          <CarouselContent className="-ml-4">
            {discountedActivities.map((activityItem) => (
              <CarouselItem
                key={activityItem.id}
                className="pl-4 basis-full sm:basis-1/2 md:basis-1/3 lg:basis-1/4"
              >
                <ActivityCard
                  activityItem={activityItem}
                  onAddToCart={handleAddToCart}
                  isAdding={addingItemId === activityItem.id}
                />
              </CarouselItem>
            ))}
          </CarouselContent>
          <CarouselPrevious className="hidden sm:flex" />
          <CarouselNext className="hidden sm:flex" />
        </Carousel>
      </div>
    </div>
  );
};

export default ActivityDiscountSection;
