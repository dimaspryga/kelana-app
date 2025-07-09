"use client";

import React, { useState, useMemo, useEffect } from "react";
import { useAllUsers } from "@/hooks/useAllUsers";
import { useAuth } from "@/context/AuthContext";
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
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Edit,
  Trash2,
  Frown,
  Search,
  PlusCircle,
  Loader2,
  Users,
  Mail,
  Phone,
  Calendar,
  UserCheck,
  UserX
} from "lucide-react";
import { UserFormDialog } from "@/components/ui/admin/UserFormDialog";
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

const ITEMS_PER_PAGE = 10;

const UserManagementPage = () => {
  const {
    users,
    isLoading: isUserLoading,
    error,
    refetch: refetchUsers,
  } = useAllUsers();
  const { loading: isAuthLoading } = useAuth();

  const [filter, setFilter] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [isFormDialogOpen, setIsFormDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [userToDelete, setUserToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const isLoading = isUserLoading || isAuthLoading;

  const filteredUsers = useMemo(() => {
    if (!users) return [];
    return users.filter((user) =>
      user.name.toLowerCase().includes(filter.toLowerCase()) ||
      user.email.toLowerCase().includes(filter.toLowerCase())
    );
  }, [users, filter]);

  useEffect(() => {
    setCurrentPage(1);
  }, [filter]);

  const totalPages = Math.ceil(filteredUsers.length / ITEMS_PER_PAGE);
  const paginatedUsers = filteredUsers.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  const handlePageChange = (page) => {
    if (page >= 1 && page <= totalPages) setCurrentPage(page);
  };

  const handleCreateClick = () => {
    setSelectedUser(null);
    setIsFormDialogOpen(true);
  };

  const handleEditClick = (user) => {
    setSelectedUser(user);
    setIsFormDialogOpen(true);
  };

  const handleDeleteClick = (user) => {
    setUserToDelete(user);
    setIsDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (!userToDelete) return;

    setIsDeleting(true);
    try {
      // Here you would typically call an API to delete the user
      // For now, we'll just simulate a successful deletion
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      toast.success("User deleted successfully.");
      refetchUsers();
    } catch (error) {
      const errorMessage =
        error.response?.data?.message || "Failed to delete user.";
      toast.error(errorMessage);
    } finally {
      setIsDeleteDialogOpen(false);
      setUserToDelete(null);
      setIsDeleting(false);
    }
  };

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-8 text-center bg-white">
        <Frown className="w-16 h-16 text-red-500" />
        <h2 className="mt-4 text-2xl font-bold text-blue-900">Failed to Load Users</h2>
        <p className="mt-2 text-slate-600">{error.message}</p>
        <Button onClick={() => refetchUsers()} className="mt-4 bg-blue-600 text-white hover:bg-blue-700 border-0">
          Try Again
        </Button>
      </div>
    );
  }

  return (
    <>
      <UserFormDialog
        user={selectedUser}
        isOpen={isFormDialogOpen}
        setIsOpen={setIsFormDialogOpen}
        onSuccess={refetchUsers}
      />

      <AlertDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
      >
        <AlertDialogContent className="bg-white border border-slate-200 rounded-xl shadow-lg">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-blue-900">Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription className="text-slate-600">
              This action cannot be undone. This will permanently delete the user "
              {userToDelete?.name}".
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
            <h2 className="text-3xl font-bold tracking-tight text-blue-900">Users</h2>
            <div className="flex items-center space-x-2">
              <Button 
                onClick={handleCreateClick} 
                className="bg-blue-600 text-white hover:bg-blue-700 border-0 shadow-sm"
              >
                <PlusCircle className="w-4 h-4 mr-2" />
                Add User
              </Button>
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
              <Input
                placeholder="Search users..."
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                className="pl-10 border border-slate-200 rounded-lg bg-white text-slate-900 placeholder-slate-400 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
              />
            </div>
          </div>
          
          <Card className="border border-slate-200 rounded-xl shadow-sm bg-white overflow-hidden">
            <CardHeader className="bg-white border-b border-slate-100">
              <CardTitle className="text-xl font-semibold text-blue-900">Users</CardTitle>
              <CardDescription className="text-slate-600">
                Manage all users in your system.
              </CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <Table className="w-full">
                  <TableHeader className="bg-blue-50">
                    <TableRow className="border-b border-slate-200">
                      <TableHead className="font-semibold text-blue-900 py-4 px-6">User</TableHead>
                      <TableHead className="font-semibold text-blue-900 py-4 px-6">Email</TableHead>
                      <TableHead className="font-semibold text-blue-900 py-4 px-6">Phone</TableHead>
                      <TableHead className="font-semibold text-blue-900 py-4 px-6">Status</TableHead>
                      <TableHead className="font-semibold text-blue-900 py-4 px-6">Role</TableHead>
                      <TableHead className="font-semibold text-right text-blue-900 py-4 px-6">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {isLoading ? (
                      Array.from({ length: ITEMS_PER_PAGE }).map((_, index) => (
                        <TableRow key={index} className="border-b border-slate-100 hover:bg-slate-50">
                          <TableCell className="py-4 px-6">
                            <div className="flex items-center space-x-3">
                              <Skeleton className="w-10 h-10 rounded-full" />
                              <div className="space-y-2">
                                <Skeleton className="h-4 w-[150px]" />
                                <Skeleton className="h-3 w-[100px]" />
                              </div>
                            </div>
                          </TableCell>
                          <TableCell className="py-4 px-6">
                            <Skeleton className="h-4 w-[200px]" />
                          </TableCell>
                          <TableCell className="py-4 px-6">
                            <Skeleton className="h-4 w-[120px]" />
                          </TableCell>
                          <TableCell className="py-4 px-6">
                            <Skeleton className="h-6 w-[80px] rounded-full" />
                          </TableCell>
                          <TableCell className="py-4 px-6">
                            <Skeleton className="h-6 w-[60px] rounded-full" />
                          </TableCell>
                          <TableCell className="py-4 px-6 text-right">
                            <div className="flex items-center justify-end space-x-2">
                              <Skeleton className="w-8 h-8 rounded" />
                              <Skeleton className="w-8 h-8 rounded" />
                            </div>
                          </TableCell>
                        </TableRow>
                      ))
                    ) : paginatedUsers.length > 0 ? (
                      paginatedUsers.map((user) => (
                        <TableRow key={user.id} className="border-b border-slate-100 hover:bg-slate-50">
                          <TableCell className="py-4 px-6">
                            <div className="flex items-center space-x-3">
                              <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center border border-slate-200">
                                <span className="text-sm font-bold text-blue-700">
                                  {user.name?.charAt(0)?.toUpperCase() || 'U'}
                                </span>
                              </div>
                              <div className="min-w-0 flex-1">
                                <p className="font-medium text-blue-900 truncate">{user.name}</p>
                                <p className="text-sm text-slate-500 truncate">
                                  Joined {new Date(user.createdAt).toLocaleDateString()}
                                </p>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell className="py-4 px-6">
                            <div className="flex items-center space-x-2">
                              <Mail className="w-4 h-4 text-slate-400" />
                              <span className="text-slate-700 truncate">{user.email}</span>
                            </div>
                          </TableCell>
                          <TableCell className="py-4 px-6">
                            <div className="flex items-center space-x-2">
                              <Phone className="w-4 h-4 text-slate-400" />
                              <span className="text-slate-700">{user.phone || 'N/A'}</span>
                            </div>
                          </TableCell>
                          <TableCell className="py-4 px-6">
                            <Badge className={`rounded-full px-3 py-1 text-xs font-medium ${
                              user.isActive 
                                ? "bg-green-100 text-green-900 border border-green-200" 
                                : "bg-slate-100 text-slate-600 border border-slate-200"
                            }`}>
                              {user.isActive ? "Active" : "Inactive"}
                            </Badge>
                          </TableCell>
                          <TableCell className="py-4 px-6">
                            <Badge className="bg-blue-100 text-blue-900 border border-blue-200 rounded-full px-3 py-1 text-xs font-medium">
                              {user.role || 'User'}
                            </Badge>
                          </TableCell>
                          <TableCell className="py-4 px-6 text-right">
                            <div className="flex items-center justify-end space-x-2">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleEditClick(user)}
                                className="w-8 h-8 p-0 border border-slate-200 bg-white hover:bg-blue-50"
                              >
                                <Edit className="w-4 h-4 text-blue-600" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleDeleteClick(user)}
                                className="w-8 h-8 p-0 border border-slate-200 bg-white hover:bg-red-50"
                              >
                                <Trash2 className="w-4 h-4 text-red-600" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={6} className="py-12 text-center">
                          <div className="flex flex-col items-center space-y-3">
                            <Users className="w-12 h-12 text-slate-400" />
                            <p className="text-slate-600 font-medium">No users found.</p>
                            <p className="text-slate-400 text-sm">Try adjusting your search criteria.</p>
                          </div>
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
              
              {totalPages > 1 && (
                <div className="flex items-center justify-center py-6 border-t border-slate-100">
                  <Pagination>
                    <PaginationContent className="flex items-center space-x-1">
                      <PaginationItem>
                        <PaginationPrevious 
                          onClick={() => handlePageChange(currentPage - 1)}
                          className={cn(
                            "cursor-pointer border border-slate-200 rounded-lg px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50",
                            currentPage === 1 && "pointer-events-none opacity-50"
                          )}
                        />
                      </PaginationItem>
                      {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                        <PaginationItem key={page}>
                          <PaginationLink
                            onClick={() => handlePageChange(page)}
                            className={cn(
                              "cursor-pointer border border-slate-200 rounded-lg px-3 py-2 text-sm font-medium",
                              currentPage === page 
                                ? "bg-blue-600 text-white border-blue-600" 
                                : "text-slate-700 hover:bg-slate-50"
                            )}
                          >
                            {page}
                          </PaginationLink>
                        </PaginationItem>
                      ))}
                      <PaginationItem>
                        <PaginationNext 
                          onClick={() => handlePageChange(currentPage + 1)}
                          className={cn(
                            "cursor-pointer border border-slate-200 rounded-lg px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50",
                            currentPage === totalPages && "pointer-events-none opacity-50"
                          )}
                        />
                      </PaginationItem>
                    </PaginationContent>
                  </Pagination>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
};

export default UserManagementPage;