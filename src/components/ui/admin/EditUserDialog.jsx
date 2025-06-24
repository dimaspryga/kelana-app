"use client";

import React, { useState, useEffect } from "react";
import { useUpdateProfile } from "@/hooks/useUpdateProfile"; // Menggunakan hook yang sudah ada
import { useUpdateUserRole } from "@/hooks/useUpdateUserRole"; // Menggunakan hook yang sudah ada
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";


export const EditUserDialog = ({ user, isOpen, setIsOpen, onUpdate }) => {
    // Memanggil kedua hook yang relevan
    const { updateProfile, loading: isUpdatingProfile } = useUpdateProfile();
    const { updateUserRole, loading: isUpdatingRole } = useUpdateUserRole();
    
    // State untuk menyimpan data form
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [phone, setPhone] = useState('');
    const [role, setRole] = useState('');

    // Isi form dengan data user yang ada saat dialog dibuka
    useEffect(() => {
        if (user) {
            setName(user.name || '');
            setEmail(user.email || '');
            setPhone(user.phoneNumber || '');
            setRole(user.role || '');
        }
    }, [user]);

    const handleSubmit = async () => {
        if (!user) return;

        const updatePromises = [];

        // Cek apakah ada perubahan pada data profil (nama atau telepon)
        if (name !== user.name || phone !== user.phoneNumber) {
            // Kita tidak mengirim gambar profil di sini, jadi null
            updatePromises.push(updateProfile({ name, email: user.email, phoneNumber: phone, profilePictureUrl: null }));
        }

        // Cek apakah ada perubahan pada role
        if (role !== user.role) {
            updatePromises.push(updateUserRole(user.id, role));
        }

        // Jika tidak ada perubahan, langsung tutup dialog
        if (updatePromises.length === 0) {
            setIsOpen(false);
            toast.info("No changes were made.");
            return;
        }

        try {
            await Promise.all(updatePromises);
            toast.success("User details updated successfully!");
            onUpdate(); // Panggil fungsi refetch dari halaman utama
            setIsOpen(false); // Tutup dialog
        } catch (error) {
            // Hook individu sudah menangani notifikasi errornya sendiri
            console.error("Failed to update user:", error);
        }
    };
    
    // Gabungkan status loading dari kedua hook
    const isLoading = isUpdatingProfile || isUpdatingRole;
    
    if (!user) return null;

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Edit User Profile</DialogTitle>
                    <DialogDescription>
                        Update user details and their role here. Click save when you're done.
                    </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                    <div className="grid items-center grid-cols-4 gap-4">
                        <Label htmlFor="name" className="text-right">Name</Label>
                        <Input id="name" value={name} onChange={(e) => setName(e.target.value)} className="col-span-3" />
                    </div>
                    <div className="grid items-center grid-cols-4 gap-4">
                        <Label htmlFor="email" className="text-right">Email</Label>
                        <Input id="email" value={email} className="col-span-3 bg-gray-100" disabled />
                    </div>
                    <div className="grid items-center grid-cols-4 gap-4">
                        <Label htmlFor="phone" className="text-right">Phone</Label>
                        <Input id="phone" value={phone} onChange={(e) => setPhone(e.target.value)} className="col-span-3" />
                    </div>
                    <div className="grid items-center grid-cols-4 gap-4">
                        <Label htmlFor="role" className="text-right">Role</Label>
                        <Select value={role} onValueChange={setRole}>
                            <SelectTrigger className="col-span-3">
                                <SelectValue placeholder="Select a role" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="admin">Admin</SelectItem>
                                <SelectItem value="user">User</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </div>
                <DialogFooter>
                    <Button variant="outline" onClick={() => setIsOpen(false)}>Cancel</Button>
                    <Button onClick={handleSubmit} disabled={isLoading} className="bg-blue-600 hover:bg-blue-700">
                        {isLoading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                        Save Changes
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};
