"use client"

import React, { useState, useEffect, useMemo, useRef } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useActivity } from "@/hooks/useActivity"
import { useAuth } from "@/context/AuthContext"
import { useCart } from "@/hooks/useCart"
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { Input } from "@/components/ui/input"
import { MapPin, Star, Loader2, ShoppingCart, Search, Frown, Sparkles } from "lucide-react"
import { toast } from "sonner"
import { motion, AnimatePresence } from "framer-motion"
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel"
import Autoplay from "embla-carousel-autoplay"
import { useCategory } from "@/hooks/useCategory"
import { ActivitySection } from "@/components/ui/user/ActivitySection"
import { Badge } from "@/components/ui/badge"

const ITEMS_PER_PAGE = 8

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

const formatCurrency = (amount) =>
  new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(amount)

const ActivityCard = ({ item, onAddToCart, addingItemId }) => {
  const hasDiscount = item.price_discount > 0 && item.price_discount < item.price;
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3 }}
      className="group relative overflow-hidden transition-all duration-300 bg-white border border-gray-200 rounded-xl hover:border-blue-300 hover:-translate-y-1"
    >
      <Link href={`/activity/${item.id}`} className="block">
        <div className="relative overflow-hidden h-48">
          <img
            src={item.imageUrls[0]}
            alt={item.title}
            className="object-cover w-full h-full transition-transform duration-300 group-hover:scale-110"
            onError={(e) => {
              e.target.onerror = null
              e.target.src = "/assets/error.png"
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
          <div className="absolute top-2 left-2 sm:top-3 sm:left-3">
            <Badge className="bg-blue-600 text-white border-0 text-xs">
              {item.category?.name || "Activity"}
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
              <span className="text-xs font-medium">{item.rating}</span>
            </div>
          )}
          {hasDiscount && (
            <div className="absolute top-8 right-2 sm:top-12 sm:right-3 flex items-center gap-1 px-1.5 py-0.5 sm:px-2 sm:py-1 text-white bg-black/30 rounded-full backdrop-blur-sm">
              <Star className="w-2.5 h-2.5 sm:w-3 sm:h-3 fill-yellow-400 text-yellow-400" />
              <span className="text-xs font-medium">{item.rating}</span>
            </div>
          )}
        </div>

        <div className="p-3 sm:p-4">
          <h3 className="mb-1.5 sm:mb-2 text-sm sm:text-base font-semibold text-gray-900 line-clamp-2">
            {item.title}
          </h3>
          <div className="flex items-center gap-1 mb-2 sm:mb-3 text-xs sm:text-sm text-gray-500">
            <MapPin className="w-3 h-3 sm:w-4 sm:h-4" />
            <span className="truncate">{item.city || "Location not specified"}</span>
          </div>
          <div className="flex items-center justify-between">
            <div className="flex flex-col">
              {hasDiscount ? (
                <>
                  <p className="text-xs sm:text-sm text-gray-400 line-through">
                    {formatCurrency(item.price)}
                  </p>
                  <p className="text-sm sm:text-lg font-bold text-red-600">
                    {formatCurrency(item.price_discount)}
                  </p>
                </>
              ) : (
                <>
                  <div className="h-3 sm:h-4"></div>
                  <p className="text-sm sm:text-lg font-bold text-blue-600">
                    {formatCurrency(item.price)}
                  </p>
                </>
              )}
              <p className="text-xs sm:text-sm text-gray-500">per person</p>
            </div>
            <Button
              onClick={(e) => onAddToCart(e, item)}
              disabled={addingItemId === item.id}
              size="sm"
              className="bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-all duration-200 hover:scale-105"
            >
              {addingItemId === item.id ? (
                <Loader2 className="w-3 h-3 sm:w-4 sm:h-4 animate-spin" />
              ) : (
                <ShoppingCart className="w-3 h-3 sm:w-4 sm:h-4" />
              )}
            </Button>
          </div>
        </div>
      </Link>
    </motion.div>
  )
}

const ActivityBanner = ({ featuredActivities }) => {
  const plugin = useRef(Autoplay({ delay: 4000, stopOnInteraction: false }))
  if (!featuredActivities || featuredActivities.length === 0) return null

  return (
    <div className="w-full mt-4 mb-16">
      <Carousel
        opts={{ align: "start", loop: true }}
        plugins={[plugin.current]}
        onMouseEnter={plugin.current.stop}
        onMouseLeave={plugin.current.reset}
        className="w-full"
      >
        <CarouselContent className="-ml-4">
          {featuredActivities.map((item) => (
            <CarouselItem key={item.id} className="pl-4 basis-full">
              <Link href={`/activity/${item.id}`}>
                <div className="relative h-[50vh] w-full rounded-3xl overflow-hidden group shadow-2xl">
                  <img
                    src={item.imageUrls?.[0] || "/assets/error.png"}
                    alt={item.title}
                    className="object-cover w-full h-full transition-transform duration-700 group-hover:scale-105"
                    onError={(e) => {
                      e.currentTarget.onerror = null
                      e.currentTarget.src = "/assets/error.png"
                    }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent"></div>
                  <div className="absolute bottom-0 left-0 p-8 text-white">
                    <div className="inline-flex items-center px-4 py-2 mb-4 text-sm font-semibold bg-blue-600 rounded-full shadow-lg">
                      <Star className="w-4 h-4 mr-2 fill-current" />
                      Featured
                    </div>
                    <h2 className="mb-3 text-2xl font-bold drop-shadow-lg sm:text-3xl md:text-4xl">{item.title}</h2>
                    <p className="max-w-2xl mb-4 text-sm opacity-90 drop-shadow sm:text-base md:text-lg">
                      {item.description?.substring(0, 120)}...
                    </p>
                    <div className="flex items-center space-x-6">
                      <div className="flex items-center">
                        <MapPin className="w-4 h-4 mr-2 sm:w-5 sm:h-5" />
                        <span className="text-sm sm:text-lg">{item.city}</span>
                      </div>
                      <div className="flex items-center">
                        <Star className="w-4 h-4 mr-2 text-yellow-400 fill-current sm:w-5 sm:h-5" />
                        <span className="text-sm sm:text-lg">{item.rating}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </Link>
            </CarouselItem>
          ))}
        </CarouselContent>
      </Carousel>
    </div>
  )
}

const ActivityPageSkeleton = () => (
  <div className="min-h-screen py-8 bg-white">
    <div className="container px-4 mx-auto max-w-7xl">
      {/* Header Skeleton */}
      <div className="mb-8">
        <Skeleton className="w-1/3 h-8 mb-4 rounded-xl" />
        <Skeleton className="w-1/2 h-6 rounded-xl" />
      </div>
      
      {/* Search and Filter Skeleton */}
      <div className="flex flex-col gap-4 mb-8 sm:flex-row sm:items-center sm:justify-between">
        <Skeleton className="w-full h-12 sm:w-80 rounded-xl" />
        <div className="flex gap-2">
          <Skeleton className="w-24 h-10 rounded-xl" />
          <Skeleton className="w-24 h-10 rounded-xl" />
        </div>
      </div>

      {/* Activity Grid Skeleton */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {Array.from({ length: 8 }).map((_, index) => (
          <div key={index} className="overflow-hidden transition-all duration-300 border border-gray-200 bg-white rounded-xl hover:border-blue-300 hover:scale-[1.02]">
            <Skeleton className="w-full h-48 rounded-t-xl" />
            <div className="p-3 sm:p-4 space-y-3 sm:space-y-4">
              <Skeleton className="w-3/4 h-4 sm:h-5 rounded-lg" />
              <Skeleton className="w-1/2 h-3 sm:h-4 rounded-lg" />
              <div className="flex items-center justify-between">
                <Skeleton className="w-1/3 h-4 sm:h-5 rounded-lg" />
                <Skeleton className="w-16 h-8 sm:w-20 sm:h-10 rounded-lg" />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Pagination Skeleton */}
      <div className="flex items-center justify-center mt-8">
        <Skeleton className="w-64 h-12 rounded-xl" />
      </div>
    </div>
  </div>
)

const ActivityPage = () => {
  const { user, loading: isAuthLoading } = useAuth()
  const { activity, isLoading: isActivityLoading, error } = useActivity()
  const { addToCart } = useCart()
  const router = useRouter()
  const [currentPage, setCurrentPage] = useState(1)
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("all")
  const [addingItemId, setAddingItemId] = useState(null)
  const [hasMounted, setHasMounted] = useState(false)

  useEffect(() => {
    setHasMounted(true)
  }, [])

  // Reset pagination when filters change
  useEffect(() => {
    setCurrentPage(1)
  }, [searchQuery, selectedCategory])

  // Debug selectedCategory changes
  useEffect(() => {
    console.log("Selected category changed to:", selectedCategory)
  }, [selectedCategory])

  const handleAddToCart = async (e, item) => {
    e.preventDefault()
    e.stopPropagation()
    
    if (!user) {
      toast.error("Please login to add items to cart")
      router.push("/login")
      return
    }

    setAddingItemId(item.id)
    try {
      await addToCart(item.id, 1)
    } catch (error) {
      // Error toast already handled in CartContext
    } finally {
      setAddingItemId(null)
    }
  }

  const handleCategoryChange = (e) => {
    const newCategory = e.target.value
    console.log("Category dropdown changed from", selectedCategory, "to", newCategory)
    setSelectedCategory(newCategory)
  }

  const filteredActivities = useMemo(() => {
    if (!activity) return []
    
    let filtered = activity

    if (searchQuery.trim()) {
      filtered = filtered.filter((item) =>
        item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.city?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.address?.toLowerCase().includes(searchQuery.toLowerCase())
      )
    }

    if (selectedCategory !== "all") {
      filtered = filtered.filter((item) => {
        const itemCategory = item.category?.name || item.category
        console.log(`Filtering: "${item.title}" category "${itemCategory}" vs selected "${selectedCategory}"`)
        return itemCategory === selectedCategory
      })
    }

    console.log(`Filtered activities: ${filtered.length} out of ${activity.length}`)
    return filtered
  }, [activity, searchQuery, selectedCategory])

  const totalPages = Math.ceil(filteredActivities.length / ITEMS_PER_PAGE)
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE
  const endIndex = startIndex + ITEMS_PER_PAGE
  const currentActivities = filteredActivities.slice(startIndex, endIndex)

  const categories = useMemo(() => {
    if (!activity) return []
    
    // Debug: Log first few activities to see structure
    if (activity.length > 0) {
      console.log("First activity structure:", activity[0])
      console.log("Category from first activity:", activity[0].category)
    }
    
    const uniqueCategories = [...new Set(
      activity
        .map(item => {
          const category = item.category?.name || item.category
          console.log(`Activity "${item.title}" category:`, category)
          return category
        })
        .filter(Boolean)
    )]
    
    console.log("Available categories:", uniqueCategories)
    return uniqueCategories.sort() // Sort alphabetically
  }, [activity])

  const featuredActivities = useMemo(() => {
    if (!activity) return []
    return activity.filter(item => item.rating >= 4.5).slice(0, 5)
  }, [activity])

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber)
    window.scrollTo({ top: 0, behavior: "smooth" })
  }

  const getPageNumbers = () => {
    const pages = []
    const maxVisiblePages = 5

    if (totalPages <= maxVisiblePages) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i)
      }
    } else {
      if (currentPage <= 3) {
        for (let i = 1; i <= 4; i++) {
          pages.push(i)
        }
        pages.push("...")
        pages.push(totalPages)
      } else if (currentPage >= totalPages - 2) {
        pages.push(1)
        pages.push("...")
        for (let i = totalPages - 3; i <= totalPages; i++) {
          pages.push(i)
        }
      } else {
        pages.push(1)
        pages.push("...")
        for (let i = currentPage - 1; i <= currentPage + 1; i++) {
          pages.push(i)
        }
        pages.push("...")
        pages.push(totalPages)
      }
    }

    return pages
  }

  const isLoading = isAuthLoading || isActivityLoading || !hasMounted

  if (isLoading) {
    return <ActivityPageSkeleton />
  }

  if (error) {
    return (
      <div className="container py-8 mx-auto text-center">
        <div className="flex flex-col items-center justify-center min-h-[60vh]">
          <div className="flex items-center justify-center w-24 h-24 mx-auto mb-6 bg-red-100 rounded-full">
            <Frown className="w-12 h-12 text-red-600" />
          </div>
          <h1 className="mb-4 text-3xl font-bold text-gray-900">Error Loading Activities</h1>
          <p className="text-gray-600">Failed to load activities. Please try again later.</p>
        </div>
      </div>
    )
  }

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key="activity-page"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="min-h-screen py-8 bg-white"
      >
        <div className="container px-4 mx-auto max-w-7xl sm:px-6 lg:px-8">
          <div className="mb-8 text-center">
            <h1 className="mb-4 text-2xl font-bold text-gray-900 sm:text-3xl lg:text-4xl">
              Explore <span className="text-transparent bg-gradient-to-r from-blue-600 to-blue-700 bg-clip-text">Activities</span>
            </h1>
            <p className="text-sm text-gray-600 max-w-2xl mx-auto sm:text-base">
              Discover amazing adventures and experiences waiting for you
            </p>
          </div>

          {/* Featured Activities Banner */}
          <ActivityBanner featuredActivities={featuredActivities} />

          {/* Search and Filter */}
          <div className="mb-8 space-y-4 lg:space-y-0 lg:flex lg:items-center lg:space-x-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 w-4 h-4 -translate-y-1/2 text-gray-400 pointer-events-none" />
              <input
                type="text"
                placeholder="Search activities..."
                className="w-full pl-10 pr-4 py-3 text-base border border-gray-200 rounded-xl bg-white/80 backdrop-blur-sm transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 hover:border-gray-300 hover:bg-white/90"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            
            <div className="relative">
              <select
                value={selectedCategory}
                onChange={handleCategoryChange}
                className="w-full lg:w-48 px-4 py-3 text-base border border-gray-200 rounded-xl bg-white/80 backdrop-blur-sm transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 hover:border-gray-300 hover:bg-white/90 appearance-none cursor-pointer"
              >
                <option value="all">All Categories ({activity?.length || 0})</option>
                {categories.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat} ({activity?.filter(item => (item.category?.name || item.category) === cat).length || 0})
                  </option>
                ))}
              </select>
              <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
                <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </div>
          </div>

          {currentActivities.length === 0 ? (
            <div className="py-20 text-center">
              <div className="flex items-center justify-center w-24 h-24 mx-auto mb-6 bg-blue-100 rounded-full">
                <Frown className="w-12 h-12 text-blue-600" />
              </div>
              <h3 className="mb-2 text-xl font-semibold text-gray-900">No activities found</h3>
              <p className="text-gray-600">
                {searchQuery
                  ? `No activities found for "${searchQuery}". Try different keywords.`
                  : "No activities available at the moment. Check back later!"}
              </p>
            </div>
          ) : (
            <motion.div
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
            >
              {currentActivities.map((item) => (
                <ActivityCard key={item.id} item={item} onAddToCart={handleAddToCart} addingItemId={addingItemId} />
              ))}
            </motion.div>
          )}

          {totalPages > 1 && (
            <Pagination className="mt-16">
              <PaginationContent>
                <PaginationItem>
                  <PaginationPrevious
                    href="#"
                    onClick={(e) => {
                      e.preventDefault()
                      if (currentPage > 1) handlePageChange(currentPage - 1)
                    }}
                    className={currentPage === 1 ? "pointer-events-none opacity-50" : ""}
                  />
                </PaginationItem>
                {getPageNumbers().map((page, index) => (
                  <PaginationItem key={`${page}-${index}`}>
                    {page === "..." ? (
                      <PaginationEllipsis />
                    ) : (
                      <PaginationLink
                        href="#"
                        onClick={(e) => {
                          e.preventDefault()
                          handlePageChange(page)
                        }}
                        isActive={currentPage === page}
                        className={currentPage === page ? "bg-blue-600 text-white hover:bg-blue-700" : ""}
                      >
                        {page}
                      </PaginationLink>
                    )}
                  </PaginationItem>
                ))}
                <PaginationItem>
                  <PaginationNext
                    href="#"
                    onClick={(e) => {
                      e.preventDefault()
                      if (currentPage < totalPages) handlePageChange(currentPage + 1)
                    }}
                    className={currentPage === totalPages ? "pointer-events-none opacity-50" : ""}
                  />
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          )}
        </div>
      </motion.div>
    </AnimatePresence>
  )
}

export default ActivityPage
