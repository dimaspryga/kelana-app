"use client";

import React, { useState, useMemo, useEffect } from "react";
import { useAllTransactions } from "@/hooks/useAllTransactions";
import { useAuth } from "@/context/AuthContext";
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
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Frown,
  Search,
  FileText,
  DollarSign,
  Calendar,
  User,
  ShoppingCart,
  Eye,
  CheckCircle,
  XCircle,
  Clock
} from "lucide-react";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const ITEMS_PER_PAGE = 10;

const TransactionManagementPage = () => {
  const {
    transactions,
    isLoading: isTransactionsLoading,
    error,
    mutate,
  } = useAllTransactions();
  const { loading: isAuthLoading } = useAuth();

  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [isStatusDialogOpen, setIsStatusDialogOpen] = useState(false);
  const [selectedTransaction, setSelectedTransaction] = useState(null);
  const [statusFilter, setStatusFilter] = useState("all");

  const isLoading = isTransactionsLoading || isAuthLoading;

  const filteredTransactions = useMemo(() => {
    if (!transactions) return [];
    return transactions.filter((transaction) => {
      const matchesSearch =
        transaction.invoiceId?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        transaction.user?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        transaction.transaction_items?.[0]?.title?.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesStatus =
        statusFilter === "all" || (transaction.status?.toLowerCase() === statusFilter);
      return matchesSearch && matchesStatus;
    });
  }, [transactions, searchQuery, statusFilter]);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery]);

  const paginatedTransactions = useMemo(() => {
    const startIdx = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredTransactions.slice(startIdx, startIdx + ITEMS_PER_PAGE);
  }, [filteredTransactions, currentPage]);

  const totalPages = Math.ceil(filteredTransactions.length / ITEMS_PER_PAGE);

  const handlePageChange = (page) => {
    if (page >= 1 && page <= totalPages) setCurrentPage(page);
  };

  const getStatusBadge = (status) => {
    switch (status?.toLowerCase()) {
      case 'completed':
        return (
          <Badge className="bg-green-100 text-green-900 border border-green-200 rounded-full px-3 py-1 text-xs font-medium">
            <CheckCircle className="w-3 h-3 mr-1" />
            Completed
          </Badge>
        );
      case 'pending':
        return (
          <Badge className="bg-yellow-100 text-yellow-900 border border-yellow-200 rounded-full px-3 py-1 text-xs font-medium">
            <Clock className="w-3 h-3 mr-1" />
            Pending
          </Badge>
        );
      case 'cancelled':
        return (
          <Badge className="bg-red-100 text-red-900 border border-red-200 rounded-full px-3 py-1 text-xs font-medium">
            <XCircle className="w-3 h-3 mr-1" />
            Cancelled
          </Badge>
        );
      default:
        return (
          <Badge className="bg-slate-100 text-slate-600 border border-slate-200 rounded-full px-3 py-1 text-xs font-medium">
            {status || 'Unknown'}
          </Badge>
        );
    }
  };

  const handleOpenStatusDialog = (transaction) => {
    setSelectedTransaction(transaction);
    setIsStatusDialogOpen(true);
  };

  const handleCloseStatusDialog = () => {
    setIsStatusDialogOpen(false);
    setSelectedTransaction(null);
  };

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-8 text-center bg-white">
        <Frown className="w-16 h-16 text-red-500" />
        <h2 className="mt-4 text-2xl font-bold text-blue-900">Failed to Load Transactions</h2>
        <p className="mt-2 text-slate-600">{error.message}</p>
        <Button onClick={() => mutate()} className="mt-4 bg-blue-600 text-white hover:bg-blue-700 border-0">
          Try Again
        </Button>
      </div>
    );
  }

  return (
    <div className="w-full px-6 py-6">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-3xl font-bold tracking-tight text-blue-900">Transactions</h2>
          <div className="flex items-center space-x-2">
            <Button 
              onClick={() => mutate()} 
              className="bg-blue-600 text-white hover:bg-blue-700 border-0 shadow-sm"
            >
              <Eye className="w-4 h-4 mr-2" />
              Refresh
            </Button>
          </div>
        </div>
        
        <div className="flex items-center space-x-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
            <Input
              placeholder="Search transactions..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 border border-slate-200 rounded-lg bg-white text-slate-900 placeholder-slate-400 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
            />
          </div>
          <div className="w-48">
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full border border-slate-200 rounded-lg bg-white text-slate-900">
                <SelectValue placeholder="All Statuses" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
                <SelectItem value="confirmation">Confirmation</SelectItem>
                <SelectItem value="unpaid">Unpaid</SelectItem>
                <SelectItem value="success">Success</SelectItem>
                <SelectItem value="failed">Failed</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        
        <Card className="border border-slate-200 rounded-xl shadow-sm bg-white overflow-hidden">
          <CardHeader className="bg-white border-b border-slate-100">
            <CardTitle className="text-xl font-semibold text-blue-900">Transactions</CardTitle>
            <CardDescription className="text-slate-600">
              View and manage all transactions in your system.
            </CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <Table className="w-full">
                <TableHeader className="bg-blue-50">
                  <TableRow className="border-b border-slate-200">
                    <TableHead className="font-semibold text-blue-900 py-4 px-6">Transaction</TableHead>
                    <TableHead className="font-semibold text-blue-900 py-4 px-6">Customer</TableHead>
                    <TableHead className="font-semibold text-blue-900 py-4 px-6">Activity</TableHead>
                    <TableHead className="font-semibold text-blue-900 py-4 px-6">Amount</TableHead>
                    <TableHead className="font-semibold text-blue-900 py-4 px-6">Status</TableHead>
                    <TableHead className="font-semibold text-blue-900 py-4 px-6">Date</TableHead>
                    <TableHead className="font-semibold text-blue-900 py-4 px-6">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {isLoading ? (
                    Array.from({ length: ITEMS_PER_PAGE }).map((_, index) => (
                      <TableRow key={index} className="border-b border-slate-100 hover:bg-slate-50">
                        <TableCell className="py-4 px-6">
                          <div className="flex items-center space-x-3">
                            <Skeleton className="w-10 h-10 rounded-lg" />
                            <div className="space-y-2">
                              <Skeleton className="h-4 w-[120px]" />
                              <Skeleton className="h-3 w-[80px]" />
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="py-4 px-6">
                          <div className="flex items-center space-x-2">
                            <Skeleton className="w-6 h-6 rounded-full" />
                            <Skeleton className="h-4 w-[100px]" />
                          </div>
                        </TableCell>
                        <TableCell className="py-4 px-6">
                          <Skeleton className="h-4 w-[150px]" />
                        </TableCell>
                        <TableCell className="py-4 px-6">
                          <Skeleton className="h-4 w-[80px]" />
                        </TableCell>
                        <TableCell className="py-4 px-6">
                          <Skeleton className="h-6 w-[80px] rounded-full" />
                        </TableCell>
                        <TableCell className="py-4 px-6">
                          <Skeleton className="h-4 w-[100px]" />
                        </TableCell>
                        <TableCell className="py-4 px-6">
                          <div className="flex items-center gap-2">
                            <Link href={`/transactions/${index + 1}`} legacyBehavior>
                              <Button size="sm" variant="outline" className="border-blue-200 text-blue-700 hover:bg-blue-50">
                                <Eye className="w-4 h-4 mr-1" /> View
                              </Button>
                            </Link>
                            <Button size="sm" variant="outline" className="border-blue-200 text-blue-700 hover:bg-blue-50" onClick={() => handleOpenStatusDialog(index + 1)}>
                              Change Status
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : paginatedTransactions.length > 0 ? (
                    paginatedTransactions.map((transaction) => (
                      <TableRow key={transaction.id} className="border-b border-slate-100 hover:bg-slate-50">
                        <TableCell className="py-4 px-6">
                          <div className="flex items-center space-x-3">
                            <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center border border-slate-200">
                              <FileText className="w-5 h-5 text-blue-600" />
                            </div>
                            <div className="min-w-0 flex-1">
                              <p className="font-medium text-blue-900 truncate">
                                {transaction.invoiceId || 'N/A'}
                              </p>
                              <p className="text-sm text-slate-500 truncate">
                                ID: {transaction.id}
                              </p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="py-4 px-6">
                          <div className="flex items-center space-x-2">
                            <div className="w-6 h-6 rounded-full bg-green-100 flex items-center justify-center border border-slate-200">
                              <User className="w-3 h-3 text-green-600" />
                            </div>
                            <span className="text-slate-700 truncate">
                              {transaction.user?.name || 'Unknown User'}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell className="py-4 px-6">
                          <div className="flex items-center space-x-2">
                            <ShoppingCart className="w-4 h-4 text-slate-400" />
                            <span className="text-slate-700 truncate">
                              {transaction.transaction_items?.[0]?.title || 'Unknown Activity'}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell className="py-4 px-6">
                          <div className="flex items-center space-x-2">
                            <DollarSign className="w-4 h-4 text-slate-400" />
                            <span className="font-medium text-green-600">
                              ${transaction.totalAmount || 0}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell className="py-4 px-6">
                          {getStatusBadge(transaction.status)}
                        </TableCell>
                        <TableCell className="py-4 px-6">
                          <div className="flex items-center space-x-2">
                            <Calendar className="w-4 h-4 text-slate-400" />
                            <span className="text-slate-700">
                              {new Date(transaction.createdAt).toLocaleDateString()}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell className="py-4 px-6">
                          <div className="flex items-center gap-2">
                            <Link href={`/transactions/${transaction.id}`} legacyBehavior>
                              <Button size="sm" variant="outline" className="border-blue-200 text-blue-700 hover:bg-blue-50">
                                <Eye className="w-4 h-4 mr-1" /> View
                              </Button>
                            </Link>
                            <Button size="sm" variant="outline" className="border-blue-200 text-blue-700 hover:bg-blue-50" onClick={() => handleOpenStatusDialog(transaction)}>
                              Change Status
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={6} className="py-12 text-center">
                        <div className="flex flex-col items-center space-y-3">
                          <FileText className="w-12 h-12 text-slate-400" />
                          <p className="text-slate-600 font-medium">No transactions found.</p>
                          <p className="text-slate-400 text-sm">Try adjusting your search criteria.</p>
                        </div>
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
            
            {totalPages > 1 && (
              <div className="flex items-center justify-center py-6 border-t border-slate-100">
                <Pagination>
                  <PaginationContent className="flex items-center space-x-1">
                    <PaginationItem>
                      <PaginationPrevious 
                        onClick={() => handlePageChange(currentPage - 1)}
                        className={cn(
                          "cursor-pointer border border-slate-200 rounded-lg px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50",
                          currentPage === 1 && "pointer-events-none opacity-50"
                        )}
                      />
                    </PaginationItem>
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                      <PaginationItem key={page}>
                        <PaginationLink
                          onClick={() => handlePageChange(page)}
                          className={cn(
                            "cursor-pointer border border-slate-200 rounded-lg px-3 py-2 text-sm font-medium",
                            currentPage === page 
                              ? "bg-blue-600 text-white border-blue-600" 
                              : "text-slate-700 hover:bg-slate-50"
                          )}
                        >
                          {page}
                        </PaginationLink>
                      </PaginationItem>
                    ))}
                    <PaginationItem>
                      <PaginationNext 
                        onClick={() => handlePageChange(currentPage + 1)}
                        className={cn(
                          "cursor-pointer border border-slate-200 rounded-lg px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50",
                          currentPage === totalPages && "pointer-events-none opacity-50"
                        )}
                      />
                    </PaginationItem>
                  </PaginationContent>
                </Pagination>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
      {isStatusDialogOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-30">
          <div className="bg-white rounded-xl shadow-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-bold mb-4 text-blue-900">Change Transaction Status</h3>
            <p className="mb-4 text-slate-600">Transaction: <span className="font-mono">{selectedTransaction?.invoiceId}</span></p>
            <div className="flex justify-end gap-2 mt-6">
              <Button variant="outline" onClick={handleCloseStatusDialog}>Cancel</Button>
              <Button className="bg-blue-600 text-white hover:bg-blue-700">Save</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TransactionManagementPage;
