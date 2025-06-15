"use client";

import { useDetailBanner } from "@/hooks/useDetailBanner";
import { useActivity } from "@/hooks/useActivity";
import { use } from "react";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { AlertCircleIcon } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

const DEFAULT_ACTIVITY_IMAGE = "/assets/banner-authpage.png";

const DetailBanner = ({ params }) => {
  const resolvedParams = use(params);
  const id = resolvedParams?.id;
  const { detailBanner, isLoading, error } = useDetailBanner(id);
  const { activity } = useActivity();

  if (isLoading) {
    return (
      <div className="container px-4 py-6 mx-auto text-center">
        Memuat detail...
      </div>
    );
  }
  if (error) {
    return (
      <div className="container px-4 py-6 mx-auto text-center text-red-500">
        Terjadi kesalahan: {error.message || "Gagal memuat data."}
      </div>
    );
  }
  if (!id || !detailBanner) {
    return (
      <div className="container px-4 py-6 mx-auto text-center">
        Detail banner tidak ditemukan atau ID tidak valid.
      </div>
    );
  }

  return (
    <div className="container px-4 py-6 mx-auto max-w-7xl">
      <div className="flex flex-col gap-6 lg:flex-row">
        <div className="lg:w-2/3">
          <div className="overflow-hidden bg-white rounded-lg shadow-md">
            <div className="relative w-full h-80 md:h-96">
              {" "}
              <img
                src={detailBanner.imageUrl}
                alt={detailBanner.name || "Activity image"}
                className="object-cover w-full h-full"
              />
            </div>
          </div>

          <div className="p-6 mt-6 bg-white rounded-lg shadow-md">
            <h1 className="mb-2 text-3xl font-bold text-gray-800">
              {detailBanner.name}
            </h1>
            <div className="flex items-center mb-4 text-justify text-gray-600 text-md">
              <a>
                From breathtaking natural wonders to world-famous attractions,
                explore everything your dream destination has to offer, all in
                one place.
              </a>
            </div>
          </div>

          <div className="mt-6 bg-white rounded-lg shadow-md">
            <div className="border-b">
              <div className="flex px-6 -mb-px space-x-8">
                <p className="px-1 py-4 text-xl font-medium text-gray-800">
                  Banner Details
                </p>
              </div>
            </div>
            <div className="p-6">
              <p className="mb-3 text-justify text-gray-600 text-md">
                Find and Book All Your Travel Needs in One Place! Exciting
                activities at your favorite destinations — everything you need
                is just a few clicks away. Enjoy a hassle-free journey with
                complete options, the best prices, and trusted service.
              </p>
            </div>
          </div>
        </div>

        {/* Kolom Kanan (Sticky) */}
        <div className="lg:w-1/3">
          <div className="sticky top-24">
            <div className="p-6 bg-white rounded-lg shadow-md">
              <h2 className="mb-4 text-xl font-bold text-gray-800">
                Banner Information
              </h2>

              <div className="p-4 mt-6 border-l-4 border-blue-500 rounded bg-blue-50">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <i className="text-xl text-blue-500 fas fa-calendar-check"></i>
                  </div>
                  <div className="ml-3">
                    <p className="text-sm text-blue-700">
                      View activities first to see activity availability.
                    </p>
                  </div>
                </div>
              </div>
              <button className="w-full py-3 mt-6 font-semibold text-white transition duration-300 bg-blue-600 rounded-lg cursor-pointer hover:bg-blue-700">
                See Activities
              </button>
              <p className="mt-2 text-xs text-center text-gray-500">
                Easy Cancellation & Full Refund
              </p>
            </div>
            <div className="p-4 mt-5 text-sm bg-white rounded-lg shadow-md">
              <Alert variant="destructive">
                <AlertCircleIcon />
                <AlertTitle>Important notice :</AlertTitle>
                <AlertDescription>
                  <p>Every transaction can be done if you are logged in.</p>
                </AlertDescription>
              </Alert>
            </div>
          </div>
        </div>
      </div>

      {activity && activity.length > 0 && (
        <div className="mt-12">
          <h2 className="mb-6 text-2xl font-bold text-gray-800">
            You Might Also Like This
          </h2>
          <Carousel
            opts={{
              align: "start",
              loop: true,
            }}
            className="w-full"
          >
            <CarouselContent className="-ml-2 md:-ml-4">
              {" "}
              {activity.map((rec) => (
                <CarouselItem
                  key={rec.id}
                  className="pl-2 md:pl-4 basis-full sm:basis-1/2 lg:basis-1/3 xl:basis-1/4"
                >
                  <div className="h-full p-1 cursor-pointer">
                    {" "}
                    <div className="flex flex-col h-full overflow-hidden bg-white rounded-lg shadow-md">
                      {" "}
                      <div className="relative w-full h-40">
                        {" "}
                        <img
                          src={rec.imageUrls || DEFAULT_ACTIVITY_IMAGE}
                          fallbacksrc={DEFAULT_ACTIVITY_IMAGE}
                          onError={(e) => {
                            e.currentTarget.onerror = null;
                            e.currentTarget.src = "/assets/error.png";
                          }}
                          alt={rec.name || "Activity"}
                          className="absolute inset-0 object-cover w-full h-full"
                        />
                      </div>
                      <div className="flex flex-col flex-grow p-4">
                        {" "}
                        {/* flex-grow agar konten teks mengisi sisa ruang */}
                        <h3 className="font-semibold text-gray-800 truncate">
                          {rec.title || "Nama Tidak Tersedia"}
                        </h3>
                        <p className="mb-1 text-sm text-gray-600 truncate">
                          <i className="mr-1 text-xs fas fa-map-marker-alt"></i>
                          {rec.address || "Lokasi Tidak Tersedia"}
                        </p>
                        <p className="text-sm text-yellow-500">
                          <i className="fas fa-star"></i> {rec.rating || "-"} ({" "}
                          {rec.total_reviews || "0"} Reviews )
                        </p>
                        <p className="pt-2 mt-auto text-lg font-bold text-blue-400">
                          {" "}
                          Rp{" "}
                          {rec.price?.toLocaleString("id-ID") ||
                            "Harga Tidak Tersedia"}
                        </p>
                      </div>
                    </div>
                  </div>
                </CarouselItem>
              ))}
            </CarouselContent>
            {activity.length > 3 && (
              <>
                <CarouselPrevious className="absolute left-[-20px] md:left-[-25px] top-1/2 -translate-y-1/2 z-10 hidden sm:flex" />{" "}
                <CarouselNext className="absolute right-[-20px] md:right-[-25px] top-1/2 -translate-y-1/2 z-10 hidden sm:flex" />
              </>
            )}
          </Carousel>
        </div>
      )}
    </div>
  );
};

export default DetailBanner;
