"use client";

import { useDetailActivity } from "@/hooks/useDetailActivity";
import { useActivityByCategory } from "@/hooks/useActivityByCategory";
import { use, useState } from "react";
import { format } from "date-fns";
import { id as localeId } from 'date-fns/locale';
import { cn } from "@/lib/utils";
import { useRouter } from "next/navigation";
import { getCookie } from "cookies-next";
import { useCart } from "@/hooks/useCart";

// --- PERBAIKAN: Impor Toaster dan toast dari sonner ---
import { Toaster, toast } from "sonner";

// Impor Komponen UI dari Shadcn
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Label } from "@/components/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";

// Impor Ikon dari Lucide-React
import {
  AlertCircleIcon,
  MapPin,
  Star,
  Calendar as CalendarIcon,
  Minus,
  Plus,
  Loader2,
} from "lucide-react";

const DEFAULT_ACTIVITY_IMAGE = "/assets/banner-authpage.png";

const exampleReviews = [
  {
    id: 1,
    user: { name: "Budi Santoso", avatarUrl: "https://github.com/shadcn.png" },
    rating: 5,
    comment: "Pengalaman yang sangat luar biasa! Pemandangannya indah dan fasilitasnya lengkap. Sangat direkomendasikan!",
    createdAt: "2024-05-20T10:00:00Z",
  },
  {
    id: 2,
    user: { name: "Citra Lestari", avatarUrl: "https://github.com/shadcn.png" },
    rating: 4,
    comment: "Aktivitasnya seru, cocok untuk keluarga. Hanya saja antriannya cukup panjang di akhir pekan.",
    createdAt: "2024-05-18T14:30:00Z",
  },
];

const DetailActivity = ({ params }) => {
  const resolvedParams = use(params);
  const id = resolvedParams?.id;
  const router = useRouter();

  const { detailActivity, isLoading: isFetchingDetail, error } = useDetailActivity(id);
  const { activityByCategory } = useActivityByCategory(id);

  // --- LOGIKA KERANJANG ---
  const { addToCart, isLoading: isAddingToCart } = useCart();
  const token = getCookie("token");

  // State untuk input pengguna
  const [quantity, setQuantity] = useState(1);
  const [selectedDate, setSelectedDate] = useState(null);

  // Handler untuk mengubah kuantitas
  const handleDecrement = () => {
    setQuantity((prev) => (prev > 1 ? prev - 1 : 1));
  };
  const handleIncrement = () => {
    setQuantity((prev) => prev + 1);
  };

  // --- PERBAIKAN: Handler untuk tombol Add to Cart menggunakan toast ---
  const handleAddToCart = async () => {
    if (!token) {
      // Menggunakan toast.error untuk notifikasi login
      toast.error("Silakan login terlebih dahulu untuk menambahkan item.");
      router.push("/login");
      return;
    }
    if (!detailActivity?.id) {
      // Menggunakan toast.error untuk notifikasi kesalahan
      toast.error("Terjadi kesalahan, ID aktivitas tidak ditemukan.");
      return;
    }
    if (!selectedDate) {
      // Menggunakan toast.warning untuk notifikasi input yang kurang
      toast.warning("Silakan pilih tanggal terlebih dahulu.");
      return;
    }

    // Panggil fungsi addToCart dari context.
    // Fungsi ini sudah menangani pemanggilan API dan notifikasi (jika ada).
    // Untuk konsistensi, pastikan hook `useCart` juga menggunakan `toast`
    // untuk notifikasi sukses atau gagalnya.
    await addToCart(detailActivity.id, quantity);
  };

  if (isFetchingDetail) {
    return (
      <div className="container px-4 py-6 mx-auto text-center">
        Memuat detail...
      </div>
    );
  }

  if (error) {
    return (
      <div className="container px-4 py-6 mx-auto text-center text-red-500">
        Terjadi kesalahan: {error.message || "Gagal memuat data."}
      </div>
    );
  }

  if (!id || !detailActivity) {
    return (
      <div className="container px-4 py-6 mx-auto text-center">
        Detail Aktivitas tidak ditemukan atau ID tidak valid.
      </div>
    );
  }

  // Logika Harga Dinamis
  const hasDiscount = detailActivity.price_discount && detailActivity.price_discount > 0;
  const effectivePrice = hasDiscount ? detailActivity.price_discount : detailActivity.price || 0;
  const totalPrice = effectivePrice * quantity;
  const { reviews = exampleReviews } = detailActivity;

  return (
    <div className="container px-4 py-6 mx-auto max-w-7xl">
      {/* --- PERBAIKAN: Menambahkan komponen Toaster --- */}
      {/* Idealnya, letakkan ini di file layout.tsx agar global */}
      <Toaster richColors position="top-center" />

      <div className="flex flex-col gap-8 lg:flex-row">
        {/* Kolom Kiri: Info, Gambar, Deskripsi, dll. */}
        <div className="lg:w-2/3">
          <div className="p-6 bg-white rounded-lg shadow-md">
            <h1 className="mb-2 text-3xl font-bold text-gray-800">
              {detailActivity.title}
            </h1>
            <div className="flex flex-wrap items-center gap-4 mb-4 text-gray-600">
              <div className="flex items-center gap-1">
                <Star className="w-5 h-5 text-yellow-500 fill-yellow-500" />
                <span className="font-semibold">{detailActivity.rating}</span>
                <span className="text-sm text-gray-500">
                  ({detailActivity.total_reviews} reviews)
                </span>
              </div>
              <div className="flex items-center gap-1">
                <MapPin className="w-5 h-5 text-gray-500" />
                <span className="text-sm">{detailActivity.address}</span>
              </div>
            </div>
          </div>

          <div className="mt-6 overflow-hidden bg-white rounded-lg shadow-md">
            <div className="relative w-full h-80 md:h-96">
              <img
                src={detailActivity.imageUrls?.[0] || DEFAULT_ACTIVITY_IMAGE}
                alt={detailActivity.title || "Activity image"}
                className="object-cover w-full h-full"
              />
            </div>
          </div>

          <div className="p-6 mt-6 bg-white rounded-lg shadow-md">
            <h2 className="mb-4 text-2xl font-bold text-gray-800">
              {" "}
              Tentang Aktivitas Ini{" "}
            </h2>
            <p className="text-justify text-gray-700 whitespace-pre-line">
              {" "}
              {detailActivity.description}{" "}
            </p>
          </div>
          <div className="p-6 mt-6 bg-white rounded-lg shadow-md">
            <h2 className="mb-4 text-2xl font-bold text-gray-800">Lokasi</h2>
            <div className="flex items-center gap-2 mb-4">
              <MapPin className="w-5 h-5 text-gray-600" />
              <p className="text-gray-700">{detailActivity.address}</p>{" "}
            </div>
            <div className="flex justify-center w-full h-full text-gray-500 bg-white rounded-md">
              <div
                className="justify-center w-full h-full overflow-hidden rounded-md xl:pl-20"
                dangerouslySetInnerHTML={{
                  __html: detailActivity.location_maps,
                }}
              />{" "}
            </div>
          </div>
          <div className="p-6 mt-6 bg-white rounded-lg shadow-md">
            <h2 className="mb-4 text-2xl font-bold text-gray-800">
              {" "}
              Ulasan Pengguna ({reviews.length}){" "}
            </h2>
            <div className="space-y-6">
              {reviews.map((review) => (
                <div key={review.id} className="flex gap-4">
                  <Avatar>
                    <AvatarImage
                      src={review.user.avatarUrl}
                      alt={review.user.name}
                    />
                    <AvatarFallback>
                      {" "}
                      {review.user.name.charAt(0)}{" "}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <p className="font-semibold text-gray-800">
                        {" "}
                        {review.user.name}{" "}
                      </p>
                      <div className="flex items-center gap-1 text-sm text-yellow-500">
                        <Star className="w-4 h-4 fill-current" />
                        <span>{review.rating.toFixed(1)}</span>
                      </div>
                    </div>
                    <p className="text-sm text-gray-500">
                      {" "}
                      {new Date(review.createdAt).toLocaleDateString("id-ID", {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })}{" "}
                    </p>
                    <p className="mt-2 text-gray-700">{review.comment}</p>{" "}
                  </div>{" "}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Kolom Kanan: Kartu Harga & Pemesanan */}
        <div className="lg:w-1/3">
          <div className="sticky top-24">
            <div className="p-6 bg-white rounded-lg shadow-md">
              <div className="mb-4">
                {hasDiscount && (
                  <span className="text-lg text-gray-500 line-through">
                    Rp {(detailActivity.price ?? 0).toLocaleString("id-ID")}
                  </span>
                )}
                <p className={`text-3xl font-bold ${hasDiscount ? "text-red-600" : "text-gray-900"}`}>
                  Rp {effectivePrice.toLocaleString("id-ID")}
                </p>
                <p className="text-sm text-gray-600">/ orang</p>
              </div>

              <div className="space-y-4">
                <div className="grid w-full gap-1.5">
                  <Label htmlFor="date">Pilih Tanggal</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button id="date" variant={"outline"} className={cn("w-full justify-start text-left font-normal", !selectedDate && "text-muted-foreground")}>
                        <CalendarIcon className="w-4 h-4 mr-2" />
                        {selectedDate ? (
                          format(selectedDate, "PPP", { locale: localeId })
                        ) : (
                          <span>Pilih tanggal</span>
                        )}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar mode="single" selected={selectedDate} onSelect={setSelectedDate} disabled={(date) => date < new Date(new Date().setHours(0, 0, 0, 0))} initialFocus />
                    </PopoverContent>
                  </Popover>
                </div>

                <div className="grid w-full gap-1.5">
                  <Label htmlFor="quantity">Jumlah Orang / Kuantitas</Label>
                  <div className="flex items-center justify-between p-2 border rounded-md">
                    <Button variant="outline" size="icon" onClick={handleDecrement} disabled={quantity <= 1}>
                      <Minus className="w-4 h-4" />
                    </Button>
                    <span className="w-16 font-bold text-center text-md">{quantity}</span>
                    <Button variant="outline" size="icon" onClick={handleIncrement}>
                      <Plus className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </div>

              <div className="py-4 mt-4 border-t">
                <div className="flex items-center justify-between">
                  <p className="text-lg font-semibold">Total</p>
                  <p className="text-2xl font-bold text-gray-900">
                    Rp {totalPrice.toLocaleString("id-ID")}
                  </p>
                </div>
              </div>

              <Button size="lg" className="w-full text-lg" disabled={!selectedDate || isAddingToCart} onClick={handleAddToCart}>
                {isAddingToCart ? (
                  <><Loader2 className="w-6 h-6 mr-2 animate-spin" /> Menambahkan...</>
                ) : (
                  "Add to Cart"
                )}
              </Button>

              <p className="mt-2 text-xs text-center text-gray-500">
                Pembatalan Mudah & Refund Penuh
              </p>
            </div>

            {!token && (
              <div className="p-4 mt-5 text-sm bg-white rounded-lg shadow-md">
                <Alert variant="destructive">
                  <AlertCircleIcon className="w-4 h-4" />
                  <AlertTitle>Anda Belum Login</AlertTitle>
                  <AlertDescription>
                    Setiap transaksi hanya bisa dilakukan jika Anda sudah login.
                  </AlertDescription>
                </Alert>
              </div>
            )}
          </div>
        </div>
      </div>

      {activityByCategory && activityByCategory.length > 0 ? (
        <div className="mt-12">
          <h2 className="mb-6 text-2xl font-bold text-gray-800">
            Aktivitas Serupa
          </h2>
          <Carousel opts={{ align: "start", loop: activityByCategory.length > 3 }} className="w-full">
            <CarouselContent className="-ml-2 md:-ml-4">
              {activityByCategory.map((rec) => (
                <CarouselItem key={rec.id} className="pl-2 md:pl-4 basis-full sm:basis-1/2 lg:basis-1/3 xl:basis-1/4">
                  <div className="h-full p-1 cursor-pointer">
                    <div className="flex flex-col h-full overflow-hidden bg-white rounded-lg shadow-md">
                      <div className="relative w-full h-40">
                        <img src={rec.imageUrls?.[0] || DEFAULT_ACTIVITY_IMAGE} alt={rec.title || "Activity"} className="absolute inset-0 object-cover w-full h-full" />
                      </div>
                      <div className="flex flex-col flex-grow p-4">
                        <h3 className="font-semibold text-gray-800 truncate">{rec.title || "Nama Tidak Tersedia"}</h3>
                        <p className="mb-1 text-sm text-gray-600 truncate"><MapPin className="inline w-3 h-3 mr-1" />{rec.address || "Lokasi Tidak Tersedia"}</p>
                        <p className="text-sm text-yellow-500"><Star className="inline w-3 h-3 mr-1 fill-current" />{" "}{rec.rating || "-"} ({rec.total_reviews || "0"}{" "}Reviews)</p>
                        <p className="pt-2 mt-auto text-lg font-bold text-blue-500">Rp{" "}{(rec.price ?? 0).toLocaleString("id-ID") || "Harga Tidak Tersedia"}</p>
                      </div>
                    </div>
                  </div>
                </CarouselItem>
              ))}
            </CarouselContent>
            {activityByCategory.length > 3 && (
              <>
                <CarouselPrevious className="absolute left-[-20px] md:left-[-25px] top-1/2 -translate-y-1/2 z-10 hidden sm:flex" />
                <CarouselNext className="absolute right-[-20px] md:right-[-25px] top-1/2 -translate-y-1/2 z-10 hidden sm:flex" />
              </>
            )}
          </Carousel>
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-12 mt-12 text-center bg-white rounded-lg shadow-md">
          <svg className="w-16 h-16 mb-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1">
            <path strokeLinecap="round" strokeLinejoin="round" d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <h3 className="mb-2 text-xl font-semibold text-gray-700">Tidak ada aktivitas serupa</h3>
          <p className="mb-6 text-sm text-gray-500">Saat ini tidak ada aktivitas lain dalam kategori ini.</p>
          <a href="/activities" className="px-6 py-2 text-sm font-medium text-white bg-blue-500 rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
            Lihat Semua Aktivitas
          </a>
        </div>
      )}
    </div>
  );
};

export default DetailActivity;