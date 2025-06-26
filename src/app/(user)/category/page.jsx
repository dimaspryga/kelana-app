"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCategory } from "@/hooks/useCategory";
import { useAuth } from "@/context/AuthContext";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { Input } from "@/components/ui/input";
import { motion } from "framer-motion";
import { Skeleton } from "@/components/ui/skeleton";
import { Search, Mountain, Frown } from "lucide-react";

const DEFAULT_CATEGORY_IMAGE = "/assets/banner-authpage.png";
const ITEMS_PER_PAGE = 8;

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08,
    },
  },
};

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
};

const CategoryPage = () => {
  const { category, isLoading: isCategoryLoading, error } = useCategory();
  const { loading: isAuthLoading } = useAuth();
  const router = useRouter();

  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");

  const filteredCategories = useMemo(() => {
    if (!category) return [];
    if (!searchQuery) return category;
    return category.filter(cat =>
      cat.name.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [category, searchQuery]);

  const totalPages = Math.ceil(filteredCategories.length / ITEMS_PER_PAGE);
  const indexOfLastItem = currentPage * ITEMS_PER_PAGE;
  const indexOfFirstItem = indexOfLastItem - ITEMS_PER_PAGE;
  const currentCategories = filteredCategories.slice(indexOfFirstItem, indexOfLastItem);

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const getPageNumbers = () => {
    const pageNumbers = [];
    if (totalPages <= 7) {
      for (let i = 1; i <= totalPages; i++) pageNumbers.push(i);
    } else if (currentPage <= 4) {
      pageNumbers.push(1, 2, 3, 4, 5, "...", totalPages);
    } else if (currentPage > totalPages - 4) {
      pageNumbers.push(1, "...", totalPages - 4, totalPages - 3, totalPages - 2, totalPages - 1, totalPages);
    } else {
      pageNumbers.push(1, "...", currentPage - 1, currentPage, currentPage + 1, "...", totalPages);
    }
    return pageNumbers;
  };

  const isLoading = isCategoryLoading || isAuthLoading;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="px-4 py-12 mx-auto max-w-7xl sm:px-6 lg:px-8">
            <Skeleton className="w-1/2 h-12 mx-auto mb-4" />
            <Skeleton className="w-2/3 h-8 mx-auto mb-10" />
            <div className="grid grid-cols-1 gap-x-6 gap-y-8 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {Array.from({ length: 8 }).map((_, index) => (
                    <div key={index} className="space-y-3">
                        <Skeleton className="w-full h-64 rounded-xl" />
                        <Skeleton className="w-5/6 h-6" />
                    </div>
                ))}
            </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-screen text-center">
        <div>
          <h2 className="text-2xl font-bold text-red-600">An Error Occurred</h2>
          <p className="mt-2 text-red-500">Error loading categories: {error.message}</p>
        </div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.75 }}
      className="min-h-screen bg-gray-50"
    >
      <div className="flex flex-col px-4 py-12 mx-auto max-w-7xl sm:px-6 lg:px-8">
        <h1 className="mb-4 text-4xl font-extrabold tracking-tight text-center text-gray-900">
          Browse by Category
        </h1>
        <p className="mb-10 text-lg text-center text-gray-600">
          Find amazing experiences and activities that suit your interests.
        </p>

        <div className="relative w-full max-w-lg mx-auto mb-12">
            <Search className="absolute text-gray-400 -translate-y-1/2 left-4 top-1/2" />
            <Input
                type="text"
                placeholder="Search for a category..."
                className="w-full py-6 pl-12 pr-4 text-base border-gray-200 rounded-full shadow-sm focus-visible:ring-blue-500"
                value={searchQuery}
                onChange={(e) => {
                    setSearchQuery(e.target.value);
                    setCurrentPage(1);
                }}
            />
        </div>

        {currentCategories.length === 0 ? (
          <div className="py-16 text-center">
            <p className="text-xl text-gray-600">
              No categories found for "{searchQuery}".
            </p>
          </div>
        ) : (
          <motion.div
            className="grid flex-grow grid-cols-1 gap-x-6 gap-y-8 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            {currentCategories.map((item) => (
              <motion.div variants={cardVariants} key={item.id}>
                <Link href={`/category/${item.id}`} className="block h-full group">
                  <div className="flex flex-col w-full h-full overflow-hidden transition-all duration-300 bg-white shadow-md rounded-xl hover:shadow-2xl hover:-translate-y-1">
                    <div className="relative overflow-hidden">
                      <img
                        alt={item.name || "Category image"}
                        className="object-cover w-full h-64 transition-transform duration-500 group-hover:scale-110"
                        src={item.imageUrl || DEFAULT_CATEGORY_IMAGE}
                        onError={(e) => {
                          e.currentTarget.onerror = null;
                          e.currentTarget.src = "/assets/error.png";
                        }}
                      />
                       <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>
                       <div className="absolute bottom-4 left-4">
                            <h3 className="text-xl font-bold text-white drop-shadow-lg">{item.name}</h3>
                       </div>
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </motion.div>
        )}

        {totalPages > 1 && (
          <Pagination className="mt-12">
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious href="#" onClick={(e) => { e.preventDefault(); if (currentPage > 1) handlePageChange(currentPage - 1); }} />
              </PaginationItem>
              {getPageNumbers().map((page, index) => (
                <PaginationItem key={`${page}-${index}`}>
                  {page === "..." ? (
                    <PaginationEllipsis />
                  ) : (
                    <PaginationLink href="#" onClick={(e) => { e.preventDefault(); handlePageChange(page); }} isActive={currentPage === page}>
                      {page}
                    </PaginationLink>
                  )}
                </PaginationItem>
              ))}
              <PaginationItem>
                <PaginationNext href="#" onClick={(e) => { e.preventDefault(); if (currentPage < totalPages) handlePageChange(currentPage + 1); }} />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        )}
      </div>
    </motion.div>
  );
};

export default CategoryPage;