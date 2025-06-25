"use client";

import React, { useState, useMemo, useEffect } from "react";
import { useAllUsers } from "@/hooks/useAllUsers";
import { useAuth } from "@/context/AuthContext";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

// Import UI Components from Shadcn
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
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Edit, Frown, Search } from "lucide-react";
import { EditUserDialog } from "@/components/ui/admin/EditUserDialog";

const ITEMS_PER_PAGE = 10;

const UserManagementPage = () => {
  const {
    users,
    isLoading: isUsersLoading,
    error,
    refetch: refetchUsers,
  } = useAllUsers();
  const { loading: isAuthLoading } = useAuth();
  const [filter, setFilter] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);

  // State untuk dialog edit
  const [selectedUser, setSelectedUser] = useState(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);

  const isLoading = isUsersLoading || isAuthLoading;

  const filteredUsers = useMemo(() => {
    let filtered = users;

    if (roleFilter !== "all") {
      filtered = filtered.filter((user) => user.role === roleFilter);
    }

    if (filter) {
      filtered = filtered.filter(
        (user) =>
          user.name.toLowerCase().includes(filter.toLowerCase()) ||
          user.email.toLowerCase().includes(filter.toLowerCase())
      );
    }

    return filtered;
  }, [users, filter, roleFilter]);

  useEffect(() => {
    setCurrentPage(1);
  }, [filter, roleFilter]);

  const totalPages = Math.ceil(filteredUsers.length / ITEMS_PER_PAGE);
  const paginatedUsers = filteredUsers.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  const handlePageChange = (page) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  const handleEditClick = (user) => {
    setSelectedUser(user);
    setIsEditDialogOpen(true);
  };

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-8 text-center">
        <Frown className="w-16 h-16 text-red-500" />
        <h2 className="mt-4 text-2xl font-bold">Failed to Load Users</h2>
        <p className="mt-2 text-muted-foreground">{error.message}</p>
      </div>
    );
  }

  return (
    <>
      <EditUserDialog
        user={selectedUser}
        isOpen={isEditDialogOpen}
        setIsOpen={setIsEditDialogOpen}
        onUpdate={refetchUsers}
      />
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="p-4 space-y-6 md:p-6"
      >
        <div className="flex flex-col items-start justify-between gap-4 md:flex-row md:items-center">
          <div>
            <h1 className="text-3xl font-bold">User Management</h1>
            <p className="text-muted-foreground">
              Manage all users in the system.
            </p>
          </div>
          {/* Tombol Add User telah dihapus */}
        </div>

        <div className="flex flex-col gap-4 md:flex-row">
          <div className="relative flex-grow">
            <Search
              className="absolute text-gray-400 -translate-y-1/2 left-3 top-1/2"
              size={20}
            />
            <Input
              placeholder="Search by name or email..."
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="pl-10 h-11"
            />
          </div>
          <Select value={roleFilter} onValueChange={setRoleFilter}>
            <SelectTrigger className="w-full md:w-[180px] h-11 cursor-pointer">
              <SelectValue placeholder="Filter by role" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Roles</SelectItem>
              <SelectItem value="admin">Admin</SelectItem>
              <SelectItem value="user">User</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="overflow-hidden bg-white border rounded-lg">
          <Table>
            <TableHeader className="bg-slate-100">
              <TableRow>
                {/* Kolom Avatar dan Nama digabung menjadi "User" */}
                <TableHead className="px-6">User</TableHead>
                <TableHead className="hidden px-6 sm:table-cell">
                  Email
                </TableHead>
                <TableHead className="hidden px-6 md:table-cell">
                  Phone
                </TableHead>
                <TableHead className="px-6">Role</TableHead>
                <TableHead className="px-6 text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                Array.from({ length: ITEMS_PER_PAGE }).map((_, index) => (
                  <TableRow key={index}>
                    <TableCell className="px-6 py-3">
                      <div className="flex items-center gap-3">
                        <Skeleton className="w-10 h-10 rounded-full" />
                        <Skeleton className="h-5 w-36" />
                      </div>
                    </TableCell>
                    <TableCell className="hidden px-6 py-3 sm:table-cell">
                      <Skeleton className="w-48 h-5" />
                    </TableCell>
                    <TableCell className="hidden px-6 py-3 md:table-cell">
                      <Skeleton className="w-32 h-5" />
                    </TableCell>
                    <TableCell className="px-6 py-3">
                      <Skeleton className="w-16 h-6 rounded-full" />
                    </TableCell>
                    <TableCell className="px-6 py-3 text-right">
                      <Skeleton className="w-10 h-8 ml-auto" />
                    </TableCell>
                  </TableRow>
                ))
              ) : paginatedUsers.length > 0 ? (
                paginatedUsers.map((user) => (
                  <TableRow key={user.id}>
                    {/* Sel untuk Avatar dan Nama digabung */}
                    <TableCell className="px-6 py-3">
                      <div className="flex items-center gap-3">
                        <Avatar>
                          <AvatarImage
                            src={user.profilePictureUrl}
                            alt={user.name}
                          />
                          <AvatarFallback>
                            {user.name?.charAt(0)}
                          </AvatarFallback>
                        </Avatar>
                        <span className="font-medium">{user.name}</span>
                      </div>
                    </TableCell>
                    <TableCell className="hidden px-6 py-3 sm:table-cell">
                      {user.email}
                    </TableCell>
                    <TableCell className="hidden px-6 py-3 md:table-cell">
                      {user.phoneNumber || "-"}
                    </TableCell>
                    <TableCell className="px-6 py-3">
                      <Badge
                        className={cn(
                          user.role === "admin"
                            ? "bg-red-100 text-red-800 border-red-200"
                            : "bg-blue-100 text-blue-800 border-blue-200"
                        )}
                      >
                        {user.role}
                      </Badge>
                    </TableCell>
                    <TableCell className="px-6 py-3 text-right">
                      {/* Tombol Delete telah dihapus */}
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => handleEditClick(user)}
                        className="text-white bg-blue-500 cursor-pointer hover:text-slate-100 hover:bg-blue-600"
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={5} className="h-24 text-center">
                    No users found for the current filters.
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

export default UserManagementPage;
