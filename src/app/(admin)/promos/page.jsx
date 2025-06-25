"use client";

import React, { useState, useMemo, useEffect } from "react";
import { usePromo } from "@/hooks/usePromo";
import { usePromoActions } from "@/hooks/usePromoActions"; 
import { useAuth } from "@/context/AuthContext";
import { motion } from "framer-motion";
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
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { Badge } from "@/components/ui/badge";
import { Frown, PlusCircle, Edit, Trash2, Search, Loader2 } from "lucide-react";
import { PromoFormDialog } from "@/components/ui/admin/PromoFormDialog";
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

const ITEMS_PER_PAGE = 10;

const PromoManagementPage = () => {
  const {
    promo: promos,
    isLoading: isPromoLoading,
    error,
    mutate,
  } = usePromo();
  const { loading: isAuthLoading } = useAuth();
  const { deletePromo, isMutating: isDeleting } = usePromoActions();

  const [filter, setFilter] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [isFormDialogOpen, setIsFormDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedPromo, setSelectedPromo] = useState(null);
  const [promoToDelete, setPromoToDelete] = useState(null);

  const isLoading = isPromoLoading || isAuthLoading;

  const filteredPromos = useMemo(() => {
    if (!promos) return [];
    return promos.filter((promo) =>
      promo.title.toLowerCase().includes(filter.toLowerCase())
    );
  }, [promos, filter]);

  useEffect(() => {
    setCurrentPage(1);
  }, [filter]);

  const totalPages = Math.ceil(filteredPromos.length / ITEMS_PER_PAGE);
  const paginatedPromos = useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredPromos.slice(startIndex, startIndex + ITEMS_PER_PAGE);
  }, [filteredPromos, currentPage]);

  const handlePageChange = (page) => {
    if (page >= 1 && page <= totalPages) setCurrentPage(page);
  };

  const handleCreateClick = () => {
    setSelectedPromo(null);
    setIsFormDialogOpen(true);
  };
  const handleEditClick = (promo) => {
    setSelectedPromo(promo);
    setIsFormDialogOpen(true);
  };
  const handleDeleteClick = (promo) => {
    setPromoToDelete(promo);
    setIsDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (!promoToDelete) return;

    const loadingToastId = toast.loading(
      `Deleting promo "${promoToDelete.title}"...`
    );
    try {
      await deletePromo(promoToDelete.id);
      toast.success("Promo deleted successfully.", { id: loadingToastId });
      mutate();
    } catch (error) {
      const errorMessage =
        error.response?.data?.message || "Failed to delete promo.";
      toast.error(errorMessage, { id: loadingToastId });
    } finally {
      setIsDeleteDialogOpen(false);
      setPromoToDelete(null);
    }
  };

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-8 text-center">
        <Frown className="w-16 h-16 text-red-500" />
        <h2 className="mt-4 text-2xl font-bold">Failed to Load Promos</h2>
        <p className="mt-2 text-muted-foreground">{error.message}</p>
        <Button onClick={() => mutate()}>Try Again</Button>
      </div>
    );
  }

  return (
    <>
      <PromoFormDialog
        promo={selectedPromo}
        isOpen={isFormDialogOpen}
        setIsOpen={setIsFormDialogOpen}
        onSuccess={mutate}
      />
      <AlertDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the promo "
              {promoToDelete?.title}".
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              disabled={isDeleting}
              className="bg-red-600 cursor-pointer hover:bg-red-700"
            >
              {isDeleting && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Delete
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
            <h1 className="text-3xl font-bold">Promo Management</h1>
            <p className="text-muted-foreground">
              Create, edit, and manage all promotional offers.
            </p>
          </div>
          <Button
            onClick={handleCreateClick}
            className="bg-blue-600 cursor-pointer hover:bg-blue-700"
          >
            <PlusCircle className="w-4 h-4 mr-2" />
            Create Promo
          </Button>
        </div>

        <div className="relative">
          <Search
            className="absolute text-gray-400 -translate-y-1/2 left-3 top-1/2"
            size={20}
          />
          <Input
            placeholder="Search by promo title..."
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="pl-10 h-11"
          />
        </div>

        <div className="overflow-hidden bg-white border rounded-lg">
          <Table>
            <TableHeader className="bg-gray-50">
              <TableRow>
                <TableHead className="px-6">Promo Title</TableHead>
                <TableHead className="hidden px-6 md:table-cell">
                  Promo Code
                </TableHead>
                <TableHead className="hidden px-6 lg:table-cell">
                  Discount
                </TableHead>
                <TableHead className="px-6 text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                Array.from({ length: ITEMS_PER_PAGE }).map((_, index) => (
                  <TableRow key={index}>
                    <TableCell className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <Skeleton className="w-10 h-10 rounded-md" />
                        <Skeleton className="w-48 h-5" />
                      </div>
                    </TableCell>
                    <TableCell className="hidden px-6 py-4 md:table-cell">
                      <Skeleton className="w-24 h-5" />
                    </TableCell>
                    <TableCell className="hidden px-6 py-4 lg:table-cell">
                      <Skeleton className="w-32 h-5" />
                    </TableCell>
                    <TableCell className="px-6 py-4 text-right">
                      <Skeleton className="w-20 h-8 ml-auto" />
                    </TableCell>
                  </TableRow>
                ))
              ) : paginatedPromos.length > 0 ? (
                paginatedPromos.map((promo) => (
                  <TableRow key={promo.id}>
                    <TableCell className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <img
                          src={promo.imageUrl}
                          alt={promo.title}
                          className="object-cover w-10 h-10 rounded-md"
                          onError={(e) => {
                            e.currentTarget.onerror = null;
                            e.currentTarget.src = "/assets/error.png";
                          }}
                        />
                        <span className="font-medium">{promo.title}</span>
                      </div>
                    </TableCell>
                    <TableCell className="hidden px-6 py-4 md:table-cell">
                      <Badge variant="outline">{promo.promo_code}</Badge>
                    </TableCell>
                    <TableCell className="hidden px-6 py-4 font-medium lg:table-cell">
                      {new Intl.NumberFormat("id-ID", {
                        style: "currency",
                        currency: "IDR",
                        minimumFractionDigits: 0,
                      }).format(promo.promo_discount_price)}
                    </TableCell>
                    <TableCell className="px-6 py-4 text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => handleEditClick(promo)}
                          className="text-white bg-blue-600 cursor-pointer hover:bg-blue-700 hover:text-slate-50"
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="destructive"
                          size="icon"
                          onClick={() => handleDeleteClick(promo)}
                          className="cursor-pointer"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={4} className="h-24 text-center">
                    No promos found.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>

        {totalPages > 1 && (
          <Pagination>
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious
                  href="#"
                  onClick={(e) => {
                    e.preventDefault();
                    handlePageChange(currentPage - 1);
                  }}
                />
              </PaginationItem>
              <PaginationItem>
                <span className="px-4 py-2 text-sm">
                  Page {currentPage} of {totalPages}
                </span>
              </PaginationItem>
              <PaginationItem>
                <PaginationNext
                  href="#"
                  onClick={(e) => {
                    e.preventDefault();
                    handlePageChange(currentPage + 1);
                  }}
                />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        )}
      </motion.div>
    </>
  );
};

export default PromoManagementPage;
