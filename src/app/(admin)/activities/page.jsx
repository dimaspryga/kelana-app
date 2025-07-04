"use client";

import React, { useState, useMemo, useEffect } from "react";
import { useActivity } from "@/hooks/useActivity"; 
import { useActivityActions } from "@/hooks/useActivityActions";
import { useAuth } from "@/context/AuthContext";
import { useCategory } from "@/hooks/useCategory";
import { motion } from "framer-motion";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Edit,
  Trash2,
  Frown,
  Search,
  PlusCircle,
  Star,
  Loader2,
} from "lucide-react";
import { ActivityFormDialog } from "@/components/ui/admin/ActivityFormDialog";
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

const ActivityManagementPage = () => {
  const {
    activity: activities,
    isLoading: isActivityLoading,
    error,
    refetch: mutate,
  } = useActivity();

  const { category: categories } = useCategory();
  const { loading: isAuthLoading } = useAuth();
  const { deleteActivity, isMutating: isDeleting } = useActivityActions();

  const [filter, setFilter] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [isFormDialogOpen, setIsFormDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedActivity, setSelectedActivity] = useState(null);
  const [activityToDelete, setActivityToDelete] = useState(null);

  const isLoading = isActivityLoading || isAuthLoading;

  const filteredActivities = useMemo(() => {
    let filtered = Array.isArray(activities) ? activities : [];
    if (categoryFilter !== "all") {
      filtered = filtered.filter((act) => act.categoryId === categoryFilter);
    }
    if (filter) {
      filtered = filtered.filter((act) =>
        act.title.toLowerCase().includes(filter.toLowerCase())
      );
    }
    return filtered;
  }, [activities, filter, categoryFilter]);

  useEffect(() => {
    setCurrentPage(1);
  }, [filter, categoryFilter]);

  const totalPages = Math.ceil(filteredActivities.length / ITEMS_PER_PAGE);
  const paginatedActivities = filteredActivities.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  const handlePageChange = (page) => {
    if (page >= 1 && page <= totalPages) setCurrentPage(page);
  };

  const handleCreateClick = () => {
    setSelectedActivity(null);
    setIsFormDialogOpen(true);
  };

  const handleEditClick = (activity) => {
    setSelectedActivity(activity);
    setIsFormDialogOpen(true);
  };

  const handleDeleteClick = (activity) => {
    setActivityToDelete(activity);
    setIsDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (!activityToDelete) return;

    const loadingToastId = toast.loading(
      `Deleting "${activityToDelete.title}"...`
    );
    try {
      await deleteActivity(activityToDelete.id);
      toast.success("Activity deleted successfully.", { id: loadingToastId });
      mutate();
    } catch (error) {
      const errorMessage =
        error.response?.data?.message ||
        "Failed to delete activity. You may not have permission.";
      toast.error(errorMessage, { id: loadingToastId });
    } finally {
      setIsDeleteDialogOpen(false);
      setActivityToDelete(null);
    }
  };

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-8 text-center">
        <Frown className="w-16 h-16 text-red-500" />
        <h2 className="mt-4 text-2xl font-bold">Failed to Load Activities</h2>
        <p className="mt-2 text-muted-foreground">{error.message}</p>
        <Button onClick={() => mutate()}>Try Again</Button>
      </div>
    );
  }

  return (
    <>
      <ActivityFormDialog
        activity={selectedActivity}
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
              This action cannot be undone. This will permanently delete the activity "
              {activityToDelete?.title}".
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              disabled={isDeleting}
              className="bg-red-600 hover:bg-red-700"
            >
              {isDeleting && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
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
            <h1 className="text-3xl font-bold">Activity Management</h1>
            <p className="text-muted-foreground">
              Manage all available activities in the system.
            </p>
          </div>
          <Button
            onClick={handleCreateClick}
            className="bg-blue-600 cursor-pointer hover:bg-blue-700"
          >
            <PlusCircle className="w-4 h-4 mr-2" />
            Create Activity
          </Button>
        </div>

        <div className="flex flex-col gap-4 md:flex-row">
          <div className="relative flex-grow">
            <Search
              className="absolute text-gray-400 -translate-y-1/2 left-3 top-1/2"
              size={20}
            />
            <Input
              placeholder="Search by activity title..."
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="pl-10 h-11"
            />
          </div>
          <Select value={categoryFilter} onValueChange={setCategoryFilter}>
            <SelectTrigger className="w-full md:w-[240px] h-11">
              <SelectValue placeholder="Filter by category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              {(categories || []).map((cat) => (
                <SelectItem key={cat.id} value={cat.id}>
                  {cat.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="overflow-hidden bg-white border rounded-lg">
          <Table>
            <TableHeader className="bg-gray-50">
              <TableRow>
                <TableHead className="px-6">Activity</TableHead>
                <TableHead className="hidden px-6 lg:table-cell">
                  Category
                </TableHead>
                <TableHead className="hidden px-6 md:table-cell">
                  Rating
                </TableHead>
                <TableHead className="hidden px-6 lg:table-cell">
                  Price
                </TableHead>
                <TableHead className="px-6 text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                Array.from({ length: ITEMS_PER_PAGE }).map((_, index) => (
                  <TableRow key={index}>
                    <TableCell className="px-6 py-3">
                      <div className="flex items-center gap-3">
                        <Skeleton className="w-10 h-10 rounded-md" />
                        <Skeleton className="w-40 h-5" />
                      </div>
                    </TableCell>
                    <TableCell className="hidden px-6 py-3 lg:table-cell">
                      <Skeleton className="w-24 h-5" />
                    </TableCell>
                    <TableCell className="hidden px-6 py-3 md:table-cell">
                      <Skeleton className="w-20 h-5" />
                    </TableCell>
                    <TableCell className="hidden px-6 py-3 lg:table-cell">
                      <Skeleton className="h-5 w-28" />
                    </TableCell>
                    <TableCell className="px-6 py-3 text-right">
                      <Skeleton className="w-20 h-8 ml-auto" />
                    </TableCell>
                  </TableRow>
                ))
              ) : paginatedActivities.length > 0 ? (
                paginatedActivities.map((activity) => (
                  <TableRow key={activity.id}>
                    <TableCell className="px-6 py-3">
                      <div className="flex items-center gap-3">
                        <img
                          src={activity.imageUrls?.[0]}
                          alt={activity.title}
                          className="object-cover w-10 h-10 rounded-md"
                          onError={(e) => {
                            e.currentTarget.onerror = null;
                            e.currentTarget.src = "/assets/error.png";
                          }}
                        />
                        <span className="font-medium">{activity.title}</span>
                      </div>
                    </TableCell>
                    <TableCell className="hidden px-6 py-3 lg:table-cell">
                      {categories?.find((c) => c.id === activity.categoryId)
                        ?.name || "N/A"}
                    </TableCell>
                    <TableCell className="hidden px-6 py-3 md:table-cell">
                      <div className="flex items-center gap-1">
                        <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                        {activity.rating}
                      </div>
                    </TableCell>
                    <TableCell className="hidden px-6 py-3 font-medium lg:table-cell">
                      {new Intl.NumberFormat("id-ID", {
                        style: "currency",
                        currency: "IDR",
                        minimumFractionDigits: 0,
                      }).format(activity.price)}
                    </TableCell>
                    <TableCell className="px-6 py-3 text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => handleEditClick(activity)}
                          className="text-white bg-blue-500 cursor-pointer hover:bg-blue-600 hover:text-slate-50"
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="destructive"
                          size="icon"
                          onClick={() => handleDeleteClick(activity)}
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
                  <TableCell colSpan={5} className="h-24 text-center">
                    No activities found.
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

export default ActivityManagementPage;
