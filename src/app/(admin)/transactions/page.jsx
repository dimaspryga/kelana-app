"use client";

import React, { useState, useMemo, useEffect } from "react";
import Link from "next/link";
import { useAllTransactions } from "@/hooks/useAllTransactions";
import { useTransactionActions } from "@/hooks/useTransactionActions";
import { useAuth } from "@/context/AuthContext";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { Badge } from "@/components/ui/badge";
import {
  Frown,
  Search,
  Loader2,
  PackageCheck,
  PackageX,
  Hourglass,
  Edit,
  ArrowUp,
  ArrowDown,
  ImageIcon,
  XCircle,
  Wallet,
} from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { toast } from "sonner";
import clsx from "clsx";

const ITEMS_PER_PAGE = 10;

const statusConfig = {
  UNPAID: {
    label: "Waiting for Payment Proof",
    icon: Wallet,
    className: "bg-gray-100 text-gray-800 border-gray-300",
  },
  CONFIRMATION: {
    label: "Waiting for Confirmation",
    icon: Hourglass,
    className: "bg-blue-100 text-blue-800 border-blue-300",
  },
  SUCCESS: {
    label: "Success",
    icon: PackageCheck,
    className: "bg-green-100 text-green-800 border-green-300",
  },
  CANCELLED: {
    label: "Cancelled",
    icon: PackageX,
    className: "bg-red-100 text-red-800 border-red-300",
  },
  FAILED: {
    label: "Failed",
    icon: XCircle,
    className: "bg-destructive/10 text-destructive border-destructive/30",
  },
};

const filterStatuses = [
  { key: "ALL", label: "All" },
  { key: "UNPAID", label: "Pending" },
  { key: "CONFIRMATION", label: "Confirming" },
  { key: "SUCCESS", label: "Success" },
  { key: "CANCELLED", label: "Cancelled" },
  { key: "FAILED", label: "Failed" },
];

const TransactionManagementPage = () => {
  const {
    transactions,
    isLoading: isTransactionsLoading,
    error,
    mutate,
  } = useAllTransactions();
  const { loading: isAuthLoading } = useAuth();
  const { cancelTransaction, isMutating } = useTransactionActions();

  const [statusFilter, setStatusFilter] = useState("ALL");
  const [searchFilter, setSearchFilter] = useState("");
  const [transactionToCancel, setTransactionToCancel] = useState(null);
  const [sortConfig, setSortConfig] = useState({
    key: "orderDate",
    direction: "desc",
  });
  const [currentPage, setCurrentPage] = useState(1);

  const isLoading = isTransactionsLoading || isAuthLoading;

  const mapApiStatusToDisplayStatus = (transaction) => {
    const apiStatus = transaction.status?.toUpperCase();
    const hasPaymentProof = !!transaction.proofPaymentUrl;

    if (apiStatus === "PENDING") {
      return hasPaymentProof ? "CONFIRMATION" : "UNPAID";
    }
    return apiStatus;
  };
  
  const processedTransactions = useMemo(() => {
    if (isLoading || !Array.isArray(transactions)) return [];

    let sortableTransactions = [...transactions];

    const transactionsWithCalculatedDetails = sortableTransactions.map((t) => {
        const calculatedTotal = t.transaction_items?.reduce(
            (acc, item) => acc + (item.price || 0) * (item.quantity || 1),
            0
        );
        return {
            ...t,
            displayStatus: mapApiStatusToDisplayStatus(t),
            calculatedTotalAmount: calculatedTotal || t.totalAmount
        };
    });

    let filteredTransactions = transactionsWithCalculatedDetails.filter(
      (t) => statusFilter === "ALL" || t.displayStatus === statusFilter
    );

    filteredTransactions = filteredTransactions.filter((t) => {
      const searchTerm = searchFilter.toLowerCase();
      const title = t.transaction_items?.[0]?.title?.toLowerCase() || "";
      const invoiceId = t.invoiceId?.toLowerCase() || "";
      return title.includes(searchTerm) || invoiceId.includes(searchTerm);
    });

    if (sortConfig.key) {
      filteredTransactions.sort((a, b) => {
        let aValue = a[sortConfig.key];
        let bValue = b[sortConfig.key];
        if (sortConfig.key === "orderDate") {
          aValue = new Date(aValue).getTime();
          bValue = new Date(bValue).getTime();
        }
        if (sortConfig.key === "totalAmount" || sortConfig.key === "calculatedTotalAmount") {
            aValue = a.calculatedTotalAmount;
            bValue = b.calculatedTotalAmount;
        }

        if (aValue < bValue) {
          return sortConfig.direction === "asc" ? -1 : 1;
        }
        if (aValue > bValue) {
          return sortConfig.direction === "asc" ? 1 : -1;
        }
        return 0;
      });
    }

    return filteredTransactions;
  }, [transactions, statusFilter, searchFilter, isLoading, sortConfig]);

  const statusCounts = useMemo(() => {
    const counts = { ALL: 0 };
    filterStatuses.forEach((s) => {
      if (s.key !== "ALL") {
        counts[s.key] = 0;
      }
    });

    if (Array.isArray(transactions)) {
      transactions.forEach((t) => {
        const displayStatus = mapApiStatusToDisplayStatus(t);

        if (displayStatus in counts) {
          counts[displayStatus]++;
        }
        counts.ALL++;
      });
    }
    return counts;
  }, [transactions]);

  useEffect(() => {
    setCurrentPage(1);
  }, [statusFilter, searchFilter]);

  const totalPages = Math.ceil(processedTransactions.length / ITEMS_PER_PAGE);
  const paginatedTransactions = useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    return processedTransactions.slice(startIndex, startIndex + ITEMS_PER_PAGE);
  }, [processedTransactions, currentPage]);

  const handlePageChange = (page) => {
    if (page >= 1 && page <= totalPages) {
        setCurrentPage(page);
    }
  };

  const getPageNumbers = () => {
    const pageNumbers = [];
    if (totalPages <= 7) {
        for (let i = 1; i <= totalPages; i++) pageNumbers.push(i);
    } else {
        pageNumbers.push(1);
        if (currentPage > 4) pageNumbers.push("...");
        const start = Math.max(2, currentPage - 2);
        const end = Math.min(totalPages - 1, currentPage + 2);
        for (let i = start; i <= end; i++) pageNumbers.push(i);
        if (currentPage < totalPages - 3) pageNumbers.push("...");
        pageNumbers.push(totalPages);
    }
    return pageNumbers;
  };

  const handleSort = (key) => {
    let direction = "asc";
    if (sortConfig.key === key && sortConfig.direction === "asc") {
      direction = "desc";
    }
    const sortKey = (key === "totalAmount") ? "calculatedTotalAmount" : key;
    setSortConfig({ key: sortKey, direction });
  };

  const handleConfirmCancel = async () => {
    if (!transactionToCancel) return;
    const loadingToastId = toast.loading(`Cancelling transaction...`);
    try {
      await cancelTransaction(transactionToCancel.id);
      toast.success("Transaction has been cancelled.", { id: loadingToastId });
      mutate();
    } catch (err) {
      toast.error(
        err.response?.data?.message || "Failed to cancel transaction.",
        { id: loadingToastId }
      );
    } finally {
      setTransactionToCancel(null);
    }
  };

  if (error) {
    return (
      <div className="p-8 text-center">
        <Frown className="w-16 h-16 mx-auto text-red-500" />
        <h2 className="mt-4 text-2xl font-bold">Failed to Load Data</h2>
        <p className="mt-2">{error.message}</p>
        <Button onClick={() => mutate()} className="mt-4">
          Try Again
        </Button>
      </div>
    );
  }

  return (
    <>
      <AlertDialog
        open={!!transactionToCancel}
        onOpenChange={(open) => !open && setTransactionToCancel(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              Are you sure you want to cancel?
            </AlertDialogTitle>
            <AlertDialogDescription>
              This action will cancel the transaction (
              {transactionToCancel?.invoiceId}). This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isMutating}>Back</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmCancel}
              disabled={isMutating}
              className="bg-red-600 cursor-pointer hover:bg-red-700"
            >
              {isMutating && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Yes, Cancel
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="p-4 space-y-6 md:p-6"
      >
        <div className="flex flex-col items-start justify-between gap-4 md:flex-row md:items-center">
          <div>
            <h1 className="text-3xl font-bold">Transaction Management</h1>
            <p className="text-muted-foreground">
              View all user transactions and manage their status.
            </p>
          </div>
        </div>

        <div className="flex flex-col gap-4 md:flex-row">
          <div className="flex items-center p-1 space-x-2 overflow-x-auto bg-gray-100 border border-gray-200 rounded-lg shadow-sm">
            {filterStatuses.map((status) => (
              <Button
                key={status.key}
                variant="ghost"
                onClick={() => setStatusFilter(status.key)}
                className={clsx(
                  "px-4 py-2 text-sm font-medium rounded-md transition-colors duration-200 whitespace-nowrap",
                  "hover:bg-gray-200 data-[state=active]:bg-white data-[state=active]:shadow",
                  {
                    "bg-white shadow": statusFilter === status.key,
                    "text-gray-700": statusFilter !== status.key,
                  }
                )}
                data-state={statusFilter === status.key ? "active" : "inactive"}
              >
                {status.label}
                <span className="ml-2 font-semibold text-gray-500">
                  {isLoading ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : statusCounts[status.key] !== undefined ? (
                    statusCounts[status.key]
                  ) : (
                    0
                  )}
                </span>
              </Button>
            ))}
          </div>

          <div className="relative flex-grow">
            <Search
              className="absolute text-gray-400 -translate-y-1/2 left-3 top-1/2"
              size={20}
            />
            <Input
              placeholder="Search by Title or Invoice ID..."
              value={searchFilter}
              onChange={(e) => setSearchFilter(e.target.value)}
              className="pl-10 h-11"
            />
          </div>
        </div>

        <div className="overflow-hidden bg-white border rounded-lg">
          <Table>
            <TableHeader className="bg-gray-50">
              <TableRow>
                <TableHead className="px-6">Invoice ID</TableHead>
                <TableHead className="hidden px-6 lg:table-cell">Title</TableHead>
                <TableHead className="hidden px-6 md:table-cell">Payment Method</TableHead>
                <TableHead className="hidden px-6 md:table-cell">
                  <Button variant="ghost" className="px-0 hover:bg-transparent" onClick={() => handleSort("totalAmount")}>
                    Total Amount
                    {sortConfig.key === "calculatedTotalAmount" &&
                      (sortConfig.direction === "asc" ? <ArrowUp className="w-4 h-4 ml-2" /> : <ArrowDown className="w-4 h-4 ml-2" />)}
                  </Button>
                </TableHead>
                <TableHead className="hidden px-6 lg:table-cell">
                  <Button variant="ghost" className="px-0 hover:bg-transparent" onClick={() => handleSort("orderDate")}>
                    Order Date
                    {sortConfig.key === "orderDate" &&
                      (sortConfig.direction === "asc" ? <ArrowUp className="w-4 h-4 ml-2" /> : <ArrowDown className="w-4 h-4 ml-2" />)}
                  </Button>
                </TableHead>
                <TableHead className="px-6">Status</TableHead>
                <TableHead className="px-6 text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                Array.from({ length: ITEMS_PER_PAGE }).map((_, index) => (
                  <TableRow key={index}>
                    <TableCell><Skeleton className="w-40 h-5" /></TableCell>
                    <TableCell className="hidden lg:table-cell"><Skeleton className="w-48 h-5" /></TableCell>
                    <TableCell className="hidden md:table-cell"><Skeleton className="w-24 h-5" /></TableCell>
                    <TableCell className="hidden md:table-cell"><Skeleton className="h-5 w-28" /></TableCell>
                    <TableCell className="hidden lg:table-cell"><Skeleton className="w-24 h-5" /></TableCell>
                    <TableCell><Skeleton className="w-20 h-6" /></TableCell>
                    <TableCell className="text-right"><Skeleton className="w-8 h-8 ml-auto" /></TableCell>
                  </TableRow>
                ))
              ) : paginatedTransactions.length > 0 ? (
                paginatedTransactions.map((t) => {
                  const upperCaseDisplayStatus = t.displayStatus;
                  const currentStatus = statusConfig[upperCaseDisplayStatus] || { label: t.status, className: "bg-gray-100 text-gray-800" };
                  const items = t.transaction_items || [];
                  const firstItemTitle = items.length > 0 ? items[0].title : "Activity Not Found";

                  return (
                    <TableRow key={t.id}>
                      <TableCell className="px-6 py-3 font-mono text-xs text-gray-600">{t.invoiceId || "N/A"}</TableCell>
                      <TableCell className="hidden px-6 py-3 font-medium lg:table-cell">
                          <div className="flex items-center gap-3">
                              {items[0]?.imageUrls?.[0] ? (
                                  <img src={items[0].imageUrls[0]} alt={firstItemTitle} className="object-cover w-12 h-12 rounded-md bg-gray-50" onError={(e) => { e.currentTarget.onerror = null; e.currentTarget.src = "/assets/error.png"; }} />
                              ) : (
                                  <div className="flex items-center justify-center w-12 h-12 rounded-md bg-secondary"><ImageIcon className="w-6 h-6 text-muted-foreground" /></div>
                              )}
                              <span>{firstItemTitle}</span>
                          </div>
                      </TableCell>
                      <TableCell className="hidden px-6 py-3 md:table-cell">
                          <div className="flex items-center gap-2">
                              {t.payment_method?.imageUrl ? (
                                  <img src={t.payment_method.imageUrl} alt={t.payment_method.name || ""} className="object-contain h-6 w-9" onError={(e) => { e.currentTarget.onerror = null; e.currentTarget.src = "/assets/error.png"; }} />
                              ) : (
                                  <div className="flex items-center justify-center h-6 rounded-md w-9 bg-secondary"><ImageIcon className="w-4 h-4 text-muted-foreground" /></div>
                              )}
                              <span>{t.payment_method?.name || "N/A"}</span>
                          </div>
                      </TableCell>
                      <TableCell className="hidden px-6 py-3 font-medium md:table-cell">{new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", minimumFractionDigits: 0 }).format(t.calculatedTotalAmount)}</TableCell>
                      <TableCell className="hidden px-6 py-3 text-sm text-gray-600 lg:table-cell">{new Date(t.orderDate).toLocaleDateString("en-GB")}</TableCell>
                      <TableCell className="px-6 py-3"><Badge variant="outline" className={`font-semibold ${currentStatus.className}`}>{currentStatus.icon && (<currentStatus.icon className="w-3 h-3 mr-1.5" />)}{currentStatus.label}</Badge></TableCell>
                      <TableCell className="px-6 py-3 text-right"><Button asChild variant="outline" size="icon"><Link href={`/transactions/${t.id}`}><Edit className="w-4 h-4" /></Link></Button></TableCell>
                    </TableRow>
                  );
                })
              ) : (
                <TableRow><TableCell colSpan={7} className="h-24 text-center">No transactions found.</TableCell></TableRow>
              )}
            </TableBody>
          </Table>
        </div>
        
        {totalPages > 1 && (
            <Pagination className="mt-8">
                <PaginationContent>
                    <PaginationItem>
                        <PaginationPrevious href="#" onClick={(e) => { e.preventDefault(); handlePageChange(currentPage - 1); }} />
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
                        <PaginationNext href="#" onClick={(e) => { e.preventDefault(); handlePageChange(currentPage + 1); }} />
                    </PaginationItem>
                </PaginationContent>
            </Pagination>
        )}

      </motion.div>
    </>
  );
};

export default TransactionManagementPage;
