// File: pages/admin/BannerManagementPage.js (sesuaikan path jika perlu)

"use client";

import React, { useState, useMemo } from "react";
import { useBanner } from "@/hooks/useBanner";
import { useBannerActions } from "@/hooks/useBannerActions";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import { Frown, ImagePlus, Edit, Trash2, Search, Loader2 } from "lucide-react";
import { BannerFormDialog } from "@/components/ui/admin/BannerFormDialog";
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

const BannerManagementPage = () => {
  // FIX UTAMA: Gunakan nama variabel yang BENAR dari hook useBanner
  const {
    banner: banners,
    loading: isBannerLoading,
    error,
    getBanner: refetchBanners,
  } = useBanner();
  const { deleteBanner, isMutating: isDeleting } = useBannerActions();

  const [isFormDialogOpen, setIsFormDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedBanner, setSelectedBanner] = useState(null);
  const [bannerToDelete, setBannerToDelete] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");

  const filteredBanners = useMemo(() => {
    if (!Array.isArray(banners)) return [];
    return banners.filter((banner) =>
      banner.name.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [banners, searchQuery]);

  const handleCreateClick = () => {
    setSelectedBanner(null);
    setIsFormDialogOpen(true);
  };

  const handleEditClick = (banner) => {
    setSelectedBanner(banner);
    setIsFormDialogOpen(true);
  };

  const handleDeleteClick = (banner) => {
    setBannerToDelete(banner);
    setIsDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (!bannerToDelete) return;

    const loadingToastId = toast.loading(
      `Menghapus "${bannerToDelete.name}"...`
    );
    try {
      await deleteBanner(bannerToDelete.id);
      toast.success("Banner berhasil dihapus.", { id: loadingToastId });
      refetchBanners();
    } catch (error) {
      const errorMessage =
        error.response?.data?.message || "Gagal menghapus banner.";
      toast.error(errorMessage, { id: loadingToastId });
    } finally {
      setIsDeleteDialogOpen(false);
      setBannerToDelete(null);
    }
  };

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-8 text-center">
        <Frown className="w-16 h-16 text-red-500" />
        <h2 className="mt-4 text-2xl font-bold">Gagal Memuat Banner</h2>
        <p className="mt-2 text-muted-foreground">{error.message}</p>
        <Button onClick={() => refetchBanners()} className="mt-4">
          Coba Lagi
        </Button>
      </div>
    );
  }

  return (
    <>
      <BannerFormDialog
        banner={selectedBanner}
        isOpen={isFormDialogOpen}
        setIsOpen={setIsFormDialogOpen}
        onSuccess={refetchBanners} // Prop ini sekarang menerima fungsi yang valid
      />
      <AlertDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Apakah Anda benar-benar yakin?</AlertDialogTitle>
            <AlertDialogDescription>
              Tindakan ini tidak dapat dibatalkan. Ini akan menghapus banner
              secara permanen "{bannerToDelete?.name}".
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Batal</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              disabled={isDeleting}
              className="bg-red-600 hover:bg-red-700"
            >
              {isDeleting && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Ya, hapus
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
            <h1 className="text-3xl font-bold">Manajemen Banner</h1>
            <p className="text-muted-foreground">
              Buat, edit, dan kelola semua banner promosi.
            </p>
          </div>
          <Button
            onClick={handleCreateClick}
            className="bg-blue-600 hover:bg-blue-700"
          >
            <ImagePlus className="w-4 h-4 mr-2" />
            Buat Banner
          </Button>
        </div>

        <div className="relative">
          <Search
            className="absolute text-gray-400 -translate-y-1/2 left-3 top-1/2"
            size={20}
          />
          <Input
            placeholder="Cari banner berdasarkan nama..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 h-11"
          />
        </div>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {isBannerLoading ? (
            Array.from({ length: 6 }).map((_, index) => (
              <Skeleton key={index} className="w-full h-48 rounded-lg" />
            ))
          ) : filteredBanners.length > 0 ? (
            filteredBanners.map((banner) => (
              <div
                key={banner.id}
                className="relative overflow-hidden border rounded-lg shadow-sm group"
              >
                <img
                  src={banner.imageUrl}
                  alt={banner.name}
                  className="object-cover w-full transition-transform duration-300 aspect-[16/9] group-hover:scale-105"
                  onError={(e) => {
                    e.currentTarget.onerror = null;
                    e.currentTarget.src = "/assets/error.png";
                  }}
                />
                <div className="absolute inset-0 flex flex-col justify-end p-4 bg-gradient-to-t from-black/70 to-transparent">
                  <h3 className="font-bold text-white shadow-lg drop-shadow-lg">
                    {banner.name}
                  </h3>
                </div>
                <div className="absolute flex gap-2 transition-opacity duration-300 bg-black/20 backdrop-blur-sm p-1.5 rounded-lg opacity-0 top-2 right-2 group-hover:opacity-100">
                  <Button
                    size="icon"
                    variant="outline"
                    className="w-8 h-8"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleEditClick(banner);
                    }}
                  >
                    <Edit className="w-4 h-4" />
                  </Button>
                  <Button
                    size="icon"
                    variant="destructive"
                    className="w-8 h-8"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteClick(banner);
                    }}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            ))
          ) : (
            <div className="flex flex-col items-center justify-center py-16 text-center border-2 border-dashed rounded-lg bg-gray-50 col-span-full">
              <h3 className="text-xl font-semibold">Tidak Ada Banner</h3>
              <p className="mt-2 text-muted-foreground">
                {searchQuery
                  ? `Tidak ada hasil untuk "${searchQuery}".`
                  : "Mulai dengan membuat banner baru."}
              </p>
              <Button
                onClick={handleCreateClick}
                className="mt-4 bg-blue-600 hover:bg-blue-700"
              >
                <ImagePlus className="w-4 h-4 mr-2" />
                Buat Banner Pertama
              </Button>
            </div>
          )}
        </div>
      </motion.div>
    </>
  );
};

export default BannerManagementPage;
