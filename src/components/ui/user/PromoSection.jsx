"use client"

import React, { useCallback, useRef } from "react"
import { useRouter } from "next/navigation"
import { usePromo } from "@/hooks/usePromo"
import { CheckCircle2, Gift, Percent, Calendar, ArrowRight, Sparkles, Copy } from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { motion } from "framer-motion"
import { Carousel, CarouselContent, CarouselItem, CarouselPrevious, CarouselNext } from "@/components/ui/carousel"
import Autoplay from "embla-carousel-autoplay"
import { Badge } from "@/components/ui/badge"
import { toast } from "sonner"

const formatCurrency = (amount) =>
  new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(amount)

const PromoCard = React.memo(({ promoItem, index, onViewDetail }) => {
  if (!promoItem) return null

  const discountValue = promoItem.promo_discount_percentage
    ? `${promoItem.promo_discount_percentage}%`
    : formatCurrency(promoItem.promo_discount_price)

  const expiryDate = promoItem.endDate
    ? new Date(promoItem.endDate).toLocaleDateString("en-US", { day: "numeric", month: "long" })
    : "December"

  const isExpired = promoItem.endDate && new Date(promoItem.endDate) < new Date()

  const handleCopyCode = (e) => {
    e.preventDefault()
    e.stopPropagation()
    navigator.clipboard.writeText(promoItem.promo_code)
    toast.success("Promo code copied to clipboard!")
  }

  return (
    <motion.article
      whileHover={{ y: -4, scale: 1.01 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
      className={`relative overflow-hidden transition-all duration-300 border border-gray-200 bg-white rounded-2xl group h-full ${
        isExpired ? "opacity-60" : "hover:border-blue-300"
      }`}
    >
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-gradient-to-br from-gray-50 via-white to-gray-50" />

      {/* Decorative Elements */}
      <div className="absolute top-0 right-0 w-32 h-32 translate-x-16 -translate-y-16 rounded-full opacity-30 bg-gradient-to-br from-blue-100 to-blue-200" />
      <div className="absolute bottom-0 left-0 w-24 h-24 -translate-x-12 translate-y-12 rounded-full opacity-30 bg-gradient-to-tr from-blue-100 to-blue-200" />

      {isExpired && (
        <div className="absolute z-10 px-3 py-1 text-xs font-bold text-white bg-red-500 rounded-full top-4 right-4">
          EXPIRED
        </div>
      )}

      <div className="relative p-4 sm:p-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 sm:mb-6">
          <div className="flex items-center gap-3 mb-3 sm:mb-0">
            <div className="flex items-center justify-center w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-blue-600 to-blue-700 rounded-xl">
              <Gift className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
            </div>
            <div>
              <p className="text-xs sm:text-sm font-medium text-gray-600">Special Offer</p>
              <p className="text-xs text-gray-500">Limited Time</p>
            </div>
          </div>
          <div className="text-left sm:text-right">
            <div className={`text-2xl sm:text-3xl font-bold ${isExpired ? "text-gray-400" : "text-blue-600"}`}>{discountValue}</div>
            <p className="text-xs text-gray-500">Discount</p>
          </div>
        </div>

        {/* Title */}
        <h3 className={`text-base sm:text-lg font-bold mb-3 sm:mb-4 line-clamp-2 ${isExpired ? "text-gray-500" : "text-gray-900"}`}>
          {promoItem.title || "Special Promo"}
        </h3>

        {/* Details */}
        <div className="mb-4 sm:mb-6 space-y-2 sm:space-y-3">
          <div className="flex items-center text-xs sm:text-sm text-gray-600">
            <CheckCircle2 className="flex-shrink-0 w-3 h-3 sm:w-4 sm:h-4 mr-2 sm:mr-3 text-green-500" />
            <span>Min. purchase {formatCurrency(promoItem.minimum_claim_price)}</span>
          </div>
          <div className="flex items-center text-xs sm:text-sm text-gray-600">
            <Calendar className="flex-shrink-0 w-3 h-3 sm:w-4 sm:h-4 mr-2 sm:mr-3 text-blue-500" />
            <span>Valid until {expiryDate}</span>
          </div>
        </div>

        {/* Promo Code */}
        <div className="mb-4 sm:mb-6">
          <div
            className={`p-3 sm:p-4 border border-dashed rounded-xl ${
              isExpired ? "border-gray-200 bg-gray-50" : "border-blue-200 bg-blue-50"
            }`}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="mb-1 text-xs text-gray-500">Promo Code</p>
                <p className={`font-mono font-bold text-sm sm:text-lg ${isExpired ? "text-gray-500" : "text-blue-800"}`}>
                  {promoItem.promo_code}
                </p>
              </div>
              <Button
                size="sm"
                variant="ghost"
                onClick={handleCopyCode}
                disabled={isExpired}
                className={`${
                  isExpired ? "text-gray-400" : "text-blue-600 hover:text-blue-700 hover:bg-blue-100"
                } rounded-xl`}
              >
                <Copy className="w-3 h-3 sm:w-4 sm:h-4" />
              </Button>
            </div>
          </div>
        </div>

        {/* Action Button */}
        <Button
          onClick={() => onViewDetail(promoItem.id)}
          disabled={isExpired}
          className={`w-full rounded-xl font-semibold transition-all duration-200 group text-sm sm:text-base ${
            isExpired
              ? "bg-gray-300 text-gray-500 cursor-not-allowed"
              : "bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white"
          }`}
          aria-label={`Use promo: ${promoItem.title}`}
        >
          {isExpired ? (
            "Expired"
          ) : (
            <>
              Use This Promo
              <ArrowRight className="w-3 h-3 sm:w-4 sm:h-4 ml-2 transition-transform group-hover:translate-x-1" />
            </>
          )}
        </Button>
      </div>
    </motion.article>
  )
})

PromoCard.displayName = "PromoCard"

const PromoSkeleton = () => (
  <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden">
    <div className="p-4 sm:p-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 sm:mb-6">
        <div className="flex items-center gap-3 mb-3 sm:mb-0">
          <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gray-200 rounded-xl animate-pulse" />
          <div>
            <div className="w-16 h-3 sm:w-20 bg-gray-200 rounded animate-pulse" />
            <div className="w-12 h-2 sm:w-16 bg-gray-200 rounded animate-pulse mt-1" />
          </div>
        </div>
        <div className="text-left sm:text-right">
          <div className="w-12 h-6 sm:w-16 sm:h-8 bg-gray-200 rounded animate-pulse" />
          <div className="w-10 h-2 sm:w-12 bg-gray-200 rounded animate-pulse mt-1" />
        </div>
      </div>
      <div className="h-4 sm:h-5 bg-gray-200 rounded mb-3 sm:mb-4 animate-pulse" />
      <div className="space-y-2 sm:space-y-3 mb-4 sm:mb-6">
        <div className="h-3 sm:h-4 bg-gray-200 rounded animate-pulse" />
        <div className="h-3 sm:h-4 bg-gray-200 rounded animate-pulse" />
      </div>
      <div className="h-16 sm:h-20 bg-gray-100 rounded-xl mb-4 sm:mb-6 animate-pulse" />
      <div className="w-full h-9 sm:h-10 bg-gray-200 rounded-xl animate-pulse" />
    </div>
  </div>
)

const PromoSection = React.memo(() => {
  const router = useRouter()
  const { promo, isLoading } = usePromo()
  const plugin = useRef(Autoplay({ delay: 4000, stopOnInteraction: true }))

  const handleViewDetail = useCallback(
    (id) => {
      router.push(`/promo/${id}`)
    },
    [router],
  )

  const displayedPromos = (promo || []).slice(0, 3)

  if (isLoading) {
    return (
      <section className="py-20 bg-white" aria-label="Special promos loading">
        <div className="px-4 mx-auto max-w-7xl sm:px-6 lg:px-8">
          <div className="mb-12">
            <div className="h-10 mb-4 rounded-2xl w-80 bg-gradient-to-r from-blue-200 via-blue-100 to-blue-200 animate-pulse" />
            <div className="h-6 rounded-2xl w-96 bg-gradient-to-r from-blue-200 via-blue-100 to-blue-200 animate-pulse" />
          </div>
          <div className="flex gap-4 overflow-x-auto pb-4">
            {Array.from({ length: 4 }).map((_, index) => (
              <div key={index} className="flex-shrink-0 w-1/2 sm:w-1/2 lg:w-1/3">
                <PromoSkeleton />
              </div>
            ))}
          </div>
        </div>
      </section>
    )
  }

  if (displayedPromos.length === 0) {
    return null
  }

  return (
    <section className="py-20 bg-white" aria-label="Special promos">
      <div className="px-4 mx-auto max-w-7xl sm:px-6 lg:px-8">
        <div className="mb-16 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 mb-6 rounded-full bg-gradient-to-r from-blue-100 to-blue-200">
            <Gift className="w-5 h-5 text-blue-600" />
            <span className="text-sm font-semibold text-blue-800">Special Offers</span>
          </div>
          <h2 className="mb-6 text-2xl font-bold text-gray-900 md:text-3xl lg:text-4xl tracking-tight">
            <span className="text-transparent bg-gradient-to-r from-blue-600 to-blue-700 bg-clip-text">Special</span> Promos
          </h2>
          <p className="text-sm text-gray-600 max-w-2xl mx-auto md:text-lg">
            Exclusive deals and discounts for your next adventure! Don't miss out on these amazing offers.
          </p>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="mb-8"
        >
          <Carousel 
            className="w-full" 
            opts={{ align: "start", loop: displayedPromos.length > 3 }}
            plugins={[plugin.current]}
          >
            <CarouselContent className="-ml-4">
              {displayedPromos.map((item, index) => (
                <CarouselItem key={item.id} className="pl-4 basis-1/2 sm:basis-1/2 lg:basis-1/3">
                  <div className="h-full">
                    <PromoCard promoItem={item} index={index} onViewDetail={handleViewDetail} />
                  </div>
                </CarouselItem>
              ))}
            </CarouselContent>
            {displayedPromos.length > 3 && (
              <>
                <CarouselPrevious className="absolute left-[-20px] md:left-[-25px] top-1/2 -translate-y-1/2 z-10 hidden sm:flex border-blue-200 hover:border-blue-300 bg-white/90 backdrop-blur-sm" />
                <CarouselNext className="absolute right-[-20px] md:right-[-25px] top-1/2 -translate-y-1/2 z-10 hidden sm:flex border-blue-200 hover:border-blue-300 bg-white/90 backdrop-blur-sm" />
              </>
            )}
          </Carousel>
          
          {/* View All Promos Button */}
          <div className="mt-12 text-center">
            <Button
              onClick={() => router.push('/promo')}
              className="px-8 py-3 text-lg font-semibold text-white transition-all duration-200 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 rounded-2xl shadow-lg hover:shadow-xl hover:-translate-y-1"
            >
              View All Promos
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
          </div>
        </motion.div>
      </div>
    </section>
  )
})

PromoSection.displayName = "PromoSection"

export default PromoSection
