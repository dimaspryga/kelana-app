'use client';

import React from "react";
import { useRouter } from "next/navigation";
import { usePromo } from "@/hooks/usePromo";
import { Skeleton } from "@/components/ui/skeleton";
import { CheckCircle2, Ticket, Frown } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

const formatCurrency = (amount) => new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", minimumFractionDigits: 0 }).format(amount);

const PromoSection = () => {
  const router = useRouter();
  const { promo, isLoading } = usePromo();

  const displayedPromos = (promo || []).slice(0, 3);

  const handleViewDetail = (id) => {
    router.push(`/promo/${id}`);
  };

  return (
    <div className="py-16 bg-white">
      <div className="px-4 mx-auto max-w-7xl sm:px-6 lg:px-8">
        <div className="mb-12 text-center">
            <h2 className="text-3xl font-bold text-gray-900">Don't Miss Our Special Promos</h2>
            <p className="mt-3 text-lg text-gray-600">Enjoy discounts and other attractive offers!</p>
        </div>
        <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
          {isLoading ? (
            Array.from({ length: 3 }).map((_, index) => (
                <Skeleton key={index} className="h-48 rounded-2xl" />
            ))
          ) : (
            displayedPromos.map((item) => {
              const discountValue = item.promo_discount_percentage
                ? `${item.promo_discount_percentage}%`
                : formatCurrency(item.promo_discount_price);
              
              const expiryDate = item.endDate
                ? new Date(item.endDate).toLocaleDateString("en-US", { day: 'numeric', month: 'long' })
                : "December";

              return (
                <div key={item.id} className="relative flex overflow-hidden transition-all duration-300 bg-white border-2 border-gray-300 border-dashed shadow-lg rounded-2xl hover:shadow-2xl text-slate-800 group">
                    <div className="absolute w-10 h-10 -translate-y-1/2 bg-white border-r-2 border-gray-300 border-dashed rounded-full top-1/2 -left-5"></div>
                    <div className="absolute w-10 h-10 -translate-y-1/2 bg-white border-l-2 border-gray-300 border-dashed rounded-full top-1/2 -right-5"></div>
                    <div className="flex flex-col items-center justify-center p-5 w-[120px] shrink-0 bg-blue-50">
                        <Ticket className="w-8 h-8 mb-1 text-blue-500" />
                        <p className="font-bold tracking-tighter text-blue-600 text-md">{discountValue}</p>
                        <p className="text-xs text-slate-500">Discount</p>
                    </div>
                    <div className="flex flex-col flex-grow p-5">
                        <h3 className="mb-2 text-base font-bold leading-tight text-slate-900">{item.title || "Special Promo"}</h3>
                        <div className="space-y-1.5 text-sm font-medium text-slate-600">
                            <p className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-green-500 shrink-0" /><span>Min. {formatCurrency(item.minimum_claim_price)}</span></p>
                            <p className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-green-500 shrink-0" /><span>Valid until {expiryDate}</span></p>
                        </div>
                        <div className="flex-grow"></div>
                        <Button onClick={() => handleViewDetail(item.id)} size="sm" className="w-full mt-4 bg-blue-600 hover:bg-blue-700">Use Promo</Button>
                    </div>
                </div>
              );
            })
          )}
        </div>
        <div className="mt-12 text-center">
            <Button asChild size="lg" variant="outline">
                <Link href="/promo">View All Promos</Link>
            </Button>
        </div>
      </div>
    </div>
  );
};

export default PromoSection;