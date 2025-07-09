"use client";

import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Loader2, User, Mail, Phone, Shield } from "lucide-react";
import { toast } from "sonner";

export const UserFormDialog = ({ user, isOpen, setIsOpen, onSuccess }) => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    role: "user",
    isActive: true,
  });
  const [isLoading, setIsLoading] = useState(false);

  const isEditing = !!user;

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || "",
        email: user.email || "",
        phone: user.phone || "",
        role: user.role || "user",
        isActive: user.isActive !== undefined ? user.isActive : true,
      });
    } else {
      setFormData({
        name: "",
        email: "",
        phone: "",
        role: "user",
        isActive: true,
      });
    }
  }, [user]);

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // Here you would typically call an API to create/update the user
      // For now, we'll just simulate a successful operation
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      toast.success(
        isEditing 
          ? "User updated successfully!" 
          : "User created successfully!"
      );
      
      setIsOpen(false);
      if (onSuccess) {
        onSuccess();
      }
    } catch (error) {
      toast.error(
        isEditing 
          ? "Failed to update user" 
          : "Failed to create user"
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    if (!isLoading) {
      setIsOpen(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="bg-white border border-slate-200 rounded-xl shadow-lg max-w-md">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold text-blue-900 flex items-center">
            <User className="w-5 h-5 mr-2 text-blue-600" />
            {isEditing ? "Edit User" : "Create New User"}
          </DialogTitle>
          <DialogDescription className="text-slate-600">
            {isEditing 
              ? "Update user information and settings" 
              : "Add a new user to the system"
            }
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name" className="text-sm font-medium text-slate-700">
              Full Name
            </Label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                className="pl-10 border border-slate-200 rounded-lg bg-white text-slate-900 placeholder-slate-400 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                placeholder="Enter full name"
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="email" className="text-sm font-medium text-slate-700">
              Email Address
            </Label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                className="pl-10 border border-slate-200 rounded-lg bg-white text-slate-900 placeholder-slate-400 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                placeholder="Enter email address"
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="phone" className="text-sm font-medium text-slate-700">
              Phone Number
            </Label>
            <div className="relative">
              <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
              <Input
                id="phone"
                value={formData.phone}
                onChange={(e) => handleInputChange('phone', e.target.value)}
                className="pl-10 border border-slate-200 rounded-lg bg-white text-slate-900 placeholder-slate-400 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                placeholder="Enter phone number"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="role" className="text-sm font-medium text-slate-700">
              Role
            </Label>
            <Select
              value={formData.role}
              onValueChange={(value) => handleInputChange('role', value)}
            >
              <SelectTrigger className="border border-slate-200 rounded-lg bg-white text-slate-900 focus:border-blue-500 focus:ring-1 focus:ring-blue-500">
                <SelectValue placeholder="Select role" />
              </SelectTrigger>
              <SelectContent className="bg-white border border-slate-200 rounded-lg">
                <SelectItem value="user" className="text-slate-700">
                  <div className="flex items-center">
                    <User className="w-4 h-4 mr-2" />
                    User
                  </div>
                </SelectItem>
                <SelectItem value="admin" className="text-slate-700">
                  <div className="flex items-center">
                    <Shield className="w-4 h-4 mr-2" />
                    Administrator
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label className="text-sm font-medium text-slate-700">
                Account Status
              </Label>
              <p className="text-xs text-slate-500">
                Enable or disable this user account
              </p>
            </div>
            <Switch
              checked={formData.isActive}
              onCheckedChange={(checked) => handleInputChange('isActive', checked)}
            />
          </div>
        </form>

        <DialogFooter className="flex items-center justify-end space-x-2 pt-4">
          <Button
            type="button"
            variant="outline"
            onClick={handleClose}
            disabled={isLoading}
            className="border border-slate-200 text-slate-700 hover:bg-slate-50"
          >
            Cancel
          </Button>
          <Button
            type="submit"
            onClick={handleSubmit}
            disabled={isLoading}
            className="bg-blue-600 text-white hover:bg-blue-700 border-0"
          >
            {isLoading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
            {isEditing ? "Update User" : "Create User"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}; 