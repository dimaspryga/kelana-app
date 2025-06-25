"use client";

import React, { useState, useMemo } from "react";
import { useCategory } from "@/hooks/useCategory";
import { useAuth } from "@/context/AuthContext";
import { useCategoryActions } from "@/hooks/useCategoryActions";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import { Frown, ImagePlus, Edit, Trash2, Search, Loader2 } from "lucide-react";
// Pastikan path import ini benar menuju file yang telah kita buat
import { CategoryFormDialog } from "@/components/ui/admin/CategoryFormDialog";
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

const CategoryManagementPage = () => {
  const {
    category: categories,
    isLoading: isCategoryLoading,
    error,
    refetch: refetchCategories,
  } = useCategory();
  const { loading: isAuthLoading } = useAuth();
  // Ambil `isMutating` dari hook untuk mengetahui status aksi C/U/D
  const { deleteCategory, isMutating } = useCategoryActions();

  const [isFormDialogOpen, setIsFormDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [categoryToDelete, setCategoryToDelete] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");

  const isLoading = isCategoryLoading || isAuthLoading;

  const filteredCategories = useMemo(() => {
    if (!categories) return [];
    return categories.filter((category) =>
      category.name.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [categories, searchQuery]);

  const handleCreateClick = () => {
    setSelectedCategory(null);
    setIsFormDialogOpen(true);
  };

  const handleEditClick = (category) => {
    setSelectedCategory(category);
    setIsFormDialogOpen(true);
  };

  const handleDeleteClick = (category) => {
    setCategoryToDelete(category);
    setIsDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (!categoryToDelete) return;

    const loadingToastId = toast.loading(
      `Deleting "${categoryToDelete.name}"...`
    );

    try {
      await deleteCategory(categoryToDelete.id);
      toast.success("Category deleted successfully!", { id: loadingToastId });
      refetchCategories();
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Failed to delete category.",
        { id: loadingToastId }
      );
    } finally {
      setIsDeleteDialogOpen(false);
      setCategoryToDelete(null);
    }
  };

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-8 text-center">
        <Frown className="w-16 h-16 text-red-500" />
        <h2 className="mt-4 text-2xl font-bold">Failed to Load Categories</h2>
        <p className="mt-2 text-muted-foreground">{error.message}</p>
        <Button onClick={refetchCategories} className="mt-4">
          Try Again
        </Button>
      </div>
    );
  }

  return (
    <>
      <CategoryFormDialog
        category={selectedCategory}
        isOpen={isFormDialogOpen}
        setIsOpen={setIsFormDialogOpen}
        onSuccess={refetchCategories}
      />
      <AlertDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the
              category "{categoryToDelete?.name}".
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isMutating}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              disabled={isMutating}
              className="bg-red-600 cursor-pointer hover:bg-red-700"
            >
              {isMutating && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Yes, delete
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
            <h1 className="text-3xl font-bold">Category Management</h1>
            <p className="text-muted-foreground">
              Create, edit, and manage all activity categories.
            </p>
          </div>
          <Button
            onClick={handleCreateClick}
            className="bg-blue-600 cursor-pointer hover:bg-blue-700"
          >
            <ImagePlus className="w-4 h-4 mr-2" />
            Create Category
          </Button>
        </div>

        <div className="relative">
          <Search
            className="absolute text-gray-400 -translate-y-1/2 left-3 top-1/2"
            size={20}
          />
          <Input
            placeholder="Search categories by name..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 h-11"
          />
        </div>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
          {isLoading ? (
            Array.from({ length: 8 }).map((_, index) => (
              <Skeleton
                key={index}
                className="w-full rounded-lg aspect-[4/5]"
              />
            ))
          ) : filteredCategories.length > 0 ? (
            filteredCategories.map((category) => (
              <div
                key={category.id}
                className="relative overflow-hidden border rounded-lg shadow-sm group"
              >
                <img
                  src={category.imageUrl}
                  alt={category.name}
                  className="object-cover w-full aspect-[4/5]"
                  onError={(e) => {
                    e.currentTarget.onerror = null;
                    e.currentTarget.src = "/assets/error.png";
                  }}
                />
                <div className="absolute inset-0 flex flex-col justify-end p-4 bg-gradient-to-t from-black/70 to-transparent">
                  <h3 className="text-lg font-bold text-white shadow-lg">
                    {category.name}
                  </h3>
                </div>
                <div className="absolute flex gap-2 transition-opacity duration-300 opacity-0 cursor-pointer top-2 right-2 group-hover:opacity-100">
                  <Button
                    size="icon"
                    variant="secondary"
                    onClick={() => handleEditClick(category)}
                    className="cursor-pointer"
                  >
                    <Edit className="w-4 h-4 " />
                  </Button>
                  <Button
                    size="icon"
                    variant="destructive"
                    onClick={() => handleDeleteClick(category)}
                    className="cursor-pointer"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            ))
          ) : (
            <div className="flex flex-col items-center justify-center py-16 text-center bg-white border-2 border-dashed rounded-lg col-span-full">
              <h3 className="text-xl font-semibold">No Categories Found</h3>
              <p className="mt-2 text-muted-foreground">
                {searchQuery
                  ? `No results for "${searchQuery}".`
                  : "Get started by creating a new category."}
              </p>
              <Button
                onClick={handleCreateClick}
                className="mt-4 bg-blue-600 hover:bg-blue-700"
              >
                <ImagePlus className="w-4 h-4 mr-2" />
                Create First Category
              </Button>
            </div>
          )}
        </div>
      </motion.div>
    </>
  );
};

export default CategoryManagementPage;
