import { Suspense } from "react"
import axios from "axios"
import { DetailActivityClient } from "@/components/ui/user/DetailActivityClient"
import { Skeleton } from "@/components/ui/skeleton"

// Optimized image utility functions
const PLACEHOLDER_DATA_URL =
  "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAwIiBoZWlnaHQ9IjQwMCIgdmlld0JveD0iMCAwIDYwMCA0MDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSI2MDAiIGhlaWdodD0iNDAwIiBmaWxsPSIjRjNGNEY2Ii8+CjxwYXRoIGQ9Ik0yOTcuNSAyMTJIMjg1TDMwNy41IDE3MEwzMzAuNSAxNzBMMzEwIDIxMkgyOTcuNVoiIGZpbGw9IiNEMUQ1REIiLz4KPGNpcmNsZSBjeD0iMzA3LjUiIGN5PSIxNzAiIHI9IjcuNSIgZmlsbD0iI0QxRDVEQiIvPgo8L3N2Zz4K"

const isExternalImage = (src) => {
  return src && (src.startsWith("http://") || src.startsWith("https://"))
}

const getImageProps = (src, alt, hasError = false) => {
  if (!src || hasError) {
    return {
      src: PLACEHOLDER_DATA_URL,
      alt: alt || "Activity image",
      unoptimized: true,
    }
  }

  if (isExternalImage(src)) {
    return { src, alt, unoptimized: true }
  }

  return { src, alt }
}

const formatCurrency = (amount) =>
  new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(amount)

const DetailActivitySkeleton = () => (
  <div className="min-h-screen py-8 bg-white">
    <div className="container px-4 mx-auto max-w-7xl">
      <Skeleton className="w-1/3 h-5 mb-6 rounded-lg" />
      <div className="flex flex-col gap-6 lg:flex-row">
        <div className="w-full space-y-4 lg:w-2/3">
          <div className="p-4 border border-gray-200 bg-white rounded-lg">
            <Skeleton className="w-3/4 h-6 mb-4 rounded" />
            <div className="flex flex-wrap items-center gap-2">
              <Skeleton className="w-1/3 h-4 rounded" />
              <Skeleton className="w-1/2 h-4 rounded" />
            </div>
          </div>
          <Skeleton className="w-full rounded-lg aspect-video h-64" />
        </div>
        <div className="w-full lg:w-1/3">
          <div className="sticky p-4 border border-gray-200 bg-white rounded-lg top-24">
            <div className="space-y-3">
              <div className="space-y-2">
                <Skeleton className="w-1/2 h-6 rounded" />
                <Skeleton className="w-1/4 h-3 rounded" />
              </div>
              <Skeleton className="w-full h-8 rounded" />
              <Skeleton className="w-full h-8 rounded" />
              <div className="py-2 border-t border-gray-200">
                <Skeleton className="w-full h-6 rounded" />
              </div>
              <Skeleton className="w-full h-10 rounded" />
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
)

async function getActivityData(id) {
  if (!id) return null
  try {
    const response = await axios.get(`https://travel-journal-api-bootcamp.do.dibimbing.id/api/v1/activity/${id}`, {
      headers: {
        apiKey: "24405e01-fbc1-45a5-9f5a-be13afcd757c",
      },
    })
    return response.data.data
  } catch (error) {
    console.error("Gagal mengambil data detail aktivitas di server:", error.message)
    return null
  }
}

export default async function DetailActivityPage({ params }) {
  const { id } = await params
  const initialActivity = await getActivityData(id)

  if (!initialActivity) {
    return (
      <div className="container py-8 mx-auto text-center">
        <div className="flex flex-col items-center justify-center min-h-[60vh]">
          <div className="flex items-center justify-center w-24 h-24 mx-auto mb-6 bg-blue-100 rounded-full">
            <svg className="w-12 h-12 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
              />
            </svg>
          </div>
          <h1 className="mb-4 text-2xl font-bold text-gray-900 md:text-3xl tracking-tight">Activity Not Found</h1>
          <p className="text-gray-600">Detail activity not found.</p>
        </div>
      </div>
    )
  }

  return (
    <Suspense fallback={<DetailActivitySkeleton />}>
      <DetailActivityClient initialActivity={initialActivity} />
    </Suspense>
  )
}
