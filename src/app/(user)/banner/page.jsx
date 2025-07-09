"use client"

import { useState, useMemo } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useBanner } from "@/hooks/useBanner"
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination"
import { Skeleton } from "@/components/ui/skeleton"
import { Input } from "@/components/ui/input"
import { Frown, Search, Sparkles, ImageIcon } from "lucide-react"
import { motion } from "framer-motion"

const ITEMS_PER_PAGE = 8

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.08 },
  },
}

const cardVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: { duration: 0.5, ease: "easeOut" },
  },
}

const BannerPageSkeleton = () => (
  <div className="min-h-screen bg-white">
    <div className="container px-4 py-8 mx-auto max-w-7xl sm:px-6 lg:px-8">
      <div className="mb-8">
        <Skeleton className="w-1/3 h-6 mb-2 rounded-lg" />
        <Skeleton className="w-1/2 h-4 rounded-lg" />
      </div>
      
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, index) => (
          <div key={index} className="overflow-hidden transition-all duration-300 border border-gray-200 bg-white rounded-lg hover:border-blue-300 hover:scale-[1.02]">
            <Skeleton className="w-full aspect-[4/3] rounded-t-lg" />
            <div className="p-3 space-y-2">
              <Skeleton className="w-3/4 h-3 rounded" />
              <Skeleton className="w-1/2 h-2.5 rounded" />
              <div className="flex items-center justify-between">
                <Skeleton className="w-1/3 h-3 rounded" />
                <Skeleton className="w-12 h-7 rounded" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  </div>
)

const BannerPage = () => {
  const { banner, isLoading, error } = useBanner()
  const router = useRouter()
  const [currentPage, setCurrentPage] = useState(1)
  const [searchQuery, setSearchQuery] = useState("")

  const filteredBanners = useMemo(() => {
    if (!banner) return []
    if (!searchQuery) return banner
    return banner.filter((b) => b.name.toLowerCase().includes(searchQuery.toLowerCase()))
  }, [banner, searchQuery])

  const indexOfLastItem = currentPage * ITEMS_PER_PAGE
  const indexOfFirstItem = indexOfLastItem - ITEMS_PER_PAGE
  const currentBanners = filteredBanners.slice(indexOfFirstItem, indexOfLastItem)
  const totalPages = Math.ceil(filteredBanners.length / ITEMS_PER_PAGE)

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber)
    window.scrollTo({ top: 0, behavior: "smooth" })
  }

  const getPageNumbers = () => {
    const pageNumbers = []
    const maxPagesToShow = 5
    const halfPagesToShow = Math.floor(maxPagesToShow / 2)

    if (totalPages <= maxPagesToShow) {
      for (let i = 1; i <= totalPages; i++) {
        pageNumbers.push(i)
      }
    } else {
      pageNumbers.push(1)
      let startPage = Math.max(2, currentPage - halfPagesToShow)
      let endPage = Math.min(totalPages - 1, currentPage + halfPagesToShow)

      if (currentPage - halfPagesToShow <= 2) {
        endPage = Math.min(totalPages - 1, maxPagesToShow - 2)
      }
      if (currentPage + halfPagesToShow >= totalPages - 1) {
        startPage = Math.max(2, totalPages - (maxPagesToShow - 3))
      }
      if (startPage > 2) {
        pageNumbers.push("...")
      }
      for (let i = startPage; i <= endPage; i++) {
        pageNumbers.push(i)
      }
      if (endPage < totalPages - 1) {
        pageNumbers.push("...")
      }
      pageNumbers.push(totalPages)
    }
    return pageNumbers
  }

  if (isLoading) {
    return <BannerPageSkeleton />
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
        <div className="flex items-center justify-center w-24 h-24 mx-auto mb-6 bg-red-100 rounded-full">
          <Frown className="w-12 h-12 text-red-500" />
        </div>
        <h2 className="mt-4 text-2xl font-bold text-gray-900 md:text-3xl tracking-tight">Error Loading Banners</h2>
        <p className="mt-2 text-lg text-red-500">{error.message}</p>
      </div>
    )
  }

  if (!banner || banner.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
        <div className="flex items-center justify-center w-24 h-24 mx-auto mb-6 bg-blue-100 rounded-full">
          <ImageIcon className="w-12 h-12 text-blue-600" />
        </div>
        <h1 className="mb-4 text-3xl font-bold text-gray-900 md:text-4xl tracking-tight">No Banners Available</h1>
        <p className="text-xl text-gray-600">Check back later for new promotional banners.</p>
      </div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="min-h-screen bg-white"
    >
      <div className="flex flex-col px-4 py-12 mx-auto max-w-7xl sm:px-6 lg:px-8">
        <div className="mb-8 text-center">
          <h1 className="mb-4 text-2xl font-bold tracking-tight text-gray-900 sm:text-3xl lg:text-4xl">
            Promotional <span className="text-blue-600">Banners</span>
          </h1>
          <p className="max-w-3xl mx-auto mb-6 text-sm text-gray-600 sm:text-base">
            Discover our latest offers and featured destinations
          </p>

          {/* Enhanced Search */}
          <div className="mb-6">
            <div className="relative">
              <Search className="absolute w-4 h-4 text-gray-400 transform -translate-y-1/2 left-3 top-1/2 pointer-events-none" />
              <input
                type="text"
                placeholder="Search banners..."
                className="w-full pl-10 pr-4 py-2.5 text-sm border border-gray-200 rounded-lg bg-white/80 backdrop-blur-sm transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 hover:border-gray-300 hover:bg-white/90"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            
            {searchQuery ? (
              <p className="mt-2 text-xs text-gray-600">
                Found <span className="font-semibold text-blue-600">{filteredBanners.length}</span> banners for "{searchQuery}"
              </p>
            ) : (
              <p className="mt-2 text-xs text-gray-600">
                Explore our featured travel destinations and experiences
              </p>
            )}
          </div>
        </div>

        {/* Results Summary */}
        <div className="flex items-center justify-between mb-6">
          <div className="text-gray-600">
            {searchQuery ? (
              <p className="text-sm">
                Found <span className="font-semibold text-blue-600">{filteredBanners.length}</span> banners for "
                {searchQuery}"
              </p>
            ) : (
              <p className="text-sm">
                Showing <span className="font-semibold text-blue-600">{filteredBanners.length}</span> banners
              </p>
            )}
          </div>
          <div className="px-3 py-1.5 text-xs text-gray-500 border border-blue-100 rounded-full bg-white/80 backdrop-blur-sm">
            Page {currentPage} of {totalPages}
          </div>
        </div>

        {currentBanners.length === 0 ? (
          <div className="py-16 text-center">
            <div className="flex items-center justify-center w-20 h-20 mx-auto mb-4 bg-blue-100 rounded-full">
              <Search className="w-10 h-10 text-blue-600" />
            </div>
            <h3 className="mb-2 text-lg font-semibold text-gray-900 tracking-tight">No banners found</h3>
            <p className="text-sm text-gray-600">
              {searchQuery
                ? `No banners found for "${searchQuery}". Try different keywords.`
                : "No banners available at the moment."}
            </p>
          </div>
        ) : (
          <motion.div
            className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            {currentBanners.map((item) => (
              <motion.div key={item.id} variants={cardVariants}>
                <Link href={`/banner/${item.id}`}>
                  <div className="relative w-full h-48 overflow-hidden transition-all duration-300 border border-gray-200 bg-white rounded-lg hover:border-blue-300 hover:-translate-y-1 group">
                    <img
                      alt={item.name}
                      className="absolute inset-0 object-cover w-full h-full transition-transform duration-500 group-hover:scale-110"
                      src={item.imageUrl || "/assets/error.png"}
                      onError={(e) => {
                        e.currentTarget.onerror = null
                        e.currentTarget.src = "/assets/error.png"
                      }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent"></div>
                    <div className="relative flex flex-col items-start justify-end h-full p-3">
                      <div className="inline-flex items-center px-2 py-1 mb-2 text-xs font-semibold text-white bg-blue-600 rounded-full shadow-lg">
                        <Sparkles className="w-2.5 h-2.5 mr-1" />
                        Featured
                      </div>
                      <h3
                        className="text-sm font-bold text-white transition-colors duration-200 shadow-lg drop-shadow-md group-hover:text-blue-200"
                        title={item.name}
                      >
                        {item.name}
                      </h3>
                    </div>
                  </div>
                </Link>
              </motion.div>
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
                    if (currentPage > 1) {
                      handlePageChange(currentPage - 1)
                    }
                  }}
                  className={`${currentPage === 1 ? "pointer-events-none opacity-50" : ""} hover:bg-blue-50 hover:text-blue-600`}
                />
              </PaginationItem>

              {getPageNumbers().map((page, index) => (
                <PaginationItem key={typeof page === "number" ? `page-${page}` : `ellipsis-${index}`}>
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
                      className={
                        currentPage === page
                          ? "bg-blue-600 text-white hover:bg-blue-700"
                          : "hover:bg-blue-50 hover:text-blue-600"
                      }
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
                    if (currentPage < totalPages) {
                      handlePageChange(currentPage + 1)
                    }
                  }}
                  className={`${currentPage === totalPages ? "pointer-events-none opacity-50" : ""} hover:bg-blue-50 hover:text-blue-600`}
                />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        )}
      </div>
    </motion.div>
  )
}

export default BannerPage
