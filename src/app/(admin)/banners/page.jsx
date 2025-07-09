"use client";
import React, { useState, useMemo, useEffect } from "react";
import { useBanner } from "@/hooks/useBanner";
import { useBannerActions } from "@/hooks/useBannerActions";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Edit,
  Trash2,
  Frown,
  Search,
  PlusCircle,
  Loader2,
  ImageIcon,
  Eye,
  EyeOff
} from "lucide-react";
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
import { cn } from "@/lib/utils";

const BannerManagementPage = () => {
  const {
    banner: banners,
    isLoading: isBannerLoading,
    error,
    mutate,
  } = useBanner();
  const { loading: isAuthLoading } = useAuth();
  const { deleteBanner, isMutating: isDeleting } = useBannerActions();

  const [searchQuery, setSearchQuery] = useState("");
  const [isFormDialogOpen, setIsFormDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedBanner, setSelectedBanner] = useState(null);
  const [bannerToDelete, setBannerToDelete] = useState(null);

  const isLoading = isBannerLoading || isAuthLoading;

  const filteredBanners = useMemo(() => {
    if (!banners) return [];
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

    try {
      await deleteBanner(bannerToDelete.id);
      toast.success("Banner deleted successfully.");
      mutate();
    } catch (error) {
      const errorMessage =
        error.response?.data?.message || "Failed to delete banner.";
      toast.error(errorMessage);
    } finally {
      setIsDeleteDialogOpen(false);
      setBannerToDelete(null);
    }
  };

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-8 text-center bg-white">
        <Frown className="w-16 h-16 text-red-500" />
        <h2 className="mt-4 text-2xl font-bold text-blue-900">Failed to Load Banners</h2>
        <p className="mt-2 text-slate-600">{error.message}</p>
        <Button onClick={() => mutate()} className="mt-4 bg-blue-600 text-white hover:bg-blue-700 border-0">
          Try Again
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
        onSuccess={mutate}
      />

      <AlertDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
      >
        <AlertDialogContent className="bg-white border border-slate-200 rounded-xl shadow-lg">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-blue-900">Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription className="text-slate-600">
              This action cannot be undone. This will permanently delete the banner "
              {bannerToDelete?.name}".
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting} className="border border-slate-200 text-slate-700 hover:bg-slate-50">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              disabled={isDeleting}
              className="bg-red-600 text-white hover:bg-red-700 border-0"
            >
              {isDeleting && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <div className="w-full px-6 py-6">
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-3xl font-bold tracking-tight text-blue-900">Banners</h2>
            <div className="flex items-center space-x-2">
              <Button 
                onClick={handleCreateClick} 
                className="bg-blue-600 text-white hover:bg-blue-700 border-0 shadow-sm"
              >
                <PlusCircle className="w-4 h-4 mr-2" />
                Add Banner
              </Button>
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
              <Input
                placeholder="Search banners..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 border border-slate-200 rounded-lg bg-white text-slate-900 placeholder-slate-400 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
              />
            </div>
          </div>
          
          <Card className="border border-slate-200 rounded-xl shadow-sm bg-white overflow-hidden">
            <CardHeader className="bg-white border-b border-slate-100">
              <CardTitle className="text-xl font-semibold text-blue-900">Banners</CardTitle>
              <CardDescription className="text-slate-600">
                Manage all promotional banners in your system.
              </CardDescription>
            </CardHeader>
            <CardContent className="p-6">
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {isLoading ? (
                  Array.from({ length: 6 }).map((_, index) => (
                    <div key={index} className="space-y-3">
                      <Skeleton className="h-48 w-full rounded-lg" />
                      <div className="space-y-2">
                        <Skeleton className="h-4 w-full" />
                        <Skeleton className="h-4 w-3/4" />
                      </div>
                    </div>
                  ))
                ) : filteredBanners.length > 0 ? (
                  filteredBanners.map((banner) => (
                    <Card key={banner.id} className="overflow-hidden border border-slate-200 bg-white rounded-lg shadow-sm">
                      <div className="aspect-video relative overflow-hidden">
                        {banner.imageUrl ? (
                          <img
                            src={banner.imageUrl}
                            alt={banner.name}
                            className="object-cover w-full h-full transition-transform duration-300 hover:scale-105"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center bg-blue-50">
                            <ImageIcon className="h-12 w-12 text-slate-400" />
                          </div>
                        )}
                        <div className="absolute inset-0 bg-black/20" />
                        <div className="absolute top-2 right-2 flex space-x-1">
                          <Button
                            size="sm"
                            variant="secondary"
                            onClick={() => handleEditClick(banner)}
                            className="h-8 w-8 p-0 border border-slate-200 bg-white hover:bg-blue-50"
                          >
                            <Edit className="h-4 w-4 text-blue-600" />
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => handleDeleteClick(banner)}
                            className="h-8 w-8 p-0 border border-slate-200 bg-white hover:bg-red-50"
                          >
                            <Trash2 className="h-4 w-4 text-red-600" />
                          </Button>
                        </div>
                        <div className="absolute bottom-2 left-2">
                          <Badge className={`rounded-full px-3 py-1 text-xs font-medium ${
                            banner.isActive 
                              ? "bg-green-100 text-green-900 border border-green-200" 
                              : "bg-slate-100 text-slate-600 border border-slate-200"
                          }`}>
                            {banner.isActive ? (
                              <>
                                <Eye className="w-3 h-3 mr-1" />
                                Active
                              </>
                            ) : (
                              <>
                                <EyeOff className="w-3 h-3 mr-1" />
                                Inactive
                              </>
                            )}
                          </Badge>
                        </div>
                      </div>
                      <div className="p-4">
                        <div className="font-semibold text-blue-900 mb-1">{banner.name}</div>
                        <div className="text-sm text-slate-400 line-clamp-2">{banner.description}</div>
                      </div>
                    </Card>
                  ))
                ) : (
                  <div className="col-span-full text-center py-12">
                    <div className="flex flex-col items-center space-y-3">
                      <ImageIcon className="w-12 h-12 text-slate-400" />
                      <p className="text-slate-600 font-medium">No banners found.</p>
                      <p className="text-slate-400 text-sm">Try adjusting your search criteria or add a new banner.</p>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
};

export default BannerManagementPage;