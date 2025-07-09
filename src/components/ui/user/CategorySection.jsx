"use client"

import React, { useCallback, useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { useCategory } from "@/hooks/useCategory"
import { useAuth } from "@/context/AuthContext"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { motion } from "framer-motion"
import { Mountain } from "lucide-react"
import Marquee from "react-fast-marquee"

// Optimized image utility functions
const PLACEHOLDER_DATA_URL =
  "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIyNCIgdmlld0JveD0iMCAwIDIwMCAyMjQiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIyMDAiIGhlaWdodD0iMjI0IiBmaWxsPSIjRjNGNEY2Ii8+CjxwYXRoIGQ9Ik05Ny41IDEzMkg4NUwxMDcuNSA5MEwxMzAuNSA5MEwxMTAgMTMySDk3LjVaIiBmaWxsPSIjRDFENURCIi8+CjxjaXJjbGUgY3g9IjEwNy41IiBjeT0iOTAiIHI9IjcuNSIgZmlsbD0iI0QxRDVEQiIvPgo8L3N2Zz4K"

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
    transition: { staggerChildren: 0.08 },
  },
}

const itemVariants = {
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

const CategorySection = React.memo(({ className }) => {
  const { category, isLoading: isCategoryLoading } = useCategory()
  const { loading: isAuthLoading } = useAuth()
  const [imageErrors, setImageErrors] = useState(new Set())

  const handleImageError = useCallback((categoryId) => {
    setImageErrors((prev) => new Set([...prev, categoryId]))
  }, [])

  const isLoading = isCategoryLoading || isAuthLoading

  if (isLoading) {
    return (
      <section className={cn("bg-white", className)} aria-label="Categories loading">
        <div className="px-4 py-8 mx-auto max-w-7xl sm:px-6 lg:px-8">
          <div className="flex gap-4 overflow-x-auto pb-2" style={{ height: '96px' }}>
            {Array.from({ length: 6 }).map((_, index) => (
              <div key={index} className="flex-shrink-0 w-48 overflow-hidden border border-gray-200 bg-white rounded-2xl">
                <div className="w-full h-16 bg-gradient-to-br from-gray-200 via-gray-100 to-gray-200 animate-pulse" />
              </div>
            ))}
          </div>
        </div>
      </section>
    )
  }

  if (!category || category.length === 0) {
    return null
  }

  return (
    <section className={cn("bg-white", className)} aria-label="Explore categories">
      <div className="w-full py-2">
        <Marquee
          speed={40}
          gradient={true}
          gradientColor={[255, 255, 255]}
          gradientWidth={60}
          pauseOnHover={true}
          className="py-2 hide-scrollbar w-full"
        >
          <div className="flex gap-6 w-full" style={{ height: '64px' }}>
            {category.map((cat, index) => (
              <motion.div 
                key={cat.id} 
                className="flex-shrink-0 w-48 h-16"
                initial="hidden"
                animate="visible"
              >
                <Link
                  href={`/category/${cat.id}`}
                  className="block h-full group"
                  aria-label={`Explore ${cat.name} category`}
                >
                  <div className="relative overflow-hidden w-full h-full rounded-xl transition-all duration-300 hover:scale-[1.02]">
                    <Image
                      {...getImageProps(cat.imageUrl, cat.name, imageErrors.has(cat.id))}
                      width={200}
                      height={64}
                      className="object-cover w-full h-full transition-transform duration-500 ease-out group-hover:scale-110"
                      sizes="(max-width: 640px) 200px, 200px"
                      quality={80}
                      loading={index < 3 ? "eager" : "lazy"}
                      placeholder="blur"
                      blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAAIAAoDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAhEAACAQMDBQAAAAAAAAAAAAABAgMABAUGIWGRkqGx0f/EABUBAQEAAAAAAAAAAAAAAAAAAAMF/8QAGhEAAgIDAAAAAAAAAAAAAAAAAAECEgMRkf/aAAwDAQACEQMRAD8AltJagyeH0AthI5xdrLcNM91BF5pX2HaH9bcfaSXWGaRmknyJckliyjqTzSlT54b6bk+h0R//2Q=="
                      onError={() => handleImageError(cat.id)}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent"></div>
                    <div className="absolute bottom-2 left-2 right-2">
                      <div className="inline-flex items-center px-2 py-1 mb-1 text-xs font-semibold text-white bg-blue-600 rounded-full">
                        <Mountain className="w-3 h-3 mr-1" />
                        Category
                      </div>
                      <h3 className="text-xs font-bold text-white drop-shadow-lg transition-transform duration-300 group-hover:translate-y-[-2px] line-clamp-1">
                        {cat.name}
                      </h3>
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        </Marquee>
      </div>
      <style jsx global>{`
        .hide-scrollbar::-webkit-scrollbar { display: none; }
        .hide-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
    </section>
  )
})

CategorySection.displayName = "CategorySection"

export default CategorySection
