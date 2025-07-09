"use client"

import { use } from "react"
import Link from "next/link"
import { useDetailBanner } from "@/hooks/useDetailBanner"
import { useActivity } from "@/hooks/useActivity"
import { useAuth } from "@/context/AuthContext"
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel"
import { Skeleton } from "@/components/ui/skeleton"
import { Button } from "@/components/ui/button"
import { Frown, ChevronRight, Star, MapPin, Sparkles } from "lucide-react"
import { motion } from "framer-motion"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"

const DEFAULT_ACTIVITY_IMAGE = "/assets/banner-authpage.png"

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
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

const DetailBanner = ({ params }) => {
  const resolvedParams = use(params)
  const id = resolvedParams?.id
  const { detailBanner, isLoading: isBannerLoading, error } = useDetailBanner(id)
  const { activity, isLoading: isActivityLoading } = useActivity()
  const { loading: isAuthLoading } = useAuth()

  const isLoading = isBannerLoading || isActivityLoading || isAuthLoading

  if (isLoading) {
    return (
      <div className="min-h-screen bg-white">
        <div className="container px-4 py-8 mx-auto max-w-7xl">
          <Skeleton className="w-1/2 h-5 mb-6 rounded-lg" />
          <div className="flex flex-col gap-6 lg:flex-row">
            <div className="w-full space-y-4 lg:w-2/3">
              <Skeleton className="w-full rounded-lg h-64" />
              <div className="space-y-3">
                <Skeleton className="w-3/4 h-6 rounded" />
                <Skeleton className="w-full h-20 rounded" />
              </div>
            </div>
            <div className="w-full lg:w-1/3">
              <div className="sticky top-24">
                <Skeleton className="w-full h-48 rounded-lg" />
              </div>
            </div>
          </div>
          <div className="mt-8">
            <Skeleton className="w-1/3 h-5 mb-4 rounded" />
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {Array.from({ length: 4 }).map((_, i) => (
                <Skeleton key={i} className="h-40 rounded-lg" />
              ))}
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
        <div className="flex items-center justify-center w-24 h-24 mx-auto mb-6 bg-red-100 rounded-full">
          <Frown className="w-12 h-12 text-red-500" />
        </div>
        <h2 className="mt-4 text-3xl font-bold text-gray-900">Failed to Load Banner</h2>
        <p className="mt-2 text-lg text-gray-600">{error.message}</p>
      </div>
    )
  }

  if (!id || !detailBanner) {
    return (
      <div className="container px-4 py-6 mx-auto text-center">
        <div className="flex flex-col items-center justify-center min-h-[60vh]">
          <div className="flex items-center justify-center w-24 h-24 mx-auto mb-6 bg-blue-100 rounded-full">
            <Sparkles className="w-12 h-12 text-blue-600" />
          </div>
          <h1 className="mb-4 text-3xl font-bold text-gray-900">Banner Not Found</h1>
          <p className="text-gray-600">Banner detail not found or ID is invalid.</p>
        </div>
      </div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.75 }}
      className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50"
    >
      <div className="container px-4 py-8 mx-auto max-w-7xl">
        <Breadcrumb className="mb-8">
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink asChild>
                <Link href="/" className="text-blue-600 hover:text-blue-800 transition-colors duration-200">
                  Home
                </Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator>
              <ChevronRight className="text-blue-400" />
            </BreadcrumbSeparator>
            <BreadcrumbItem>
              <BreadcrumbLink asChild>
                <Link href="/banner" className="text-blue-600 hover:text-blue-800 transition-colors duration-200">
                  Banners
                </Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator>
              <ChevronRight className="text-blue-400" />
            </BreadcrumbSeparator>
            <BreadcrumbItem>
              <BreadcrumbPage className="font-semibold text-gray-700">{detailBanner.name}</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>

        <div className="flex flex-col gap-8 lg:flex-row">
          <div className="w-full lg:w-2/3">
            <div className="overflow-hidden border border-blue-100 shadow-2xl bg-white/90 backdrop-blur-sm rounded-3xl">
              <div className="relative w-full h-80 md:h-96">
                <img
                  src={detailBanner.imageUrl || "/placeholder.svg"}
                  alt={detailBanner.name || "Banner image"}
                  onError={(e) => {
                    e.currentTarget.onerror = null
                    e.currentTarget.src = "/assets/error.png"
                  }}
                  className="object-cover w-full h-full"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-black/20 to-transparent"></div>
                <div className="absolute bottom-6 left-6">
                  <div className="inline-flex items-center px-4 py-2 text-sm font-semibold text-white bg-blue-600 rounded-full shadow-lg">
                    <Sparkles className="w-4 h-4 mr-2" />
                    Featured Banner
                  </div>
                </div>
              </div>
            </div>

            <div className="p-8 mt-6 border border-blue-100 shadow-xl bg-white/90 backdrop-blur-sm rounded-3xl">
              <h1 className="mb-4 text-4xl font-bold text-gray-900">{detailBanner.name}</h1>
              <p className="text-lg leading-relaxed text-gray-700">
                From breathtaking natural wonders to world-famous attractions, explore everything your dream destination
                has to offer, all in one place. Discover amazing experiences that will create memories to last a
                lifetime.
              </p>
            </div>
          </div>

          <div className="w-full lg:w-1/3">
            <div className="sticky top-24">
              <div className="p-8 text-center border border-blue-100 shadow-2xl bg-white/90 backdrop-blur-sm rounded-3xl">
                <div className="flex items-center justify-center w-16 h-16 mx-auto mb-6 bg-blue-100 rounded-full">
                  <MapPin className="w-8 h-8 text-blue-600" />
                </div>
                <h2 className="mb-4 text-2xl font-bold text-gray-800">Ready for an Adventure?</h2>
                <p className="mb-6 leading-relaxed text-gray-600">
                  Check out all the exciting activities available now and start planning your next unforgettable
                  journey!
                </p>
                <Button
                  asChild
                  className="w-full py-4 text-lg font-bold text-white transition duration-300 bg-blue-600 shadow-lg hover:bg-blue-700 rounded-2xl hover:shadow-xl hover:scale-105"
                >
                  <Link href="/activity">
                    <Star className="w-5 h-5 mr-2" />
                    View All Activities
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        </div>

        {activity && activity.length > 0 && (
          <div className="mt-16">
            <div className="mb-8 text-center">
              <h2 className="mb-4 text-3xl font-bold text-gray-900">
                Related <span className="text-blue-600">Activities</span>
              </h2>
              <p className="text-lg text-gray-600">Discover more amazing experiences</p>
            </div>

            <motion.div variants={containerVariants} initial="hidden" animate="visible">
              <Carousel opts={{ align: "start", loop: activity.length > 3 }} className="w-full">
                <CarouselContent className="-ml-2 md:-ml-4">
                  {activity.map((rec) => (
                    <CarouselItem
                      key={rec.id}
                      className="pl-2 md:pl-4 basis-full sm:basis-1/2 lg:basis-1/3 xl:basis-1/4"
                    >
                      <motion.div variants={cardVariants}>
                        <Link href={`/activity/${rec.id}`} className="block h-full group">
                          <div className="flex flex-col h-full overflow-hidden transition-all duration-300 border border-blue-100 shadow-lg bg-white/90 backdrop-blur-sm rounded-3xl hover:shadow-2xl hover:-translate-y-2">
                            <div className="relative w-full h-48 overflow-hidden rounded-t-3xl">
                              <img
                                src={rec.imageUrls?.[0] || DEFAULT_ACTIVITY_IMAGE}
                                alt={rec.title || "Activity"}
                                className="absolute inset-0 object-cover w-full h-full transition-transform duration-500 group-hover:scale-110"
                                onError={(e) => {
                                  e.currentTarget.onerror = null
                                  e.currentTarget.src = "/assets/error.png"
                                }}
                              />
                              <div className="absolute p-2 transition-opacity duration-300 rounded-full shadow-lg opacity-0 top-3 right-3 bg-white/90 backdrop-blur-sm group-hover:opacity-100">
                                <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                              </div>
                            </div>
                            <div className="flex flex-col flex-grow p-6">
                              <h3 className="text-lg font-bold text-gray-800 transition-colors duration-200 line-clamp-2 group-hover:text-blue-600">
                                {rec.title || "Name Not Available"}
                              </h3>
                              <div className="flex items-center mt-2 text-sm text-gray-500">
                                <MapPin className="w-4 h-4 mr-1 text-blue-500" />
                                <span className="truncate">{rec.city}</span>
                              </div>
                            </div>
                          </div>
                        </Link>
                      </motion.div>
                    </CarouselItem>
                  ))}
                </CarouselContent>
                {activity.length > 3 && (
                  <>
                    <CarouselPrevious className="absolute left-[-20px] md:left-[-25px] top-1/2 -translate-y-1/2 z-10 hidden sm:flex bg-white/90 backdrop-blur-sm border-blue-200 hover:bg-blue-50" />
                    <CarouselNext className="absolute right-[-20px] md:right-[-25px] top-1/2 -translate-y-1/2 z-10 hidden sm:flex bg-white/90 backdrop-blur-sm border-blue-200 hover:bg-blue-50" />
                  </>
                )}
              </Carousel>
            </motion.div>
          </div>
        )}
      </div>
    </motion.div>
  )
}

export default DetailBanner
