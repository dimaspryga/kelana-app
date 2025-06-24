"use client";

import React, { useEffect, useState, useMemo } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";

// Using your original hooks (ensure these files exist and are correctly configured in your Next.js project)
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
  ImageIcon, // Imported for payment method image fallback
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

// Helper for status visualization (using uppercase keys)
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
  // PENDING is an API status that will be mapped, not a direct display status here
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
  // useAuth.loading is needed to ensure auth is ready before fetching/displaying data related to user roles or authenticated actions
  const { loading: isAuthLoading } = useAuth();
  // useUpdateUserRole.loading is not strictly needed for UI loading state here, but kept for consistency if it affects other parts
  const { loading: isUpdatingUserRole } = useUpdateUserRole();

  // State to store the current display status of the transaction (e.g., UNPAID, CONFIRMATION)
  const [currentDisplayStatus, setCurrentDisplayStatus] = useState("");
  // State to store the selected value from the dropdown (not yet applied to API)
  const [selectedUpdateApiStatus, setSelectedUpdateApiStatus] = useState("");
  // State to manage the cancellation confirmation dialog
  const [showCancelConfirmDialog, setShowCancelConfirmDialog] = useState(false);

  // Overall loading state considering all data fetches and mutations
  const isLoading =
    isTransactionLoading ||
    isUsersLoading ||
    isMutating ||
    isAuthLoading ||
    isUpdatingUserRole;
  // Combined error state
  const error = transactionError || usersError;

  // Effect to fetch transaction details when ID changes
  useEffect(() => {
    if (transactionId) {
      fetchTransactionDetail(transactionId);
    }
  }, [transactionId, fetchTransactionDetail]);

  // Helper function to map API status and proofPaymentUrl to display status
  const mapApiStatusToDisplayStatus = (transaction) => {
    const apiStatus = transaction.status?.toUpperCase();
    const hasPaymentProof = !!transaction.proofPaymentUrl;

    if (apiStatus === "PENDING") {
      return hasPaymentProof ? "CONFIRMATION" : "UNPAID";
    }
    // If the API status is CONFIRMATION, it's already a display status
    if (apiStatus === "CONFIRMATION") {
      return "CONFIRMATION";
    }
    return apiStatus;
  };

  // Effect to set the current display status and default dropdown value when transactionDetail changes
  useEffect(() => {
    if (transactionDetail) {
      const displayStatus = mapApiStatusToDisplayStatus(transactionDetail);
      setCurrentDisplayStatus(displayStatus);
      // Set dropdown to the actual API status that matches the display or default to PENDING
      // If the status is CONFIRMATION or UNPAID, the dropdown should show PENDING
      if (displayStatus === "CONFIRMATION" || displayStatus === "UNPAID") {
        setSelectedUpdateApiStatus("PENDING");
      } else {
        setSelectedUpdateApiStatus(transactionDetail.status?.toUpperCase());
      }
    }
  }, [transactionDetail]); // Depend on transactionDetail to update status

  // Memoize customer data to avoid re-calculation
  const customer = useMemo(() => {
    if (!transactionDetail?.userId || !Array.isArray(users)) return null;
    return users.find((u) => u.id === transactionDetail.userId);
  }, [transactionDetail, users]);

  // Calculate the total amount for all items in the order
  const calculatedTotalOrderAmount = useMemo(() => {
    if (!transactionDetail?.transaction_items) return 0;
    return transactionDetail.transaction_items.reduce(
      (acc, item) => acc + (item.price || 0) * (item.quantity || 1),
      0
    );
  }, [transactionDetail?.transaction_items]);

  // Handler to update transaction status when the button is clicked
  const handleUpdateStatusClick = async () => {
    // Only proceed if the selected status is different from the current API status and is not empty
    // We need to get the actual API status from transactionDetail for comparison.
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
      // Re-fetch transaction details to get the latest data and trigger status re-mapping
      await fetchTransactionDetail(transactionId);
      toast.success("Status updated successfully!", { id: loadingToastId });
    } catch (err) {
      // Using err.response?.data?.message or err.message as API error response structure might vary
      toast.error(
        err.response?.data?.message ||
          err.message ||
          "Failed to update status.",
        {
          id: loadingToastId,
        }
      );
      // No need to revert dropdown choice, as fetchTransactionDetail will update state
      // which in turn will reset setSelectedUpdateApiStatus
    }
  };

  // Handler to cancel transaction
  const handleCancelTransaction = async () => {
    setShowCancelConfirmDialog(false); // Close confirmation dialog
    const loadingToastId = toast.loading(`Cancelling transaction...`);
    try {
      await cancelTransaction(transactionId);
      await fetchTransactionDetail(transactionId); // Re-fetch data after cancellation
      toast.success("Transaction successfully cancelled!", {
        id: loadingToastId,
      });
    } catch (err) {
      // Using err.response?.data?.message or err.message as API error response structure might vary
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

  // Display skeleton loader while data is loading
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

  // Display error message if data fetching fails
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

  // Return null if transactionDetail is not yet available after loading
  if (!transactionDetail) {
    return null;
  }

  // Get status info for the badge using the derived display status
  const statusInfo = statusConfig[currentDisplayStatus] || {
    label: currentDisplayStatus,
    className: "bg-gray-100 text-gray-800",
  };

  const hasPaymentProof = !!transactionDetail.proofPaymentUrl; // Determine if proof exists

  return (
    <>
      {/* Cancellation Confirmation Dialog */}
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

        {/* First row of cards: Customer Information and Payment Details */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-2">
          {" "}
          {/* Changed to lg:grid-cols-2 */}
          {/* Customer Information Card */}
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
          {/* Payment Details Card */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CreditCard size={20} />
                Payment Details
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-1">
              <p className="flex items-center gap-2">
                {" "}
                {/* Added flex and gap for alignment */}
                <strong>Method:</strong> {/* Display Payment Method Image */}
                {transactionDetail.payment_method?.imageUrl ? (
                  <img
                    src={transactionDetail.payment_method.imageUrl}
                    alt={
                      transactionDetail.payment_method.name ||
                      "Payment method logo"
                    }
                    className="flex-shrink-0 object-contain w-20 h-10" // Added flex-shrink-0
                    onError={(e) => {
                      e.currentTarget.onerror = null;
                      e.currentTarget.src =
                        "https://placehold.co/120x60/f87171/ffffff?text=Error";
                    }}
                  />
                ) : (
                  <ImageIcon className="flex-shrink-0 w-5 h-5 text-muted-foreground" /> // Fallback icon
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

        {/* Second row of cards: Order Details (moved here) */}
        <div className="grid gap-6">
          {" "}
          {/* Full width card for order details */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Package size={20} />
                Order Details
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {" "}
              {/* Increased vertical spacing for multiple items */}
              {transactionDetail.transaction_items &&
              transactionDetail.transaction_items.length > 0 ? (
                transactionDetail.transaction_items.map((item, index) => (
                  <div key={index} className="flex items-start gap-2 py-1">
                    {" "}
                    {/* Use items-start to align top if image is tall */}
                    {/* Optional: Display item image if available */}
                    {item.imageUrls?.[0] && (
                      <img
                        src={item.imageUrls[0]}
                        alt={item.title}
                        className="flex-shrink-0 object-cover w-10 h-10 rounded-md"
                        onError={(e) => {
                          e.currentTarget.onerror = null;
                          e.currentTarget.src =
                            "https://placehold.co/40x40/f87171/ffffff?text=Error";
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
                      {/* Calculate and display subtotal for each item */}
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
              {/* Separator if there are items and a total */}
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
                  {/* Use calculated total here */}
                </span>
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Proof of Payment Card */}
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
                {/* Directly linking to the image URL */}
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

                {/* URL and View button */}
                <div className="p-3 mt-4 bg-gray-100 rounded-md">
                  <div className="flex items-center justify-between">
                    {/* URL Text on the left */}
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

        {/* Update Transaction Status Card */}
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
              {" "}
              {/* Using flex-col for vertical layout */}
              <div className="flex items-center gap-2">
                <Select
                  value={selectedUpdateApiStatus} // Bind to state for dropdown selection
                  onValueChange={setSelectedUpdateApiStatus} // Update state when selection changes
                  disabled={isMutating}
                >
                  <SelectTrigger className="w-[280px]">
                    <SelectValue placeholder="Select new status" />
                  </SelectTrigger>
                  <SelectContent>
                    {/* Options that admin can set, dynamically labeled for PENDING */}
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
                {/* Use isLoading here */}
              </div>
              <div className="flex gap-2">
                {" "}
                {/* Button group */}
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
                  onClick={() => setShowCancelConfirmDialog(true)} // Show confirmation dialog
                  disabled={
                    isMutating ||
                    transactionDetail.status?.toUpperCase() === "CANCELLED"
                  } // Disable if already cancelled
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
