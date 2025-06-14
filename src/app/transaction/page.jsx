'use client';

import React, { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { useTransaction } from "@/hooks/useTransaction";
import { useTransactionProofPayment } from "@/hooks/useTransactionProofPayment";
import { useCancelTransaction } from "@/hooks/useCancelTransaction";
import { useUploadImage } from "@/hooks/useUploadImage";
import { cn } from "@/lib/utils";

// Import UI Components
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
    Pagination, 
    PaginationContent, 
    PaginationItem, 
    PaginationLink, 
    PaginationNext, 
    PaginationPrevious 
} from "@/components/ui/pagination";
import { Toaster, toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogClose } from "@/components/ui/dialog";
import { Frown, PackageSearch, Calendar, Ticket, Loader2, ChevronRight, Upload, XCircle, Clock, CheckCircle2, FileCheck2 } from "lucide-react";

// Helper functions
const formatCurrency = (amount) => new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", minimumFractionDigits: 0 }).format(amount);
const formatDate = (dateString) => new Date(dateString).toLocaleDateString("id-ID", { day: 'numeric', month: 'long', year: 'numeric' });

const getDisplayStatus = (transaction) => {
  const status = transaction.status.toLowerCase();
  const hasProof = !!transaction.proofPaymentUrl;

  if (status === 'pending') {
    if (hasProof) {
      return { label: 'Waiting for Confirmation', className: 'bg-blue-100 text-blue-800 border-transparent hover:bg-blue-100/80 dark:bg-blue-900/30 dark:text-blue-300', Icon: FileCheck2 };
    } else {
      return { label: 'Waiting for Payment', className: 'bg-orange-100 text-orange-800 border-transparent hover:bg-orange-100/80 dark:bg-orange-900/30 dark:text-orange-300', Icon: Clock };
    }
  }
  if (status === 'paid' || status === 'success') {
    return { label: 'Success', className: 'bg-green-100 text-green-800 border-transparent hover:bg-green-100/80 dark:bg-green-900/30 dark:text-green-300', Icon: CheckCircle2 };
  }
  if (status === 'cancelled' || status === 'failed') {
    return { label: status, className: 'bg-red-100 text-red-800 border-transparent hover:bg-red-100/80 dark:bg-red-900/30 dark:text-red-300', Icon: XCircle };
  }
  return { label: status, className: 'border-transparent bg-gray-100 text-gray-800 hover:bg-gray-100/80 dark:bg-gray-700 dark:text-gray-300', Icon: null };
};

const StatusBadge = ({ transaction, className }) => {
  const { label, className: statusClasses, Icon } = getDisplayStatus(transaction);
  return (
    <Badge className={cn("capitalize flex items-center gap-1.5", statusClasses, className)}>
      {Icon && <Icon className="h-3.5 w-3.5" />}
      <span>{label}</span>
    </Badge>
  );
};

const TransactionPage = () => {
  const { transactions, isLoading, error, fetchTransactions } = useTransaction();
  const { submitProofUrl, isLoading: isSubmittingUrl } = useTransactionProofPayment();
  const { cancelTransaction, isLoading: isCancelling } = useCancelTransaction();
  const { uploadImage, isLoading: isUploadingImage } = useUploadImage();

  const [activeTab, setActiveTab] = useState('semua');
  const [showAll, setShowAll] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [isUploadDialogOpen, setIsUploadDialogOpen] = useState(false);
  const [isCancelDialogOpen, setIsCancelDialogOpen] = useState(false);
  const [selectedTransaction, setSelectedTransaction] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const ITEMS_PER_PAGE = 8;
  
  useEffect(() => {
    if (transactions.length === 0) {
      fetchTransactions();
    }
  }, [fetchTransactions, transactions.length]);

  const filteredTransactions = useMemo(() => {
    const tab = activeTab.toLowerCase();
    if (tab === 'semua') return transactions;
    const paidStatus = ['paid', 'success'];
    const failedStatus = ['cancelled', 'failed'];
    return transactions.filter(t => {
      const status = t.status.toLowerCase();
      const hasProof = !!t.proofPaymentUrl;
      switch(tab) {
        case 'belum bayar': return status === 'pending' && !hasProof;
        case 'menunggu konfirmasi': return status === 'pending' && hasProof;
        case 'lunas': return paidStatus.includes(status);
        case 'dibatalkan': return status === 'cancelled';
        case 'gagal': return failedStatus.includes(status);
        default: return false;
      }
    });
  }, [activeTab, transactions]);

  useEffect(() => {
    setCurrentPage(1);
    setShowAll(false);
  }, [activeTab]);

  const visibleTransactions = useMemo(() => {
    const total = filteredTransactions.length;
    if (total > ITEMS_PER_PAGE) {
      const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
      return filteredTransactions.slice(startIndex, startIndex + ITEMS_PER_PAGE);
    }
    if (total > 4 && total <= ITEMS_PER_PAGE) {
      return showAll ? filteredTransactions : filteredTransactions.slice(0, 4);
    }
    return filteredTransactions;
  }, [filteredTransactions, showAll, currentPage]);
  
  const totalPages = Math.ceil(filteredTransactions.length / ITEMS_PER_PAGE);

  const transactionCounts = useMemo(() => {
    const paidStatus = ['paid', 'success'];
    const failedStatus = ['cancelled', 'failed'];
    return {
      semua: transactions.length,
      belumBayar: transactions.filter(t => t.status.toLowerCase() === 'pending' && !t.proofPaymentUrl).length,
      menungguKonfirmasi: transactions.filter(t => t.status.toLowerCase() === 'pending' && !!t.proofPaymentUrl).length,
      lunas: transactions.filter(t => paidStatus.includes(t.status.toLowerCase())).length,
      dibatalkan: transactions.filter(t => t.status.toLowerCase() === 'cancelled').length,
      gagal: transactions.filter(t => t.status.toLowerCase() === 'failed').length,
    }
  }, [transactions]);

  const handlePageChange = (page) => { if (page < 1 || page > totalPages) return; setCurrentPage(page); window.scrollTo(0, 0); };
  const handleOpenUploadDialog = (transaction) => { setSelectedTransaction(transaction); setIsUploadDialogOpen(true); };
  const handleOpenCancelDialog = (transaction) => { setSelectedTransaction(transaction); setIsCancelDialogOpen(true); };
  const handleFileChange = (event) => { const file = event.target.files?.[0]; if (file) { setSelectedFile(file); setPreviewUrl(URL.createObjectURL(file)); } };
  const handleCancelSubmit = async () => { if (!selectedTransaction) return; try { await cancelTransaction(selectedTransaction.id); toast.success("Transaksi berhasil dibatalkan."); await fetchTransactions(); setIsCancelDialogOpen(false); } catch (err) { toast.error(err.response?.data?.message || "Gagal membatalkan transaksi."); } };

  const handleUploadSubmit = async () => {
    if (!selectedFile || !selectedTransaction) return;
    
    const uploadToast = toast.loading("Mengunggah gambar...");
    
    try {
      const imageUrl = await uploadImage(selectedFile);
      toast.loading("Gambar terunggah. Mengirim bukti...", { id: uploadToast });

      if (imageUrl) {
        await submitProofUrl(selectedTransaction.id, imageUrl);
        toast.success("Bukti pembayaran berhasil dikirim!", { id: uploadToast });
        await fetchTransactions();
        setIsUploadDialogOpen(false);
        setSelectedFile(null);
        setPreviewUrl(null);
      }
    } catch (err) {
      toast.error(err.message || "Gagal mengunggah bukti pembayaran.", { id: uploadToast });
    }
  };

  const isUploadingProcess = isUploadingImage || isSubmittingUrl;

  if (isLoading && transactions.length === 0) {
    return (
      <div className="px-4 py-12 mx-auto max-w-7xl sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-8"><Skeleton className="w-1/3 h-8" /><Skeleton className="w-24 h-10" /></div>
        <Skeleton className="w-full h-10 mb-6" />
        <div className="space-y-4">{Array.from({ length: 4 }).map((_, index) => (<div key={index} className="flex items-center p-4 border rounded-xl"><Skeleton className="w-16 h-16 rounded-lg shrink-0" /><div className="flex-grow ml-4 space-y-2"><Skeleton className="w-3/4 h-5" /><Skeleton className="w-1/2 h-4" /></div><div className="w-48 space-y-2"><Skeleton className="w-24 h-5 ml-auto" /><Skeleton className="w-full h-10" /></div></div>))}</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
        <Frown className="w-16 h-16 text-red-500" />
        <h2 className="mt-4 text-2xl font-bold">Gagal memuat data</h2>
        <p className="mt-2 text-muted-foreground">{error}</p>
        <Button onClick={() => fetchTransactions()} className="mt-4">Coba Lagi</Button>
      </div>
    );
  }

  return (
    <div className="px-4 py-12 mx-auto max-w-7xl sm:px-6 lg:px-8">
      <Toaster richColors position="top-center" />
      <Dialog open={isUploadDialogOpen} onOpenChange={(isOpen) => { if (!isOpen) { setSelectedFile(null); setPreviewUrl(null); } setIsUploadDialogOpen(isOpen); }}>
        <DialogContent>
          <DialogHeader><DialogTitle>Upload Bukti Pembayaran</DialogTitle><DialogDescription>Untuk Invoice: {selectedTransaction?.invoiceId}</DialogDescription></DialogHeader>
          <div className="py-4 space-y-4"><Input type="file" accept="image/png, image/jpeg, image/jpg" onChange={handleFileChange} />{previewUrl && <img src={previewUrl} alt="Preview" className="object-contain w-full mt-4 rounded-md max-h-60" />}</div>
          <DialogFooter><DialogClose asChild><Button variant="outline">Batal</Button></DialogClose><Button onClick={handleUploadSubmit} disabled={!selectedFile || isUploadingProcess}>{isUploadingProcess ? <Loader2 className="w-4 h-4 mr-2 animate-spin"/> : <Upload className="w-4 h-4 mr-2"/>} {isUploadingImage ? 'Mengunggah...' : 'Mengirim...'}</Button></DialogFooter>
        </DialogContent>
      </Dialog>
      <Dialog open={isCancelDialogOpen} onOpenChange={setIsCancelDialogOpen}>
        <DialogContent><DialogHeader><DialogTitle>Konfirmasi Pembatalan</DialogTitle><DialogDescription>Anda yakin ingin membatalkan transaksi dengan invoice {selectedTransaction?.invoiceId}? Tindakan ini tidak dapat diurungkan.</DialogDescription></DialogHeader><DialogFooter><DialogClose asChild><Button variant="outline">Tidak</Button></DialogClose><Button variant="destructive" onClick={handleCancelSubmit} disabled={isCancelling}>{isCancelling ? <Loader2 className="w-4 h-4 mr-2 animate-spin"/> : null} Ya, Batalkan</Button></DialogFooter></DialogContent>
      </Dialog>
      
      <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Riwayat Transaksi</h1>
        <Button variant="outline" onClick={() => fetchTransactions()} disabled={isLoading}>{isLoading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null} Segarkan</Button>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full h-auto grid-cols-3 gap-1 sm:grid-cols-6 sm:h-10">
          <TabsTrigger value="semua">Semua <Badge variant="secondary" className="ml-2">{transactionCounts.semua}</Badge></TabsTrigger>
          <TabsTrigger value="belum bayar">Belum Bayar <Badge variant="secondary" className="ml-2">{transactionCounts.belumBayar}</Badge></TabsTrigger>
          <TabsTrigger value="menunggu konfirmasi">Konfirmasi <Badge variant="secondary" className="ml-2">{transactionCounts.menungguKonfirmasi}</Badge></TabsTrigger>
          <TabsTrigger value="lunas">Lunas <Badge variant="secondary" className="ml-2">{transactionCounts.lunas}</Badge></TabsTrigger>
          <TabsTrigger value="dibatalkan">Dibatalkan <Badge variant="secondary" className="ml-2">{transactionCounts.dibatalkan}</Badge></TabsTrigger>
          <TabsTrigger value="gagal">Gagal <Badge variant="secondary" className="ml-2">{transactionCounts.gagal}</Badge></TabsTrigger>
        </TabsList>
      </Tabs>
      
      <div className="mt-6">
        {(isLoading && transactions.length > 0) ? (<div className="flex justify-center py-16"><Loader2 className="w-8 h-8 animate-spin text-muted-foreground" /></div>
        ) : visibleTransactions.length === 0 ? (
           <div className="flex flex-col items-center justify-center py-16 text-center"><PackageSearch className="w-16 h-16 text-gray-400" /><h2 className="mt-4 text-2xl font-bold">Tidak Ada Transaksi</h2><p className="mt-2 text-muted-foreground">Tidak ada transaksi yang sesuai dengan kategori ini.</p></div>
        ) : (
          <>
            <div className="space-y-4">
              {visibleTransactions.map(item => {
                const firstProduct = item.transaction_items?.[0];
                const isWaitingForPayment = item.status.toLowerCase() === 'pending' && !item.proofPaymentUrl;
                return (
                  <div key={item.id} className="p-4 transition-all bg-white border shadow-sm rounded-xl hover:shadow-lg">
                      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                          <div className="flex items-center flex-grow gap-4">
                              <img src={firstProduct?.imageUrls?.[0] || 'https://via.placeholder.com/150'} alt={firstProduct?.title || 'Gambar Produk'} className="object-cover w-16 h-16 rounded-lg shrink-0"/>
                              <div className="flex-grow">
                                  <div className="flex items-center justify-between">
                                      <p className="text-base font-bold text-gray-800">{item.invoiceId}</p>
                                      <StatusBadge transaction={item} className="sm:hidden" />
                                  </div>
                                  <p className="text-sm font-medium text-gray-900">{firstProduct?.title}{item.transaction_items.length > 1 && <span className="font-normal text-gray-500"> dan {item.transaction_items.length - 1} lainnya</span>}</p>
                                  <div className="flex flex-wrap items-center mt-1 text-xs gap-x-4 gap-y-1 text-muted-foreground">
                                    <span className="flex items-center gap-1.5"><Ticket size={12}/>{firstProduct?.quantity} tiket</span>
                                    <span className="flex items-center gap-1.5"><img src={item.payment_method?.imageUrl} alt={item.payment_method?.name} className="object-contain w-auto h-3"/>{item.payment_method?.name}</span>
                                    <span className="flex items-center gap-1.5"><Calendar size={12}/>{formatDate(item.orderDate)}</span>
                                  </div>
                              </div>
                          </div>
                          <div className="flex items-center justify-between sm:flex-col sm:items-end sm:justify-center shrink-0 sm:w-48">
                              <StatusBadge transaction={item} className="hidden sm:flex" />
                              <div className="mt-1 text-right"><p className="text-sm text-gray-500">Total</p><p className="font-bold text-blue-600">{formatCurrency(item.totalAmount)}</p></div>
                          </div>
                      </div>
                      {isWaitingForPayment ? (
                        <div className="flex flex-col gap-2 pt-4 mt-4 border-t sm:flex-row">
                           <Button onClick={() => handleOpenUploadDialog(item)} className="flex-1 w-full sm:w-auto"><Upload className="w-4 h-4 mr-2"/> Upload Bukti Bayar</Button>
                           <Button asChild className="flex-1 w-full sm:w-auto" variant="secondary"><Link href={`/transaction/${item.id}`}>Lihat Detail</Link></Button>
                           <Button onClick={() => handleOpenCancelDialog(item)} variant="outline" size="sm" className="w-full sm:w-auto hover:bg-red-50 hover:text-red-600"><XCircle className="w-4 h-4 mr-2"/> Batalkan</Button>
                        </div>
                      ) : (
                        <div className="pt-4 mt-4 border-t">
                            <Button asChild className="w-full" variant="secondary"><Link href={`/transaction/${item.id}`}>Lihat Detail</Link></Button>
                        </div>
                      )}
                  </div>
                );
              })}
            </div>
            
            <div className="mt-10 text-center">
              {filteredTransactions.length > 4 && filteredTransactions.length <= ITEMS_PER_PAGE && !showAll && (
                  <Button variant="outline" onClick={() => setShowAll(true)}>Lihat Semua ({filteredTransactions.length})</Button>
              )}
              {filteredTransactions.length > ITEMS_PER_PAGE && totalPages > 1 && (
                  <Pagination>
                    <PaginationContent>
                      <PaginationItem><PaginationPrevious href="#" onClick={(e) => { e.preventDefault(); handlePageChange(currentPage - 1); }} disabled={currentPage === 1} /></PaginationItem>
                      {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                        <PaginationItem key={page}><PaginationLink href="#" onClick={(e) => { e.preventDefault(); handlePageChange(page); }} isActive={currentPage === page}>{page}</PaginationLink></PaginationItem>
                      ))}
                      <PaginationItem><PaginationNext href="#" onClick={(e) => { e.preventDefault(); handlePageChange(currentPage + 1); }} disabled={currentPage === totalPages} /></PaginationItem>
                    </PaginationContent>
                  </Pagination>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default TransactionPage;