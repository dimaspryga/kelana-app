"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useUpdateProfile } from "@/hooks/useUpdateProfile";
import { useUpdateUserRole } from "@/hooks/useUpdateUserRole";
import { useUploadImage } from "@/hooks/useUploadImage";
import { Loader2, Camera } from "lucide-react"; 
import { toast } from "sonner"; 

const MAX_FILE_SIZE = 2 * 1024 * 1024; // 2 Megabytes

export const EditProfileDialog = ({ user, isOpen, setIsOpen, onUpdateSuccess }) => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [role, setRole] = useState("");
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState("");
  const fileInputRef = useRef(null);
  
  const { uploadImage, isLoading: isUploadingImage } = useUploadImage();
  const { updateProfile, loading: isUpdatingProfile } = useUpdateProfile();
  const { updateUserRole, loading: isUpdatingRole } = useUpdateUserRole();

  useEffect(() => {
    if (user && isOpen) {
      setName(user.name || "");
      setEmail(user.email || "");
      setPhoneNumber(user.phoneNumber || "");
      setRole(user.role || "");
      setImagePreview(user.profilePictureUrl || "");
      setImageFile(null);
    }
  }, [user, isOpen]);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > MAX_FILE_SIZE) {
        toast.error(`File is too large. Maximum size is ${MAX_FILE_SIZE / 1024 / 1024}MB.`);
        setImageFile(null);
        e.target.value = ""; 
        return;
      }
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      let finalImageUrl = user.profilePictureUrl;
      if (imageFile) {
        finalImageUrl = await uploadImage(imageFile);
      }

      // Pastikan email tidak dikirim dalam payload update
      const profilePayload = { name, phoneNumber, profilePictureUrl: finalImageUrl };
      
      const updatePromises = [updateProfile(profilePayload)];
      
      if (role !== user.role && user.role === 'admin') {
        updatePromises.push(updateUserRole(user.id, role));
      }

      await Promise.all(updatePromises);
      
      toast.success("Profile updated successfully!"); 
      onUpdateSuccess();
      setIsOpen(false);

    } catch (err) {
      toast.error(err.message || "An error occurred. Please try again."); 
    }
  };

  const isLoading = isUploadingImage || isUpdatingProfile || isUpdatingRole;

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="sm:max-w-[480px] bg-white rounded-lg">
        <DialogHeader>
          <DialogTitle className="text-base font-bold tracking-tight text-gray-800 sm:text-lg">Edit Profile</DialogTitle>
          <DialogDescription className="text-xs">
            Make changes to your profile here. Click save when you're done.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} noValidate>
          <div className="grid gap-3 py-4">
            <div className="flex flex-col items-center justify-center gap-2">
                <div className="relative">
                    <Avatar className="w-16 h-16 sm:w-20 sm:h-20 border-4 shadow-sm border-blue-50">
                        <AvatarImage src={imagePreview} alt={user?.name} />
                        <AvatarFallback>{user?.name?.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <input type="file" ref={fileInputRef} onChange={handleImageChange} className="hidden" accept="image/*" />
                    <Button type="button" variant="outline" size="icon" className="absolute bottom-0 right-0 bg-white rounded-full hover:bg-gray-100" onClick={() => fileInputRef.current.click()}>
                       <Camera className="w-3 h-3 text-gray-600" />
                    </Button>
                </div>
            </div>
            
            <div className="space-y-2">
              <div className="space-y-1">
                <Label htmlFor="name" className="text-xs font-medium text-gray-700">
                  Full Name
                </Label>
                <input
                  id="name"
                  type="text"
                  placeholder="Enter your full name"
                  className="w-full px-3 py-2 text-sm transition-all duration-300 border border-gray-200 rounded bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 hover:border-gray-300"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>

              <div className="space-y-1">
                <Label htmlFor="email" className="text-xs font-medium text-gray-700">
                  Email Address
                </Label>
                <input
                  id="email"
                  type="email"
                  placeholder="Enter your email address"
                  className="w-full px-3 py-2 text-sm transition-all duration-300 border border-gray-200 rounded bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 hover:border-gray-300"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>

              <div className="space-y-1">
                <Label htmlFor="phoneNumber" className="text-xs font-medium text-gray-700">
                  Phone Number
                </Label>
                <input
                  id="phoneNumber"
                  type="tel"
                  placeholder="Enter your phone number"
                  className="w-full px-3 py-2 text-sm transition-all duration-300 border border-gray-200 rounded bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 hover:border-gray-300"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                />
              </div>

              {user?.role === 'admin' && (
                <div className="space-y-1">
                  <Label htmlFor="role" className="text-xs font-medium text-gray-700">
                    Role
                  </Label>
                  <Select value={role} onValueChange={setRole}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select a role" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="admin">Admin</SelectItem>
                      <SelectItem value="user">User</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" size="sm" onClick={() => setIsOpen(false)}>Cancel</Button>
            <Button type="submit" size="sm" disabled={isLoading} className="bg-blue-600 hover:bg-blue-700">
              {isLoading && <Loader2 className="w-3 h-3 mr-2 animate-spin" />}
              Save changes
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
