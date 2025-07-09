'use client';

import React, { useEffect, useState, useMemo, useCallback } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useDetailTransaction } from "@/hooks/useDetailTransaction";
import { usePromo } from "@/hooks/usePromo";
import { useTransactionProofPayment } from "@/hooks/useTransactionProofPayment";
import { useCancelTransaction } from "@/hooks/useCancelTransaction";
import { useUploadImage } from "@/hooks/useUploadImage";
import { useTransaction } from "@/hooks/useTransaction";
import { useAuth } from "@/context/AuthContext";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";

// Import UI Components
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogClose } from "@/components/ui/dialog";
import { Frown, PackageSearch, Calendar, Ticket, Loader2, ArrowLeft, Upload, XCircle, Clock, CheckCircle2, FileCheck2, Copy } from "lucide-react";

// Helper functions
const formatCurrency = (amount) => new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", minimumFractionDigits: 0 }).format(amount);
const formatDate = (dateString) => new Date(dateString).toLocaleDateString("en-US", { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' });

const getDisplayStatus = (transaction) => {
  if (!transaction) return { label: '', Icon: null };
  const status = transaction.status.toLowerCase();
  const hasProof = !!transaction.proofPaymentUrl;

  if (status === 'pending') {
    if (hasProof) return { label: 'Waiting for Confirmation', Icon: FileCheck2 };
    return { label: 'Waiting for Payment Proof', Icon: Clock };
  }
  if (status === 'paid' || status === 'success') return { label: 'Payment Successful', Icon: CheckCircle2 };
  if (status === 'cancelled') return { label: 'Transaction Cancelled', Icon: XCircle };
  if (status === 'failed') return { label: 'Payment Failed', Icon: XCircle };
  return { label: status, Icon: null };
};

const getStatusClasses = (transaction) => {
    if (!transaction) return '';
    const status = transaction.status.toLowerCase();
    const hasProof = !!transaction.proofPaymentUrl;

    if (status === 'pending') {
        if (hasProof) return 'bg-blue-100 text-blue-800 border-transparent';
        return 'bg-orange-100 text-orange-800 border-transparent';
    }
    if (status === 'paid' || status === 'success') return 'bg-green-600 text-white border-transparent';
    if (status === 'cancelled' || status === 'failed') return 'bg-red-100 text-red-800 border-transparent';
    return 'border-transparent bg-gray-100 text-gray-800';
};


const StatusBadge = ({ transaction, className }) => {
  const { label, Icon } = getDisplayStatus(transaction);
  const statusClasses = getStatusClasses(transaction);
  return (
    <Badge className={cn("capitalize flex items-center gap-1.5", statusClasses, className)}>
      {Icon && <Icon className="h-3.5 w-3.5" />}
      <span>{label}</span>
    </Badge>
  );
};

const SkeletonLoader = () => (
    <div className="min-h-screen bg-white">
        <div className="max-w-6xl p-4 mx-auto md:p-8">
            <Skeleton className="w-32 h-5 mb-4 rounded-lg" />
            <Skeleton className="w-full h-16 mb-6 rounded-lg" />
            <div className="grid gap-6 md:grid-cols-5">
                <div className="space-y-4 md:col-span-3">
                    <Skeleton className="w-full h-64 rounded-lg" />
                </div>
                <div className="space-y-4 md:col-span-2">
                    <Skeleton className="w-full h-56 rounded-lg" />
                </div>
            </div>
        </div>
    </div>
);


const DetailTransactionPage = () => {
  const params = useParams();
  const { transactionDetail, isLoading: isDetailLoading, error, fetchTransactionDetail } = useDetailTransaction();
  const { promo: allPromos, isLoading: isPromoLoading } = usePromo();
  const { fetchTransactions } = useTransaction();
  const { uploadImage, isLoading: isUploadingImage } = useUploadImage();
  const { submitProofUrl, isLoading: isSubmittingUrl } = useTransactionProofPayment();
  const { cancelTransaction, isLoading: isCancelling } = useCancelTransaction();
  const { loading: isAuthLoading } = useAuth();

  const [timeLeft, setTimeLeft] = useState("");
  const [isUploadDialogOpen, setIsUploadDialogOpen] = useState(false);
  const [isCancelDialogOpen, setIsCancelDialogOpen] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);

  const stableFetchTransactionDetail = useCallback(fetchTransactionDetail, []);

  useEffect(() => {
    const transactionId = params.id;
    if (transactionId) {
      stableFetchTransactionDetail(transactionId);
    }
  }, [params.id, stableFetchTransactionDetail]);

  const status = transactionDetail?.status;
  const proofUrl = transactionDetail?.proofPaymentUrl;
  const expiryDate = transactionDetail?.expiredDate;

  useEffect(() => {
    if (status?.toLowerCase() === 'pending' && !proofUrl && expiryDate) {
      const interval = setInterval(() => {
        const now = new Date();
        const expiry = new Date(expiryDate);
        const diff = expiry.getTime() - now.getTime();
        if (diff < 0) {
          if (timeLeft !== "Payment time has expired.") {
            setTimeLeft("Payment time has expired.");
            if (params.id) {
                stableFetchTransactionDetail(params.id);
            }
          }
          clearInterval(interval);
        } else {
          const hours = Math.floor(diff / (1000 * 60 * 60));
          const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
          const seconds = Math.floor((diff % (1000 * 60)) / 1000);
          setTimeLeft(`${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`);
        }
      },);
      return () => clearInterval(interval);
    }
  }, [status, proofUrl, expiryDate, params.id, stableFetchTransactionDetail]);

  const handleCopy = (text) => { navigator.clipboard.writeText(String(text)); toast.success(`"${text}" copied successfully!`); };
  const handleFileChange = (event) => { const file = event.target.files?.[0]; if (file) { setSelectedFile(file); setPreviewUrl(URL.createObjectURL(file)); } };
  const handleUploadSubmit = async () => { if (!selectedFile || !transactionDetail) return; const uploadToast = toast.loading("Uploading image..."); try { const imageUrl = await uploadImage(selectedFile); toast.loading("Image uploaded. Submitting proof...", { id: uploadToast }); if (imageUrl) { await submitProofUrl(transactionDetail.id, imageUrl); toast.success("Proof of payment submitted successfully!", { id: uploadToast }); await fetchTransactionDetail(params.id); await fetchTransactions(); setIsUploadDialogOpen(false); setSelectedFile(null); setPreviewUrl(null); } } catch (err) { toast.error(err.message || "Failed to upload proof of payment.", { id: uploadToast }); } };
  const handleCancelSubmit = async () => { if (!transactionDetail) return; try { await cancelTransaction(transactionDetail.id); toast.success("Transaction cancelled successfully."); await fetchTransactionDetail(params.id); await fetchTransactions(); setIsCancelDialogOpen(false); } catch (err) { toast.error(err.response?.data?.message || "Failed to cancel transaction."); } };

  const isUploadingProcess = isUploadingImage || isSubmittingUrl;
  const isLoading = isDetailLoading || isPromoLoading || isAuthLoading;

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-4 text-center bg-gradient-to-br from-blue-50 via-white to-blue-50">
        <div className="flex items-center justify-center w-24 h-24 mx-auto mb-6 bg-red-100 rounded-full">
          <Frown className="w-12 h-12 text-red-500" />
        </div>
        <h2 className="mt-4 text-2xl font-bold text-gray-900 md:text-3xl tracking-tight">Failed to Load Transaction</h2>
        <p className="mt-2 text-lg text-gray-600">{error.message}</p>
        <Button asChild className="mt-6 text-white transition-all duration-200 bg-blue-600 shadow-lg hover:bg-blue-700 rounded-xl">
          <Link href="/transaction">Back to History</Link>
        </Button>
      </div>
    );
  }
  
  const renderContent = () => {
    if (!transactionDetail) {
      return (
        <div className="flex flex-col items-center justify-center min-h-screen p-4 text-center bg-gradient-to-br from-blue-50 via-white to-blue-50">
          <div className="flex items-center justify-center w-24 h-24 mx-auto mb-6 bg-blue-100 rounded-full">
            <PackageSearch className="w-12 h-12 text-blue-600" />
          </div>
          <h2 className="mt-4 text-2xl font-bold text-gray-900 md:text-3xl tracking-tight">Transaction Not Found</h2>
          <Button asChild className="mt-4 text-white transition-all duration-200 bg-blue-600 shadow-lg hover:bg-blue-700 rounded-xl">
              <Link href="/transaction">Back to History</Link>
          </Button>
        </div>
      );
    }

    const { transaction_items = [], payment_method, orderDate, invoiceId, promoId } = transactionDetail;
    const isWaitingForPayment = status?.toLowerCase() === 'pending' && !proofUrl;
    const isSuccess = ['paid', 'success'].includes(status?.toLowerCase());
    const isTerminated = ['cancelled', 'failed'].includes(status?.toLowerCase());
    const correctSubtotal = transaction_items.reduce((acc, item) => acc + (item.price * item.quantity), 0);
    const appliedPromo = promoId && allPromos.length > 0 ? allPromos.find(p => p.id === promoId) : null;
    const correctDiscount = appliedPromo ? appliedPromo.promo_discount_price : 0;
    const correctGrandTotal = Math.max(0, correctSubtotal - correctDiscount);

    if (isSuccess || isTerminated) {
      const cardClass = isSuccess ? "bg-green-50 border-green-200 text-green-800" : "bg-red-50 border-red-200 text-red-800";
      const headerIcon = isSuccess ? <CheckCircle2 className="w-16 h-16 mx-auto mb-4 text-green-600"/> : <XCircle className="w-16 h-16 mx-auto mb-4 text-red-600"/>;

      return (
          <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50">
              <div className="max-w-4xl px-4 py-8 mx-auto sm:px-6 lg:px-8">
                  <div className="mb-6">
                      <Button asChild variant="ghost" className="-ml-4 transition-all duration-200 hover:bg-blue-50 hover:text-blue-600 rounded-xl">
                          <Link href="/transaction">
                              <ArrowLeft className="w-4 h-4 mr-2" /> Back to Transaction History
                          </Link>
                      </Button>
                  </div>
                  <Card className={`${cardClass} text-center p-8 mb-8 rounded-3xl shadow-2xl border-0`}>
                      {headerIcon}
                      <h1 className={`text-3xl font-bold ${isSuccess ? 'text-green-900' : 'text-red-900'}`}>{getDisplayStatus(transactionDetail).label}</h1>
                      {isTerminated && <p className="mt-2 opacity-80">{status === 'cancelled' ? 'This transaction has been cancelled or has expired.' : 'A problem occurred while processing the order.'}</p>}
                      {isSuccess && <p className="mt-2 opacity-80">Thank you! Your order has been confirmed.</p>}
                      <div className="mt-6">
                          <p className="text-sm opacity-80">Total Payment</p>
                          <p className="text-4xl font-bold">{formatCurrency(correctGrandTotal)}</p>
                      </div>
                  </Card>
                  <div className="p-8 space-y-6 bg-white/90 backdrop-blur-sm shadow-2xl rounded-3xl border border-blue-100">
                      <div className="grid grid-cols-1 gap-6 pb-6 border-b border-blue-100 sm:grid-cols-2">
                          <div>
                              <p className="text-sm text-gray-500">Invoice Number</p>
                              <p className="font-semibold text-gray-900">{invoiceId}</p>
                          </div>
                          <div className="sm:text-right">
                              <p className="text-sm text-gray-500">Transaction Date</p>
                              <p className="font-semibold text-gray-900">{formatDate(orderDate)}</p>
                          </div>
                      </div>
                      <div>
                          <h2 className="mb-4 text-lg font-semibold text-gray-900">Order Details</h2>
                          <ul className="divide-y divide-blue-100">
                              {transaction_items.map(item => (
                                  <li key={item.id} className={`flex items-center gap-4 py-4 ${isTerminated ? 'opacity-50' : ''}`}>
                                      <img 
                                          src={item.imageUrls?.[0]} 
                                          alt={item.title} 
                                          className="object-cover w-16 h-16 rounded-xl shadow-sm"
                                          onError={(e) => {
                                              e.currentTarget.onerror = null; 
                                              e.currentTarget.src = "/assets/error.png"
                                          }}
                                      />
                                      <div className="flex-grow">
                                          <p className={`font-semibold text-gray-900 ${isTerminated ? 'line-through' : ''}`}>{item.title}</p>
                                          <p className="text-sm text-gray-500">{item.quantity} tickets x {formatCurrency(item.price)}</p>
                                      </div>
                                      <p className={`font-semibold text-gray-900 ${isTerminated ? 'line-through' : ''}`}>{formatCurrency(item.quantity * item.price)}</p>
                                  </li>
                              ))}
                          </ul>
                      </div>
                      <div className="pt-6 space-y-2 border-t border-blue-100">
                          <h2 className="mb-4 text-lg font-semibold text-gray-900">Payment Details</h2>
                          <div className="flex items-center justify-between text-gray-500">
                              <span>Payment Method</span>
                              <div className="flex items-center gap-3 font-medium text-gray-900">
                                  <img 
                                      src={payment_method?.imageUrl} 
                                      alt={payment_method?.name} 
                                      className="w-auto h-6"
                                      onError={(e) => {e.currentTarget.style.display='none'}}
                                  />
                                  <span>{payment_method?.name}</span>
                              </div>
                          </div>
                          <div className="flex items-center justify-between text-gray-500">
                              <span>Subtotal</span>
                              <span className="text-gray-900">{formatCurrency(correctSubtotal)}</span>
                          </div>
                          {appliedPromo && (
                              <div className="flex items-center justify-between text-green-600">
                                  <span>Discount ({appliedPromo.promo_code})</span>
                                  <span>- {formatCurrency(correctDiscount)}</span>
                              </div>
                          )}
                          <div className="flex items-center justify-between pt-2 font-bold border-t border-blue-100">
                              <span className="text-base text-gray-900">Grand Total</span>
                              <span className="text-base text-blue-600">{formatCurrency(correctGrandTotal)}</span>
                          </div>
                      </div>
                      <div className="flex flex-col gap-3 pt-6 border-t border-blue-100 sm:flex-row">
                          <Button asChild className="w-full text-white transition-all duration-200 bg-blue-600 shadow-lg hover:bg-blue-700 rounded-xl sm:w-auto">
                              <Link href="/">Book Another Activity</Link>
                          </Button>
                      </div>
                  </div>
              </div>
          </div>
      );
    }
  
    // DEFAULT view for PENDING status
    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50">
            <div className="px-4 py-8 mx-auto max-w-7xl sm:px-6 lg:px-8">
                <div className="mb-6">
                    <Button asChild variant="ghost" className="-ml-4 transition-all duration-200 hover:bg-blue-50 hover:text-blue-600 rounded-xl">
                        <Link href="/transaction">
                            <ArrowLeft className="w-4 h-4 mr-2" /> Back to Transaction History
                        </Link>
                    </Button>
                </div>
                <Card className="mb-8 border border-blue-100 shadow-xl bg-white/90 backdrop-blur-sm rounded-3xl">
                    <CardHeader className="p-4 sm:p-6">
                        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-4">
                                {/* Status Badge for Mobile - Above Invoice */}
                                <div className="sm:hidden">
                                    <StatusBadge transaction={transactionDetail} className="px-3 py-1.5 text-base"/>
                                </div>
                                
                                <div className="flex items-center gap-4">
                                    {/* Status Badge for Desktop */}
                                    <div className="hidden sm:block">
                                        <StatusBadge transaction={transactionDetail} className="px-3 py-1.5 text-base"/>
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-500">Invoice Number</p>
                                        <p className="font-semibold text-gray-900">{invoiceId}</p>
                                    </div>
                                </div>
                            </div>
                            {isWaitingForPayment && (
                                <div className="p-3 text-center border border-orange-200 rounded-xl sm:text-right bg-orange-50">
                                    <p className="text-sm text-orange-700">Payment time left</p>
                                    <p className="text-lg font-bold text-orange-800">{timeLeft}</p>
                                </div>
                            )}
                        </div>
                    </CardHeader>
                </Card>
                <div className="grid items-start grid-cols-1 gap-8 lg:grid-cols-5">
                    <div className="space-y-6 lg:col-span-3">
                        {isWaitingForPayment && (
                            <Card className="border border-blue-100 shadow-xl bg-white/90 backdrop-blur-sm rounded-3xl">
                                <CardHeader>
                                    <CardTitle className="text-gray-900">How to Pay</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="p-4 space-y-4 bg-white border border-blue-100 rounded-xl">
                                        <div className="flex items-center justify-between">
                                            <p className="text-gray-500">Payment Method</p>
                                            <div className="flex items-center gap-2 font-semibold text-gray-900">
                                                <img 
                                                    src={payment_method?.imageUrl} 
                                                    alt={payment_method?.name} 
                                                    className="w-auto h-5"
                                                    onError={(e) => {e.currentTarget.style.display='none'}}
                                                />
                                                <span>{payment_method?.name}</span>
                                            </div>
                                        </div>
                                        <div className="flex items-center justify-between">
                                            <p className="text-gray-500">Virtual Account Number</p>
                                            <div className="flex items-center gap-2">
                                                <span className="text-lg font-bold text-gray-900">{payment_method?.virtual_account_number}</span>
                                                <Button 
                                                    variant="ghost" 
                                                    size="icon" 
                                                    className="w-8 h-8 transition-all duration-200 hover:bg-blue-50 hover:text-blue-600 rounded-xl" 
                                                    onClick={() => handleCopy(payment_method?.virtual_account_number)}
                                                >
                                                    <Copy className="w-4 h-4"/>
                                                </Button>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="p-4 mt-6 space-y-4 bg-white border border-blue-100 rounded-xl">
                                        <p className="font-semibold text-gray-900">Total Payment</p>
                                        <div className="flex items-center justify-between">
                                            <span className="text-2xl font-bold text-blue-600">{formatCurrency(correctGrandTotal)}</span>
                                            <Button 
                                                variant="ghost" 
                                                size="sm" 
                                                className="transition-all duration-200 hover:bg-blue-50 hover:text-blue-600 rounded-xl"
                                                onClick={() => handleCopy(String(correctGrandTotal))}
                                            >
                                                <Copy className="w-4 h-4 mr-2"/> Copy Amount
                                            </Button>
                                        </div>
                                        <p className="text-xs text-gray-500">Make sure you transfer the exact same amount.</p>
                                    </div>
                                    <Tabs defaultValue="m-banking" className="w-full mt-6">
                                        <TabsList className="grid w-full grid-cols-2 bg-blue-50 border border-blue-100 rounded-xl">
                                            <TabsTrigger value="m-banking" className="data-[state=active]:bg-blue-600 data-[state=active]:text-white rounded-lg">m-Banking</TabsTrigger>
                                            <TabsTrigger value="atm" className="data-[state=active]:bg-blue-600 data-[state=active]:text-white rounded-lg">ATM</TabsTrigger>
                                        </TabsList>
                                        <TabsContent value="m-banking" className="p-4 text-sm bg-white border border-blue-100 border-t-0 text-gray-600 rounded-b-xl">
                                            <ol className="space-y-2 list-decimal list-inside">
                                                <li>Open your mobile banking application.</li>
                                                <li>Select the **Transfer** menu, then choose **Virtual Account**.</li>
                                                <li>Enter the Virtual Account number above.</li>
                                                <li>Check the transaction details and make sure the name and bill amount are correct.</li>
                                                <li>Enter your PIN to complete the transaction.</li>
                                            </ol>
                                        </TabsContent>
                                        <TabsContent value="atm" className="p-4 text-sm bg-white border border-blue-100 border-t-0 text-gray-600 rounded-b-xl">
                                            <ol className="space-y-2 list-decimal list-inside">
                                                <li>Insert your ATM card and PIN.</li>
                                                <li>Select **Other Menu**, then select **Transfer**.</li>
                                                <li>Select **Virtual Account** and enter the Virtual Account number above.</li>
                                                <li>Ensure the details and bill amount are correct on the confirmation screen.</li>
                                                <li>Complete the transaction and keep the receipt as proof.</li>
                                            </ol>
                                        </TabsContent>
                                    </Tabs>
                                </CardContent>
                            </Card>
                        )}
                        {proofUrl && status?.toLowerCase() === 'pending' && (
                            <Card className="border border-blue-100 shadow-xl bg-white/90 backdrop-blur-sm rounded-3xl">
                                <CardHeader>
                                    <CardTitle className="text-gray-900">Waiting for Confirmation</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <img 
                                        src={proofUrl} 
                                        alt="Proof of Payment" 
                                        className="w-full border border-blue-100 rounded-xl shadow-sm"
                                        onError={(e) => { 
                                            e.currentTarget.onerror = null; 
                                            e.currentTarget.src = "/assets/error.png"; 
                                        }}
                                    />
                                    <p className="mt-4 text-sm text-center text-blue-600">Thank you! Your proof of payment is being verified by our team within 1x24 hours.</p>
                                </CardContent>
                            </Card>
                        )}
                    </div>
                    <div className="space-y-6 lg:col-span-2">
                        <Card className="border border-blue-100 shadow-xl bg-white/90 backdrop-blur-sm rounded-3xl">
                            <CardHeader>
                                <CardTitle className="text-gray-900">Order Summary</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <ul className="divide-y divide-blue-100">
                                    {transaction_items.map(item => (
                                        <li key={item.id} className="flex items-start gap-4 py-4">
                                            <img 
                                                src={item.imageUrls?.[0]} 
                                                alt={item.title} 
                                                className="object-cover w-24 h-24 rounded-xl shadow-sm"
                                                onError={(e) => { 
                                                    e.currentTarget.onerror = null; 
                                                    e.currentTarget.src = "/assets/error.png"; 
                                                }}
                                            />
                                            <div className="flex-grow">
                                                <p className="font-semibold text-gray-900">{item.title}</p>
                                                <p className="text-sm text-gray-500">{item.quantity} tickets x {formatCurrency(item.price)}</p>
                                            </div>
                                            <p className="font-semibold text-right text-gray-900">{formatCurrency(item.quantity * item.price)}</p>
                                        </li>
                                    ))}
                                </ul>
                            </CardContent>
                            <CardFooter className="flex justify-end text-lg font-bold bg-blue-50 border-t border-blue-100 rounded-b-3xl">
                                <div className="flex items-center gap-4">
                                    <span className="text-gray-700">Total</span>
                                    <span className="text-blue-600">{formatCurrency(correctSubtotal)}</span>
                                </div>
                            </CardFooter>
                        </Card>
                        {isWaitingForPayment && (
                            <Card className="border border-blue-100 shadow-xl bg-white/90 backdrop-blur-sm rounded-3xl">
                                <CardHeader>
                                    <CardTitle className="text-gray-900">Actions</CardTitle>
                                </CardHeader>
                                <CardContent className="flex flex-col gap-3">
                                    <Button 
                                        onClick={() => setIsUploadDialogOpen(true)} 
                                        className="w-full text-white transition-all duration-200 bg-blue-600 shadow-lg hover:bg-blue-700 rounded-xl"
                                    >
                                        <Upload className="w-4 h-4 mr-2"/>Upload Proof of Payment
                                    </Button>
                                    <Button 
                                        onClick={() => setIsCancelDialogOpen(true)} 
                                        variant="ghost" 
                                        className="w-full text-red-600 transition-all duration-200 hover:text-red-700 hover:bg-red-50 rounded-xl"
                                    >
                                        <XCircle className="w-4 h-4 mr-2"/>Cancel Transaction
                                    </Button>
                                </CardContent>
                            </Card>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
  };


  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50">
        <Dialog open={isUploadDialogOpen} onOpenChange={(isOpen) => { if (!isOpen) { setSelectedFile(null); setPreviewUrl(null); } setIsUploadDialogOpen(isOpen); }}>
            <DialogContent className="border border-blue-100 shadow-2xl bg-white/95 backdrop-blur-sm rounded-3xl">
                <DialogHeader>
                    <DialogTitle className="text-gray-900">Upload Proof of Payment</DialogTitle>
                    <DialogDescription className="text-gray-600">For Invoice: {transactionDetail?.invoiceId}</DialogDescription>
                </DialogHeader>
                <div className="py-4 space-y-4">
                    <Input 
                        type="file" 
                        accept="image/png, image/jpeg, image/jpg" 
                        onChange={handleFileChange}
                        className="border-2 border-blue-200 rounded-xl focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                    />
                    {previewUrl && (
                        <img src={previewUrl} alt="Preview" className="object-contain w-full mt-4 rounded-xl max-h-60 shadow-lg" />
                    )}
                </div>
                <DialogFooter>
                    <DialogClose asChild>
                        <Button variant="outline" className="border-blue-200 hover:bg-blue-50 hover:text-blue-600 rounded-xl">Cancel</Button>
                    </DialogClose>
                    <Button 
                        onClick={handleUploadSubmit} 
                        disabled={!selectedFile || isUploadingProcess}
                        className="text-white transition-all duration-200 bg-blue-600 shadow-lg hover:bg-blue-700 rounded-xl"
                    >
                        {isUploadingProcess ? <Loader2 className="w-4 h-4 mr-2 animate-spin"/> : <Upload className="w-4 h-4 mr-2"/>} 
                        {isUploadingImage ? 'Uploading...' : 'Submitting...'}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
        <Dialog open={isCancelDialogOpen} onOpenChange={setIsCancelDialogOpen}>
            <DialogContent className="border border-blue-100 shadow-2xl bg-white/95 backdrop-blur-sm rounded-3xl">
                <DialogHeader>
                    <DialogTitle className="text-gray-900">Confirm Cancellation</DialogTitle>
                    <DialogDescription className="text-gray-600">Are you sure you want to cancel the transaction with invoice {transactionDetail?.invoiceId}? This action cannot be undone.</DialogDescription>
                </DialogHeader>
                <DialogFooter>
                    <DialogClose asChild>
                        <Button variant="outline" className="border-blue-200 hover:bg-blue-50 hover:text-blue-600 rounded-xl">No</Button>
                    </DialogClose>
                    <Button 
                        variant="destructive" 
                        onClick={handleCancelSubmit} 
                        disabled={isCancelling}
                        className="transition-all duration-200 rounded-xl"
                    >
                        {isCancelling ? <Loader2 className="w-4 h-4 mr-2 animate-spin"/> : null} Yes, Cancel
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
      <AnimatePresence mode="wait">
        {isLoading ? (
            <motion.div key="loader" exit={{ opacity: 0 }}>
                <SkeletonLoader />
            </motion.div>
        ) : (
            <motion.div
                key="content"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5 }}
            >
                {renderContent()}
            </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default DetailTransactionPage;
