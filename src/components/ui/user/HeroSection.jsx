"use client"

import React, { useState, useMemo, useCallback } from "react"
import { useRouter } from "next/navigation"
import { useCategory } from "@/hooks/useCategory"
import { useBanner } from "@/hooks/useBanner"
import { useActivity } from "@/hooks/useActivity"
import { usePromo } from "@/hooks/usePromo"
import { motion } from "framer-motion"
import Image from "next/image"
import CountUp from "react-countup"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Search, Sparkles } from "lucide-react"

// Optimized image utility functions
const PLACEHOLDER_DATA_URL =
  "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwMCIgaGVpZ2h0PSI2MDAiIHZpZXdCb3g9IjAgMCAxMDAwIDYwMCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjEwMDAiIGhlaWdodD0iNjAwIiBmaWxsPSIjRjNGNEY2Ii8+CjxwYXRoIGQ9Ik00ODcuNSAzMTJIMzc1TDQzNy41IDI1MEw1NjIuNSAyNTBMNTAwIDMxMkg0ODcuNVoiIGZpbGw9IiNEMUQ1REIiLz4KPGNpcmNsZSBjeD0iNDM3LjUiIGN5PSIyNTAiIHI9IjEyLjUiIGZpbGw9IiNEMUQ1REIiLz4KPC9zdmc+"

const isExternalImage = (src) => {
  return src && (src.startsWith("http://") || src.startsWith("https://"))
}

const getImageProps = (src, alt, hasError = false) => {
  if (!src || hasError) {
    return {
      src: PLACEHOLDER_DATA_URL,
      alt: alt || "Placeholder image",
      unoptimized: true,
    }
  }

  if (isExternalImage(src)) {
    return { src, alt, unoptimized: true }
  }

  return { src, alt }
}

const HeroSection = React.memo(() => {
  const router = useRouter()
  const { category: categories, isLoading: isCategoryLoading } = useCategory()
  const { banner: banners, isLoading: isBannerLoading } = useBanner()
  const { activity: activities, isLoading: isActivityLoading } = useActivity()
  const { promo: promos, isLoading: isPromoLoading } = usePromo()

  const [searchQuery, setSearchQuery] = useState("")
  const [searchType, setSearchType] = useState("all")
  const [imageError, setImageError] = useState(false)

  const handleSearch = useCallback(() => {
    if (!searchQuery.trim()) return
    
    let searchPath = `/search?q=${encodeURIComponent(searchQuery.trim())}`
    
    if (searchType !== "all") {
      searchPath += `&type=${searchType}`
    }
    
    router.push(searchPath)
  }, [searchQuery, searchType, router])

  const handleKeyDown = useCallback(
    (e) => {
      if (e.key === "Enter") {
        handleSearch()
      }
    },
    [handleSearch],
  )

  const handleImageError = useCallback(() => {
    setImageError(true)
  }, [])

  const heroBanner = useMemo(() => {
    return banners?.find((b) => b.id === "9b0f60df-4e08-421e-b2b5-10c2aa516a97")
  }, [banners])

  const isLoading = isBannerLoading

  return (
    <section className="relative w-full h-[70vh] md:h-[85vh] overflow-hidden" aria-label="Hero section">
      {/* Background Image with optimized loading */}
      {!isLoading && (
        <Image
          {...getImageProps(heroBanner?.imageUrl || "/assets/header.png", "Travel destination background", imageError)}
          fill
          className="object-cover transition-opacity duration-500"
          priority
          sizes="100vw"
          quality={90}
          placeholder="blur"
          blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAAIAAoDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAhEAACAQMDBQAAAAAAAAAAAAABAgMABAUGIWGRkqGx0f/EABUBAQEAAAAAAAAAAAAAAAAAAAMF/8QAGhEAAgIDAAAAAAAAAAAAAAAAAAECEgMRkf/aAAwDAQACEQMRAD8AltJagyeH0AthI5xdrLcNM91BF5pX2HaH9bcfaSXWGaRmknyJckliyjqTzSlT54b6bk+h0R//2Q=="
          onError={handleImageError}
        />
      )}

      {/* Loading skeleton */}
      {isLoading && (
        <div className="absolute inset-0 bg-gradient-to-br from-blue-100 via-blue-50 to-blue-100 animate-pulse" />
      )}

      {/* Gradient Overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-black/60 via-black/40 to-black/60" />

      {/* Floating Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute w-20 h-20 rounded-full top-20 left-10 bg-white/10 blur-xl animate-pulse" />
        <div className="absolute w-32 h-32 delay-1000 rounded-full top-40 right-20 bg-blue-400/20 blur-2xl animate-pulse" />
        <div className="absolute w-24 h-24 rounded-full bottom-32 left-1/4 bg-blue-400/20 blur-xl animate-pulse delay-2000" />
      </div>

      <div className="relative z-10 flex flex-col items-center justify-center w-full h-full p-4 text-center text-white">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="max-w-5xl mx-auto"
        >
          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="inline-flex items-center gap-2 px-4 py-2 mb-6 text-sm font-medium border rounded-full bg-white/20 backdrop-blur-sm border-white/30"
          >
            <Sparkles className="w-4 h-4" />
            Discover Amazing Adventures
          </motion.div>

          {/* Main Heading */}
          <h1 className="mb-6 text-3xl font-extrabold leading-tight tracking-tight md:text-5xl lg:text-6xl xl:text-7xl">
            Find Your{" "}
            <span className="text-transparent bg-gradient-to-r from-blue-400 to-blue-600 bg-clip-text">
              Next Adventure
            </span>
          </h1>

          {/* Subtitle */}
          <p className="max-w-3xl mx-auto mb-10 text-lg leading-relaxed md:text-xl lg:text-2xl text-white/90">
            Discover amazing activities, unique places, and unforgettable experiences for your perfect getaway.
          </p>

          {/* Search Section - 3 Parts */}
          <div className="flex w-full max-w-4xl mx-auto bg-white/95 backdrop-blur-sm rounded-2xl shadow-2xl overflow-hidden">
            {/* Left: Dropdown */}
            <div className="flex-shrink-0">
              <Select value={searchType} onValueChange={setSearchType}>
                <SelectTrigger className="h-12 md:h-16 px-4 md:px-6 border-0 bg-transparent text-gray-700 hover:bg-gray-50 rounded-none focus:ring-0 text-sm md:text-base">
                  <SelectValue placeholder="Search type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All</SelectItem>
                  <SelectItem value="activities">Activities</SelectItem>
                  <SelectItem value="categories">Categories</SelectItem>
                  <SelectItem value="promos">Promos</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Middle: Search Input */}
            <div className="flex-grow relative">
              <Input
                placeholder="Search activities, categories, promos..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={handleKeyDown}
                className="h-12 md:h-16 px-4 md:px-6 text-sm md:text-base border-0 bg-transparent text-gray-700 placeholder-gray-500 focus:ring-0 focus:outline-none"
              />
            </div>

            {/* Right: Search Button */}
            <Button
              size="lg"
              className="h-12 md:h-16 px-6 md:px-8 text-sm md:text-base transition-all duration-300 border-0 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 rounded-none"
              onClick={handleSearch}
              aria-label="Search"
            >
              <Search className="w-4 h-4 md:w-5 md:h-5" aria-hidden="true" />
            </Button>
          </div>

          {/* Quick Stats */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="flex flex-wrap items-center justify-center gap-8 mt-12 text-white/80"
          >
            <div className="text-center">
              <div className="text-2xl font-bold text-white">
                <CountUp start={0} end={1000} duration={2.5} suffix="+" />
              </div>
              <div className="text-sm">Activities</div>
            </div>
            <div className="w-px h-8 bg-white/30" />
            <div className="text-center">
              <div className="text-2xl font-bold text-white">
                <CountUp start={0} end={50} duration={2.5} suffix="+" />
              </div>
              <div className="text-sm">Destinations</div>
            </div>
            <div className="w-px h-8 bg-white/30" />
            <div className="text-center">
              <div className="text-2xl font-bold text-white">
                <CountUp start={0} end={10000} duration={2.5} suffix="+" />
              </div>
              <div className="text-sm">Happy Travelers</div>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  )
})

HeroSection.displayName = "HeroSection"

export default HeroSection
