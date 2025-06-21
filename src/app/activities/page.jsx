"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { useActivity } from "@/hooks/useActivity";
import { useCart } from "@/hooks/useCart";
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
import { Card, CardBody, CardFooter } from "@heroui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import { MapPin, Star, Loader2, ShoppingCart, Search, Frown } from "lucide-react";
import { toast } from "sonner";
import { motion } from "framer-motion";
import BannerSection from "@/components/ui/user/BannerSection";
import CategorySection from "@/components/ui/user/CategorySection";
import ActivityDiscountSection from "@/components/ui/user/ActivityDiscountSection";

const DEFAULT_ACTIVITY_IMAGE = "/assets/banner-authpage.png";
const ITEMS_PER_PAGE = 8;

// Variants for Framer Motion animations
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

// Helper function
const formatCurrency = (amount) =>
  new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(amount);

const Activity = () => {
  const { activity, isLoading: isActivityLoading, error } = useActivity();
  const { addToCart } = useCart();
  const { user, loading: isAuthLoading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  const [currentPage, setCurrentPage] = useState(1);
  const [addingItemId, setAddingItemId] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");

  const handleAddToCart = async (e, item) => {
    e.stopPropagation();
    e.preventDefault();

    if (!user) {
      toast.info("Please log in to add items to your cart.");
      router.push(`/login?redirect=${pathname}`);
      return;
    }

    setAddingItemId(item.id);
    try {
      await addToCart(item.id, 1);
      toast.success(`"${item.title}" has been added successfully!`);
    } catch (err) {
      console.error("Failed to add to cart:", err);
      toast.error("Failed to add item. It might already be in the cart or an error occurred.");
    } finally {
      setAddingItemId(null);
    }
  };

  // Filter activities based on search query
  const filteredActivities = useMemo(() => {
    if (!activity) return [];
    if (!searchQuery) return activity;
    return activity.filter(act =>
      act.title.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [activity, searchQuery]);

  // Pagination logic based on filtered results
  const totalPages = Math.ceil(filteredActivities.length / ITEMS_PER_PAGE);
  const indexOfLastItem = currentPage * ITEMS_PER_PAGE;
  const indexOfFirstItem = indexOfLastItem - ITEMS_PER_PAGE;
  const currentActivities = filteredActivities.slice(indexOfFirstItem, indexOfLastItem);

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

  const isLoading = isActivityLoading || isAuthLoading;

  if (isLoading) {
    return (
      <div className="bg-gray-50">
        <Skeleton className="w-full h-[400px]" />
        <div className="flex items-center justify-center py-24">
          <div className="grid w-full grid-cols-1 gap-6 px-4 mx-auto sm:grid-cols-2 lg:grid-cols-4 max-w-7xl">
            {Array.from({ length: 8 }).map((_, index) => (
              <div key={index} className="space-y-3">
                <Skeleton className="w-full h-48 rounded-xl" />
                <Skeleton className="w-5/6 h-6" />
                <Skeleton className="w-3/4 h-5" />
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-screen text-center">
        <Frown className="w-16 h-16 text-red-500" />
        <h2 className="mt-4 text-2xl font-bold">An Error Occurred</h2>
        <p className="mt-2 text-red-500">Error: {error.message}</p>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.75 }}
    >
      <BannerSection />
      <div className="min-h-screen bg-gray-50">
        <div className="flex flex-col px-4 py-12 mx-auto max-w-7xl sm:px-6 lg:px-8">
          <h1 className="mb-4 text-4xl font-extrabold tracking-tight text-center text-gray-900">
            Explore Fun Activities
          </h1>
          <p className="mb-10 text-lg text-center text-gray-600">
            Discover unforgettable adventures at your favorite destinations.
          </p>
          
          <div className="relative w-full max-w-lg mx-auto mb-12">
              <Search className="absolute text-gray-400 -translate-y-1/2 left-4 top-1/2" />
              <Input 
                  type="text"
                  placeholder="Search for an activity..."
                  className="w-full py-6 pl-12 pr-4 text-base border-gray-200 rounded-full shadow-sm focus-visible:ring-blue-500"
                  value={searchQuery}
                  onChange={(e) => {
                      setSearchQuery(e.target.value);
                      setCurrentPage(1); 
                  }}
              />
          </div>

          {currentActivities.length === 0 ? (
            <div className="py-16 text-center">
              <p className="text-xl text-gray-600">
                {searchQuery ? `No activities found for "${searchQuery}".` : "No activities available at the moment."}
              </p>
            </div>
          ) : (
            <motion.div
              className="grid flex-grow grid-cols-1 gap-x-6 gap-y-8 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
              variants={containerVariants}
              initial="hidden"
              animate="visible"
            >
              {currentActivities.map((item) => (
                <motion.div variants={cardVariants} key={item.id}>
                  <Card className="flex flex-col w-full h-full overflow-hidden transition-all duration-300 bg-white shadow-md rounded-xl hover:shadow-2xl hover:-translate-y-1 group">
                    <Link href={`/activities/${item.id}`} className="block">
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
                            <span className="font-bold">{item.rating.toFixed(1)}</span>
                          </div>
                          <span className="text-gray-500">({item.total_reviews} reviews)</span>
                        </div>
                        <h3 className="h-12 mt-1 text-base font-bold text-gray-900 line-clamp-2 group-hover:text-blue-600" title={item.title}>
                          {item.title || "No title"}
                        </h3>
                        <div className="flex items-center mt-1 text-xs text-gray-500">
                          <MapPin size={14} className="mr-1.5 flex-shrink-0" />
                          <p className="truncate">{item.address}</p>
                        </div>
                      </CardBody>
                    </Link>
                    <CardFooter className="p-4 pt-2 mt-auto border-t border-gray-100">
                      <div className="flex items-end justify-between w-full">
                        <div>
                          {item.price_discount > 0 && item.price_discount < item.price ? (
                            <>
                              <p className="text-xs text-red-500 line-through">{formatCurrency(item.price)}</p>
                              <p className="text-lg font-bold text-blue-600">{formatCurrency(item.price_discount)}</p>
                            </>
                          ) : (
                            <p className="text-lg font-bold text-blue-600">{formatCurrency(item.price)}</p>
                          )}
                        </div>
                        <Button size="icon" variant="outline" className="text-blue-600 transition-colors duration-300 border-blue-200 hover:bg-blue-600 hover:text-white" onClick={(e) => handleAddToCart(e, item)} disabled={addingItemId === item.id}>
                            {addingItemId === item.id ? <Loader2 className="w-4 h-4 animate-spin"/> : <ShoppingCart className="w-4 h-4" />}
                        </Button>
                      </div>
                    </CardFooter>
                  </Card>
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
      </div>
      <ActivityDiscountSection />
      <CategorySection className="bg-gray-50" />
    </motion.div>
  );
};

export default Activity;
