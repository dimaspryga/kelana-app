"use client"

import React, { useState, useEffect, useMemo, useCallback } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useCategory } from "@/hooks/useCategory"
import { useActivity } from "@/hooks/useActivity"
import { useAuth } from "@/context/AuthContext"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Skeleton } from "@/components/ui/skeleton"
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
  PaginationEllipsis,
} from "@/components/ui/pagination"
import { motion, AnimatePresence } from "framer-motion"
import { Search, Mountain, Frown, Compass } from "lucide-react"
import { Badge } from "@/components/ui/badge"

const DEFAULT_CATEGORY_IMAGE = "/assets/banner-authpage.png"
const ITEMS_PER_PAGE = 12

// Optimized image utility functions
const PLACEHOLDER_DATA_URL =
  "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAwIiBoZWlnaHQ9IjI0MCIgdmlld0JveD0iMCAwIDMwMCAyNDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIzMDAiIGhlaWdodD0iMjQwIiBmaWxsPSIjRjNGNEY2Ii8+CjxwYXRoIGQ9Ik0xNDcuNSAxMzJIMTM1TDE1Ny41IDkwTDE4MC41IDkwTDE2MCAxMzJIMTQ3LjVaIiBmaWxsPSIjRDFENURCIi8+CjxjaXJjbGUgY3g9IjE1Ny41IiBjeT0iOTAiIHI9IjcuNSIgZmlsbD0iI0QxRDVEQiIvPgo8L3N2Zz4K"

const isExternalImage = (src) => {
  return src && (src.startsWith("http://") || src.startsWith("https://"))
}

const getImageProps = (src, alt, hasError = false) => {
  if (!src || hasError) {
    return {
      src: PLACEHOLDER_DATA_URL,
      alt: alt || "Category placeholder",
      unoptimized: true,
    }
  }

  if (isExternalImage(src)) {
    return { src, alt, unoptimized: true }
  }

  return { src, alt }
}

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08,
    },
  },
}

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
}

const CategoryPageSkeleton = () => (
  <div className="min-h-screen py-8 bg-white">
    <div className="container px-4 mx-auto max-w-7xl">
      {/* Header Skeleton */}
      <div className="mb-8">
        <Skeleton className="w-1/3 h-8 mb-4 rounded-xl" />
        <Skeleton className="w-1/2 h-6 rounded-xl" />
      </div>
      
      {/* Search Skeleton */}
      <div className="flex flex-col gap-4 mb-8 sm:flex-row sm:items-center sm:justify-between">
        <Skeleton className="w-full h-12 sm:w-80 rounded-xl" />
        <Skeleton className="w-24 h-10 rounded-xl" />
      </div>

      {/* Category Grid Skeleton */}
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

const CategoryCard = ({ item }) => {
  return (
    <motion.div variants={cardVariants}>
      <Link href={`/category/${item.id}`} className="block h-full group">
        <div className="flex flex-col w-full h-full overflow-hidden transition-all duration-300 border border-gray-200 bg-white rounded-xl hover:border-blue-300 hover:-translate-y-1">
          <div className="relative overflow-hidden">
            <img
              src={item.imageUrl || "/assets/banner-authpage.png"}
              alt={item.name}
              className="object-cover w-full h-48 transition-transform duration-500 group-hover:scale-110"
              onError={(e) => {
                e.currentTarget.onerror = null
                e.currentTarget.src = "/assets/error.png"
              }}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent"></div>
            <div className="absolute bottom-2 left-2 right-2 sm:bottom-3 sm:left-3 sm:right-3">
              <div className="inline-flex items-center px-1.5 py-0.5 sm:px-2 sm:py-1 mb-1 text-xs font-semibold text-white bg-blue-600 rounded-full">
                <Mountain className="w-2.5 h-2.5 sm:w-3 sm:h-3 mr-1" />
                Category
              </div>
              <h3 className="text-sm sm:text-base font-bold text-white drop-shadow-lg transition-transform duration-300 group-hover:translate-y-[-2px] line-clamp-2">
                {item.name}
              </h3>
            </div>
          </div>
          <div className="flex flex-col flex-grow p-3 sm:p-4">
            <div className="flex items-center justify-between mb-2 sm:mb-3">
              <Badge className="bg-blue-100 text-blue-800 text-xs">
                <Compass className="w-2.5 h-2.5 sm:w-3 sm:h-3 mr-1" />
                {item.activityCount || 0} {item.activityCount === 1 ? 'Activity' : 'Activities'}
              </Badge>
            </div>
            <p className="text-xs sm:text-sm text-gray-600 line-clamp-3">
              {item.description || "Explore amazing activities in this category."}
            </p>
            <div className="flex-grow" />
            <Button size="sm" className="w-full mt-3 sm:mt-4 text-white transition-all duration-200 bg-blue-600 hover:bg-blue-700 rounded-lg hover:scale-105">
              Explore Category
            </Button>
          </div>
        </div>
      </Link>
    </motion.div>
  )
}

const CategoryPage = () => {
  const { user, loading: authLoading } = useAuth()
  const { category, isLoading: isCategoryLoading, error } = useCategory()
  const { activity, isLoading: isActivityLoading } = useActivity()
  const router = useRouter()
  const [currentPage, setCurrentPage] = useState(1)
  const [searchQuery, setSearchQuery] = useState("")
  const [hasMounted, setHasMounted] = useState(false)

  useEffect(() => {
    setHasMounted(true)
  }, [])

  // Calculate activity count per category
  const categoriesWithActivityCount = useMemo(() => {
    if (!category || !activity) return []
    
    return category.map(cat => {
      const activityCount = activity.filter(act => 
        act.category?.id === cat.id || act.category?.name === cat.name
      ).length
      
      return {
        ...cat,
        activityCount
      }
    })
  }, [category, activity])

  const filteredCategories = useMemo(() => {
    if (!categoriesWithActivityCount) return []
    if (!searchQuery.trim()) return categoriesWithActivityCount

    return categoriesWithActivityCount.filter((cat) =>
      cat.name.toLowerCase().includes(searchQuery.toLowerCase())
    )
  }, [categoriesWithActivityCount, searchQuery])

  const totalPages = Math.ceil(filteredCategories.length / ITEMS_PER_PAGE)
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE
  const endIndex = startIndex + ITEMS_PER_PAGE
  const currentCategories = filteredCategories.slice(startIndex, endIndex)

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

  const isLoading = authLoading || isCategoryLoading || isActivityLoading || !hasMounted

  if (isLoading) {
    return <CategoryPageSkeleton />
  }

  if (error) {
    return (
      <div className="container py-8 mx-auto text-center">
        <div className="flex flex-col items-center justify-center min-h-[60vh]">
          <div className="flex items-center justify-center w-24 h-24 mx-auto mb-6 bg-red-100 rounded-full">
            <Frown className="w-12 h-12 text-red-600" />
          </div>
          <h1 className="mb-4 text-3xl font-bold text-gray-900">Error Loading Categories</h1>
          <p className="text-gray-600">Failed to load categories. Please try again later.</p>
        </div>
      </div>
    )
  }

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key="category-page"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="min-h-screen py-8 bg-white"
      >
        <div className="container px-4 mx-auto max-w-7xl sm:px-6 lg:px-8">
          <div className="mb-8 text-center">
            <h1 className="mb-4 text-2xl font-bold text-gray-900 sm:text-3xl lg:text-4xl">
              Explore <span className="text-transparent bg-gradient-to-r from-blue-600 to-blue-700 bg-clip-text">Categories</span>
            </h1>
            <p className="text-sm text-gray-600 max-w-2xl mx-auto sm:text-base">
              Find the perfect adventure by browsing through our curated categories
            </p>
          </div>

          {/* Search */}
          <div className="mb-8">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 w-4 h-4 -translate-y-1/2 text-gray-400 pointer-events-none" />
              <input
                type="text"
                placeholder="Search categories..."
                className="w-full pl-10 pr-4 py-3 text-base border border-gray-200 rounded-xl bg-white/80 backdrop-blur-sm transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 hover:border-gray-300 hover:bg-white/90"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            
            {searchQuery ? (
              <p className="mt-3 text-sm text-gray-600">
                Found <span className="font-semibold text-blue-600">{filteredCategories.length}</span> categories for "{searchQuery}"
              </p>
            ) : (
              <p className="mt-3 text-sm text-gray-600">
                Browse through our collection of travel categories
              </p>
            )}
          </div>

          {currentCategories.length === 0 ? (
            <div className="py-20 text-center">
              <div className="flex items-center justify-center w-24 h-24 mx-auto mb-6 bg-blue-100 rounded-full">
                <Frown className="w-12 h-12 text-blue-600" />
              </div>
              <h3 className="mb-2 text-xl font-semibold text-gray-900">No categories found</h3>
              <p className="text-gray-600">
                {searchQuery
                  ? `No categories found for "${searchQuery}". Try different keywords.`
                  : "No categories available at the moment. Check back later!"}
              </p>
            </div>
          ) : (
            <motion.div
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
            >
              {currentCategories.map((item) => (
                <CategoryCard key={item.id} item={item} />
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

export default CategoryPage
