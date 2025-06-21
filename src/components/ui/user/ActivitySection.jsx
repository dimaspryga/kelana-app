"use client";

import React, { useState } from "react";
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
import { MapPin, Star, ShoppingCart, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { motion } from "framer-motion";

// Helper function
const formatCurrency = (amount) =>
  new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(amount);

// Variants for Framer Motion
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

// Sub-component for a cleaner structure
const ActivityCard = ({ activityItem, handleAddToCart, addingItemId }) => {
    const hasDiscount = activityItem.price_discount > 0 && activityItem.price_discount < activityItem.price;
    const displayPrice = hasDiscount ? activityItem.price_discount : activityItem.price;

    return (
        <motion.div variants={itemVariants} className="h-full">
            <div className="flex flex-col h-full overflow-hidden transition-all duration-300 bg-white rounded-lg shadow-md group hover:shadow-xl hover:-translate-y-1">
                <Link href={`/activities/${activityItem.id}`} className="block">
                    <div className="relative overflow-hidden">
                        <img
                            src={activityItem.imageUrls[0]}
                            alt={activityItem.title}
                            className="object-cover w-full h-40 transition-transform duration-300 group-hover:scale-105"
                            onError={(e) => {
                                e.currentTarget.onerror = null;
                                e.currentTarget.src = "/assets/error.png";
                            }}
                        />
                    </div>
                </Link>
                <div className="flex flex-col flex-grow p-4">
                    <h3 className="h-10 text-base font-bold leading-tight text-gray-800 truncate line-clamp-2 group-hover:text-blue-600" title={activityItem.title}>
                        {activityItem.title}
                    </h3>
                    <p className="flex items-center gap-1 text-sm text-gray-500">
                        <MapPin className="w-4 h-4" /> {activityItem.city}
                    </p>
                    <div className="flex items-center gap-1 mt-2 text-sm">
                        <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                        <span className="font-bold text-gray-700">{activityItem.rating}</span>
                        <span className="text-gray-500">({activityItem.total_reviews} reviews)</span>
                    </div>

                    <div className="flex items-end justify-between mt-4">
                        <div>
                            {hasDiscount && activityItem.price > 0 && (
                                <p className="text-xs text-red-500 line-through">
                                    {formatCurrency(activityItem.price)}
                                </p>
                            )}
                            <p className="text-lg font-bold text-blue-600">
                                {formatCurrency(displayPrice)}
                            </p>
                        </div>
                        <Button
                            size="icon"
                            variant="outline"
                            className="text-blue-600 transition-colors duration-300 border-blue-200 hover:bg-blue-600 hover:text-white"
                            onClick={(e) => handleAddToCart(e, activityItem)}
                            disabled={addingItemId === activityItem.id}
                        >
                            {addingItemId === activityItem.id ? (
                                <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                                <ShoppingCart className="w-4 h-4" />
                            )}
                        </Button>
                    </div>
                </div>
            </div>
        </motion.div>
    );
};


const ActivitySection = () => {
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

  return (
    <div className="py-16 bg-gray-50">
      <div className="px-4 mx-auto max-w-7xl sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-3xl font-bold text-gray-900">Popular <span className="text-blue-600">Activities </span></h2>
            <p className="mt-2 text-lg text-gray-600">
              Explore a variety of the most sought-after activities.
            </p>
          </div>
          <Button asChild variant="outline" className="hidden sm:flex">
            <Link href="/activities">View All</Link>
          </Button>
        </div>

        <Carousel
          className="w-full"
          opts={{ align: "start", loop: true }}
        >
          <CarouselContent className="-ml-4">
            {isLoading
              ? Array.from({ length: 4 }).map((_, index) => (
                  <CarouselItem key={index} className="pl-4 basis-full sm:basis-1/2 lg:basis-1/4">
                    <div className="space-y-3">
                      <Skeleton className="w-full h-40 rounded-lg" />
                      <Skeleton className="w-5/6 h-6" />
                      <Skeleton className="w-1/2 h-5" />
                      <Skeleton className="w-full h-10 mt-2" />
                    </div>
                  </CarouselItem>
                ))
              : (activity || []).map((activityItem) => (
                  <CarouselItem key={activityItem.id} className="pl-4 basis-full sm:basis-1/2 lg:basis-1/4">
                    <ActivityCard 
                        activityItem={activityItem}
                        handleAddToCart={handleAddToCart}
                        addingItemId={addingItemId}
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

export default ActivitySection;
