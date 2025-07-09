"use client";

import React, { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { EditProfileDialog } from "@/components/ui/user/EditProfileDialog";
import {
  AlertTriangle,
  User,
  Phone,
  RefreshCw,
  UserCheck,
  UserX,
  AtSign,
  Award,
  Ticket,
  Settings,
  Receipt,
  ShoppingCart,
  LogIn,
} from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";

const ProfilePageSkeleton = () => (
  <div className="min-h-screen py-8 bg-white">
    <div className="container px-4 mx-auto max-w-7xl">
      <div className="mb-8">
        <Skeleton className="w-1/3 h-6 mb-2 rounded-lg" />
        <Skeleton className="w-1/2 h-4 rounded-lg" />
      </div>
      
      <div className="flex flex-col gap-6 lg:flex-row">
        <div className="w-full space-y-4 lg:w-2/3">
          <div className="p-4 border border-gray-200 bg-white rounded-lg">
            <div className="flex items-center gap-4 mb-4">
              <Skeleton className="w-16 h-16 rounded-full" />
              <div className="space-y-1.5">
                <Skeleton className="w-32 h-4 rounded" />
                <Skeleton className="w-24 h-3 rounded" />
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between">
                <Skeleton className="w-12 h-3 rounded" />
                <Skeleton className="w-24 h-3 rounded" />
              </div>
              <div className="flex justify-between">
                <Skeleton className="w-16 h-3 rounded" />
                <Skeleton className="w-28 h-3 rounded" />
              </div>
              <div className="flex justify-between">
                <Skeleton className="w-12 h-3 rounded" />
                <Skeleton className="w-20 h-3 rounded" />
              </div>
            </div>
          </div>
        </div>

        <div className="w-full lg:w-1/3">
          <div className="p-4 border border-gray-200 bg-white rounded-lg">
            <Skeleton className="w-1/2 h-4 mb-4 rounded" />
            <div className="space-y-2">
              <div className="flex justify-between">
                <Skeleton className="w-12 h-3 rounded" />
                <Skeleton className="w-10 h-3 rounded" />
              </div>
              <div className="flex justify-between">
                <Skeleton className="w-16 h-3 rounded" />
                <Skeleton className="w-12 h-3 rounded" />
              </div>
              <div className="flex justify-between">
                <Skeleton className="w-12 h-3 rounded" />
                <Skeleton className="w-10 h-3 rounded" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
);

const UserProfile = () => {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [hasMounted, setHasMounted] = useState(false);

  useEffect(() => {
    setHasMounted(true);
  }, []);

  const isLoading = authLoading || !hasMounted;

  // Komponen untuk menampilkan detail info dengan ikon
  const InfoItem = ({ icon: Icon, label, value }) => (
    <div className="flex items-center gap-4 p-3 transition-colors duration-300 rounded-xl hover:bg-blue-50">
      <Icon className="w-5 h-5 text-blue-500" strokeWidth={1.5} />
      <div className="flex-1">
        <p className="text-sm font-medium text-gray-500">{label}</p>
        <p className="font-semibold text-gray-800">{value || "Not provided"}</p>
      </div>
    </div>
  );

  // Komponen untuk menu aksi
  const ActionItem = ({ icon: Icon, label, href = "#", onClick }) => {
    const commonClasses = "flex flex-col items-center justify-center p-4 space-y-2 text-center transition-all duration-300 rounded-xl hover:bg-blue-50 hover:scale-105 group";
    
    const content = (
      <>
        <div className="flex items-center justify-center w-12 h-12 text-blue-600 transition-colors duration-300 bg-blue-100 rounded-full group-hover:bg-blue-200">
          <Icon className="w-6 h-6" />
        </div>
        <p className="text-sm font-semibold text-gray-700">{label}</p>
      </>
    );

    if (onClick) {
      return (
        <button onClick={onClick} className={commonClasses}>
          {content}
        </button>
      );
    }
    
    return (
      <a href={href} className={commonClasses}>
        {content}
      </a>
    );
  };
  
  // Komponen untuk state Error atau Not Found
  const InfoState = ({ icon: Icon, title, message, action }) => (
    <div className="w-full max-w-md p-10 text-center border shadow-xl bg-white/70 backdrop-blur-lg border-gray-200/60 rounded-3xl">
      <Icon className="w-20 h-20 mx-auto text-blue-400" strokeWidth={1} />
      <h2 className="mt-6 text-2xl font-bold text-gray-800 md:text-3xl tracking-tight">
        {title}
      </h2>
      <p className="mt-2 text-gray-600">{message}</p>
      {action && (
        <div className="mt-8">
          {action}
        </div>
      )}
    </div>
  );

  if (isLoading) {
    return <ProfilePageSkeleton />;
  }

  // Jika tidak ada user yang login
  if (!user) {
    return (
      <div className="min-h-screen py-8 bg-white">
        <div className="container px-4 mx-auto max-w-7xl">
          <div className="flex items-center justify-center min-h-[60vh]">
            <InfoState 
              icon={UserX}
              title="Please Login"
              message="You need to be logged in to view your profile."
              action={
                <Button
                  onClick={() => router.push("/login")}
                  className="flex items-center gap-2 px-6 py-3 text-white bg-blue-600 rounded-xl hover:bg-blue-700"
                >
                  <LogIn className="w-5 h-5" />
                  Login Now
                </Button>
              }
            />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-8 bg-white">
      <div className="container px-4 mx-auto max-w-7xl">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900 md:text-3xl tracking-tight">My Profile</h1>
          <p className="text-sm text-gray-600">Manage your account and view your information</p>
        </div>
        
        <div className="flex flex-col gap-8 lg:flex-row">
          {/* Profile Info */}
          <div className="w-full space-y-6 lg:w-2/3">
            <div className="p-8 border border-blue-100 shadow-xl bg-white/80 backdrop-blur-sm rounded-3xl">
              <div className="flex items-center gap-6 mb-8">
                <div className="relative">
                  <img
                    alt={user.name}
                    src={user.profilePictureUrl || "https://placehold.co/128x128/dbeafe/2563eb?text=User"}
                    className="object-cover w-24 h-24 rounded-full shadow-lg ring-4 ring-white/50"
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = "https://placehold.co/128x128/dbeafe/2563eb?text=User";
                    }}
                  />
                  <span className="absolute flex items-center justify-center w-8 h-8 text-white bg-blue-600 border-2 rounded-full shadow-md bottom-0 right-0 border-white">
                    <UserCheck size={16} />
                  </span>
                </div>
                <div>
                  <h2 className="text-xl font-bold text-gray-900 md:text-2xl tracking-tight">{user.name}</h2>
                  <div className="inline-flex items-center gap-2 px-3 py-1 mt-2 text-sm font-semibold text-blue-700 bg-blue-100 border border-blue-200 rounded-full">
                    <Award className="w-4 h-4" />
                    <span className="capitalize">{user.role}</span>
                  </div>
                </div>
              </div>
              
              <div className="space-y-4">
                <InfoItem icon={User} label="Full Name" value={user.name} />
                <InfoItem icon={AtSign} label="Email Address" value={user.email} />
                <InfoItem icon={Phone} label="Phone Number" value={user.phoneNumber} />
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="w-full lg:w-1/3">
            <div className="p-4 sm:p-6 border border-blue-100 shadow-2xl bg-white/90 backdrop-blur-sm rounded-3xl">
              <h3 className="mb-6 text-lg font-bold text-gray-900 tracking-tight">Quick Actions</h3>
              <div className="grid grid-cols-2 gap-4">
                <ActionItem icon={Ticket} label="Promos" href="/promo" />
                <ActionItem icon={ShoppingCart} label="Cart" href="/cart" />
                <ActionItem icon={Receipt} label="Transactions" href="/transaction" />
                <ActionItem icon={Settings} label="Settings" onClick={() => setIsEditDialogOpen(true)} />
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <EditProfileDialog
        user={user}
        isOpen={isEditDialogOpen}
        setIsOpen={setIsEditDialogOpen}
        onUpdateSuccess={() => {
          // Refresh the page to get updated user data
          window.location.reload();
        }}
      />
    </div>
  );
};

export default UserProfile;
