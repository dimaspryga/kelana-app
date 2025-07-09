"use client";

import React, { useState } from "react";
import { useGetLoggedUser } from "@/hooks/useGetLoggedUser";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  User,
  Mail,
  Phone,
  Calendar,
  Shield,
  Edit,
  Save,
  X,
  Camera,
  Key,
  Settings
} from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

const ProfilePage = () => {
  const { user, isLoading: isUserLoading, mutate } = useGetLoggedUser();
  const { loading: isAuthLoading } = useAuth();

  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: user?.name || "",
    email: user?.email || "",
    phone: user?.phone || "",
  });

  const isLoading = isUserLoading || isAuthLoading;

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSave = async () => {
    try {
      // Here you would typically call an API to update the user profile
      // For now, we'll just simulate a successful update
      toast.success("Profile updated successfully!");
      setIsEditing(false);
      mutate(); // Refresh user data
    } catch (error) {
      toast.error("Failed to update profile");
    }
  };

  const handleCancel = () => {
    setFormData({
      name: user?.name || "",
      email: user?.email || "",
      phone: user?.phone || "",
    });
    setIsEditing(false);
  };

  if (isLoading) {
    return (
      <div className="w-full px-6 py-6">
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <Skeleton className="h-8 w-48" />
            <Skeleton className="h-10 w-24" />
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              <Card className="border border-slate-200 rounded-xl shadow-sm bg-white">
                <CardHeader className="bg-white border-b border-slate-100">
                  <Skeleton className="h-6 w-32" />
                  <Skeleton className="h-4 w-64" />
                </CardHeader>
                <CardContent className="p-6 space-y-4">
                  {Array.from({ length: 4 }).map((_, index) => (
                    <div key={index} className="space-y-2">
                      <Skeleton className="h-4 w-20" />
                      <Skeleton className="h-10 w-full" />
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>
            <div className="space-y-6">
              <Card className="border border-slate-200 rounded-xl shadow-sm bg-white">
                <CardContent className="p-6">
                  <div className="flex flex-col items-center space-y-4">
                    <Skeleton className="w-24 h-24 rounded-full" />
                    <Skeleton className="h-6 w-32" />
                    <Skeleton className="h-4 w-24" />
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full px-6 py-6">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold tracking-tight text-blue-900">Profile</h2>
            <p className="text-slate-600 mt-1">Manage your account settings and preferences</p>
          </div>
          <div className="flex items-center space-x-2">
            {!isEditing ? (
              <Button 
                onClick={() => setIsEditing(true)}
                className="bg-blue-600 text-white hover:bg-blue-700 border-0 shadow-sm"
              >
                <Edit className="w-4 h-4 mr-2" />
                Edit Profile
              </Button>
            ) : (
              <div className="flex items-center space-x-2">
                <Button 
                  onClick={handleCancel}
                  variant="outline"
                  className="border border-slate-200 bg-white hover:bg-slate-50"
                >
                  <X className="w-4 h-4 mr-2" />
                  Cancel
                </Button>
                <Button 
                  onClick={handleSave}
                  className="bg-blue-600 text-white hover:bg-blue-700 border-0 shadow-sm"
                >
                  <Save className="w-4 h-4 mr-2" />
                  Save Changes
                </Button>
              </div>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Profile Form */}
          <div className="lg:col-span-2 space-y-6">
            <Card className="border border-slate-200 rounded-xl shadow-sm bg-white overflow-hidden">
              <CardHeader className="bg-white border-b border-slate-100">
                <CardTitle className="text-xl font-semibold text-blue-900">Personal Information</CardTitle>
                <CardDescription className="text-slate-600">
                  Update your personal details and contact information
                </CardDescription>
              </CardHeader>
              <CardContent className="p-6">
                <div className="space-y-4">
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
                        disabled={!isEditing}
                        className="pl-10 border border-slate-200 rounded-lg bg-white text-slate-900 placeholder-slate-400 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 disabled:bg-slate-50"
                        placeholder="Enter your full name"
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
                        disabled={!isEditing}
                        className="pl-10 border border-slate-200 rounded-lg bg-white text-slate-900 placeholder-slate-400 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 disabled:bg-slate-50"
                        placeholder="Enter your email address"
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
                        disabled={!isEditing}
                        className="pl-10 border border-slate-200 rounded-lg bg-white text-slate-900 placeholder-slate-400 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 disabled:bg-slate-50"
                        placeholder="Enter your phone number"
                      />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border border-slate-200 rounded-xl shadow-sm bg-white overflow-hidden">
              <CardHeader className="bg-white border-b border-slate-100">
                <CardTitle className="text-xl font-semibold text-blue-900">Account Settings</CardTitle>
                <CardDescription className="text-slate-600">
                  Manage your account preferences and security settings
                </CardDescription>
              </CardHeader>
              <CardContent className="p-6">
                <div className="space-y-4">
                  <Button variant="outline" className="w-full justify-start border border-slate-200 bg-white hover:bg-blue-50">
                    <Key className="w-4 h-4 mr-3 text-blue-600" />
                    Change Password
                  </Button>
                  <Button variant="outline" className="w-full justify-start border border-slate-200 bg-white hover:bg-blue-50">
                    <Settings className="w-4 h-4 mr-3 text-blue-600" />
                    Notification Preferences
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Profile Sidebar */}
          <div className="space-y-6">
            <Card className="border border-slate-200 rounded-xl shadow-sm bg-white overflow-hidden">
              <CardContent className="p-6">
                <div className="flex flex-col items-center space-y-4">
                  <div className="relative">
                    <div className="w-24 h-24 rounded-full bg-blue-100 flex items-center justify-center border-4 border-slate-200">
                      <span className="text-2xl font-bold text-blue-700">
                        {user?.name?.charAt(0)?.toUpperCase() || 'A'}
                      </span>
                    </div>
                    {isEditing && (
                      <Button
                        size="sm"
                        className="absolute -bottom-1 -right-1 w-8 h-8 rounded-full p-0 bg-blue-600 hover:bg-blue-700"
                      >
                        <Camera className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                  <div className="text-center">
                    <h3 className="text-lg font-semibold text-blue-900">{user?.name || 'Admin User'}</h3>
                    <p className="text-sm text-slate-500">{user?.email || 'admin@example.com'}</p>
                  </div>
                  <Badge className="bg-green-100 text-green-900 border border-green-200 rounded-full px-3 py-1 text-xs font-medium">
                    <Shield className="w-3 h-3 mr-1" />
                    Administrator
                  </Badge>
                </div>
              </CardContent>
            </Card>

            <Card className="border border-slate-200 rounded-xl shadow-sm bg-white overflow-hidden">
              <CardHeader className="bg-white border-b border-slate-100">
                <CardTitle className="text-lg font-semibold text-blue-900">Account Info</CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="space-y-3">
                  <div className="flex items-center space-x-3">
                    <Calendar className="w-4 h-4 text-slate-400" />
                    <div>
                      <p className="text-sm font-medium text-slate-700">Member since</p>
                      <p className="text-sm text-slate-500">
                        {user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A'}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Shield className="w-4 h-4 text-slate-400" />
                    <div>
                      <p className="text-sm font-medium text-slate-700">Role</p>
                      <p className="text-sm text-slate-500">{user?.role || 'Administrator'}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Mail className="w-4 h-4 text-slate-400" />
                    <div>
                      <p className="text-sm font-medium text-slate-700">Status</p>
                      <Badge className="bg-green-100 text-green-900 border border-green-200 rounded-full px-2 py-0.5 text-xs">
                        Active
                      </Badge>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage; 