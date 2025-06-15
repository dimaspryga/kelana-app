"use client";

import { useState } from "react";
import Link from "next/link";
import { useActivity } from "@/hooks/useActivity";
import { useCart } from "@/hooks/useCart";
import { Card, CardBody, CardFooter } from "@heroui/card";
import { getCookie } from "cookies-next";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { ShoppingCart, MapPin, Star, Loader2 } from "lucide-react";
import { toast } from "sonner";

const DEFAULT_ACTIVITY_IMAGE = "/assets/banner-authpage.png";
const ITEMS_PER_PAGE = 8;

const Activity = () => {
  const { activity, isLoading, error } = useActivity();
  const { addToCart } = useCart(); // Get the addToCart function from the hook
  const token = getCookie("token");

  const [currentPage, setCurrentPage] = useState(1);
  const [addingItemId, setAddingItemId] = useState(null); // State for loading per button

  // Fixed "Add to Cart" function
  const handleAddToCart = async (e, item) => {
    e.stopPropagation(); // Prevent Link navigation
    e.preventDefault();

    // Check if the user is not logged in
    if (!token) {
      toast.error("You must be logged in to add items to the cart.");
      return;
    }

    setAddingItemId(item.id); // Start loading for the clicked button

    try {
      // Call the function from useCart by sending the entire 'item' object
      await addToCart(item);
      toast.success(`"${item.title}" has been added successfully!`);
    } catch (err) {
      console.error("Failed to add to cart:", err);
      toast.error(
        "Failed to add item. It might already be in the cart or an error occurred."
      );
    } finally {
      setAddingItemId(null); // Stop loading, whether successful or failed
    }
  };

  // Calculation for pagination
  const indexOfLastItem = currentPage * ITEMS_PER_PAGE;
  const indexOfFirstItem = indexOfLastItem - ITEMS_PER_PAGE;
  const currentActivities = activity
    ? activity.slice(indexOfFirstItem, indexOfLastItem)
    : [];
  const totalPages = activity ? Math.ceil(activity.length / ITEMS_PER_PAGE) : 0;

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const getPageNumbers = () => {
    const pageNumbers = [];
    if (totalPages <= 7) {
      for (let i = 1; i <= totalPages; i++) pageNumbers.push(i);
    } else {
      if (currentPage <= 4) {
        pageNumbers.push(1, 2, 3, 4, 5, "...", totalPages);
      } else if (currentPage > totalPages - 4) {
        pageNumbers.push(
          1,
          "...",
          totalPages - 4,
          totalPages - 3,
          totalPages - 2,
          totalPages - 1,
          totalPages
        );
      } else {
        pageNumbers.push(
          1,
          "...",
          currentPage - 1,
          currentPage,
          currentPage + 1,
          "...",
          totalPages
        );
      }
    }
    return pageNumbers;
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-50">
        <div className="grid w-full grid-cols-1 gap-6 px-4 mx-auto sm:grid-cols-2 lg:grid-cols-4 max-w-7xl">
          {Array.from({ length: 8 }).map((_, index) => (
            <div
              key={index}
              className="w-full bg-gray-200 h-96 rounded-xl animate-pulse"
            ></div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-screen text-center">
        <div>
          <h2 className="text-2xl font-bold text-red-600">An Error Occurred</h2>
          <p className="mt-2 text-red-500">Error: {error.message}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="flex flex-col px-4 py-12 mx-auto max-w-7xl sm:px-6 lg:px-8">
        <h1 className="mb-4 text-4xl font-extrabold tracking-tight text-center text-gray-900">
          Explore Fun Activities
        </h1>
        <p className="mb-10 text-lg text-center text-gray-600">
          Discover unforgettable adventures at your favorite destinations.
        </p>

        {currentActivities.length === 0 ? (
          <div className="py-16 text-center">
            <p className="text-xl text-gray-600">
              No activities available at the moment.
            </p>
          </div>
        ) : (
          <div className="grid flex-grow grid-cols-1 gap-x-6 gap-y-8 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {currentActivities.map((item) => (
              <Link
                href={`/activities/${item.id}`}
                key={item.id}
                className="block h-full group"
              >
                <Card className="flex flex-col w-full h-full overflow-hidden transition-all duration-300 shadow-md rounded-xl hover:shadow-2xl hover:-translate-y-1">
                  <div className="relative overflow-hidden">
                    <img
                      alt={item.title || "Activity image"}
                      className="object-cover w-full h-48 transition-transform duration-500 group-hover:scale-110"
                      src={item.imageUrls?.[0] || DEFAULT_ACTIVITY_IMAGE}
                      onError={(e) => {
                        e.currentTarget.onerror = null;
                        e.currentTarget.src = "/assets/error.png";
                      }}
                    />
                  </div>

                  <CardBody className="flex-grow p-4">
                    <div className="flex items-center gap-2 text-xs">
                      <div className="flex items-center text-yellow-500">
                        <Star size={16} className="mr-1 fill-current" />
                        <span className="font-bold">
                          {item.rating.toFixed(1)}
                        </span>
                      </div>
                      <span className="text-gray-500">
                        ({item.total_reviews} reviews)
                      </span>
                    </div>
                    <h3
                      className="mt-1 text-base font-bold text-gray-900 truncate group-hover:text-blue-600"
                      title={item.title}
                    >
                      {item.title || "No title"}
                    </h3>
                    <div className="flex items-center mt-1 text-xs text-gray-500">
                      <MapPin size={14} className="mr-1.5 flex-shrink-0" />
                      <p className="truncate">{item.address}</p>
                    </div>
                  </CardBody>

                  <CardFooter className="p-4 pt-2 border-t border-gray-100">
                    <div className="flex items-end justify-between w-full">
                      <div>
                        {item.price_discount &&
                        item.price_discount < item.price ? (
                          <>
                            <p className="text-xs text-red-500 line-through">
                              Rp {item.price.toLocaleString("id-ID")}
                            </p>
                            <p className="text-lg font-bold text-blue-600">
                              Rp {item.price_discount.toLocaleString("id-ID")}
                            </p>
                          </>
                        ) : (
                          <p className="text-lg font-bold text-blue-600">
                            Rp {item.price.toLocaleString("id-ID")}
                          </p>
                        )}
                      </div>
                      {/* Button logic has been removed as per user request in previous interactions, but the structure is kept */}
                    </div>
                  </CardFooter>
                </Card>
              </Link>
            ))}
          </div>
        )}

        {totalPages > 1 && (
          <Pagination className="mt-12 mb-4">
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious
                  href="#"
                  onClick={(e) => {
                    e.preventDefault();
                    if (currentPage > 1) handlePageChange(currentPage - 1);
                  }}
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
                        e.preventDefault();
                        handlePageChange(page);
                      }}
                      isActive={currentPage === page}
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
                    e.preventDefault();
                    if (currentPage < totalPages)
                      handlePageChange(currentPage + 1);
                  }}
                />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        )}
      </div>
    </div>
  );
};

export default Activity;