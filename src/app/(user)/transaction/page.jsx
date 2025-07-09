"use client";

import React, { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { useTransaction } from "@/hooks/useTransaction";
import { usePromo } from "@/hooks/usePromo";
import { useTransactionProofPayment } from "@/hooks/useTransactionProofPayment";
import { useCancelTransaction } from "@/hooks/useCancelTransaction";
import { useUploadImage } from "@/hooks/useUploadImage";
import { useAuth } from "@/context/AuthContext";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";

// Import UI Components
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogClose,
} from "@/components/ui/dialog";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
  PaginationEllipsis,
} from "@/components/ui/pagination";
import { toast } from "sonner";
import {
  Frown,
  PackageSearch,
  Calendar,
  Ticket,
  Loader2,
  Upload,
  XCircle,
  Clock,
  CheckCircle2,
  FileCheck2,
  Percent,
  Search,
} from "lucide-react";

// Helper functions
const formatCurrency = (amount) =>
  new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(amount);
const formatDate = (dateString) =>
  new Date(dateString).toLocaleDateString("en-US", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

// Variants for Framer Motion animations
const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.1 } },
};

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: { type: "spring", stiffness: 300, damping: 30 },
  },
};

// Status Components
const getDisplayStatus = (transaction) => {
  if (!transaction) return { label: "", Icon: null };
  const status = transaction.status.toLowerCase();
  const hasProof = !!transaction.proofPaymentUrl;

  if (status === "pending") {
    if (hasProof)
      return { label: "Waiting for Confirmation", Icon: FileCheck2 };
    return { label: "Waiting for Payment Proof", Icon: Clock };
  }
  if (status === "paid" || status === "success")
    return { label: "Success", Icon: CheckCircle2 };
  if (status === "cancelled") return { label: "Cancelled", Icon: XCircle };
  if (status === "failed") return { label: "Failed", Icon: XCircle };
  return { label: status, Icon: null };
};

const getStatusClasses = (transaction) => {
  if (!transaction) return "";
  const status = transaction.status.toLowerCase();
  const hasProof = !!transaction.proofPaymentUrl;
  if (status === "pending") {
    if (hasProof)
      return "bg-blue-100 text-blue-800 border-blue-200";
    return "bg-orange-100 text-orange-800 border-orange-200";
  }
  if (status === "paid" || status === "success")
    return "bg-green-100 text-green-800 border-green-200";
  if (status === "cancelled" || status === "failed")
    return "bg-red-100 text-red-800 border-red-200";
  return "bg-gray-100 text-gray-800 border-gray-200";
};

const StatusBadge = ({ transaction, className }) => {
  const { label, Icon } = getDisplayStatus(transaction);
  const statusClasses = getStatusClasses(transaction);
  return (
    <Badge
      className={cn(
        "capitalize flex items-center gap-1.5 border",
        statusClasses,
        className
      )}
    >
      {Icon && <Icon className="h-3.5 w-3.5" />}
      <span>{label}</span>
    </Badge>
  );
};

const TransactionPageSkeleton = () => (
  <div className="min-h-screen py-8 bg-white">
    <div className="container px-4 mx-auto max-w-7xl">
      {/* Header Skeleton */}
      <div className="mb-8">
        <Skeleton className="w-1/3 h-6 mb-2 rounded-lg" />
        <Skeleton className="w-1/2 h-4 rounded-lg" />
      </div>
      
      {/* Search Skeleton */}
      <div className="flex flex-col gap-4 mb-6 sm:flex-row sm:items-center sm:justify-between">
        <Skeleton className="w-full h-10 sm:w-80 rounded-lg" />
        <Skeleton className="w-20 h-8 rounded-lg" />
      </div>

      {/* Transaction Grid Skeleton */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {Array.from({ length: 8 }).map((_, index) => (
          <div key={index} className="overflow-hidden transition-all duration-300 border border-gray-200 bg-white rounded-lg hover:border-blue-300 hover:scale-[1.02]">
            <Skeleton className="w-full aspect-[4/3] rounded-t-lg" />
            <div className="p-3 space-y-2">
              <Skeleton className="w-3/4 h-3 rounded" />
              <Skeleton className="w-1/2 h-2.5 rounded" />
              <div className="flex items-center justify-between">
                <Skeleton className="w-1/3 h-3 rounded" />
                <Skeleton className="w-12 h-6 rounded" />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Pagination Skeleton */}
      <div className="flex items-center justify-center mt-8">
        <Skeleton className="w-48 h-10 rounded-lg" />
      </div>
    </div>
  </div>
);

const TransactionPage = () => {
  const {
    transactions,
    isLoading: isTransactionLoading,
    error,
    fetchTransactions,
  } = useTransaction();
  const { promo: allPromos } = usePromo();
  const { submitProofUrl, isLoading: isSubmittingUrl } =
    useTransactionProofPayment();
  const { cancelTransaction, isLoading: isCancelling } = useCancelTransaction();
  const { uploadImage, isLoading: isUploadingImage } = useUploadImage();
  const { loading: isAuthLoading } = useAuth();

  const [activeTab, setActiveTab] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState(""); // State untuk pencarian
  const [isUploadDialogOpen, setIsUploadDialogOpen] = useState(false);
  const [isCancelDialogOpen, setIsCancelDialogOpen] = useState(false);
  const [selectedTransaction, setSelectedTransaction] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const ITEMS_PER_PAGE = 5;

  const [hasMounted, setHasMounted] = useState(false);

  useEffect(() => {
    if (transactions.length === 0) {
      fetchTransactions();
    }
    setHasMounted(true);
  }, [fetchTransactions, transactions.length]);

  const filteredTransactions = useMemo(() => {
    let items = transactions;

    // Filter by active tab
    const tab = activeTab.toLowerCase();
    if (tab !== "all") {
      const paidStatus = ["paid", "success"];
      items = transactions.filter((t) => {
        const status = t.status.toLowerCase();
        const hasProof = !!t.proofPaymentUrl;
        switch (tab) {
          case "unpaid":
            return status === "pending" && !hasProof;
          case "waiting confirmation":
            return status === "pending" && hasProof;
          case "paid":
            return paidStatus.includes(status);
          case "cancelled":
            return status === "cancelled";
          case "failed":
            return status === "failed";
          default:
            return true;
        }
      });
    }

    // Filter by search query
    if (searchQuery) {
      items = items.filter(
        (t) =>
          t.invoiceId.toLowerCase().includes(searchQuery.toLowerCase()) ||
          t.transaction_items.some((product) =>
            product.title.toLowerCase().includes(searchQuery.toLowerCase())
          )
      );
    }

    return items;
  }, [transactions, activeTab, searchQuery]);

  const transactionCounts = useMemo(() => {
    const counts = {
      all: transactions.length,
      unpaid: 0,
      waitingConfirmation: 0,
      paid: 0,
      cancelled: 0,
      failed: 0,
    };

    transactions.forEach((t) => {
      const status = t.status.toLowerCase();
      const hasProof = !!t.proofPaymentUrl;

      if (status === "pending") {
        if (hasProof) {
          counts.waitingConfirmation++;
        } else {
          counts.unpaid++;
        }
      } else if (["paid", "success"].includes(status)) {
        counts.paid++;
      } else if (status === "cancelled") {
        counts.cancelled++;
      } else if (status === "failed") {
        counts.failed++;
      }
    });

    return counts;
  }, [transactions]);

  const totalPages = Math.ceil(filteredTransactions.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const paginatedTransactions = filteredTransactions.slice(
    startIndex,
    startIndex + ITEMS_PER_PAGE
  );

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

  const handlePageChange = (page) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleOpenUploadDialog = (transaction) => {
    setSelectedTransaction(transaction);
    setIsUploadDialogOpen(true);
  };

  const handleOpenCancelDialog = (transaction) => {
    setSelectedTransaction(transaction);
    setIsCancelDialogOpen(true);
  };

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      setSelectedFile(file);
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
    }
  };

  const handleCancelSubmit = async () => {
    if (!selectedTransaction) return;
    const cancelToast = toast.loading("Cancelling transaction...");
    try {
      await cancelTransaction(selectedTransaction.id);
      toast.success("Transaction cancelled successfully!", { id: cancelToast });
      await fetchTransactions();
      setIsCancelDialogOpen(false);
      setSelectedTransaction(null);
    } catch (err) {
      toast.error(err.message || "Failed to cancel transaction.", { id: cancelToast });
    }
  };

  const handleUploadSubmit = async () => {
    if (!selectedFile || !selectedTransaction) return;
    const uploadToast = toast.loading("Uploading image...");
    try {
      const imageUrl = await uploadImage(selectedFile);
      toast.loading("Image uploaded. Submitting proof...", { id: uploadToast });
      if (imageUrl) {
        await submitProofUrl(selectedTransaction.id, imageUrl);
        toast.success("Proof of payment submitted successfully!", {
          id: uploadToast,
        });
        await fetchTransactions();
        setIsUploadDialogOpen(false);
        setSelectedFile(null);
        setPreviewUrl(null);
      }
    } catch (err) {
      toast.error(err.message || "Failed to upload proof of payment.", {
        id: uploadToast,
      });
    }
  };

  const isUploadingProcess = isUploadingImage || isSubmittingUrl;
  const isLoading = isAuthLoading || isTransactionLoading || !hasMounted;

  if (isLoading) {
    return <TransactionPageSkeleton />;
  }

  if (error) {
    return (
      <div className="container py-8 mx-auto text-center">
        <div className="flex flex-col items-center justify-center min-h-[60vh]">
          <div className="flex items-center justify-center w-24 h-24 mx-auto mb-6 bg-red-100 rounded-full">
            <svg className="w-12 h-12 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
              />
            </svg>
          </div>
          <h1 className="mb-4 text-3xl font-bold text-gray-900">Error Loading Transactions</h1>
          <p className="text-gray-600">Failed to load transactions. Please try again later.</p>
        </div>
      </div>
    );
  }

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key="transaction-page"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="min-h-screen py-8 bg-white"
      >
        <div className="container px-4 mx-auto max-w-7xl">
          <div className="mb-8 text-center">
            <h1 className="mb-4 text-4xl font-bold text-gray-900 sm:text-5xl lg:text-6xl">
              My Transactions
            </h1>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              View and manage your booking history
            </p>
          </div>
          
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.75 }}
            className="min-h-screen bg-white"
          >
            <div className="px-4 py-12 mx-auto max-w-7xl sm:px-6 lg:px-8">
              <Dialog
                open={isUploadDialogOpen}
                onOpenChange={(isOpen) => {
                  if (!isOpen) {
                    setSelectedFile(null);
                    setPreviewUrl(null);
                  }
                  setIsUploadDialogOpen(isOpen);
                }}
              >
                <DialogContent className="sm:max-w-[425px] rounded-3xl border border-blue-100 shadow-2xl bg-white/95 backdrop-blur-sm">
                  <DialogHeader>
                    <DialogTitle className="text-xl font-bold text-gray-900">Upload Proof of Payment</DialogTitle>
                    <DialogDescription className="text-gray-600">
                      For Invoice: {selectedTransaction?.invoiceId}
                    </DialogDescription>
                  </DialogHeader>
                  <div className="py-4 space-y-4">
                    <Input
                      type="file"
                      accept="image/png, image/jpeg, image/jpg"
                      onChange={handleFileChange}
                      className="border-blue-200 rounded-2xl focus:border-blue-500 focus:ring-blue-100"
                    />
                    {previewUrl && (
                      <img
                        src={previewUrl}
                        alt="Preview"
                        className="object-contain w-full mt-4 rounded-2xl max-h-60 border border-blue-100"
                      />
                    )}
                  </div>
                  <DialogFooter className="gap-2">
                    <DialogClose asChild>
                      <Button variant="outline" className="border-blue-200 hover:bg-blue-50 rounded-2xl">
                        Cancel
                      </Button>
                    </DialogClose>
                    <Button
                      onClick={handleUploadSubmit}
                      disabled={!selectedFile || isUploadingProcess}
                      className="bg-blue-600 hover:bg-blue-700 text-white shadow-lg transition-all duration-200 rounded-2xl"
                    >
                      {isUploadingProcess ? (
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      ) : (
                        <Upload className="w-4 h-4 mr-2" />
                      )}{" "}
                      {isUploadingImage ? "Uploading..." : "Submitting..."}
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
              
              <Dialog open={isCancelDialogOpen} onOpenChange={setIsCancelDialogOpen}>
                <DialogContent className="sm:max-w-[425px] rounded-3xl border border-blue-100 shadow-2xl bg-white/95 backdrop-blur-sm">
                  <DialogHeader>
                    <DialogTitle className="text-xl font-bold text-gray-900">Confirm Cancellation</DialogTitle>
                    <DialogDescription className="text-gray-600">
                      Are you sure you want to cancel the transaction with invoice{" "}
                      {selectedTransaction?.invoiceId}? This action cannot be undone.
                    </DialogDescription>
                  </DialogHeader>
                  <DialogFooter className="gap-2">
                    <DialogClose asChild>
                      <Button variant="outline" className="border-blue-200 hover:bg-blue-50 rounded-2xl">
                        No
                      </Button>
                    </DialogClose>
                    <Button
                      variant="destructive"
                      onClick={handleCancelSubmit}
                      disabled={isCancelling}
                      className="bg-red-600 hover:bg-red-700 rounded-2xl shadow-lg transition-all duration-200"
                    >
                      {isCancelling ? (
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      ) : null}{" "}
                      Yes, Cancel
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>

              <div className="flex flex-col items-start justify-between gap-4 mb-8 md:flex-row md:items-center">
                <h1 className="text-2xl font-bold tracking-tight text-gray-900 md:text-3xl lg:text-4xl">
                  Transaction History
                </h1>
                <div className="relative w-full md:w-auto md:min-w-[320px]">
                  <Search className="absolute text-gray-400 -translate-y-1/2 left-4 top-1/2 pointer-events-none" />
                  <input
                    type="text"
                    placeholder="Search by invoice or activity..."
                    className="w-full pl-10 pr-4 py-3 text-base border border-gray-200 rounded-xl bg-white/80 backdrop-blur-sm transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 hover:border-gray-300 hover:bg-white/90"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
              </div>

              <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-8">
                <TabsList className="grid w-full h-auto grid-cols-3 gap-2 p-2 bg-white/80 backdrop-blur-sm border border-blue-100 rounded-2xl sm:grid-cols-6">
                  <TabsTrigger value="all" className="rounded-xl data-[state=active]:bg-blue-600 data-[state=active]:text-white">
                    All{" "}
                    <Badge variant="secondary" className="ml-2 bg-blue-100 text-blue-800">
                      {transactionCounts.all}
                    </Badge>
                  </TabsTrigger>
                  <TabsTrigger value="unpaid" className="rounded-xl data-[state=active]:bg-blue-600 data-[state=active]:text-white">
                    Pending{" "}
                    <Badge variant="secondary" className="ml-2 bg-orange-100 text-orange-800">
                      {transactionCounts.unpaid}
                    </Badge>
                  </TabsTrigger>
                  <TabsTrigger value="waiting confirmation" className="rounded-xl data-[state=active]:bg-blue-600 data-[state=active]:text-white">
                    Confirming{" "}
                    <Badge variant="secondary" className="ml-2 bg-blue-100 text-blue-800">
                      {transactionCounts.waitingConfirmation}
                    </Badge>
                  </TabsTrigger>
                  <TabsTrigger value="paid" className="rounded-xl data-[state=active]:bg-blue-600 data-[state=active]:text-white">
                    Success{" "}
                    <Badge variant="secondary" className="ml-2 bg-green-100 text-green-800">
                      {transactionCounts.paid}
                    </Badge>
                  </TabsTrigger>
                  <TabsTrigger value="cancelled" className="rounded-xl data-[state=active]:bg-blue-600 data-[state=active]:text-white">
                    Cancelled{" "}
                    <Badge variant="secondary" className="ml-2 bg-red-100 text-red-800">
                      {transactionCounts.cancelled}
                    </Badge>
                  </TabsTrigger>
                  <TabsTrigger value="failed" className="rounded-xl data-[state=active]:bg-blue-600 data-[state=active]:text-white">
                    Failed{" "}
                    <Badge variant="secondary" className="ml-2 bg-red-100 text-red-800">
                      {transactionCounts.failed}
                    </Badge>
                  </TabsTrigger>
                </TabsList>
              </Tabs>

              <div className="mt-6">
                {paginatedTransactions.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-16 text-center">
                    <div className="flex items-center justify-center w-24 h-24 mx-auto mb-6 bg-blue-100 rounded-full">
                      <PackageSearch className="w-12 h-12 text-blue-600" />
                    </div>
                    <h2 className="text-xl font-bold text-gray-900 md:text-2xl tracking-tight">No Transactions Found</h2>
                    <p className="mt-2 text-gray-600">
                      {searchQuery
                        ? `No results for "${searchQuery}".`
                        : "There are no transactions in this category."}
                    </p>
                  </div>
                ) : (
                  <>
                    <motion.div
                      className="space-y-4"
                      variants={containerVariants}
                      initial="hidden"
                      animate="visible"
                    >
                      {paginatedTransactions.map((item) => {
                        const firstProduct = item.transaction_items?.[0];
                        const isWaitingForPayment =
                          item.status.toLowerCase() === "pending" &&
                          !item.proofPaymentUrl;
                        const correctSubtotal = item.transaction_items.reduce(
                          (acc, product) => acc + product.price * product.quantity,
                          0
                        );
                        const appliedPromo =
                          item.promoId && allPromos.length > 0
                            ? allPromos.find((p) => p.id === item.promoId)
                            : null;
                        const correctDiscount = appliedPromo
                          ? appliedPromo.promo_discount_price
                          : 0;
                        const correctGrandTotal = Math.max(
                          0,
                          correctSubtotal - correctDiscount
                        );

                        return (
                          <motion.div
                            key={item.id}
                            variants={itemVariants}
                            className="p-6 transition-all duration-300 border border-blue-100 shadow-lg bg-white/90 backdrop-blur-sm rounded-3xl hover:shadow-2xl hover:-translate-y-1"
                          >
                            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                              <div className="flex items-center flex-grow gap-4">
                                <img
                                  src={
                                    firstProduct?.imageUrls?.[0] ||
                                    "/assets/banner-authpage.png"
                                  }
                                  alt={firstProduct?.title || "Product Image"}
                                  className="object-cover w-16 h-16 rounded-2xl shrink-0 shadow-sm"
                                  onError={(e) => {
                                    e.currentTarget.onerror = null;
                                    e.currentTarget.src = "/assets/error.png";
                                  }}
                                />
                                <div className="flex-grow">
                                  {/* Status Badge for Mobile - Above Invoice */}
                                  <div className="mb-2 sm:hidden">
                                    <StatusBadge
                                      transaction={item}
                                      className="text-xs"
                                    />
                                  </div>
                                  
                                  <div className="flex items-center justify-between">
                                    <p className="text-base font-bold text-gray-800">
                                      {item.invoiceId}
                                    </p>
                                  </div>
                                  <p className="text-sm font-medium text-gray-900">
                                    {firstProduct?.title}
                                    {item.transaction_items.length > 1 && (
                                      <span className="font-normal text-gray-500">
                                        {" "}
                                        and {item.transaction_items.length - 1} others
                                      </span>
                                    )}
                                  </p>
                                  <div className="flex flex-wrap items-center mt-2 text-xs gap-x-4 gap-y-1 text-gray-500">
                                    <span className="flex items-center gap-1.5">
                                      <Ticket size={12} />
                                      {firstProduct?.quantity} tickets
                                    </span>
                                    <span className="flex items-center gap-1.5">
                                      <img
                                        src={item.payment_method?.imageUrl}
                                        alt={item.payment_method?.name}
                                        className="object-contain w-auto h-3"
                                      />
                                      {item.payment_method?.name}
                                    </span>
                                    <span className="flex items-center gap-1.5">
                                      <Calendar size={12} />
                                      {formatDate(item.orderDate)}
                                    </span>
                                  </div>
                                </div>
                              </div>
                              <div className="flex items-center justify-between sm:flex-col sm:items-end sm:justify-center shrink-0 sm:w-48">
                                {/* Status Badge for Desktop */}
                                <StatusBadge
                                  transaction={item}
                                  className="hidden sm:flex"
                                />
                                <div className="mt-2 flex items-center gap-2 sm:flex-col sm:items-end">
                                  <p className="text-sm text-gray-500">Total</p>
                                  {appliedPromo ? (
                                    <>
                                      <p className="text-xs text-gray-500 line-through">
                                        {formatCurrency(correctSubtotal)}
                                      </p>
                                      <p className="font-bold text-blue-600">
                                        {formatCurrency(correctGrandTotal)}
                                      </p>
                                    </>
                                  ) : (
                                    <p className="font-bold text-blue-600">
                                      {formatCurrency(correctSubtotal)}
                                    </p>
                                  )}
                                </div>
                              </div>
                            </div>
                            {appliedPromo && (
                              <div className="flex items-center gap-2 p-3 mt-4 text-xs text-green-700 bg-green-100 rounded-2xl border border-green-200">
                                <Percent className="w-4 h-4" />
                                Promo{" "}
                                <span className="font-semibold">
                                  {appliedPromo.promo_code}
                                </span>{" "}
                                applied (-{formatCurrency(correctDiscount)})
                              </div>
                            )}
                            {isWaitingForPayment ? (
                              <div className="flex flex-col gap-2 pt-4 mt-4 border-t border-blue-100 sm:flex-row">
                                <Button
                                  onClick={() => handleOpenUploadDialog(item)}
                                  className="flex-1 w-full bg-blue-600 sm:w-auto hover:bg-blue-700 text-white shadow-lg transition-all duration-200 rounded-2xl"
                                >
                                  <Upload className="w-4 h-4 mr-2" /> Upload Proof
                                </Button>
                                <Button
                                  asChild
                                  className="flex-1 w-full sm:w-auto border-blue-200 hover:bg-blue-50 hover:text-blue-600 transition-all duration-200 rounded-2xl"
                                  variant="outline"
                                >
                                  <Link href={`/transaction/${item.id}`}>
                                    View Details
                                  </Link>
                                </Button>
                                <Button
                                  onClick={() => handleOpenCancelDialog(item)}
                                  variant="outline"
                                  size="sm"
                                  className="w-full sm:w-auto border-red-200 hover:bg-red-50 hover:text-red-600 transition-all duration-200 rounded-2xl"
                                >
                                  <XCircle className="w-4 h-4 mr-2" /> Cancel
                                </Button>
                              </div>
                            ) : (
                              <div className="pt-4 mt-4 border-t border-blue-100">
                                <Button 
                                  asChild 
                                  className="w-full border-blue-200 hover:bg-blue-50 hover:text-blue-600 transition-all duration-200 rounded-2xl" 
                                  variant="outline"
                                >
                                  <Link href={`/transaction/${item.id}`}>
                                    View Details
                                  </Link>
                                </Button>
                              </div>
                            )}
                          </motion.div>
                        );
                      })}
                    </motion.div>
                    {totalPages > 1 && (
                      <Pagination className="mt-10">
                        <PaginationContent>
                          <PaginationItem>
                            <PaginationPrevious
                              href="#"
                              onClick={(e) => {
                                e.preventDefault();
                                handlePageChange(currentPage - 1);
                              }}
                              className="rounded-xl hover:bg-blue-50"
                            />
                          </PaginationItem>
                          {getPageNumbers().map((page, index) => (
                            <PaginationItem key={index}>
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
                                  className={currentPage === page ? "bg-blue-600 text-white hover:bg-blue-700 rounded-xl" : "rounded-xl hover:bg-blue-50"}
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
                                handlePageChange(currentPage + 1);
                              }}
                              className="rounded-xl hover:bg-blue-50"
                            />
                          </PaginationItem>
                        </PaginationContent>
                      </Pagination>
                    )}
                  </>
                )}
              </div>
            </div>
          </motion.div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};

export default TransactionPage;
