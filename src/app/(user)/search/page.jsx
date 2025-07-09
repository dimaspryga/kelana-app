"use client"

import React, { useState, useEffect, useMemo, useCallback } from "react"
import { useSearchParams } from "next/navigation"
import { useActivity } from "@/hooks/useActivity"
import { useCategory } from "@/hooks/useCategory"
import { usePromo } from "@/hooks/usePromo"
import { useCart } from "@/hooks/useCart"
import { useAuth } from "@/context/AuthContext"
import { motion, AnimatePresence } from "framer-motion"
import Image from "next/image"
import Link from "next/link"
import { useRouter, usePathname } from "next/navigation"

import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { Search, Plane, Mountain, Tag, MapPin, Star, Calendar, Sparkles, Frown, ShoppingCart, Loader2 } from "lucide-react"
import { toast } from "sonner"

const formatCurrency = (amount) =>
  new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(amount)

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

// Activity Card Component (matching activity page exactly)
const ActivityCard = ({ item, onAddToCart, addingItemId }) => {
  const hasDiscount = item.price_discount > 0 && item.price_discount < item.price;
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3 }}
      className="group relative overflow-hidden transition-all duration-300 bg-white border border-gray-200 rounded-lg hover:border-blue-300 hover:-translate-y-1"
    >
      <Link href={`/activity/${item.id}`} className="block">
        <div className="relative overflow-hidden aspect-[4/3]">
          <img
            src={item.imageUrls?.[0] || item.imageUrl}
            alt={item.title}
            className="object-cover w-full h-full transition-transform duration-300 group-hover:scale-110"
            onError={(e) => {
              e.target.onerror = null
              e.target.src = "/assets/error.png"
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
          <div className="absolute top-2 left-2">
            <Badge className="bg-blue-600 text-white border-0 text-xs">
              {item.category?.name || "Activity"}
            </Badge>
          </div>
          {hasDiscount && (
            <div className="absolute top-2 right-2 flex items-center gap-1 px-1.5 py-0.5 text-xs font-bold text-white bg-gradient-to-r from-red-500 to-red-600 rounded-full">
              <Sparkles className="w-2.5 h-2.5" />
              <span className="text-xs">HOT DEAL</span>
            </div>
          )}
          {!hasDiscount && (
            <div className="absolute top-2 right-2 flex items-center gap-1 px-1.5 py-0.5 text-white bg-black/30 rounded-full backdrop-blur-sm">
              <Star className="w-2.5 h-2.5 fill-yellow-400 text-yellow-400" />
              <span className="text-xs font-medium">{item.rating}</span>
            </div>
          )}
          {hasDiscount && (
            <div className="absolute top-8 right-2 flex items-center gap-1 px-1.5 py-0.5 text-white bg-black/30 rounded-full backdrop-blur-sm">
              <Star className="w-2.5 h-2.5 fill-yellow-400 text-yellow-400" />
              <span className="text-xs font-medium">{item.rating}</span>
            </div>
          )}
        </div>

        <div className="p-3">
          <h3 className="mb-1.5 text-sm font-semibold text-gray-900 line-clamp-2">
            {item.title}
          </h3>
          <div className="flex items-center gap-1 mb-2 text-xs text-gray-500">
            <MapPin className="w-3 h-3" />
            <span className="truncate">{item.city || item.location || "Location not specified"}</span>
          </div>
          <div className="flex items-center justify-between">
            <div className="flex flex-col">
              {hasDiscount ? (
                <>
                  <p className="text-xs text-gray-400 line-through">
                    {formatCurrency(item.price)}
                  </p>
                  <p className="text-base font-bold text-red-600">
                    {formatCurrency(item.price_discount)}
                  </p>
                </>
              ) : (
                <>
                  <div className="h-3"></div>
                  <p className="text-base font-bold text-blue-600">
                    {formatCurrency(item.price)}
                  </p>
                </>
              )}
              <p className="text-xs text-gray-500">per person</p>
            </div>
            <Button 
              onClick={(e) => onAddToCart(e, item)}
              disabled={addingItemId === item.id}
              size="sm"
              className="bg-blue-600 hover:bg-blue-700 text-white rounded transition-all duration-200 hover:scale-105"
            >
              {addingItemId === item.id ? (
                <Loader2 className="w-3 h-3 animate-spin" />
              ) : (
                <ShoppingCart className="w-3 h-3" />
              )}
            </Button>
          </div>
        </div>
      </Link>
    </motion.div>
  )
}

// Category Card Component (matching category page exactly)
const CategoryCard = ({ item }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3 }}
    >
      <Link href={`/category/${item.id}`} className="block h-full group">
        <div className="flex flex-col w-full h-full overflow-hidden transition-all duration-300 border border-gray-200 bg-white rounded-lg hover:border-blue-300 hover:-translate-y-1">
          <div className="relative overflow-hidden">
            <img
              src={item.imageUrl || "/assets/banner-authpage.png"}
              alt={item.name}
              className="object-cover w-full h-40 transition-transform duration-500 group-hover:scale-110"
              onError={(e) => {
                e.currentTarget.onerror = null
                e.currentTarget.src = "/assets/error.png"
              }}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent"></div>
            <div className="absolute bottom-2 left-2 right-2">
              <div className="inline-flex items-center px-1.5 py-0.5 mb-1 text-xs font-semibold text-white bg-blue-600 rounded-full">
                <Mountain className="w-2.5 h-2.5 mr-1" />
                Category
              </div>
              <h3 className="text-sm font-bold text-white drop-shadow-lg transition-transform duration-300 group-hover:translate-y-[-2px] line-clamp-2">
                {item.name}
              </h3>
            </div>
          </div>
          <div className="flex flex-col flex-grow p-3">
            <div className="flex items-center justify-between mb-2">
              <Badge className="bg-blue-100 text-blue-800 text-xs">
                <Mountain className="w-2.5 h-2.5 mr-1" />
                {item.activityCount || 0} {item.activityCount === 1 ? 'Activity' : 'Activities'}
              </Badge>
            </div>
            <p className="text-xs text-gray-600 line-clamp-3">
              {item.description || "Explore amazing activities in this category."}
            </p>
            <div className="flex-grow" />
            <Button size="sm" className="w-full mt-3 text-white transition-all duration-200 bg-blue-600 hover:bg-blue-700 rounded hover:scale-105 text-sm">
              Explore Category
            </Button>
          </div>
        </div>
      </Link>
    </motion.div>
  )
}

// Promo Card Component
const PromoCard = ({ item }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3 }}
      className="group relative overflow-hidden transition-all duration-300 bg-white border border-blue-100 rounded-3xl shadow-lg hover:shadow-2xl hover:-translate-y-1"
    >
      <div className="relative overflow-hidden aspect-[4/3]">
        <img
          src={item.imageUrl || "/assets/error.png"}
          alt={item.title}
          className="object-cover w-full h-full transition-transform duration-300 group-hover:scale-110"
          onError={(e) => {
            e.target.onerror = null
            e.target.src = "/assets/error.png"
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
        <div className="absolute top-3 left-3">
          <Badge className="bg-orange-500 text-white border-0">
            Promo
          </Badge>
        </div>
        <div className="absolute top-3 right-3 flex items-center gap-1 px-2 py-1 text-xs font-bold text-white bg-gradient-to-r from-orange-500 to-orange-600 rounded-full shadow-lg">
          <Sparkles className="w-3 h-3" />
          <span>SPECIAL</span>
        </div>
      </div>

      <div className="p-4">
        <h3 className="mb-2 text-lg font-semibold text-gray-900 line-clamp-2">
          {item.title}
        </h3>
        <p className="text-sm text-gray-600 line-clamp-2 mb-3">
          {item.description}
        </p>
        <div className="flex items-center gap-2 text-sm text-gray-500 mb-3">
          <Calendar className="w-4 h-4" />
          <span>Valid until {new Date(item.endDate).toLocaleDateString()}</span>
        </div>
        <Button asChild className="w-full bg-orange-600 hover:bg-orange-700 text-white rounded-xl transition-all duration-200 hover:scale-105">
          <Link href={`/promo/${item.id}`}>
            View Promo
          </Link>
        </Button>
      </div>
    </motion.div>
  )
}

const SearchPageSkeleton = () => (
  <div className="min-h-screen py-8 bg-white">
    <div className="container px-4 mx-auto max-w-7xl sm:px-6 lg:px-8">
      {/* Header Skeleton */}
      <div className="mb-8 text-center">
        <Skeleton className="w-1/3 h-8 mb-4 rounded-xl mx-auto" />
        <Skeleton className="w-1/2 h-6 rounded-xl mx-auto" />
      </div>
      
      {/* Tabs Skeleton */}
      <div className="flex flex-wrap gap-2 mb-8 justify-center">
        {[...Array(4)].map((_, i) => (
          <Skeleton key={i} className="w-20 h-8 sm:w-24 sm:h-10 rounded-lg" />
        ))}
      </div>

      {/* Grid Skeleton */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {Array.from({ length: 8 }).map((_, index) => (
          <div key={index} className="overflow-hidden transition-all duration-300 border border-gray-200 bg-white rounded-xl hover:border-blue-300 hover:scale-[1.02]">
            <Skeleton className="w-full aspect-[4/3] rounded-t-xl" />
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
    </div>
  </div>
)

const SearchPage = () => {
  const searchParams = useSearchParams()
  const query = searchParams.get("q") || ""
  const type = searchParams.get("type") || "all"

  const { activity: activities, isLoading: isActivityLoading } = useActivity()
  const { category: categories, isLoading: isCategoryLoading } = useCategory()
  const { promo: promos, isLoading: isPromoLoading } = usePromo()
  const { addToCart } = useCart()
  const { user, loading: isAuthLoading } = useAuth()
  const router = useRouter()
  const pathname = usePathname()

  const [activeTab, setActiveTab] = useState("all")
  const [addingItemId, setAddingItemId] = useState(null)

  useEffect(() => {
    if (type !== "all") {
      setActiveTab(type)
    }
  }, [type])

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

  // Calculate activity count per category (matching category page)
  const categoriesWithActivityCount = useMemo(() => {
    if (!categories || !activities) return []
    
    return categories.map(cat => {
      const activityCount = activities.filter(act => 
        act.category?.id === cat.id || act.category?.name === cat.name
      ).length
      
      return {
        ...cat,
        activityCount
      }
    })
  }, [categories, activities])

  const filteredResults = useMemo(() => {
    if (!query.trim()) {
      return {
        activities: [],
        categories: [],
        promos: [],
      }
    }

    const lowerCaseQuery = query.toLowerCase()
    let filteredActivities = []
    let filteredCategories = []
    let filteredPromos = []

    if (activeTab === "all" || activeTab === "activities") {
      filteredActivities = (activities || []).filter((activity) =>
        activity.title.toLowerCase().includes(lowerCaseQuery) ||
        activity.description?.toLowerCase().includes(lowerCaseQuery) ||
        activity.location?.toLowerCase().includes(lowerCaseQuery) ||
        activity.city?.toLowerCase().includes(lowerCaseQuery)
      )
    }

    if (activeTab === "all" || activeTab === "categories") {
      filteredCategories = (categoriesWithActivityCount || []).filter((category) =>
        category.name.toLowerCase().includes(lowerCaseQuery) ||
        category.description?.toLowerCase().includes(lowerCaseQuery)
      )
    }

    if (activeTab === "all" || activeTab === "promos") {
      filteredPromos = (promos || []).filter((promo) =>
        promo.title.toLowerCase().includes(lowerCaseQuery) ||
        promo.description?.toLowerCase().includes(lowerCaseQuery)
      )
    }

    return {
      activities: filteredActivities,
      categories: filteredCategories,
      promos: filteredPromos,
    }
  }, [query, activeTab, activities, categoriesWithActivityCount, promos])

  const totalResults = filteredResults.activities.length + filteredResults.categories.length + filteredResults.promos.length

  const tabs = [
    { id: "all", label: "All", count: totalResults },
    { id: "activities", label: "Activities", count: filteredResults.activities.length },
    { id: "categories", label: "Categories", count: filteredResults.categories.length },
    { id: "promos", label: "Promos", count: filteredResults.promos.length },
  ]

  const isLoading = isActivityLoading || isCategoryLoading || isPromoLoading || isAuthLoading

  if (isLoading) {
    return <SearchPageSkeleton />
  }

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key="search-page"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="min-h-screen py-8 bg-white"
      >
        <div className="container px-4 mx-auto max-w-7xl sm:px-6 lg:px-8">
          {/* Header */}
          <div className="mb-8 text-center">
            <div className="flex items-center justify-center gap-3 mb-4">
              <Search className="w-6 h-6 text-blue-600" />
              <h1 className="text-3xl font-bold text-gray-900 sm:text-4xl lg:text-5xl">
                Search <span className="text-transparent bg-gradient-to-r from-blue-600 to-blue-700 bg-clip-text">Results</span>
              </h1>
            </div>
            {query && (
              <p className="text-sm text-gray-600 max-w-2xl mx-auto sm:text-lg">
                Found {totalResults} result{totalResults !== 1 ? "s" : ""} for "{query}"
              </p>
            )}
          </div>

          {/* Tabs */}
          <div className="flex flex-wrap gap-2 mb-8 justify-center">
            {tabs.map((tab) => (
              <Button
                key={tab.id}
                variant={activeTab === tab.id ? "default" : "outline"}
                onClick={() => setActiveTab(tab.id)}
                className="flex items-center gap-2"
              >
                {tab.label}
                <Badge variant="secondary" className="ml-1">
                  {tab.count}
                </Badge>
              </Button>
            ))}
          </div>

          {/* Results */}
          {totalResults === 0 ? (
            <div className="py-20 text-center">
              <div className="flex items-center justify-center w-24 h-24 mx-auto mb-6 bg-blue-100 rounded-full">
                <Frown className="w-12 h-12 text-blue-600" />
              </div>
              <h3 className="mb-2 text-xl font-semibold text-gray-900">No results found</h3>
              <p className="text-gray-600">
                {query
                  ? `No results found for "${query}". Try different keywords.`
                  : "Try adjusting your search terms or browse our categories"}
              </p>
            </div>
          ) : (
            <motion.div
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              className="space-y-12"
            >
              {/* Activities */}
              {(activeTab === "all" || activeTab === "activities") && filteredResults.activities.length > 0 && (
                <div>
                  <h2 className="text-2xl font-semibold text-gray-900 mb-6 flex items-center gap-2">
                    <Plane className="w-6 h-6 text-green-600" />
                    Activities ({filteredResults.activities.length})
                  </h2>
                  <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                    {filteredResults.activities.map((activity) => (
                      <ActivityCard 
                        key={activity.id} 
                        item={activity} 
                        onAddToCart={handleAddToCart}
                        addingItemId={addingItemId}
                      />
                    ))}
                  </div>
                </div>
              )}

              {/* Categories */}
              {(activeTab === "all" || activeTab === "categories") && filteredResults.categories.length > 0 && (
                <div>
                  <h2 className="text-2xl font-semibold text-gray-900 mb-6 flex items-center gap-2">
                    <Mountain className="w-6 h-6 text-blue-600" />
                    Categories ({filteredResults.categories.length})
                  </h2>
                  <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                    {filteredResults.categories.map((category) => (
                      <CategoryCard key={category.id} item={category} />
                    ))}
                  </div>
                </div>
              )}

              {/* Promos */}
              {(activeTab === "all" || activeTab === "promos") && filteredResults.promos.length > 0 && (
                <div>
                  <h2 className="text-2xl font-semibold text-gray-900 mb-6 flex items-center gap-2">
                    <Tag className="w-6 h-6 text-orange-600" />
                    Promos ({filteredResults.promos.length})
                  </h2>
                  <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                    {filteredResults.promos.map((promo) => (
                      <PromoCard key={promo.id} item={promo} />
                    ))}
                  </div>
                </div>
              )}
            </motion.div>
          )}
        </div>
      </motion.div>
    </AnimatePresence>
  )
}

export default SearchPage 