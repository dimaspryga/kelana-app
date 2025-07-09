"use client"

import { useState, useMemo, useCallback, useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { usePromo } from "@/hooks/usePromo"
import { useAuth } from "@/context/AuthContext"
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { motion, AnimatePresence } from "framer-motion"
import { Search, Tag, Calendar, Gift, Copy, CheckCircle2 } from "lucide-react"
import { toast } from "sonner"
import { Skeleton } from "@/components/ui/skeleton"
import PromoBannerSection from "@/components/ui/user/PromoBannerSection"

const ITEMS_PER_PAGE = 12

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

const PromoPageSkeleton = () => (
  <div className="min-h-screen py-8 bg-white">
    <div className="container px-4 mx-auto max-w-7xl">
      <div className="mb-8">
        <Skeleton className="w-1/3 h-6 mb-2 rounded-lg" />
        <Skeleton className="w-1/2 h-4 rounded-lg" />
      </div>
      
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, index) => (
          <div key={index} className="overflow-hidden transition-all duration-300 border border-gray-200 bg-white rounded-lg hover:border-blue-300 hover:scale-[1.02]">
            <div className="p-3 space-y-2">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-0">
                <Skeleton className="w-20 h-4 rounded" />
                <Skeleton className="w-12 h-4 rounded" />
              </div>
              <Skeleton className="w-3/4 h-3 rounded" />
              <div className="space-y-1">
                <Skeleton className="w-full h-2.5 rounded" />
                <Skeleton className="w-2/3 h-2.5 rounded" />
              </div>
              <Skeleton className="w-full h-8 rounded" />
              <Skeleton className="w-full h-7 rounded" />
            </div>
          </div>
        ))}
      </div>
    </div>
  </div>
)

const PromoCard = ({ item, onCopyCode }) => {
  const discountValue = item.promo_discount_percentage
    ? `${item.promo_discount_percentage}%`
    : formatCurrency(item.promo_discount_price)

  const expiryDate = item.endDate
    ? new Date(item.endDate).toLocaleDateString("en-US", {
        day: "numeric",
        month: "short",
        year: "numeric",
      })
    : "Limited time"

  const isExpired = item.endDate && new Date(item.endDate) < new Date()

  return (
    <motion.div variants={cardVariants}>
      <Link href={`/promo/${item.id}`} className="block h-full group">
        <div
          className={`relative overflow-hidden transition-all duration-300 bg-white border border-gray-200 rounded-lg hover:border-blue-300 hover:-translate-y-1 group ${
            isExpired ? "opacity-60" : ""
          }`}
        >
          {isExpired && (
            <div className="absolute z-10 px-2 py-1 text-xs font-bold text-white bg-red-500 rounded-full top-2 right-2">
              EXPIRED
            </div>
          )}

          <div className="p-3">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-2 gap-2 sm:gap-0">
              <Badge className={`${isExpired ? "bg-gray-100 text-gray-600" : "bg-blue-100 text-blue-800"} text-xs`}>
                <Tag className="w-2.5 h-2.5 mr-1" />
                Promo Code
              </Badge>
              <div className={`text-sm sm:text-base font-bold ${isExpired ? "text-gray-400" : "text-blue-600"}`}>
                {discountValue}
              </div>
            </div>

            {/* Title */}
            <h3 className={`text-sm font-bold mb-2 line-clamp-2 ${isExpired ? "text-gray-500" : "text-gray-900"}`}>
              {item.title || "Special Discount"}
            </h3>

            {/* Details */}
            <div className="mb-2 space-y-1">
              <div className="flex items-center text-xs text-gray-600">
                <CheckCircle2 className="w-3 h-3 mr-1.5 text-green-500" />
                <span>Min. purchase {formatCurrency(item.minimum_claim_price)}</span>
              </div>
              <div className="flex items-center text-xs text-gray-600">
                <Calendar className="w-3 h-3 mr-1.5 text-blue-500" />
                <span>Valid until {expiryDate}</span>
              </div>
            </div>

            {/* Promo Code */}
            <div className="mb-2">
              <div
                className={`flex items-center justify-between p-2 border border-dashed rounded ${
                  isExpired ? "border-gray-200 bg-gray-50" : "border-blue-200 bg-blue-50"
                }`}
              >
                <span className={`font-mono font-bold text-sm ${isExpired ? "text-gray-500" : "text-blue-800"}`}>
                  {item.promo_code}
                </span>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={(e) => {
                    e.preventDefault()
                    e.stopPropagation()
                    onCopyCode(item.promo_code)
                  }}
                  disabled={isExpired}
                  className={`${
                    isExpired ? "text-gray-400" : "text-blue-600 hover:text-blue-700 hover:bg-blue-100"
                  } rounded h-6 w-6 p-0`}
                >
                  <Copy className="w-3 h-3" />
                </Button>
              </div>
            </div>

            {/* Action Button */}
            <Button
              size="sm"
              className={`w-full rounded font-semibold transition-all duration-200 text-sm ${
                isExpired
                  ? "bg-gray-300 text-gray-500 cursor-not-allowed hover:bg-gray-300"
                  : "bg-blue-600 hover:bg-blue-700 text-white"
              }`}
              disabled={isExpired}
              onClick={(e) => {
                if (isExpired) {
                  e.preventDefault()
                  e.stopPropagation()
                }
              }}
            >
              {isExpired ? "Expired" : "Use This Promo"}
            </Button>
          </div>
        </div>
      </Link>
    </motion.div>
  )
}

const PromoPage = () => {
  const { user, loading: authLoading } = useAuth()
  const { promo, isLoading: isPromoLoading, error } = usePromo()
  const router = useRouter()
  const [currentPage, setCurrentPage] = useState(1)
  const [searchQuery, setSearchQuery] = useState("")
  const [hasMounted, setHasMounted] = useState(false)

  useEffect(() => {
    setHasMounted(true)
  }, [])

  const handleCopyCode = useCallback((code) => {
    navigator.clipboard.writeText(code)
    toast.success("Promo code copied to clipboard!")
  }, [])

  const filteredPromos = useMemo(() => {
    if (!promo) return []
    if (!searchQuery.trim()) return promo

    return promo.filter((promoItem) =>
      promoItem.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      promoItem.promo_code.toLowerCase().includes(searchQuery.toLowerCase())
    )
  }, [promo, searchQuery])

  const totalPages = Math.ceil(filteredPromos.length / ITEMS_PER_PAGE)
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE
  const endIndex = startIndex + ITEMS_PER_PAGE
  const currentPromos = filteredPromos.slice(startIndex, endIndex)

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

  const isLoading = authLoading || isPromoLoading || !hasMounted

  if (isLoading) {
    return <PromoPageSkeleton />
  }

  if (error) {
    return (
      <div className="container py-8 mx-auto text-center">
        <div className="flex flex-col items-center justify-center min-h-[60vh]">
          <div className="flex items-center justify-center w-24 h-24 mx-auto mb-6 bg-red-100 rounded-full">
            <svg className="w-12 h-12 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
              />
            </svg>
          </div>
          <h1 className="mb-4 text-3xl font-bold text-gray-900">Error Loading Promos</h1>
          <p className="text-gray-600">Failed to load promos. Please try again later.</p>
        </div>
      </div>
    )
  }

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key="promo-page"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="min-h-screen py-8 bg-white"
      >
        <div className="container px-4 mx-auto max-w-7xl">
          <div className="mb-8 text-center">
            <h1 className="mb-4 text-2xl font-bold text-gray-900 sm:text-3xl lg:text-4xl">
              Special <span className="text-transparent bg-gradient-to-r from-blue-600 to-blue-700 bg-clip-text">Promos</span>
            </h1>
            <p className="text-sm text-gray-600 max-w-2xl mx-auto sm:text-base">
              Discover amazing deals and discounts on your favorite activities
            </p>
          </div>

          {/* Promo Banner Section */}
          <div className="mb-8">
            <PromoBannerSection />
          </div>

          {/* Search */}
          <div className="mb-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 w-4 h-4 -translate-y-1/2 text-gray-400 pointer-events-none" />
              <input
                type="text"
                placeholder="Search promos..."
                className="w-full pl-10 pr-4 py-2.5 text-sm border border-gray-200 rounded-lg bg-white/80 backdrop-blur-sm transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 hover:border-gray-300 hover:bg-white/90"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            
            {searchQuery ? (
              <p className="mt-2 text-xs text-gray-600">
                Found <span className="font-semibold text-blue-600">{filteredPromos.length}</span> promos for "{searchQuery}"
              </p>
            ) : (
              <p className="mt-2 text-xs text-gray-600">
                Discover amazing deals and discounts for your next adventure
              </p>
            )}
          </div>

          {currentPromos.length === 0 ? (
            <div className="py-16 text-center">
              <div className="flex items-center justify-center w-20 h-20 mx-auto mb-4 bg-blue-100 rounded-full">
                <Gift className="w-10 h-10 text-blue-600" />
              </div>
              <h3 className="mb-2 text-lg font-semibold text-gray-900">No promos found</h3>
              <p className="text-sm text-gray-600">
                {searchQuery
                  ? `No promos found for "${searchQuery}". Try different keywords.`
                  : "No promos available at the moment. Check back later for new offers!"}
              </p>
            </div>
          ) : (
            <motion.div
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3"
            >
              {currentPromos.map((item) => (
                <PromoCard key={item.id} item={item} onCopyCode={handleCopyCode} />
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

export default PromoPage
