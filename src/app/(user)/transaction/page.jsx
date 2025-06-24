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
import { motion } from "framer-motion";

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
      return "bg-blue-100 text-blue-800 border-transparent hover:bg-blue-100/80 dark:bg-blue-900/30 dark:text-blue-300";
    return "bg-orange-100 text-orange-800 border-transparent hover:bg-orange-100/80 dark:bg-orange-900/30 dark:text-orange-300";
  }
  if (status === "paid" || status === "success")
    return "bg-green-100 text-green-800 border-transparent hover:bg-green-100/80 dark:bg-green-900/30 dark:text-green-300";
  if (status === "cancelled" || status === "failed")
    return "bg-red-100 text-red-800 border-transparent hover:bg-red-100/80 dark:bg-red-900/30 dark:text-red-300";
  return "border-transparent bg-gray-100 text-gray-800 hover:bg-gray-100/80 dark:bg-gray-700 dark:text-gray-300";
};

const StatusBadge = ({ transaction, className }) => {
  const { label, Icon } = getDisplayStatus(transaction);
  const statusClasses = getStatusClasses(transaction);
  return (
    <Badge
      className={cn(
        "capitalize flex items-center gap-1.5",
        statusClasses,
        className
      )}
    >
      {Icon && <Icon className="h-3.5 w-3.5" />}
      <span>{label}</span>
    </Badge>
  );
};

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

  useEffect(() => {
    if (transactions.length === 0) {
      fetchTransactions();
    }
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
  }, [activeTab, transactions, searchQuery]);

  useEffect(() => {
    setCurrentPage(1);
  }, [activeTab, searchQuery]);

  const paginatedTransactions = useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredTransactions.slice(startIndex, startIndex + ITEMS_PER_PAGE);
  }, [filteredTransactions, currentPage]);

  const totalPages = Math.ceil(filteredTransactions.length / ITEMS_PER_PAGE);

  const getPageNumbers = () => {
    const pageNumbers = [];
    if (totalPages <= 7) {
      for (let i = 1; i <= totalPages; i++) pageNumbers.push(i);
    } else if (currentPage <= 4) {
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
    return pageNumbers;
  };

  const handlePageChange = (page) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
      window.scrollTo(0, 0);
    }
  };

  const transactionCounts = useMemo(() => {
    const paidStatus = ["paid", "success"];
    return {
      all: transactions.length,
      unpaid: transactions.filter(
        (t) => t.status.toLowerCase() === "pending" && !t.proofPaymentUrl
      ).length,
      waitingConfirmation: transactions.filter(
        (t) => t.status.toLowerCase() === "pending" && !!t.proofPaymentUrl
      ).length,
      paid: transactions.filter((t) =>
        paidStatus.includes(t.status.toLowerCase())
      ).length,
      cancelled: transactions.filter(
        (t) => t.status.toLowerCase() === "cancelled"
      ).length,
      failed: transactions.filter((t) => t.status.toLowerCase() === "failed")
        .length,
    };
  }, [transactions]);

  const handleOpenUploadDialog = (transaction) => {
    setSelectedTransaction(transaction);
    setIsUploadDialogOpen(true);
  };
  const handleOpenCancelDialog = (transaction) => {
    setSelectedTransaction(transaction);
    setIsCancelDialogOpen(true);
  };
  const handleFileChange = (event) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };
  const handleCancelSubmit = async () => {
    if (!selectedTransaction) return;
    try {
      await cancelTransaction(selectedTransaction.id);
      toast.success("Transaction successfully cancelled.");
      await fetchTransactions();
      setIsCancelDialogOpen(false);
    } catch (err) {
      toast.error(
        err.response?.data?.message || "Failed to cancel transaction."
      );
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
  const isLoading = isTransactionLoading || isAuthLoading;

  if (isLoading) {
    return (
      <div className="px-4 py-12 mx-auto max-w-7xl sm:px-6 lg:px-8">
        <Skeleton className="w-1/3 h-10 mb-8" />
        <Skeleton className="w-full h-12 mb-6" />
        <div className="space-y-4">
          {Array.from({ length: 4 }).map((_, index) => (
            <Skeleton key={index} className="w-full h-40 rounded-xl" />
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
        <Frown className="w-16 h-16 text-red-500" />
        <h2 className="mt-4 text-2xl font-bold">Failed to load data</h2>
        <p className="mt-2 text-muted-foreground">{error.message}</p>
        <Button onClick={() => fetchTransactions()} className="mt-4">
          Try Again
        </Button>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.75 }}
      className="px-4 py-12 mx-auto max-w-7xl sm:px-6 lg:px-8"
    >
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
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Upload Proof of Payment</DialogTitle>
            <DialogDescription>
              For Invoice: {selectedTransaction?.invoiceId}
            </DialogDescription>
          </DialogHeader>
          <div className="py-4 space-y-4">
            <Input
              type="file"
              accept="image/png, image/jpeg, image/jpg"
              onChange={handleFileChange}
            />
            {previewUrl && (
              <img
                src={previewUrl}
                alt="Preview"
                className="object-contain w-full mt-4 rounded-md max-h-60"
              />
            )}
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">Cancel</Button>
            </DialogClose>
            <Button
              onClick={handleUploadSubmit}
              disabled={!selectedFile || isUploadingProcess}
              className="bg-blue-600 hover:bg-blue-700"
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
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Cancellation</DialogTitle>
            <DialogDescription>
              Are you sure you want to cancel the transaction with invoice{" "}
              {selectedTransaction?.invoiceId}? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">No</Button>
            </DialogClose>
            <Button
              variant="destructive"
              onClick={handleCancelSubmit}
              disabled={isCancelling}
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
        <h1 className="text-3xl font-bold tracking-tight">
          Transaction History
        </h1>
        <div className="relative w-full md:w-auto md:min-w-[320px]">
          <Search className="absolute text-gray-400 -translate-y-1/2 left-3 top-1/2" />
          <Input
            type="text"
            placeholder="Search by invoice or activity..."
            className="w-full py-5 pr-4 border-gray-200 rounded-lg shadow-sm pl-11 focus-visible:ring-blue-500"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full h-auto grid-cols-3 gap-1 sm:grid-cols-6 sm:h-10">
          <TabsTrigger value="all">
            All{" "}
            <Badge variant="secondary" className="ml-2">
              {transactionCounts.all}
            </Badge>
          </TabsTrigger>
          <TabsTrigger value="unpaid">
            Pending{" "}
            <Badge variant="secondary" className="ml-2">
              {transactionCounts.unpaid}
            </Badge>
          </TabsTrigger>
          <TabsTrigger value="waiting confirmation">
            Confirming{" "}
            <Badge variant="secondary" className="ml-2">
              {transactionCounts.waitingConfirmation}
            </Badge>
          </TabsTrigger>
          <TabsTrigger value="paid">
            Success{" "}
            <Badge variant="secondary" className="ml-2">
              {transactionCounts.paid}
            </Badge>
          </TabsTrigger>
          <TabsTrigger value="cancelled">
            Cancelled{" "}
            <Badge variant="secondary" className="ml-2">
              {transactionCounts.cancelled}
            </Badge>
          </TabsTrigger>
          <TabsTrigger value="failed">
            Failed{" "}
            <Badge variant="secondary" className="ml-2">
              {transactionCounts.failed}
            </Badge>
          </TabsTrigger>
        </TabsList>
      </Tabs>

      <div className="mt-6">
        {paginatedTransactions.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <PackageSearch className="w-16 h-16 text-gray-400" />
            <h2 className="mt-4 text-2xl font-bold">No Transactions Found</h2>
            <p className="mt-2 text-muted-foreground">
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
                    className="p-4 transition-all duration-300 bg-white border shadow-sm rounded-xl group hover:shadow-lg hover:-translate-y-1"
                  >
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                      <div className="flex items-center flex-grow gap-4">
                        <img
                          src={
                            firstProduct?.imageUrls?.[0] ||
                            "/assets/banner-authpage.png"
                          }
                          alt={firstProduct?.title || "Product Image"}
                          className="object-cover w-16 h-16 rounded-lg shrink-0"
                          onError={(e) => {
                            e.currentTarget.onerror = null;
                            e.currentTarget.src = "/assets/error.png";
                          }}
                        />
                        <div className="flex-grow">
                          <div className="flex items-center justify-between">
                            <p className="text-base font-bold text-gray-800">
                              {item.invoiceId}
                            </p>
                            <StatusBadge
                              transaction={item}
                              className="sm:hidden"
                            />
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
                          <div className="flex flex-wrap items-center mt-1 text-xs gap-x-4 gap-y-1 text-muted-foreground">
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
                        <StatusBadge
                          transaction={item}
                          className="hidden sm:flex"
                        />
                        <div className="mt-1 text-right">
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
                      <div className="flex items-center gap-2 p-2 mt-3 text-xs text-green-700 bg-green-100 rounded-md">
                        <Percent className="w-4 h-4" />
                        Promo{" "}
                        <span className="font-semibold">
                          {appliedPromo.promo_code}
                        </span>{" "}
                        applied (-{formatCurrency(correctDiscount)})
                      </div>
                    )}
                    {isWaitingForPayment ? (
                      <div className="flex flex-col gap-2 pt-4 mt-4 border-t sm:flex-row">
                        <Button
                          onClick={() => handleOpenUploadDialog(item)}
                          className="flex-1 w-full bg-blue-600 sm:w-auto hover:bg-blue-700"
                        >
                          <Upload className="w-4 h-4 mr-2" /> Upload Proof
                        </Button>
                        <Button
                          asChild
                          className="flex-1 w-full sm:w-auto"
                          variant="secondary"
                        >
                          <Link href={`/transaction/${item.id}`}>
                            View Details
                          </Link>
                        </Button>
                        <Button
                          onClick={() => handleOpenCancelDialog(item)}
                          variant="outline"
                          size="sm"
                          className="w-full sm:w-auto hover:bg-red-50 hover:text-red-600"
                        >
                          <XCircle className="w-4 h-4 mr-2" /> Cancel
                        </Button>
                      </div>
                    ) : (
                      <div className="pt-4 mt-4 border-t">
                        <Button asChild className="w-full" variant="secondary">
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
                    />
                  </PaginationItem>
                </PaginationContent>
              </Pagination>
            )}
          </>
        )}
      </div>
    </motion.div>
  );
};

export default TransactionPage;
