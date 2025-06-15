"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { usePromo } from "@/hooks/usePromo";
import { Skeleton } from "@/components/ui/skeleton"; // For loading state
import { CheckCircle2, Ticket, Frown } from "lucide-react"; // Required icons
import { Button } from "@/components/ui/button"; // Make sure Button is from your UI components

// Helper function for currency formatting
const formatCurrency = (amount) =>
  new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(amount);

const PromoPage = () => {
  const router = useRouter();
  const { promo, isLoading, error } = usePromo(); // Also get isLoading and error

  const handleViewDetail = (id) => {
    // Navigate to the promo detail page
    router.push(`/promo/${id}`);
  };

  // View while data is loading
  if (isLoading) {
    return (
      <div className="bg-gray-50">
        <div className="px-4 py-12 mx-auto max-w-7xl sm:px-6 lg:px-8">
          <Skeleton className="w-1/2 h-10 mx-auto mb-8" />
          <div className="grid grid-cols-1 gap-6 md:grid-cols-3 lg:grid-cols-4">
            {Array.from({ length: 4 }).map((_, index) => (
              <Skeleton key={index} className="h-44 rounded-2xl" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  // View if an error occurs
  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
        <Frown className="w-16 h-16 text-red-500" />
        <h2 className="mt-4 text-2xl font-bold">Failed to Load Promos</h2>
        <p className="mt-2 text-muted-foreground">{error}</p>
      </div>
    );
  }

  return (
    <div className="bg-gray-50">
      <div className="px-4 py-12 mx-auto max-w-7xl sm:px-6 lg:px-8">
        <div className="mb-12 text-center">
          <h1 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
            Save More with Promo Codes
          </h1>
          <p className="mt-4 text-lg text-gray-600">
            Use the promos below to get special discounts!
          </p>
        </div>

        {/* Grid to hold the coupons */}
        <div className="grid grid-cols-1 gap-6 md:grid-cols-3 lg:grid-cols-3">
          {promo.map((item) => {
            // Logic to display the discount (percentage or nominal)
            const discountValue = item.promo_discount_percentage
              ? `${item.promo_discount_percentage}%`
              : formatCurrency(item.promo_discount_price);

            // Assume expiry date is in the `endDate` field, if not, provide a placeholder
            const expiryDate = item.endDate
              ? new Date(item.endDate).toLocaleDateString("en-US", {
                  day: "numeric",
                  month: "long",
                  year: "numeric",
                })
              : "31 Dec 2025";

            return (
              // --- COUPON CARD STARTS HERE ---
              <div
                key={item.id}
                className="relative flex overflow-hidden text-white shadow-lg bg-gradient-to-r from-blue-500 to-blue-600 rounded-2xl"
              >
                {/* Left tear-off effect */}
                <div className="absolute w-6 h-6 -translate-y-1/2 rounded-full top-1/2 -left-3 bg-gray-50"></div>
                {/* Right tear-off effect */}
                <div className="absolute w-6 h-6 -translate-y-1/2 rounded-full top-1/2 -right-3 bg-gray-50"></div>

                {/* Left Side of Coupon (Discount) */}
                <div className="flex flex-col items-center justify-center w-1/3 p-4 border-r-2 border-dashed border-white/30">
                  <Ticket className="w-6 h-6 mb-1 opacity-70" />
                  <p className="text-xl font-bold tracking-tighter lg:text-xl">
                    {discountValue}
                  </p>
                  <p className="text-xs opacity-80">Discount</p>
                </div>

                {/* Right Side of Coupon (Details) */}
                <div className="flex flex-col w-2/3 p-4">
                  <h3 className="text-sm font-bold leading-tight lg:text-base">
                    {item.title || "Special Promo"}
                  </h3>
                  <div className="mt-2 space-y-1 text-xs font-medium lg:text-sm opacity-90">
                    <p className="flex items-center gap-2">
                      <CheckCircle2 className="w-3 h-3 text-green-300" />
                      <span>
                        Min. {formatCurrency(item.minimum_claim_price)}
                      </span>
                    </p>
                    <p className="flex items-center gap-2">
                      <CheckCircle2 className="w-3 h-3 text-green-300" />
                      <span>Valid until {expiryDate}</span>
                    </p>
                    <p className="flex items-center gap-2">
                      <CheckCircle2 className="w-3 h-3 text-green-300" />
                      <span>
                        Max. Discount:{" "}
                        {item.max_discount
                          ? formatCurrency(item.max_discount)
                          : "Unlimited"}
                      </span>
                    </p>
                  </div>
                  <div className="flex-grow"></div>
                  <div className="flex items-center gap-2 mt-2">
                    <div className="flex-grow p-2 text-center border-2 border-dashed rounded-md bg-white/20 border-white/50">
                      <span className="font-mono text-sm tracking-widest">
                        {item.promo_code}
                      </span>
                    </div>
                    <Button
                      onClick={() => handleViewDetail(item.id)}
                      className="text-xs font-bold text-white bg-slate-800 hover:bg-slate-600 shrink-0"
                    >
                      View Details
                    </Button>
                  </div>
                </div>
              </div>
              // --- END OF COUPON CARD ---
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default PromoPage;