"use client"

import React, { useRef, useState, useCallback } from "react"
import Link from "next/link"
import Image from "next/image"
import { useBanner } from "@/hooks/useBanner"
import { useAuth } from "@/context/AuthContext"
import { Button } from "@/components/ui/button"
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel"
import Autoplay from "embla-carousel-autoplay"
import { motion, AnimatePresence } from "framer-motion"
import { Play, Pause, Sparkles } from "lucide-react"

// Optimized image utility functions
const PLACEHOLDER_DATA_URL =
  "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTIwMCIgaGVpZ2h0PSI0MDAiIHZpZXdCb3g9IjAgMCAxMjAwIDQwMCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjEyMDAiIGhlaWdodD0iNDAwIiBmaWxsPSIjRjNGNEY2Ii8+CjxwYXRoIGQ9Ik01ODcuNSAyMTJINDc1TDUzNy41IDE1MEw2NjIuNSAxNTBMNjAwIDIxMkg1ODcuNVoiIGZpbGw9IiNEMUQ1REIiLz4KPGNpcmNsZSBjeD0iNTM3LjUiIGN5PSIxNTAiIHI9IjEyLjUiIGZpbGw9IiNEMUQ1REIiLz4KPC9zdmc+"

const isExternalImage = (src) => {
  return src && (src.startsWith("http://") || src.startsWith("https://"))
}

const getImageProps = (src, alt, hasError = false) => {
  if (!src || hasError) {
    return {
      src: PLACEHOLDER_DATA_URL,
      alt: alt || "Banner placeholder",
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
    transition: { staggerChildren: 0.1 },
  },
}

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: { duration: 0.5, ease: "easeOut" },
  },
}

const BannerSectionSkeleton = () => (
  <div className="py-8 bg-white">
    <div className="px-4 mx-auto max-w-7xl sm:px-6 lg:px-8">
      <div className="relative">
        <div className="relative overflow-hidden border border-gray-200 bg-white rounded-2xl">
          <div className="w-full aspect-[3/1] bg-gradient-to-br from-gray-200 via-gray-100 to-gray-200 animate-pulse" />
          <div className="absolute inset-0 flex flex-col items-start justify-end p-6 md:p-8 bg-gradient-to-t from-black/20 via-transparent to-transparent">
            <div className="w-32 h-8 mb-3 rounded-full bg-gradient-to-r from-blue-200 via-blue-100 to-blue-200 animate-pulse" />
            <div className="w-64 h-8 md:h-10 rounded-xl bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 animate-pulse" />
          </div>
        </div>
        
        {/* Navigation buttons skeleton */}
        <div className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/90 border border-gray-200 animate-pulse" />
        <div className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/90 border border-gray-200 animate-pulse" />
        
        {/* Play/Pause button skeleton */}
        <div className="absolute top-4 right-4 w-10 h-10 rounded-xl bg-white/90 border border-gray-200 animate-pulse" />
      </div>
    </div>
  </div>
)

const BannerSection = React.memo(() => {
  const { banner, isLoading: isBannerLoading } = useBanner()
  const { loading: isAuthLoading } = useAuth()
  const [isPlaying, setIsPlaying] = useState(true)
  const [imageErrors, setImageErrors] = useState(new Set())

  const plugin = useRef(
    Autoplay({
      delay: 5000,
      stopOnInteraction: true,
      stopOnMouseEnter: true,
    }),
  )

  const handleImageError = useCallback((bannerId) => {
    setImageErrors((prev) => new Set([...prev, bannerId]))
  }, [])

  const isLoading = isBannerLoading || isAuthLoading

  const toggleAutoplay = useCallback(() => {
    if (isPlaying) {
      plugin.current.stop()
    } else {
      plugin.current.play()
    }
    setIsPlaying(!isPlaying)
  }, [isPlaying])

  if (isLoading) {
    return <BannerSectionSkeleton />
  }

  if (!banner || banner.length === 0) {
    return null
  }

  return (
    <section className="py-8 bg-white" aria-label="Featured banners">
      <div className="px-4 mx-auto max-w-7xl sm:px-6 lg:px-8">
        <AnimatePresence mode="wait">
          <motion.div
            key="content"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            className="relative"
          >
            <Carousel
              opts={{
                align: "center",
                loop: true,
              }}
              plugins={[plugin.current]}
              onMouseEnter={plugin.current.stop}
              onMouseLeave={plugin.current.reset}
              className="w-full"
            >
              <CarouselContent>
                {banner.map((bannerItem, index) => (
                  <CarouselItem key={bannerItem.id} className="basis-full">
                    <Link href={`/banner/${bannerItem.id}`} aria-label={`View banner: ${bannerItem.name}`}>
                      <div className="relative overflow-hidden transition-all duration-300 border border-gray-200 bg-white rounded-2xl group hover:border-blue-300 hover:scale-[1.01]">
                        <Image
                          {...getImageProps(bannerItem.imageUrl, bannerItem.name, imageErrors.has(bannerItem.id))}
                          width={1200}
                          height={400}
                          className="w-full aspect-[3/1] object-cover transition-transform duration-500 group-hover:scale-105"
                          priority={index === 0}
                          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 90vw, 1200px"
                          quality={90}
                          placeholder="blur"
                          blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAAIAAoDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAhEAACAQMDBQAAAAAAAAAAAAABAgMABAUGIWGRkqGx0f/EABUBAQEAAAAAAAAAAAAAAAAAAAMF/8QAGhEAAgIDAAAAAAAAAAAAAAAAAAECEgMRkf/aAAwDAQACEQMRAD8AltJagyeH0AthI5xdrLcNM91BF5pX2HaH9bcfaSXWGaRmknyJckliyjqTzSlT54b6bk+h0R//2Q=="
                          onError={() => handleImageError(bannerItem.id)}
                        />
                        <div className="absolute inset-0 flex flex-col items-start justify-end p-6 md:p-8 bg-gradient-to-t from-black/70 via-black/20 to-transparent">
                          <div className="inline-flex items-center px-3 py-1 mb-3 text-sm font-semibold text-white bg-blue-600 rounded-full">
                            <Sparkles className="w-4 h-4 mr-2" />
                            Featured Banner
                          </div>
                          <h3 className="text-lg md:text-xl lg:text-2xl font-bold text-white drop-shadow-lg transition-transform duration-300 group-hover:translate-y-[-2px] line-clamp-2">
                            {bannerItem.name}
                          </h3>
                        </div>
                      </div>
                    </Link>
                  </CarouselItem>
                ))}
              </CarouselContent>
              
              {banner.length > 1 && (
                <>
                  <CarouselPrevious className="absolute left-4 top-1/2 -translate-y-1/2 z-10 bg-white/90 backdrop-blur-sm border-blue-200 hover:bg-blue-50" />
                  <CarouselNext className="absolute right-4 top-1/2 -translate-y-1/2 z-10 bg-white/90 backdrop-blur-sm border-blue-200 hover:bg-blue-50" />
                </>
              )}
            </Carousel>

            {banner.length > 1 && (
              <Button
                variant="outline"
                size="icon"
                className="absolute z-10 transition-all duration-200 shadow-lg top-4 right-4 bg-white/90 backdrop-blur-sm border-blue-200 hover:bg-white hover:shadow-xl hover:border-blue-300 rounded-xl"
                onClick={toggleAutoplay}
                aria-label={isPlaying ? "Pause slideshow" : "Play slideshow"}
              >
                {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
              </Button>
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </section>
  )
})

BannerSection.displayName = "BannerSection"

export default BannerSection
