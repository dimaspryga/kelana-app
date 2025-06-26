"use client";

import React, { useEffect, useState, useMemo } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";

import { useDetailTransaction } from "@/hooks/useDetailTransaction";
import { useTransactionActions } from "@/hooks/useTransactionActions";
import { useAllUsers } from "@/hooks/useAllUsers";
import { useAuth } from "@/context/AuthContext";
import { useUpdateUserRole } from "@/hooks/useUpdateUserRole";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import {
  ArrowLeft,
  User,
  Package,
  CreditCard,
  Calendar,
  Frown,
  Loader2,
  FileImage,
  ExternalLink,
  ImageIcon,
} from "lucide-react";
import { toast } from "sonner";
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

const statusConfig = {
  UNPAID: {
    label: "Waiting for Payment Proof",
    className: "bg-gray-100 text-gray-800 border-gray-300",
  },
  CONFIRMATION: {
    label: "Waiting for Confirmation",
    className: "bg-blue-100 text-blue-800 border-blue-300",
  },
  SUCCESS: {
    label: "Success",
    className: "bg-green-100 text-green-800 border-green-300",
  },
  CANCELLED: {
    label: "Cancelled",
    className: "bg-red-100 text-red-800 border-red-300",
  },
  FAILED: {
    label: "Failed",
    className: "bg-destructive/10 text-destructive border-destructive/30",
  },
};

const TransactionDetailPage = () => {
  const params = useParams();
  const router = useRouter();
  const transactionId = params.id;

  const {
    transactionDetail,
    isLoading: isTransactionLoading,
    error: transactionError,
    fetchTransactionDetail,
  } = useDetailTransaction();
  const { users, isLoading: isUsersLoading, error: usersError } = useAllUsers();
  const { updateTransactionStatus, cancelTransaction, isMutating } =
    useTransactionActions();
  const { loading: isAuthLoading } = useAuth();
  const { loading: isUpdatingUserRole } = useUpdateUserRole();

  const [currentDisplayStatus, setCurrentDisplayStatus] = useState("");
  const [selectedUpdateApiStatus, setSelectedUpdateApiStatus] = useState("");
  const [showCancelConfirmDialog, setShowCancelConfirmDialog] = useState(false);

  const isLoading =
    isTransactionLoading ||
    isUsersLoading ||
    isMutating ||
    isAuthLoading ||
    isUpdatingUserRole;
  const error = transactionError || usersError;

  useEffect(() => {
    if (transactionId) {
      fetchTransactionDetail(transactionId);
    }
  }, [transactionId, fetchTransactionDetail]);

  const mapApiStatusToDisplayStatus = (transaction) => {
    const apiStatus = transaction.status?.toUpperCase();
    const hasPaymentProof = !!transaction.proofPaymentUrl;

    if (apiStatus === "PENDING") {
      return hasPaymentProof ? "CONFIRMATION" : "UNPAID";
    }
    if (apiStatus === "CONFIRMATION") {
      return "CONFIRMATION";
    }
    return apiStatus;
  };

  useEffect(() => {
    if (transactionDetail) {
      const displayStatus = mapApiStatusToDisplayStatus(transactionDetail);
      setCurrentDisplayStatus(displayStatus);
      if (displayStatus === "CONFIRMATION" || displayStatus === "UNPAID") {
        setSelectedUpdateApiStatus("PENDING");
      } else {
        setSelectedUpdateApiStatus(transactionDetail.status?.toUpperCase());
      }
    }
  }, [transactionDetail]);

  const customer = useMemo(() => {
    if (!transactionDetail?.userId || !Array.isArray(users)) return null;
    return users.find((u) => u.id === transactionDetail.userId);
  }, [transactionDetail, users]);

  const calculatedTotalOrderAmount = useMemo(() => {
    if (!transactionDetail?.transaction_items) return 0;
    return transactionDetail.transaction_items.reduce(
      (acc, item) => acc + (item.price || 0) * (item.quantity || 1),
      0
    );
  }, [transactionDetail?.transaction_items]);

  const handleUpdateStatusClick = async () => {
    const actualApiStatus = transactionDetail?.status?.toUpperCase();
    if (
      !selectedUpdateApiStatus ||
      selectedUpdateApiStatus === actualApiStatus
    ) {
      toast.info(
        "Selected status is the same as the current status or invalid."
      );
      return;
    }

    const loadingToastId = toast.loading(
      `Updating status to ${selectedUpdateApiStatus}...`
    );
    try {
      await updateTransactionStatus(
        transactionId,
        selectedUpdateApiStatus.toLowerCase()
      );
      await fetchTransactionDetail(transactionId);
      toast.success("Status updated successfully!", { id: loadingToastId });
    } catch (err) {
      toast.error(
        err.response?.data?.message ||
          err.message ||
          "Failed to update status.",
        {
          id: loadingToastId,
        }
      );
    }
  };

  const handleCancelTransaction = async () => {
    setShowCancelConfirmDialog(false);
    const loadingToastId = toast.loading(`Cancelling transaction...`);
    try {
      await cancelTransaction(transactionId);
      await fetchTransactionDetail(transactionId);
      toast.success("Transaction successfully cancelled!", {
        id: loadingToastId,
      });
    } catch (err) {
      toast.error(
        err.response?.data?.message ||
          err.message ||
          "Failed to cancel transaction.",
        {
          id: loadingToastId,
        }
      );
    }
  };

  if (isLoading) {
    return (
      <div className="p-4 space-y-4 md:p-6">
        <Skeleton className="w-48 h-8" />
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          <Card>
            <CardHeader>
              <Skeleton className="w-3/4 h-6" />
            </CardHeader>
            <CardContent>
              <Skeleton className="w-1/2 h-5" />
              <Skeleton className="w-2/3 h-5 mt-2" />
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <Skeleton className="w-3/4 h-6" />
            </CardHeader>
            <CardContent>
              <Skeleton className="w-1/2 h-5" />
              <Skeleton className="w-2/3 h-5 mt-2" />
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <Skeleton className="w-3/4 h-6" />
            </CardHeader>
            <CardContent>
              <Skeleton className="w-full h-10" />
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8 text-center">
        <Frown className="w-16 h-16 mx-auto text-red-500" />
        <h2 className="mt-4 text-2xl font-bold">Failed to Load Transaction</h2>
        <p className="mt-2 text-muted-foreground">
          {error.message || String(error)}
        </p>
        <Button onClick={() => router.back()} className="mt-4">
          Go Back
        </Button>
      </div>
    );
  }

  if (!transactionDetail) {
    return null;
  }

  const statusInfo = statusConfig[currentDisplayStatus] || {
    label: currentDisplayStatus,
    className: "bg-gray-100 text-gray-800",
  };

  const hasPaymentProof = !!transactionDetail.proofPaymentUrl;

  return (
    <>
      <AlertDialog
        open={showCancelConfirmDialog}
        onOpenChange={setShowCancelConfirmDialog}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              Are you sure you want to cancel this transaction?
            </AlertDialogTitle>
            <AlertDialogDescription>
              This action will cancel the transaction (
              {transactionDetail.invoiceId}). This cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isMutating}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleCancelTransaction}
              disabled={isMutating}
              className="bg-red-600 hover:bg-red-700"
            >
              {isMutating && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Yes, Cancel
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <div className="p-4 space-y-6 md:p-6">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="icon" onClick={() => router.back()}>
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold">Transaction Details</h1>
            <p className="font-mono text-sm text-muted-foreground">
              {transactionDetail.invoiceId || "N/A"}
            </p>
          </div>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User size={20} />
                Customer Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-1">
              <p>
                <strong>Name:</strong> {customer?.name || "No data"}
              </p>
              <p>
                <strong>Email:</strong> {customer?.email || "No data"}
              </p>
              <p>
                <strong>Phone:</strong> {customer?.phoneNumber || "No data"}
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CreditCard size={20} />
                Payment Details
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-1">
              <p className="flex items-center gap-2">
                <strong>Method:</strong>
                {transactionDetail.payment_method?.imageUrl ? (
                  <img
                    src={transactionDetail.payment_method.imageUrl}
                    alt={
                      transactionDetail.payment_method.name ||
                      "Payment method logo"
                    }
                    className="flex-shrink-0 object-contain w-20 h-10"
                    onError={(e) => {
                      e.currentTarget.onerror = null;
                      e.currentTarget.src =
                        "https://placehold.co/120x60/f87171/ffffff?text=Error";
                    }}
                  />
                ) : (
                  <ImageIcon className="flex-shrink-0 w-5 h-5 text-muted-foreground" />
                )}
                <span>
                  {transactionDetail.payment_method?.name || "No data"}
                </span>
              </p>
              <p>
                <strong>Order Date:</strong>{" "}
                <span className="flex items-center gap-1">
                  <Calendar size={14} />{" "}
                  {new Date(transactionDetail.orderDate).toLocaleString(
                    "en-GB"
                  )}
                </span>
              </p>
              <p>
                <strong>Current Status:</strong>{" "}
                <Badge variant="outline" className={statusInfo.className}>
                  {statusInfo.label}
                </Badge>
              </p>
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Package size={20} />
                Order Details
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {transactionDetail.transaction_items &&
              transactionDetail.transaction_items.length > 0 ? (
                transactionDetail.transaction_items.map((item, index) => (
                  <div key={index} className="flex items-start gap-2 py-1">
                    {item.imageUrls?.[0] && (
                      <img
                        src={item.imageUrls[0]}
                        alt={item.title}
                        className="flex-shrink-0 object-cover w-10 h-10 rounded-md"
                        onError={(e) => {
                          e.currentTarget.onerror = null;
                          e.currentTarget.src =
                            "/assets/error.png";
                        }}
                      />
                    )}
                    <div className="flex-grow">
                      <p className="text-sm font-semibold">
                        {item.title || "No title"}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {item.quantity || 1} x{" "}
                        {new Intl.NumberFormat("id-ID", {
                          style: "currency",
                          currency: "IDR",
                        }).format(item.price || 0)}
                      </p>
                      <p className="text-sm font-medium">
                        Subtotal:{" "}
                        {new Intl.NumberFormat("id-ID", {
                          style: "currency",
                          currency: "IDR",
                        }).format((item.price || 0) * (item.quantity || 1))}
                      </p>
                    </div>
                  </div>
                ))
              ) : (
                <p>No activity details found.</p>
              )}
              {transactionDetail.transaction_items?.length > 0 && (
                <hr className="my-2 border-t border-gray-200" />
              )}
              <p className="pt-1">
                <strong>Total Amount:</strong>{" "}
                <span className="font-bold">
                  {new Intl.NumberFormat("id-ID", {
                    style: "currency",
                    currency: "IDR",
                  }).format(calculatedTotalOrderAmount)}{" "}
                </span>
              </p>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileImage size={20} />
              Proof of Payment
            </CardTitle>
          </CardHeader>
          <CardContent>
            {transactionDetail.proofPaymentUrl ? (
              <div>
                <p className="mb-4 text-sm text-muted-foreground">
                  Click the image to view in full size in a new tab.
                </p>
                <a
                  href={transactionDetail.proofPaymentUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <img
                    src={transactionDetail.proofPaymentUrl}
                    alt="Proof of Payment"
                    className="object-contain h-auto max-w-sm transition-transform rounded-lg cursor-pointer hover:scale-105"
                    onError={(e) => {
                      e.currentTarget.onerror = null;
                      e.currentTarget.src =
                        "https://placehold.co/600x400/f87171/ffffff?text=Image+Not+Found";
                    }}
                  />
                </a>

                <div className="p-3 mt-4 bg-gray-100 rounded-md">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs text-muted-foreground">
                        Original Image URL:
                      </p>
                      <p className="font-mono text-xs text-gray-600 break-all">
                        {transactionDetail.proofPaymentUrl}
                      </p>
                    </div>
                    <Button
                      asChild
                      size="sm"
                      variant="outline"
                      className="ml-4"
                    >
                      <a
                        href={transactionDetail.proofPaymentUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        View
                        <ExternalLink className="w-4 h-4 ml-2" />
                      </a>
                    </Button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="p-4 text-center rounded-md text-muted-foreground bg-secondary">
                <p>No proof of payment was uploaded by the user.</p>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Update Transaction Status</CardTitle>
            <CardDescription>
              Change the current status of this transaction. The user will be
              notified.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col gap-4">
              <div className="flex items-center gap-2">
                <Select
                  value={selectedUpdateApiStatus}
                  onValueChange={setSelectedUpdateApiStatus}
                  disabled={isMutating}
                >
                  <SelectTrigger className="w-[280px]">
                    <SelectValue placeholder="Select new status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="PENDING">
                      {hasPaymentProof
                        ? "Waiting for Confirmation"
                        : "Waiting for Payment Proof"}
                    </SelectItem>
                    <SelectItem value="SUCCESS">Success</SelectItem>
                    <SelectItem value="FAILED">Failed</SelectItem>
                  </SelectContent>
                </Select>
                {isLoading && <Loader2 className="w-5 h-5 animate-spin" />}{" "}
              </div>
              <div className="flex gap-2">
                <Button
                  onClick={handleUpdateStatusClick}
                  disabled={
                    isMutating ||
                    selectedUpdateApiStatus ===
                      transactionDetail.status?.toUpperCase()
                  }
                >
                  {isMutating && (
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  )}
                  Update Status
                </Button>
                <Button
                  variant="destructive"
                  onClick={() => setShowCancelConfirmDialog(true)}
                  disabled={
                    isMutating ||
                    transactionDetail.status?.toUpperCase() === "CANCELLED"
                  }
                >
                  {isMutating && (
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  )}
                  Cancel Transaction
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </>
  );
};

export default TransactionDetailPage;