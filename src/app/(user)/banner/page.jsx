"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useBanner } from "@/hooks/useBanner";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { Skeleton } from "@/components/ui/skeleton";
import { Frown } from "lucide-react";

const ITEMS_PER_PAGE = 8;

const BannerPageSkeleton = () => (
    <div className="flex flex-col max-w-6xl min-h-screen px-4 py-8 mx-auto sm:px-6 lg:px-8">
        <Skeleton className="w-1/3 h-10 mx-auto mb-8" />
        <div className="grid flex-grow grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {Array.from({ length: ITEMS_PER_PAGE }).map((_, index) => (
                <div key={index} className="w-full h-64 bg-white border shadow-md rounded-xl">
                    <Skeleton className="w-full h-full rounded-xl" />
                </div>
            ))}
        </div>
    </div>
);


const BannerPage = () => {
  const { banner, isLoading, error } = useBanner();
  const router = useRouter();
  const [currentPage, setCurrentPage] = useState(1);

  const handlePressBanner = (id) => {
    router.push(`/banner/${id}`);
  };

  const indexOfLastItem = currentPage * ITEMS_PER_PAGE;
  const indexOfFirstItem = indexOfLastItem - ITEMS_PER_PAGE;
  const currentBanners = banner
    ? banner.slice(indexOfFirstItem, indexOfLastItem)
    : [];
  const totalPages = banner ? Math.ceil(banner.length / ITEMS_PER_PAGE) : 0;

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
    window.scrollTo({ top: 0, behavior: "smooth" });
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
    return <BannerPageSkeleton />;
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-screen text-center">
        <Frown className="w-16 h-16 text-red-500" />
        <h2 className="mt-4 text-2xl font-bold">Error Loading Banners</h2>
        <p className="mt-2 text-red-500">{error.message}</p>
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
      <div className="grid flex-grow grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {currentBanners.map((item) => (
          <Link href={`/banner/${item.id}`} key={item.id}>
            <div
              className="relative w-full h-64 overflow-hidden transition-all duration-300 ease-in-out bg-white shadow-lg rounded-xl hover:shadow-xl hover:-translate-y-1 group"
            >
              <img
                alt={item.name}
                className="absolute inset-0 object-cover w-full h-full transition-transform duration-300 ease-in-out group-hover:scale-105"
                src={item.imageUrl || "/assets/error.png"}
                onError={(e) => {
                  e.currentTarget.onerror = null;
                  e.currentTarget.src = "/assets/error.png";
                }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
              <div className="relative flex flex-col items-start justify-end h-full p-4">
                  <h3
                    className="text-lg font-bold text-white shadow-lg drop-shadow-md"
                    title={item.name}
                  >
                    {item.name}
                  </h3>
              </div>
            </div>
          </Link>
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
