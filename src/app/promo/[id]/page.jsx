"use client";

import { use, useState } from "react";
import { useDetailPromo } from "@/hooks/useDetailPromo";
import { useActivity } from "@/hooks/useActivity";
import Link from "next/link";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { AlertCircleIcon, Copy } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

const DEFAULT_ACTIVITY_IMAGE = "/assets/banner-authpage.png";

const DetailPromo = ({ params }) => {
  const resolvedParams = use(params);
  const id = resolvedParams?.id;
  const { detailPromo, isLoading, error } = useDetailPromo(id);
  const { activity } = useActivity();
  const [copyStatus, setCopyStatus] = useState("Copy");

  // Function to copy the promo code
  const handleCopy = () => {
    if (detailPromo?.promo_code) {
      navigator.clipboard.writeText(detailPromo.promo_code);
      setCopyStatus("Copied!");
      setTimeout(() => {
        setCopyStatus("Copy");
      }, 2000); // Reset status after 2 seconds
    }
  };

  if (isLoading) {
    return (
      <div className="container px-4 py-6 mx-auto text-center">
        Loading details...
      </div>
    );
  }
  if (error) {
    return (
      <div className="container px-4 py-6 mx-auto text-center text-red-500">
        An error occurred: {error.message || "Failed to load data."}
      </div>
    );
  }
  if (!id || !detailPromo) {
    return (
      <div className="container px-4 py-6 mx-auto text-center">
        Banner detail not found or ID is invalid.
      </div>
    );
  }

  return (
    <div className="bg-gray-50">
      <div className="container px-4 py-8 mx-auto max-w-7xl">
        <div className="flex flex-col gap-8 lg:flex-row">
          {/* Left Column (Main Content) */}
          <div className="w-full lg:w-2/3">
            <div className="overflow-hidden bg-white border border-gray-200 rounded-lg shadow-sm">
              <div className="relative w-full h-80 md:h-96">
                <img
                  src={detailPromo.imageUrl}
                  alt={detailPromo.name || "Activity image"}
                  className="object-cover w-full h-full"
                />
              </div>
            </div>

            <div className="p-6 mt-6 bg-white border border-gray-200 rounded-lg shadow-sm">
              <h1 className="mb-4 text-3xl font-bold text-gray-900">
                {detailPromo.title}
              </h1>
              <div className="prose text-gray-700 max-w-none">
                {/* Use dangerouslySetInnerHTML if your description is in HTML format */}
                <p>{detailPromo.description}</p>
              </div>
            </div>

            <div className="mt-6 bg-white border border-gray-200 rounded-lg shadow-sm">
              <div className="border-b border-gray-200">
                <div className="px-6 py-4">
                  <h2 className="text-xl font-bold text-gray-900">
                    Terms and Conditions
                  </h2>
                </div>
              </div>
              <div className="p-6 prose-sm text-gray-600 max-w-none">
                {/* Use dangerouslySetInnerHTML if your T&C is in HTML format */}
                <p>{detailPromo.terms_condition}</p>
              </div>
            </div>
          </div>

          {/* Right Column (Sticky) */}
          <div className="w-full lg:w-1/3">
            <div className="sticky top-24">
              <div className="p-6 bg-white border border-gray-200 rounded-lg shadow-lg">
                <h3 className="text-lg font-bold text-gray-900">
                  Use this promo code
                </h3>

                {/* Promo Code Box */}
                <div className="flex items-center justify-between p-3 mt-4 border-2 border-dashed rounded-lg bg-blue-50/50">
                  <span className="text-xl font-bold tracking-wider text-blue-600">
                    {detailPromo.promo_code || "PROMOCODE"}{" "}
                    {/* Replace with your promo code field */}
                  </span>
                  <button
                    onClick={handleCopy}
                    className="flex items-center px-3 py-1 text-sm font-semibold text-blue-600 transition-colors duration-200 bg-transparent rounded-md hover:bg-blue-100"
                  >
                    <Copy size={14} className="mr-2" />
                    {copyStatus}
                  </button>
                </div>

                <button className="w-full py-3 mt-6 text-lg font-bold text-white transition duration-300 bg-blue-500 rounded-lg shadow-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-opacity-50">
                  View Activities
                </button>

                <div className="p-4 mt-5 bg-white rounded-lg">
                  <Alert variant="destructive">
                    <AlertCircleIcon className="w-4 h-4" />
                    <AlertTitle className="font-semibold">
                      Important Notice:
                    </AlertTitle>
                    <AlertDescription>
                      All transactions can only be made if you are logged in.
                    </AlertDescription>
                  </Alert>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* "You Might Also Like" Carousel */}
        {activity && activity.length > 0 && (
          <div className="mt-12">
            <h2 className="mb-6 text-2xl font-bold text-gray-800">
              You Might Also Like This
            </h2>
            <Carousel opts={{ align: "start", loop: true }} className="w-full">
              <CarouselContent className="-ml-2 md:-ml-4">
                {activity.map((rec) => (
                  <CarouselItem
                    key={rec.id}
                    className="pl-2 md:pl-4 basis-full sm:basis-1/2 lg:basis-1/3 xl:basis-1/4"
                  >
                    {/* MODIFICATION:
                      - The entire card is wrapped with a <Link> component.
                      - The href is set dynamically using the ID from each item (`rec.id`).
                      - Some transition effects are added for a better UX.
                    */}
                    <Link
                      href={`/activities/${rec.id}`} // <-- IMPORTANT: Adjust the '/activity/' path to your routing structure
                      className="block h-full p-1 transition-transform duration-300 ease-in-out cursor-pointer hover:-translate-y-2"
                    >
                      <div className="flex flex-col h-full overflow-hidden transition-shadow bg-white rounded-lg shadow-md hover:shadow-xl">
                        <div className="relative w-full h-40">
                          <img
                            src={rec.imageUrls || DEFAULT_ACTIVITY_IMAGE}
                            alt={rec.title || "Activity"} // Better to use the title for alt text
                            className="absolute inset-0 object-cover w-full h-full"
                            onError={(e) => {
                              e.currentTarget.onerror = null;
                              e.currentTarget.src = "/assets/error.png";
                            }}
                          />
                        </div>
                        <div className="flex flex-col flex-grow p-4">
                          <h3 className="font-semibold text-gray-800 truncate">
                            {rec.title || "Name Not Available"}
                          </h3>
                          <p className="mb-1 text-sm text-gray-600 truncate">
                            <i className="mr-1 text-xs fas fa-map-marker-alt"></i>
                            {rec.address || "Location Not Available"}
                          </p>
                          <p className="text-sm text-yellow-500">
                            <i className="fas fa-star"></i> {rec.rating || "-"}{" "}
                            ({rec.total_reviews || "0"} Reviews )
                          </p>
                          <p className="pt-2 mt-auto text-lg font-bold text-blue-400">
                            Rp{" "}
                            {rec.price?.toLocaleString("id-ID") ||
                              "Price Not Available"}
                          </p>
                        </div>
                      </div>
                    </Link>
                  </CarouselItem>
                ))}
              </CarouselContent>
              {activity.length > 3 && (
                <>
                  <CarouselPrevious className="absolute left-[-20px] md:left-[-25px] top-1/2 -translate-y-1/2 z-10 hidden sm:flex" />
                  <CarouselNext className="absolute right-[-20px] md:right-[-25px] top-1/2 -translate-y-1/2 z-10 hidden sm:flex" />
                </>
              )}
            </Carousel>
          </div>
        )}
      </div>
    </div>
  );
};

export default DetailPromo;
