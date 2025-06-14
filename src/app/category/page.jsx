"use client";

import { useState } from "react";
import { useCategory } from "@/hooks/useCategory"; // Asumsi path ini benar
import { Card, CardBody, CardFooter } from "@heroui/card"; // Asumsi ini adalah UI library yang Anda gunakan
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

const ITEMS_PER_PAGE = 8; // Tentukan jumlah item per halaman

const CategoryPage = () => {
  const { category, isLoading, error } = useCategory(); // Asumsi useCategory mengembalikan isLoading dan error
  const router = useRouter();
  const [currentPage, setCurrentPage] = useState(1);

  const handlePressCategory = (id) => { // Sesuaikan tipe id jika perlu
    setTimeout(() => {
      router.push(`/category/${id}`);
    }, 1000); // Timeout dipertahankan jika memang ada kebutuhan spesifik
  };

  // Kalkulasi untuk pagination
  const indexOfLastItem = currentPage * ITEMS_PER_PAGE;
  const indexOfFirstItem = indexOfLastItem - ITEMS_PER_PAGE;
  const currentCategories = category ? category.slice(indexOfFirstItem, indexOfLastItem) : []; // Tambahkan pengecekan category
  const totalPages = category ? Math.ceil(category.length / ITEMS_PER_PAGE) : 0; // Tambahkan pengecekan category

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
    // Opsional: scroll ke atas halaman saat berganti halaman
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
        <p className="text-2xl text-gray-700">Loading categories...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-screen">
        <p className="text-2xl text-red-500">Error loading categories: {error.message}</p>
      </div>
    );
  }

  if (!category || category.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center px-4 py-8 mx-auto max-w-7xl sm:px-6 lg:px-8">
        <h1 className="mb-8 text-3xl font-bold text-center text-gray-900">
          Category Page
        </h1>
        <p className="text-xl text-gray-600">No categories available at the moment.</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col max-w-6xl min-h-screen px-4 py-8 mx-auto sm:px-6 lg:px-8">
      <h1 className="mb-8 text-3xl font-bold text-center text-gray-900">
        Category Page
      </h1>
      <div className="grid flex-grow grid-cols-1 gap-x-6 gap-y-8 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {currentCategories.map((item) => (
          <Card
            key={item.id}
            isPressable
            onPress={() => handlePressCategory(item.id)}
            // --- AWAL PERUBAHAN ---
            className="flex flex-col w-full overflow-hidden transition-shadow duration-300 ease-in-out bg-white shadow-lg h-80 rounded-xl hover:shadow-xl group"
            // Ganti w-64 (256px) dan h-80 (320px) sesuai kebutuhan Anda
            // Contoh lain: w-72 (288px) h-96 (384px)
            // --- AKHIR PERUBAHAN ---
          >
            <CardBody className="p-0">
              <img
                alt={item.name}
                // Tinggi gambar sudah ditentukan (h-48), pastikan ini sesuai dengan desain Anda
                // dan konsisten dengan tinggi total kartu yang baru.
                className="object-cover w-full h-48 transition-transform duration-300 ease-in-out"
                src={item.imageUrl}
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
                <p className="mt-1 text-sm text-gray-600 truncate">
                  Lihat promo menarik!
                  {/* Anda mungkin ingin teks ini lebih spesifik untuk kategori */}
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
                className={currentPage === totalPages ? "pointer-events-none opacity-50" : undefined}
              />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      )}
    </div>
  );
};

export default CategoryPage;