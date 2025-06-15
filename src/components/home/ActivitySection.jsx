"use client";

import React from "react";
import Link from "next/link";
import { useActivity } from "@/hooks/useActivity";
import { useCart } from "@/hooks/useCart";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { MapPin, Star, ShoppingCart, Percent } from "lucide-react";

const formatCurrency = (amount) =>
  new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(amount);

const ActivitySection = () => {
  const { activity, isLoading } = useActivity();
  const { addToCart } = useCart();

  const handleAddToCart = (e, activityId) => {
    e.preventDefault();
    e.stopPropagation();
    addToCart(activityId, 1);
  };

  return (
    <div className="py-16 bg-gray-50">
      <div className="px-4 mx-auto max-w-7xl sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-3xl font-bold text-gray-900">
              Popular Activities
            </h2>
            <p className="mt-2 text-lg text-gray-600">
              Explore a variety of the most sought-after activities.
            </p>
          </div>
          <Button asChild variant="outline" className="hidden sm:flex">
            <Link href="/activity">View All</Link>
          </Button>
        </div>

        <Carousel
          className="w-full"
          opts={{
            align: "start",
            loop: true,
          }}
        >
          <CarouselContent className="-ml-4">
            {isLoading
              ? Array.from({ length: 4 }).map((_, index) => (
                  <CarouselItem
                    key={index}
                    className="pl-4 basis-full sm:basis-1/2 lg:basis-1/4"
                  >
                    <div className="space-y-3">
                      <Skeleton className="w-full h-40 rounded-lg" />
                      <Skeleton className="w-3/4 h-5" />
                      <Skeleton className="w-1/2 h-4" />
                      <Skeleton className="w-1/3 h-5" />
                    </div>
                  </CarouselItem>
                ))
              : (activity || []).map((activity) => {
                  const hasDiscount =
                    activity.price_discount &&
                    activity.price_discount < activity.price;
                  return (
                    <CarouselItem
                      key={activity.id}
                      className="pl-4 basis-full sm:basis-1/2 lg:basis-1/4"
                    >
                      <div className="h-full group">
                        <Link
                          href={`/activities/${activity.id}`}
                          className="block h-full transition-shadow duration-300 bg-white rounded-lg shadow-md hover:shadow-xl"
                        >
                          <div className="flex flex-col h-full">
                            <div className="relative">
                              <img
                                src={activity.imageUrls[0]}
                                alt={activity.title}
                                className="object-cover w-full h-40 rounded-t-lg"
                                onError={(e) => {
                                  e.currentTarget.onerror = null;
                                  e.currentTarget.src = "/assets/error.png";
                                }}
                              />
                              <div className="absolute bottom-2 right-2 bg-red-500 text-white rounded-md px-2 py-0.5 text-xs font-bold">
                                Hot Deals
                              </div>
                            </div>

                            <div className="flex flex-col flex-grow p-4">
                              <h3 className="text-base font-bold leading-tight text-gray-800">
                                {activity.title}
                              </h3>
                              <p className="flex items-center gap-1 mt-1 text-sm text-gray-500">
                                <MapPin className="w-4 h-4" /> {activity.city}
                              </p>
                              <div className="flex items-center gap-1 mt-2 text-sm">
                                <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                                <span className="font-bold text-gray-700">
                                  {activity.rating}
                                </span>
                                <span className="text-gray-500">
                                  ({activity.total_reviews} reviews)
                                </span>
                              </div>

                              {/* Spacer */}
                              <div className="flex-grow"></div>

                              {/* Price */}
                              <div className="mt-4 text-right">
                                {hasDiscount && (
                                  <p className="text-xs text-gray-500 line-through">
                                    {formatCurrency(activity.price)}
                                  </p>
                                )}
                                <p className="text-lg font-bold text-blue-600">
                                  {formatCurrency(
                                    hasDiscount
                                      ? activity.price_discount
                                      : activity.price
                                  )}
                                </p>
                              </div>
                            </div>
                          </div>
                        </Link>
                      </div>
                    </CarouselItem>
                  );
                })}
          </CarouselContent>
          <CarouselPrevious className="hidden sm:flex" />
          <CarouselNext className="hidden sm:flex" />
        </Carousel>
      </div>
    </div>
  );
};

export default ActivitySection;