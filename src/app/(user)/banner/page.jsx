"use client";

import { useState } from "react";
import { useBanner } from "@/hooks/useBanner";
import { Card, CardBody, CardFooter } from "@heroui/card";
import { useRouter } from "next/navigation";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination"; // Path to shadcn pagination component

const ITEMS_PER_PAGE = 8; // Define the number of items per page

const BannerPage = () => {
  const { banner, isLoading, error } = useBanner();
  const router = useRouter();
  const [currentPage, setCurrentPage] = useState(1);

  const handlePressBanner = (id) => {
    setTimeout(() => {
      router.push(`/banner/${id}`);
    }, 1000);
  };

  // Pagination calculations
  const indexOfLastItem = currentPage * ITEMS_PER_PAGE;
  const indexOfFirstItem = indexOfLastItem - ITEMS_PER_PAGE;
  // Add a check for null or undefined banner before slice and length
  const currentBanners = banner
    ? banner.slice(indexOfFirstItem, indexOfLastItem)
    : [];
  const totalPages = banner ? Math.ceil(banner.length / ITEMS_PER_PAGE) : 0;

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
    // Optional: scroll to the top of the page when changing pages
    // window.scrollTo(0, 0);
  };

  const getPageNumbers = () => {
    const pageNumbers = [];
    const maxPagesToShow = 5;
    const halfPagesToShow = Math.floor(maxPagesToShow / 2);

    if (totalPages <= maxPagesToShow) {
      for (let i = 1; i <= totalPages; i++) {
        pageNumbers.push(i);
      }
    } else {
      pageNumbers.push(1);

      let startPage = Math.max(2, currentPage - halfPagesToShow);
      let endPage = Math.min(totalPages - 1, currentPage + halfPagesToShow);

      if (currentPage - halfPagesToShow <= 2) {
        endPage = Math.min(totalPages - 1, maxPagesToShow - 2);
      }

      if (currentPage + halfPagesToShow >= totalPages - 1) {
        startPage = Math.max(2, totalPages - (maxPagesToShow - 3));
      }

      if (startPage > 2) {
        pageNumbers.push("...");
      }

      for (let i = startPage; i <= endPage; i++) {
        pageNumbers.push(i);
      }

      if (endPage < totalPages - 1) {
        pageNumbers.push("...");
      }
      pageNumbers.push(totalPages);
    }
    return pageNumbers;
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <p className="text-2xl text-gray-700">Loading banners...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-screen">
        <p className="text-2xl text-red-500">
          Error loading banners: {error.message}
        </p>
      </div>
    );
  }

  if (!banner || banner.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center px-4 py-8 mx-auto max-w-7xl sm:px-6 lg:px-8">
        <h1 className="mb-8 text-3xl font-bold text-center text-gray-900">
          Banner Page
        </h1>
        <p className="text-xl text-gray-600">
          No banners available at the moment.
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col max-w-6xl min-h-screen px-4 py-8 mx-auto sm:px-6 lg:px-8">
      <h1 className="mb-8 text-3xl font-bold text-center text-gray-900">
        Banner Page
      </h1>
      <div className="grid flex-grow grid-cols-1 gap-x-6 gap-y-8 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {currentBanners.map((item) => (
          <Card
            key={item.id}
            isPressable
            onPress={() => handlePressBanner(item.id)}
            className="flex flex-col w-full overflow-hidden transition-shadow duration-300 ease-in-out bg-white shadow-lg h-80 rounded-xl hover:shadow-xl group"
          >
            <CardBody className="p-0">
              <img
                alt={item.name}
                className="object-cover w-full h-48 transition-transform duration-300 ease-in-out "
                // FIX: Use `item.imageUrl || null` to prevent passing an empty string.
                // If `item.imageUrl` is falsy (like "" or undefined), `null` will be used instead.
                src={item.imageUrl || null}
                onError={(e) => {
                  e.currentTarget.onerror = null;
                  e.currentTarget.src = "/assets/error.png";
                }}
                width="100%"
              />
            </CardBody>
            <CardFooter className="px-4 py-3 border-t border-gray-200">
              <div className="flex flex-col w-full">
                <b
                  className="text-base font-semibold text-gray-800 truncate transition-colors group-hover:text-blue-600"
                  title={item.name}
                >
                  {item.name}
                </b>
              </div>
            </CardFooter>
          </Card>
        ))}
      </div>

      {totalPages > 1 && (
        <Pagination className="mt-12 mb-4">
          <PaginationContent>
            <PaginationItem>
              <PaginationPrevious
                href="#"
                onClick={(e) => {
                  e.preventDefault();
                  if (currentPage > 1) {
                    handlePageChange(currentPage - 1);
                  }
                }}
                aria-disabled={currentPage === 1}
                className={
                  currentPage === 1
                    ? "pointer-events-none opacity-50"
                    : undefined
                }
              />
            </PaginationItem>

            {getPageNumbers().map((page, index) => (
              <PaginationItem
                key={
                  typeof page === "number"
                    ? `page-${page}`
                    : `ellipsis-${index}`
                }
              >
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
                  if (currentPage < totalPages) {
                    handlePageChange(currentPage + 1);
                  }
                }}
                aria-disabled={currentPage === totalPages}
                className={
                  currentPage === totalPages
                    ? "pointer-events-none opacity-50"
                    : undefined
                }
              />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      )}
    </div>
  );
};

export default BannerPage;
