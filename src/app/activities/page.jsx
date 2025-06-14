"use client";

import { useState } from "react";
import { useActivity } from "@/hooks/useActivity"; // Asumsi path ini benar
import { Card, CardBody, CardFooter } from "@heroui/card"; // Asumsi UI library Anda
import { useRouter } from "next/navigation"; // Menggunakan useRouter dari Next.js
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination"; // Path ke komponen pagination shadcn

const DEFAULT_ACTIVITY_IMAGE = '/assets/banner-authpage.png'; // Pastikan path ini benar
const ITEMS_PER_PAGE = 8; // Tentukan jumlah item per halaman

const Activity = () => {
  const { activity, isLoading, error } = useActivity();
  const router = useRouter();
  const [currentPage, setCurrentPage] = useState(1);

  const handlePressActivity = (id) => {
    setTimeout(() => {
      router.push(`/activities/${id}`);
    }, 1000);
  };

  // Kalkulasi untuk pagination
  const indexOfLastItem = currentPage * ITEMS_PER_PAGE;
  const indexOfFirstItem = indexOfLastItem - ITEMS_PER_PAGE;
  // Tambahkan pengecekan jika activity null atau undefined sebelum slice
  const currentActivities = activity ? activity.slice(indexOfFirstItem, indexOfLastItem) : [];
  const totalPages = activity ? Math.ceil(activity.length / ITEMS_PER_PAGE) : 0;

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
    // Opsional: window.scrollTo(0, 0);
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
        <p className="text-2xl text-gray-700">Loading activities...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-screen">
        <p className="text-2xl text-red-500">Error loading activities: {error.message}</p>
      </div>
    );
  }

  if (!activity || activity.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center px-4 py-8 mx-auto max-w-7xl sm:px-6 lg:px-8">
        <h1 className="mb-8 text-3xl font-bold text-center text-gray-900">
          Activities Page
        </h1>
        <p className="text-xl text-gray-600">No activities available at the moment.</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col max-w-6xl min-h-screen px-4 py-8 mx-auto sm:px-6 lg:px-8">
      <h1 className="mb-8 text-3xl font-bold text-center text-gray-900">
        Activities Page
      </h1>
      <div className="grid flex-grow grid-cols-1 gap-x-6 gap-y-8 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {currentActivities.map((item) => (
          <Card
            key={item.id}
            isPressable
            onPress={() => handlePressActivity(item.id)}
            className="flex flex-col w-full overflow-hidden transition-shadow duration-300 ease-in-out bg-white shadow-lg h-80 rounded-xl hover:shadow-xl group"
          >
            <CardBody className="p-0">
              <img
                alt={item.title || "Activity image"}
                className="object-cover w-full h-48 transition-transform duration-300 ease-in-out"
                src={item.imageUrls && item.imageUrls.length > 0 ? item.imageUrls[0] : DEFAULT_ACTIVITY_IMAGE}
                width="100%"
              />
            </CardBody>
            <CardFooter className="px-4 py-3 border-t border-gray-200">
              <div className="flex flex-col w-full">
                <b
                  className="text-base font-semibold text-gray-800 truncate transition-colors group-hover:text-blue-600"
                  title={item.title} // Judul tooltip adalah item.title
                >
                  {/* Teks yang ditampilkan adalah item.description, pastikan ini sesuai */}
                  {item.title || "Tidak ada judul"} {/* Menampilkan judul, atau fallback jika kosong */}
                </b>
                <p className="mt-1 text-sm text-gray-600 truncate" title={item.description}>
                  {/* Deskripsi singkat bisa dari item.description */}
                  {item.description ? (item.description.length > 50 ? item.description.substring(0, 50) + "..." : item.description) : "Lihat detail aktivitas!"}
                </p>
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
                className={currentPage === 1 ? "pointer-events-none opacity-50" : undefined}
              />
            </PaginationItem>

            {getPageNumbers().map((page, index) => (
              <PaginationItem key={typeof page === 'number' ? `page-${page}` : `ellipsis-${index}`}>
                {page === "..." ? (
                  <PaginationEllipsis />
                ) : (
                  <PaginationLink
                    href="#"
                    onClick={(e) => {
                      e.preventDefault();
                      handlePageChange(page); // PERBAIKAN: pager -> page
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
                className={currentPage === totalPages ? "pointer-events-none opacity-50" : undefined}
              />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      )}
    </div>
  );
};

export default Activity;