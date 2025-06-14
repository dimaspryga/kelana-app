"use client";

import React, { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";

// Import Hooks - Kita asumsikan useCart adalah hook yang menggunakan CartContext Anda
import { useCart } from "@/hooks/useCart";
import { usePromo } from "@/hooks/usePromo";
import { usePaymentMethod } from "@/hooks/usePaymentMethod";
import { useCreateTransaction } from "@/hooks/useCreateTransaction";
import { useTransaction } from "@/hooks/useTransaction";

// Import UI Components
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Toaster, toast } from "sonner";
import { Loader2, ShoppingCart, Trash2, Frown, Plus, Minus, Tag, X } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger, DialogClose } from "@/components/ui/dialog";

const CartPage = () => {
  const router = useRouter();
  
  // --- PERUBAHAN KUNCI: Ambil fungsi 'refetchCart' dari context ---
  const { cartItems, isLoading, error, removeFromCart, updateItemQuantity, refetchCart } = useCart();
  
  const { promo: allPromos } = usePromo();
  const { paymentMethod: allPaymentMethods } = usePaymentMethod();
  const { createTransaction, isLoading: isProcessing, error: transactionError } = useCreateTransaction();
  const { fetchTransactions } = useTransaction(); 

  // State lokal komponen (tidak ada perubahan)
  const [selectedItems, setSelectedItems] = useState(new Set());
  const [updatingItemId, setUpdatingItemId] = useState(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isSingleItemDeleteDialogOpen, setIsSingleItemDeleteDialogOpen] = useState(false);
  const [currentItemForDeletion, setCurrentItemForDeletion] = useState(null);
  const [promoCodeInput, setPromoCodeInput] = useState("");
  const [appliedPromo, setAppliedPromo] = useState(null);
  const [promoError, setPromoError] = useState("");
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState(null);

  // Kalkulasi harga (tidak ada perubahan)
  const totalPrice = useMemo(() => {
    return cartItems
      .filter((item) => selectedItems.has(item.id))
      .reduce((acc, item) => acc + (item.activity?.price || 0) * item.quantity, 0);
  }, [cartItems, selectedItems]);
  const discount = appliedPromo ? appliedPromo.promo_discount_price : 0;
  const grandTotal = Math.max(0, totalPrice - discount);

  // Semua handler UI lainnya tidak ada perubahan
  const handleSelectItem = (itemId) => {
    const newSelection = new Set(selectedItems);
    newSelection.has(itemId) ? newSelection.delete(itemId) : newSelection.add(itemId);
    setSelectedItems(newSelection);
  };
  const handleSelectAll = () => {
    if (selectedItems.size === cartItems.length && cartItems.length > 0) {
      setSelectedItems(new Set());
    } else {
      setSelectedItems(new Set(cartItems.map((item) => item.id)));
    }
  };
  const executeDeleteSelected = async () => { /* ... */ };
  const initiateSingleItemDelete = (itemId, itemTitle) => { /* ... */ };
  const executeSingleItemDelete = () => { /* ... */ };
  const handleUpdateQuantity = async (itemId, newQuantity) => { /* ... */ };
  const handleApplyPromo = () => { /* ... */ };
  const handleRemovePromo = () => { /* ... */ };


  // --- PERBAIKAN UTAMA DI FUNGSI INI ---
  const handleProcessPayment = async () => {
    if (selectedItems.size === 0 || !selectedPaymentMethod) {
      toast.error("Pilih item dan metode pembayaran terlebih dahulu.");
      return;
    }
    const payload = {
      cartIds: Array.from(selectedItems),
      paymentMethodId: selectedPaymentMethod,
    };
    
    try {
      // 1. Buat transaksi
      const result = await createTransaction(payload);
      
      toast.success("Pesanan berhasil dibuat! Menyegarkan data...");

      // 2. HAPUS blok penghapusan manual dan GANTI dengan refetch
      await refetchCart(); // Ini akan mengambil data keranjang terbaru (yang sudah kosong) dari server

      // 3. Perbarui daftar transaksi di context
      await fetchTransactions();
      
      // 4. Arahkan pengguna
      setTimeout(() => {
        router.push(result?.data?.id ? `/transaction/${result.data.id}` : "/transaction");
      }, 1000);

    } catch (err) {
      console.error("--- GAGAL MEMBUAT TRANSAKSI ---");
      if (err.response) {
        console.error("Status Code:", err.response.status);
        console.error("Data Error:", err.response.data);
        toast.error(`Error ${err.response.status}: ${err.response.data?.message || 'Gagal memproses pesanan.'}`);
      } else {
        console.error("Error:", err.message);
        toast.error(`Terjadi kesalahan: ${err.message}`);
      }
    }
  };
  
  useEffect(() => {
    if (!isLoading) {
      setSelectedItems(new Set(cartItems.map((item) => item.id)));
    }
  }, [cartItems, isLoading]);

  if (isLoading) return <div className="flex items-center justify-center min-h-[80vh]"><Loader2 className="w-12 h-12 animate-spin" /></div>;
  if (error) return <div className="flex flex-col items-center justify-center min-h-[80vh]"><Frown className="w-16 h-16 text-red-500" /><h2 className="mt-4 text-xl">Gagal memuat keranjang.</h2><p>{error}</p></div>;
  // Kondisi ini akan otomatis benar setelah refetchCart() berhasil
  if (cartItems.length === 0) return <div className="flex flex-col items-center justify-center min-h-[80vh]"><ShoppingCart className="w-24 h-24 text-gray-300" /><h1 className="mt-6 text-3xl font-bold">Keranjang Anda Kosong</h1><Button className="mt-4" onClick={() => router.push("/")}>Cari Aktivitas</Button></div>;

  return (
    <div className="container px-4 py-8 mx-auto lg:py-12">
      <Toaster richColors position="top-center" />
      <Dialog open={isSingleItemDeleteDialogOpen} onOpenChange={setIsSingleItemDeleteDialogOpen}>
        <DialogContent className="sm:max-w-[425px]"><DialogHeader><DialogTitle>Hapus Item?</DialogTitle><DialogDescription>Anda yakin ingin menghapus "{currentItemForDeletion?.title}"?</DialogDescription></DialogHeader><DialogFooter><DialogClose asChild><Button variant="outline">Batal</Button></DialogClose><Button variant="destructive" onClick={executeSingleItemDelete}>Ya, Hapus</Button></DialogFooter></DialogContent>
      </Dialog>
      <h1 className="mb-8 text-3xl font-bold">Keranjang Belanja</h1>
      <div className="flex flex-col gap-8 lg:flex-row lg:items-start">
        <div className="w-full lg:w-2/3">
          <div className="flex items-center justify-between p-4 mb-4 bg-white border rounded-lg">
            <div className="flex items-center"><Checkbox id="select-all" checked={selectedItems.size === cartItems.length && cartItems.length > 0} onCheckedChange={handleSelectAll} /><label htmlFor="select-all" className="ml-3 text-sm font-medium">Pilih Semua ({cartItems.length} jenis)</label></div>
            <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}><DialogTrigger asChild><Button variant="ghost" className="text-sm text-red-600 hover:bg-red-50" disabled={selectedItems.size === 0}><Trash2 className="w-4 h-4 mr-2" />Hapus</Button></DialogTrigger><DialogContent className="sm:max-w-[425px]"><DialogHeader><DialogTitle>Konfirmasi</DialogTitle><DialogDescription>Hapus {selectedItems.size} item terpilih?</DialogDescription></DialogHeader><DialogFooter><DialogClose asChild><Button variant="outline">Batal</Button></DialogClose><Button variant="destructive" onClick={executeDeleteSelected}>Ya, Hapus</Button></DialogFooter></DialogContent></Dialog>
          </div>
          <div className="space-y-4">
            {cartItems.map(item => (item.activity && (
              <div key={item.id} className={`p-4 bg-white border rounded-lg transition-opacity ${updatingItemId === item.id ? "opacity-50 pointer-events-none" : ""}`}>
                <div className="flex items-start justify-between">
                    <div className="flex items-start flex-grow gap-4">
                        <Checkbox checked={selectedItems.has(item.id)} onCheckedChange={() => handleSelectItem(item.id)} className="mt-1" />
                        <img src={item.activity.imageUrls?.[0]} alt={item.activity.title} className="object-cover w-20 h-20 rounded-md" />
                        <div><p className="font-medium">{item.activity.title}</p><p className="text-lg font-bold">Rp {item.activity.price?.toLocaleString("id-ID")}</p></div>
                    </div>
                    <div className="flex items-center flex-shrink-0 gap-4">
                        <Button variant="ghost" size="icon" className="text-gray-400 hover:text-red-600" onClick={() => initiateSingleItemDelete(item.id, item.activity.title)} disabled={updatingItemId === item.id}><Trash2 className="w-5 h-5" /></Button>
                        <div className="flex items-center border rounded-md">
                            <Button variant="ghost" size="icon" onClick={() => handleUpdateQuantity(item.id, item.quantity - 1)} disabled={item.quantity <= 1 || updatingItemId === item.id}><Minus className="w-4 h-4" /></Button>
                            <span className="flex items-center justify-center w-10 font-medium">{updatingItemId === item.id ? <Loader2 className="inline w-4 h-4 animate-spin" /> : item.quantity}</span>
                            <Button variant="ghost" size="icon" onClick={() => handleUpdateQuantity(item.id, item.quantity + 1)} disabled={updatingItemId === item.id}><Plus className="w-4 h-4" /></Button>
                        </div>
                    </div>
                </div>
              </div>
            )))}
          </div>
        </div>
        <div className="w-full lg:w-1/3">
          <div className="sticky p-6 bg-white border rounded-lg shadow-sm top-24">
            <h2 className="pb-4 mb-4 text-xl font-semibold border-b">Ringkasan Belanja</h2>
            <div className="pb-4 mb-4 border-b">
                <label className="block mb-2 text-sm font-medium">Kode Promo</label>
                {!appliedPromo ? (<><div className="flex gap-2"><Input type="text" placeholder="Masukkan kode promo" value={promoCodeInput} onChange={(e) => setPromoCodeInput(e.target.value)} /><Button onClick={handleApplyPromo} disabled={!promoCodeInput}>Terapkan</Button></div>{promoError && <p className="mt-2 text-sm text-red-600">{promoError}</p>}</>) : (<div className="flex items-center justify-between p-2 text-sm text-green-700 bg-green-100 rounded-md"><div className="flex items-center gap-2 font-semibold"><Tag className="w-4 h-4" /><span>{appliedPromo.promo_code}</span></div><button onClick={handleRemovePromo} className="p-1 rounded-full hover:bg-green-200"><X className="w-4 h-4" /></button></div>)}
            </div>
            <div className="space-y-2">
                <div className="flex justify-between"><span>Subtotal</span><span className="font-medium">Rp {totalPrice.toLocaleString("id-ID")}</span></div>
                {appliedPromo && (<div className="flex justify-between text-green-600"><span>Potongan Promo</span><span className="font-medium">- Rp {discount.toLocaleString("id-ID")}</span></div>)}
                <div className="flex justify-between pt-2 mt-2 text-lg font-bold border-t"><span>Total</span><span className="text-blue-600">Rp {grandTotal.toLocaleString("id-ID")}</span></div>
            </div>
            <p className="mt-2 text-sm text-gray-500">Untuk {selectedItems.size} item terpilih</p>
            <div className="py-4 my-4 border-t border-b">
                <Label className="text-sm font-medium">Pilih Metode Pembayaran</Label>
                <RadioGroup onValueChange={setSelectedPaymentMethod} className="mt-4 space-y-3">{allPaymentMethods.map((method) => (<div key={method.id} className="flex items-center"><RadioGroupItem value={method.id} id={method.id} /><Label htmlFor={method.id} className="flex items-center justify-between flex-grow p-3 ml-4 border rounded-md cursor-pointer hover:bg-accent"><span>{method.name}</span><img src={method.imageUrl} alt={method.name} className="w-12" /></Label></div>))}</RadioGroup>
            </div>
            <Button onClick={handleProcessPayment} size="lg" className="w-full mt-6 text-lg" disabled={selectedItems.size === 0 || !selectedPaymentMethod || isProcessing}>
              {isProcessing ? <><Loader2 className="w-6 h-6 mr-2 animate-spin" /> Memproses...</> : "Lanjutkan ke Pembayaran"}
            </Button>
            {transactionError && <p className="mt-2 text-sm text-center text-red-600">{transactionError}</p>}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CartPage;