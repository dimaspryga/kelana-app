"use client";

import React, { useState, useMemo } from "react";
import { useCategory } from "@/hooks/useCategory";
import { useCategoryActions } from "@/hooks/useCategoryActions";
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
  FolderOpen,
  Eye,
  EyeOff
} from "lucide-react";
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
import { cn } from "@/lib/utils";

const CategoryManagementPage = () => {
  const {
    category: categories,
    isLoading: isCategoryLoading,
    error,
    mutate,
  } = useCategory();
  const { loading: isAuthLoading } = useAuth();
  const { deleteCategory, isMutating: isDeleting } = useCategoryActions();

  const [searchQuery, setSearchQuery] = useState("");
  const [isFormDialogOpen, setIsFormDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [categoryToDelete, setCategoryToDelete] = useState(null);

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

    try {
      await deleteCategory(categoryToDelete.id);
      toast.success("Category deleted successfully.");
      mutate();
    } catch (error) {
      const errorMessage =
        error.response?.data?.message || "Failed to delete category.";
      toast.error(errorMessage);
    } finally {
      setIsDeleteDialogOpen(false);
      setCategoryToDelete(null);
    }
  };

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-8 text-center bg-white">
        <Frown className="w-16 h-16 text-red-500" />
        <h2 className="mt-4 text-2xl font-bold text-blue-900">Failed to Load Categories</h2>
        <p className="mt-2 text-slate-600">{error.message}</p>
        <Button onClick={() => mutate()} className="mt-4 bg-blue-600 text-white hover:bg-blue-700 border-0">
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
              This action cannot be undone. This will permanently delete the category "
              {categoryToDelete?.name}".
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
            <h2 className="text-3xl font-bold tracking-tight text-blue-900">Categories</h2>
            <div className="flex items-center space-x-2">
              <Button 
                onClick={handleCreateClick} 
                className="bg-blue-600 text-white hover:bg-blue-700 border-0 shadow-sm"
              >
                <PlusCircle className="w-4 h-4 mr-2" />
                Add Category
              </Button>
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
              <Input
                placeholder="Search categories..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 border border-slate-200 rounded-lg bg-white text-slate-900 placeholder-slate-400 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
              />
            </div>
          </div>
          
          <Card className="border border-slate-200 rounded-xl shadow-sm bg-white overflow-hidden">
            <CardHeader className="bg-white border-b border-slate-100">
              <CardTitle className="text-xl font-semibold text-blue-900">Categories</CardTitle>
              <CardDescription className="text-slate-600">
                Manage all activity categories in your system.
              </CardDescription>
            </CardHeader>
            <CardContent className="p-6">
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {isLoading ? (
                  Array.from({ length: 6 }).map((_, index) => (
                    <Card key={index} className="border border-slate-200 bg-white rounded-lg shadow-sm">
                      <CardContent className="p-6">
                        <div className="flex items-center space-x-3 mb-4">
                          <Skeleton className="w-12 h-12 rounded-lg" />
                          <div className="space-y-2 flex-1">
                            <Skeleton className="h-5 w-3/4" />
                            <Skeleton className="h-4 w-1/2" />
                          </div>
                        </div>
                        <Skeleton className="h-4 w-full mb-2" />
                        <Skeleton className="h-4 w-2/3" />
                      </CardContent>
                    </Card>
                  ))
                ) : filteredCategories.length > 0 ? (
                  filteredCategories.map((category) => (
                    <Card key={category.id} className="border border-slate-200 bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow">
                      <CardContent className="p-6">
                        <div className="flex items-center justify-between mb-4">
                          <div className="flex items-center space-x-3">
                            <div className="w-12 h-12 rounded-lg bg-blue-100 flex items-center justify-center border border-slate-200">
                              <FolderOpen className="w-6 h-6 text-blue-600" />
                            </div>
                            <div>
                              <h3 className="font-semibold text-blue-900">{category.name}</h3>
                              <p className="text-sm text-slate-500">
                                {category.activities?.length || 0} activities
                              </p>
                            </div>
                          </div>
                          <Badge className={`rounded-full px-3 py-1 text-xs font-medium ${
                            category.isActive 
                              ? "bg-green-100 text-green-900 border border-green-200" 
                              : "bg-slate-100 text-slate-600 border border-slate-200"
                          }`}>
                            {category.isActive ? (
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
                        
                        <p className="text-sm text-slate-600 mb-4 line-clamp-2">
                          {category.description || 'No description available'}
                        </p>
                        
                        <div className="flex items-center justify-end space-x-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleEditClick(category)}
                            className="border border-slate-200 bg-white hover:bg-blue-50 text-blue-600"
                          >
                            <Edit className="w-4 h-4 mr-1" />
                            Edit
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleDeleteClick(category)}
                            className="border border-slate-200 bg-white hover:bg-red-50 text-red-600"
                          >
                            <Trash2 className="w-4 h-4 mr-1" />
                            Delete
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))
                ) : (
                  <div className="col-span-full text-center py-12">
                    <div className="flex flex-col items-center space-y-3">
                      <FolderOpen className="w-12 h-12 text-slate-400" />
                      <p className="text-slate-600 font-medium">No categories found.</p>
                      <p className="text-slate-400 text-sm">Try adjusting your search criteria or add a new category.</p>
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

export default CategoryManagementPage;