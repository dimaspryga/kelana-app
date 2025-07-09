"use client"

import React, { useState, useMemo, useCallback } from "react"
import Link from "next/link"
import Image from "next/image"
import { useRouter, usePathname } from "next/navigation"
import { useActivity } from "@/hooks/useActivity"
import { useCart } from "@/hooks/useCart"
import { useAuth } from "@/context/AuthContext"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel"
import { MapPin, Star, ShoppingCart, Loader2, Sparkles } from "lucide-react"
import { toast } from "sonner"
import { motion } from "framer-motion"

const formatCurrency = (amount) =>
  new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(amount)

// Optimized image utility functions
const PLACEHOLDER_DATA_URL =
  "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAwIiBoZWlnaHQ9IjE2MCIgdmlld0JveD0iMCAwIDMwMCAxNjAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIzMDAiIGhlaWdodD0iMTYwIiBmaWxsPSIjRjNGNEY2Ii8+CjxwYXRoIGQ9Ik0xNDcuNSA5MkgxMzVMMTU3LjUgNjBMMTgwLjUgNjBMMTYwIDkySDEzNy41WiIgZmlsbD0iI0QxRDVEQiIvPgo8Y2lyY2xlIGN4PSIxNTcuNSIgY3k9IjYwIiByPSI3LjUiIGZpbGw9IiNEMUQ1REIiLz4KPC9zdmc+"

const isExternalImage = (src) => {
  return src && (src.startsWith("http://") || src.startsWith("https://"))
}

const getImageProps = (src, alt, hasError = false) => {
  if (!src || hasError) {
    return {
      src: PLACEHOLDER_DATA_URL,
      alt: alt || "Activity placeholder",
      unoptimized: true,
    }
  }

  if (isExternalImage(src)) {
    return { src, alt, unoptimized: true }
  }

  return { src, alt }
}

const ActivityCard = React.memo(({ activityItem, handleAddToCart, addingItemId, index, imageErrors, onImageError }) => {
  const hasDiscount = activityItem.price_discount > 0 && activityItem.price_discount < activityItem.price
  
  return (
    <div className="group relative overflow-hidden transition-all duration-300 bg-white border border-gray-200 rounded-xl hover:border-blue-300 hover:-translate-y-1">
      <Link href={`/activity/${activityItem.id}`} className="block">
        <div className="relative overflow-hidden aspect-[4/3]">
          <img
            src={activityItem.imageUrls[0]}
            alt={activityItem.title}
            className="object-cover w-full h-full transition-transform duration-300 group-hover:scale-110"
            onError={(e) => {
              e.target.onerror = null
              e.target.src = "/assets/error.png"
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
          <div className="absolute top-2 left-2 sm:top-3 sm:left-3">
            <Badge className="bg-blue-600 text-white border-0 text-xs">
              {activityItem.category?.name || "Activity"}
            </Badge>
          </div>
          {hasDiscount && (
            <div className="absolute top-2 right-2 sm:top-3 sm:right-3 flex items-center gap-1 px-1.5 py-0.5 sm:px-2 sm:py-1 text-xs font-bold text-white bg-gradient-to-r from-red-500 to-red-600 rounded-full">
              <Sparkles className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
              <span className="text-xs">HOT DEAL</span>
            </div>
          )}
          {!hasDiscount && (
            <div className="absolute top-2 right-2 sm:top-3 sm:right-3 flex items-center gap-1 px-1.5 py-0.5 sm:px-2 sm:py-1 text-white bg-black/30 rounded-full backdrop-blur-sm">
              <Star className="w-2.5 h-2.5 sm:w-3 sm:h-3 fill-yellow-400 text-yellow-400" />
              <span className="text-xs font-medium">{activityItem.rating}</span>
            </div>
          )}
          {hasDiscount && (
            <div className="absolute top-8 right-2 sm:top-12 sm:right-3 flex items-center gap-1 px-1.5 py-0.5 sm:px-2 sm:py-1 text-white bg-black/30 rounded-full backdrop-blur-sm">
              <Star className="w-2.5 h-2.5 sm:w-3 sm:h-3 fill-yellow-400 text-yellow-400" />
              <span className="text-xs font-medium">{activityItem.rating}</span>
            </div>
          )}
        </div>

        <div className="p-3 sm:p-4">
          <h3 className="mb-1.5 sm:mb-2 text-sm sm:text-base font-semibold text-gray-900 line-clamp-2">
            {activityItem.title}
          </h3>
          <div className="flex items-center gap-1 mb-2 sm:mb-3 text-xs sm:text-sm text-gray-500">
            <MapPin className="w-3 h-3 sm:w-4 sm:h-4" />
            <span className="truncate">{activityItem.city || "Location not specified"}</span>
          </div>
          <div className="flex items-center justify-between">
            <div className="flex flex-col">
              {hasDiscount ? (
                <>
                  <p className="text-xs sm:text-sm text-gray-400 line-through">
                    {formatCurrency(activityItem.price)}
                  </p>
                  <p className="text-base sm:text-lg font-bold text-red-600">
                    {formatCurrency(activityItem.price_discount)}
                  </p>
                </>
              ) : (
                <>
                  <div className="h-3 sm:h-4"></div>
                  <p className="text-base sm:text-lg font-bold text-blue-600">
                    {formatCurrency(activityItem.price)}
                  </p>
                </>
              )}
              <p className="text-xs sm:text-sm text-gray-500">per person</p>
            </div>
            <Button
              onClick={(e) => handleAddToCart(e, activityItem)}
              disabled={addingItemId === activityItem.id}
              size="sm"
              className="bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-all duration-200 hover:scale-105"
            >
              {addingItemId === activityItem.id ? (
                <Loader2 className="w-3 h-3 sm:w-4 sm:h-4 animate-spin" />
              ) : (
                <ShoppingCart className="w-3 h-3 sm:w-4 sm:h-4" />
              )}
            </Button>
          </div>
        </div>
      </Link>
    </div>
  )
})

ActivityCard.displayName = "ActivityCard"

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.05 },
  },
}

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: { y: 0, opacity: 1, transition: { type: "spring", stiffness: 100 } },
}

const ActivitySkeleton = () => (
  <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
    <div className="aspect-[4/3] bg-gray-200 animate-pulse" />
    <div className="p-3 sm:p-4">
      <div className="h-4 sm:h-5 bg-gray-200 rounded mb-2 sm:mb-3 animate-pulse" />
      <div className="h-3 sm:h-4 bg-gray-200 rounded mb-2 sm:mb-3 animate-pulse" />
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <div className="h-4 sm:h-5 bg-gray-200 rounded animate-pulse" />
          <div className="h-3 sm:h-4 bg-gray-200 rounded animate-pulse" />
        </div>
        <div className="w-8 h-8 sm:w-9 sm:h-9 bg-gray-200 rounded-lg animate-pulse" />
      </div>
    </div>
  </div>
)

const ActivitySection = React.memo(() => {
  const { activity, isLoading: isActivityLoading } = useActivity()
  const { addToCart } = useCart()
  const { user, loading: isAuthLoading } = useAuth()
  const router = useRouter()
  const pathname = usePathname()

  const [addingItemId, setAddingItemId] = useState(null)
  const [imageErrors, setImageErrors] = useState(new Set())

  const handleImageError = useCallback((activityId) => {
    setImageErrors((prev) => new Set([...prev, activityId]))
  }, [])

  const handleAddToCart = useCallback(
    async (e, activity) => {
      e.preventDefault()
      e.stopPropagation()

      if (!user) {
        toast.info("Please log in to add items to your cart.")
        router.push(`/login?redirect=${encodeURIComponent(pathname)}`)
        return
      }

      setAddingItemId(activity.id)
      try {
        await addToCart(activity.id, 1)
      } catch (err) {
        // Error toast already handled in CartContext
      } finally {
        setAddingItemId(null)
      }
    },
    [user, router, pathname, addToCart],
  )

  const isLoading = isActivityLoading || isAuthLoading

  const popularActivities = useMemo(() => {
    if (!activity) return []
    return activity.slice(0, 8)
  }, [activity])

  if (isLoading) {
    return (
      <section className="py-16 bg-white" aria-label="Popular activities loading">
        <div className="px-4 mx-auto max-w-7xl sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-8">
            <div>
              <div className="w-64 h-8 mb-2 rounded-2xl bg-gradient-to-r from-blue-200 via-blue-100 to-blue-200 animate-pulse" />
              <div className="h-6 rounded-2xl w-80 bg-gradient-to-r from-blue-200 via-blue-100 to-blue-200 animate-pulse" />
            </div>
            <div className="hidden w-20 h-10 rounded-xl sm:block bg-gradient-to-r from-blue-200 via-blue-100 to-blue-200 animate-pulse" />
          </div>
          <div className="relative">
            <div className="flex gap-4 overflow-x-auto pb-4">
              {Array.from({ length: 4 }).map((_, index) => (
                <div key={index} className="flex-shrink-0 w-64 sm:w-72">
                  <ActivitySkeleton />
                </div>
              ))}
            </div>
            
            {/* Navigation buttons skeleton */}
            <div className="absolute left-[-20px] top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/90 border border-gray-200 animate-pulse hidden sm:block" />
            <div className="absolute right-[-20px] top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/90 border border-gray-200 animate-pulse hidden sm:block" />
          </div>
        </div>
      </section>
    )
  }

  if (!popularActivities.length) {
    return null
  }

  return (
    <section className="py-16 bg-white" aria-label="Popular activities">
      <div className="px-4 mx-auto max-w-7xl sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 md:text-3xl">
              Popular <span className="text-blue-600">Activities</span>
            </h2>
            <p className="mt-2 text-sm text-gray-600">Explore a variety of the most sought-after activities.</p>
          </div>
          <Button
            asChild
            variant="outline"
            className="hidden transition-all duration-200 bg-transparent border-blue-200 hover:bg-blue-50 hover:text-blue-600 rounded-xl sm:flex"
          >
            <Link href="/activity">View All</Link>
          </Button>
        </div>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="relative"
        >
          <Carousel
            opts={{
              align: "start",
              loop: false,
            }}
            className="w-full"
          >
            <CarouselContent className="-ml-2 md:-ml-4">
              {popularActivities.map((activityItem, index) => (
                <CarouselItem key={activityItem.id} className="pl-2 md:pl-4 basis-1/2 sm:basis-1/2 lg:basis-1/3 xl:basis-1/4">
                  <ActivityCard
                    activityItem={activityItem}
                    handleAddToCart={handleAddToCart}
                    addingItemId={addingItemId}
                    index={index}
                    imageErrors={imageErrors}
                    onImageError={handleImageError}
                  />
                </CarouselItem>
              ))}
            </CarouselContent>
            
            {popularActivities.length > 4 && (
              <>
                <CarouselPrevious className="absolute left-[-20px] md:left-[-25px] top-1/2 -translate-y-1/2 z-10 hidden sm:flex bg-white/90 backdrop-blur-sm border-blue-200 hover:bg-blue-50" />
                <CarouselNext className="absolute right-[-20px] md:right-[-25px] top-1/2 -translate-y-1/2 z-10 hidden sm:flex bg-white/90 backdrop-blur-sm border-blue-200 hover:bg-blue-50" />
              </>
            )}
          </Carousel>
        </motion.div>
      </div>
    </section>
  )
})

ActivitySection.displayName = "ActivitySection"

export default ActivitySection
