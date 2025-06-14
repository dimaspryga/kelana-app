'use client';

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useDetailTransaction } from "@/hooks/useDetailTransaction";
import { useTransactionProofPayment } from "@/hooks/useTransactionProofPayment";
import { useCancelTransaction } from "@/hooks/useCancelTransaction";
import { useUploadImage } from "@/hooks/useUploadImage";
import { useTransaction } from "@/hooks/useTransaction";
import { cn } from "@/lib/utils";

// Import UI Components
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Toaster, toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogClose } from "@/components/ui/dialog";
import { Frown, PackageSearch, Calendar, Ticket, Loader2, ArrowLeft, Banknote, Upload, XCircle, Clock, CheckCircle2, FileCheck2, Copy, Printer } from "lucide-react";

// Helper Functions
const formatCurrency = (amount) => new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", minimumFractionDigits: 0 }).format(amount);
const formatDate = (dateString) => new Date(dateString).toLocaleDateString("id-ID", { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' });

// Helper yang disederhanakan untuk mendapatkan semua properti tampilan status
const getDisplayStatus = (transaction) => {
  if (!transaction) return { label: '', Icon: null, className: '' };
  
  const status = transaction.status.toLowerCase();
  const hasProof = !!transaction.proofPaymentUrl;

  if (status === 'pending') {
    if (hasProof) {
      return { label: 'Waiting for Confirmation', Icon: FileCheck2, className: 'bg-blue-100 text-blue-800' };
    }
    return { label: 'Waiting for Payment', Icon: Clock, className: 'bg-orange-100 text-orange-800' };
  }
  if (status === 'paid' || status === 'success') {
    return { label: 'Pembayaran Berhasil', Icon: CheckCircle2, className: 'bg-green-600 text-white' };
  }
  if (status === 'cancelled') {
    return { label: 'Transaksi Dibatalkan', Icon: XCircle, className: 'bg-red-100 text-red-800' };
  }
  if (status === 'failed') {
    return { label: 'Pembayaran Gagal', Icon: XCircle, className: 'bg-red-100 text-red-800' };
  }
  return { label: status, Icon: null, className: 'bg-gray-100 text-gray-800' };
};

// Komponen Badge yang lebih pintar
const StatusBadge = ({ transaction, className }) => {
  const { label, Icon, className: statusClasses } = getDisplayStatus(transaction);
  return (
    <Badge className={cn("capitalize flex items-center gap-1.5 border-transparent", statusClasses, className)}>
      {Icon && <Icon className="w-4 h-4" />}
      <span>{label}</span>
    </Badge>
  );
};

const DetailTransactionPage = () => {
  const params = useParams();
  const { transactionDetail, isLoading, error, fetchTransactionDetail } = useDetailTransaction();
  const { fetchTransactions } = useTransaction();
  const { uploadImage, isLoading: isUploadingImage } = useUploadImage();
  const { submitProofUrl, isLoading: isSubmittingUrl } = useTransactionProofPayment();
  const { cancelTransaction, isLoading: isCancelling } = useCancelTransaction();

  // State yang relevan untuk halaman detail
  const [timeLeft, setTimeLeft] = useState("");
  const [isUploadDialogOpen, setIsUploadDialogOpen] = useState(false);
  const [isCancelDialogOpen, setIsCancelDialogOpen] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);

  useEffect(() => {
    const transactionId = params.id;
    if (transactionId) {
      fetchTransactionDetail(transactionId);
    }
  }, [params.id, fetchTransactionDetail]);

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
          if (timeLeft !== "Waktu pembayaran telah habis.") {
            setTimeLeft("Waktu pembayaran telah habis.");
            fetchTransactionDetail(params.id);
          }
          clearInterval(interval);
        } else {
          const hours = Math.floor(diff / (1000 * 60 * 60));
          const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
          const seconds = Math.floor((diff % (1000 * 60)) / 1000);
          setTimeLeft(`${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`);
        }
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [status, proofUrl, expiryDate, params.id, fetchTransactionDetail, timeLeft]);

  const handleCopy = (text) => { navigator.clipboard.writeText(String(text)); toast.success(`"${text}" berhasil disalin!`); };
  const handleFileChange = (event) => { const file = event.target.files?.[0]; if (file) { setSelectedFile(file); setPreviewUrl(URL.createObjectURL(file)); } };
  const handleUploadSubmit = async () => { if (!selectedFile || !transactionDetail) return; const uploadToast = toast.loading("Mengunggah gambar..."); try { const imageUrl = await uploadImage(selectedFile); toast.loading("Gambar terunggah. Mengirim bukti...", { id: uploadToast }); if (imageUrl) { await submitProofUrl(transactionDetail.id, imageUrl); toast.success("Bukti pembayaran berhasil dikirim!", { id: uploadToast }); await fetchTransactionDetail(params.id); await fetchTransactions(); setIsUploadDialogOpen(false); setSelectedFile(null); setPreviewUrl(null); } } catch (err) { toast.error(err.message || "Gagal mengunggah bukti pembayaran.", { id: uploadToast }); } };
  const handleCancelSubmit = async () => { if (!transactionDetail) return; try { await cancelTransaction(transactionDetail.id); toast.success("Transaksi berhasil dibatalkan."); await fetchTransactionDetail(params.id); await fetchTransactions(); setIsCancelDialogOpen(false); } catch (err) { toast.error(err.response?.data?.message || "Gagal membatalkan transaksi."); } };

  const isUploadingProcess = isUploadingImage || isSubmittingUrl;

  if (isLoading) {
    return (
      <div className="max-w-4xl p-4 mx-auto md:p-8">
        <Skeleton className="w-40 h-8 mb-6" />
        <Skeleton className="w-full h-48 mb-8" />
        <Skeleton className="w-full h-64" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-4 text-center bg-gray-50">
        <Frown className="w-16 h-16 text-red-500" />
        <h2 className="mt-4 text-2xl font-bold">Gagal Memuat Transaksi</h2>
        <p className="mt-2 text-muted-foreground">{error}</p>
        <Button asChild className="mt-6">
          <Link href="/transaction">Kembali ke Riwayat</Link>
        </Button>
      </div>
    );
  }

  if (!transactionDetail) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-4 text-center bg-gray-50">
        <PackageSearch className="w-16 h-16 text-gray-400" />
        <h2 className="mt-4 text-2xl font-bold">Transaksi Tidak Ditemukan</h2>
        <Button asChild className="mt-4">
            <Link href="/transaction">Kembali ke Riwayat</Link>
        </Button>
      </div>
    );
  }

  const { transaction_items = [], payment_method, totalAmount, orderDate, proofPaymentUrl, invoiceId } = transactionDetail;
  const isWaitingForPayment = status?.toLowerCase() === 'pending' && !proofUrl;
  const isSuccess = ['paid', 'success'].includes(status?.toLowerCase());
  const isTerminated = ['cancelled', 'failed'].includes(status?.toLowerCase());

  // Tampilan E-Receipt untuk status SUKSES atau GAGAL/DIBATALKAN
  if (isSuccess || isTerminated) {
    const cardClass = isSuccess ? "bg-green-50 border-green-200 text-green-800" : "bg-red-50 border-red-200 text-red-800";
    const headerIcon = isSuccess ? <CheckCircle2 className="w-16 h-16 mx-auto mb-4 text-green-600"/> : <XCircle className="w-16 h-16 mx-auto mb-4 text-red-600"/>;
    
    return (
      <div className="min-h-screen bg-gray-50">
        <Toaster richColors position="top-center" />
        <div className="max-w-4xl px-4 py-8 mx-auto sm:px-6 lg:px-8">
            <div className="mb-6">
              <Button asChild variant="ghost" className="-ml-4">
                <Link href="/transaction"><ArrowLeft className="w-4 h-4 mr-2" /> Kembali ke Riwayat</Link>
              </Button>
            </div>
            <Card className={`${cardClass} text-center p-8 mb-8 rounded-xl shadow-lg`}>
                {headerIcon}
                <h1 className={`text-3xl font-bold ${isSuccess ? 'text-green-900' : 'text-red-900'}`}>{getDisplayStatus(transactionDetail).label}</h1>
                {isTerminated && <p className="mt-2 opacity-80">{status === 'cancelled' ? 'Transaksi ini telah dibatalkan atau kedaluwarsa.' : 'Terjadi masalah saat memproses pesanan.'}</p>}
                {isSuccess && <p className="mt-2 opacity-80">Terima kasih! Pesanan Anda telah kami konfirmasi.</p>}
                <div className="mt-6"><p className="text-sm opacity-80">Total Pembayaran</p><p className="text-4xl font-bold">{formatCurrency(totalAmount)}</p></div>
            </Card>
            <div className="p-8 space-y-6 bg-white shadow-md rounded-xl">
                <div className="grid grid-cols-1 gap-6 pb-6 border-b sm:grid-cols-2">
                    <div><p className="text-sm text-muted-foreground">Nomor Invoice</p><p className="font-semibold">{invoiceId}</p></div>
                    <div className="sm:text-right"><p className="text-sm text-muted-foreground">Tanggal Transaksi</p><p className="font-semibold">{formatDate(orderDate)}</p></div>
                </div>
                <div>
                    <h2 className="mb-4 text-lg font-semibold">Rincian Pesanan</h2>
                    <ul className="divide-y">{transaction_items.map(item => ( <li key={item.id} className={`flex items-center gap-4 py-4 ${isTerminated ? 'opacity-50' : ''}`}> <img src={item.imageUrls?.[0]} alt={item.title} className="object-cover w-16 h-16 rounded-md" /> <div className="flex-grow"> <p className={`font-semibold ${isTerminated ? 'line-through' : ''}`}>{item.title}</p> <p className="text-sm text-muted-foreground">{item.quantity} tiket x {formatCurrency(item.price)}</p> </div> <p className={`font-semibold ${isTerminated ? 'line-through' : ''}`}>{formatCurrency(item.quantity * item.price)}</p> </li> ))}</ul>
                </div>
                <div className="pt-6 border-t">
                     <h2 className="mb-4 text-lg font-semibold">Detail Pembayaran</h2>
                     <div className="flex items-center justify-between">
                        <span className="text-muted-foreground">Metode</span>
                        <div className="flex items-center gap-3 font-medium"><img src={payment_method?.imageUrl} alt={payment_method?.name} className="w-auto h-6"/><span >{payment_method?.name}</span></div>
                     </div>
                </div>
                <div className="flex flex-col gap-3 pt-6 border-t sm:flex-row">
                    <Button asChild className="w-full sm:w-auto"><Link href="/">Pesan Aktivitas Lain</Link></Button>
                </div>
            </div>
        </div>
      </div>
    );
  }

  // Tampilan DEFAULT untuk status PENDING
  return (
    <div className="min-h-screen bg-slate-50">
      <Toaster richColors position="top-center" />
      <Dialog open={isUploadDialogOpen} onOpenChange={(isOpen) => { if (!isOpen) { setSelectedFile(null); setPreviewUrl(null); } setIsUploadDialogOpen(isOpen); }}>
        <DialogContent><DialogHeader><DialogTitle>Upload Bukti Pembayaran</DialogTitle><DialogDescription>Untuk Invoice: {transactionDetail.invoiceId}</DialogDescription></DialogHeader><div className="py-4 space-y-4"><Input type="file" accept="image/png, image/jpeg, image/jpg" onChange={handleFileChange} />{previewUrl && <img src={previewUrl} alt="Preview" className="object-contain w-full mt-4 rounded-md max-h-60" />}</div><DialogFooter><DialogClose asChild><Button variant="outline">Batal</Button></DialogClose><Button onClick={handleUploadSubmit} disabled={!selectedFile || isUploadingProcess}>{isUploadingProcess ? <Loader2 className="w-4 h-4 mr-2 animate-spin"/> : <Upload className="w-4 h-4 mr-2"/>} {isUploadingImage ? 'Mengunggah...' : 'Mengirim...'}</Button></DialogFooter></DialogContent>
      </Dialog>
      <Dialog open={isCancelDialogOpen} onOpenChange={setIsCancelDialogOpen}>
        <DialogContent><DialogHeader><DialogTitle>Konfirmasi Pembatalan</DialogTitle><DialogDescription>Anda yakin ingin membatalkan transaksi dengan invoice {transactionDetail.invoiceId}? Tindakan ini tidak dapat diurungkan.</DialogDescription></DialogHeader><DialogFooter><DialogClose asChild><Button variant="outline">Tidak</Button></DialogClose><Button variant="destructive" onClick={handleCancelSubmit} disabled={isCancelling}>{isCancelling ? <Loader2 className="w-4 h-4 mr-2 animate-spin"/> : null} Ya, Batalkan</Button></DialogFooter></DialogContent>
      </Dialog>
      <div className="px-4 py-8 mx-auto max-w-7xl sm:px-6 lg:px-8">
        <div className="mb-6"><Button asChild variant="ghost" className="-ml-4"><Link href="/transaction"><ArrowLeft className="w-4 h-4 mr-2" /> Kembali ke Riwayat Transaksi</Link></Button></div>
        <Card className="mb-8"><CardHeader className="p-4 sm:p-6"><div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between"><div className="flex items-center gap-4"><StatusBadge transaction={transactionDetail} className="px-3 py-1.5 text-base"/><div><p className="text-sm text-muted-foreground">Invoice Number</p><p className="font-semibold">{invoiceId}</p></div></div>{isWaitingForPayment && (<div className="p-3 text-center border border-orange-200 rounded-md sm:text-right bg-orange-50"><p className="text-sm text-orange-700">Batas Waktu Pembayaran</p><p className="text-lg font-bold text-orange-800">{timeLeft}</p></div>)}</div></CardHeader></Card>
        <div className="grid items-start grid-cols-1 gap-8 lg:grid-cols-5">
            <div className="space-y-6 lg:col-span-3">{isWaitingForPayment && (<Card><CardHeader><CardTitle>Cara Pembayaran</CardTitle></CardHeader><CardContent><div className="p-4 space-y-4 bg-white border rounded-lg"><div className="flex items-center justify-between"><p className="text-muted-foreground">Metode Pembayaran</p><div className="flex items-center gap-2 font-semibold"><img src={payment_method?.imageUrl} alt={payment_method?.name} className="w-auto h-5" /><span>{payment_method?.name}</span></div></div><div className="flex items-center justify-between"><p className="text-muted-foreground">Nomor Virtual Account</p><div className="flex items-center gap-2"><span className="text-lg font-bold">{payment_method?.virtual_account_number}</span><Button variant="ghost" size="icon" className="w-8 h-8" onClick={() => handleCopy(payment_method?.virtual_account_number)}><Copy className="w-4 h-4"/></Button></div></div></div><div className="p-4 mt-6 space-y-4 bg-white border rounded-lg"><p className="font-semibold">Total Pembayaran</p><div className="flex items-center justify-between"><span className="text-2xl font-bold text-orange-600">{formatCurrency(totalAmount)}</span><Button variant="ghost" size="sm" onClick={() => handleCopy(String(totalAmount))}><Copy className="w-4 h-4 mr-2"/> Salin Jumlah</Button></div><p className="text-xs text-muted-foreground">Pastikan Anda mentransfer jumlah yang sama persis hingga 3 digit terakhir.</p></div><Tabs defaultValue="m-banking" className="w-full mt-6"><TabsList className="grid w-full grid-cols-2"><TabsTrigger value="m-banking">m-Banking</TabsTrigger><TabsTrigger value="atm">ATM</TabsTrigger></TabsList><TabsContent value="m-banking" className="p-4 text-sm bg-white border border-t-0 text-muted-foreground rounded-b-md"><ol className="space-y-2 list-decimal list-inside"><li>Buka aplikasi mobile banking Anda.</li><li>Pilih menu **Transfer**, lalu pilih **Virtual Account**.</li><li>Masukkan nomor Virtual Account di atas.</li><li>Periksa detail transaksi dan pastikan nama dan jumlah tagihan sudah benar.</li><li>Masukkan PIN Anda untuk menyelesaikan transaksi.</li></ol></TabsContent><TabsContent value="atm" className="p-4 text-sm bg-white border border-t-0 text-muted-foreground rounded-b-md"><ol className="space-y-2 list-decimal list-inside"><li>Masukkan kartu ATM dan PIN Anda.</li><li>Pilih **Menu Lainnya**, lalu pilih **Transfer**.</li><li>Pilih **Virtual Account** dan masukkan nomor Virtual Account di atas.</li><li>Pastikan detail dan jumlah tagihan sudah benar pada layar konfirmasi.</li><li>Selesaikan transaksi dan simpan struk sebagai bukti.</li></ol></TabsContent></Tabs></CardContent></Card>)}{proofPaymentUrl && status?.toLowerCase() === 'pending' && (<Card><CardHeader><CardTitle>Menunggu Konfirmasi</CardTitle></CardHeader><CardContent><img src={proofPaymentUrl} alt="Bukti Pembayaran" className="w-full border rounded-md"/><p className="mt-4 text-sm text-center text-blue-600">Terima kasih! Bukti pembayaran Anda sedang diverifikasi oleh tim kami dalam 1x24 jam.</p></CardContent></Card>)}</div>
            <div className="space-y-6 lg:col-span-2"><Card><CardHeader><CardTitle>Ringkasan Pesanan</CardTitle></CardHeader><CardContent><ul className="divide-y">{transaction_items.map(item => ( <li key={item.id} className="flex items-start gap-4 py-4"> <img src={item.imageUrls?.[0]} alt={item.title} className="object-cover w-24 h-24 rounded-lg" /> <div className="flex-grow"> <p className="font-semibold">{item.title}</p> <p className="text-sm text-muted-foreground">{item.quantity} tiket x {formatCurrency(item.price)}</p> </div> <p className="font-semibold text-right">{formatCurrency(item.quantity * item.price)}</p> </li> ))}</ul></CardContent><CardFooter className="flex justify-end text-lg font-bold bg-slate-100"><div className="flex items-center gap-4"><span>Total</span><span>{formatCurrency(totalAmount)}</span></div></CardFooter></Card>{isWaitingForPayment && (<Card><CardHeader><CardTitle>Aksi</CardTitle></CardHeader><CardContent className="flex flex-col gap-3"><Button onClick={() => setIsUploadDialogOpen(true)} className="w-full"><Upload className="w-4 h-4 mr-2"/>Upload Bukti Pembayaran</Button><Button onClick={() => setIsCancelDialogOpen(true)} variant="ghost" className="w-full text-red-600 hover:text-red-700"><XCircle className="w-4 h-4 mr-2"/>Batalkan Transaksi</Button></CardContent></Card>)}</div>
        </div>
      </div>
    </div>
  );
};

export default DetailTransactionPage;