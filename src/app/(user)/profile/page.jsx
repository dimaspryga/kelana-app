"use client";

import React, { useState } from "react";
import { useGetLoggedUser } from "@/hooks/useGetLoggedUser";
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
} from "lucide-react";

const ProfileSkeleton = () => (
  <div className="w-full max-w-lg p-8 space-y-6 transition-all duration-300 transform border shadow-2xl bg-white/50 backdrop-blur-xl border-gray-200/50 rounded-3xl animate-pulse">
    <div className="flex flex-col items-center md:flex-row md:space-x-8">
        <div className="w-32 h-32 bg-gray-300 rounded-full"></div>
        <div className="flex-1 w-full mt-6 space-y-4 text-center md:mt-0 md:text-left">
            <div className="w-3/4 h-8 mx-auto bg-gray-300 rounded md:mx-0"></div>
            <div className="w-1/2 h-5 mx-auto bg-gray-300 rounded md:mx-0"></div>
        </div>
    </div>
    <div className="pt-6 space-y-5 border-t border-gray-200/50">
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
            <div className="h-20 bg-gray-300 rounded-lg"></div>
            <div className="h-20 bg-gray-300 rounded-lg"></div>
            <div className="h-20 bg-gray-300 rounded-lg"></div>
            <div className="h-20 bg-gray-300 rounded-lg"></div>
        </div>
        <div className="w-full h-6 bg-gray-300 rounded"></div>
        <div className="w-full h-6 bg-gray-300 rounded"></div>
        <div className="w-2/3 h-6 bg-gray-300 rounded"></div>
    </div>
  </div>
);


const UserProfile = () => {
  const { user, loading, error, refetch } = useGetLoggedUser();
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);


  const PageWrapper = ({ children }) => (
    <div className="relative flex items-center justify-center min-h-screen p-4 overflow-hidden font-sans text-gray-800 bg-white">
      <div className="absolute inset-0 z-0 bg-gradient-to-br from-blue-50 to-white"></div>
        <div 
          className="absolute inset-0 z-0 opacity-20" 
          style={{
              backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 32 32' width='32' height='32' fill='none' stroke='rgb(224 231 255 / 1)'%3e%3cpath d='M0 .5H31.5V32'/%3e%3c/svg%3e")`,
          }}>
        </div>
      <div className="relative z-10">
        {children}
      </div>
    </div>
  );

  // Komponen untuk menampilkan detail info dengan ikon
  const InfoItem = ({ icon: Icon, label, value }) => (
    <div className="flex items-center gap-4 p-2 transition-colors duration-300 rounded-lg hover:bg-blue-500/5">
      <Icon className="w-6 h-6 text-blue-500" strokeWidth={1.5} />
      <div>
        <p className="text-sm font-medium text-gray-500">{label}</p>
        <p className="font-semibold text-gray-800">{value}</p>
      </div>
    </div>
  );

  // Komponen untuk menu aksi di dasbor
  const ActionItem = ({ icon: Icon, label, href = "#", onClick }) => {
    const commonClasses = "flex flex-col items-center justify-center p-2 space-y-2 text-center transition-all duration-300 rounded-xl hover:bg-blue-100 hover:scale-105 group w-full";
    
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
  const InfoState = ({ icon: Icon, title, message, onRetry, retryText }) => (
      <div className="w-full max-w-md p-10 text-center border shadow-xl bg-white/70 backdrop-blur-lg border-gray-200/60 rounded-3xl">
        <Icon
          className="w-20 h-20 mx-auto text-blue-400"
          strokeWidth={1}
        />
        <h2 className="mt-6 text-3xl font-bold text-gray-800">
          {title}
        </h2>
        <p className="mt-2 text-gray-600">{message}</p>
        {onRetry && (
            <button
                onClick={onRetry}
                className="flex items-center justify-center w-full gap-2 px-4 py-3 mt-8 font-semibold text-white transition-all duration-300 bg-blue-600 rounded-xl hover:bg-blue-700 focus:outline-none focus:ring-4 focus:ring-blue-300 hover:shadow-lg hover:scale-105"
            >
                <RefreshCw className="w-5 h-5" />
                {retryText}
            </button>
        )}
      </div>
  );

  if (loading) {
    return (
      <PageWrapper>
        <ProfileSkeleton />
      </PageWrapper>
    );
  }

  if (error) {
    return (
      <PageWrapper>
          <InfoState 
            icon={AlertTriangle}
            title="An Error Occurred"
            message={error.message}
            onRetry={refetch}
            retryText="Try Again"
          />
      </PageWrapper>
    );
  }

  if (!user) {
    return (
      <PageWrapper>
        <InfoState 
            icon={UserX}
            title="User Not Found"
            message="Your session may have expired. Please log in again."
        />
      </PageWrapper>
    );
  }

  return (
    <PageWrapper>
      <div className="w-full max-w-lg p-8 space-y-6 transition-all duration-500 transform border shadow-2xl bg-white/60 backdrop-blur-xl border-gray-200/50 rounded-3xl hover:shadow-blue-200">
        <div className="flex flex-col items-center md:flex-row md:space-x-8">
          <div className="relative flex-shrink-0">
            <img
              alt={user.name}
              src={user.profilePictureUrl}
              className="object-cover w-32 h-32 rounded-full shadow-lg ring-4 ring-white/50"
              onError={(e) => {
                e.target.onerror = null;
                e.target.src = "https://placehold.co/128x128/dbeafe/2563eb?text=User";
              }}
            />
            <span className="absolute flex items-center justify-center w-10 h-10 text-white capitalize bg-blue-600 border-4 rounded-full shadow-md bottom-1 right-1 border-white/50">
                <UserCheck size={20} />
            </span>
          </div>
          <div className="flex-1 mt-6 text-center md:mt-0 md:text-left">
            <h1 className="text-2xl font-bold text-gray-900">{user.name}</h1>
             <div className="inline-flex items-center gap-2 px-4 py-1 mt-2 font-semibold text-blue-700 bg-blue-100 border border-blue-200 rounded-full">
                <Award className="w-4 h-4" />
                <span className="capitalize">{user.role}</span>
            </div>
          </div>
        </div>
        
        {/* Bagian Dasbor Akun */}
        <div className="pt-6 border-t border-gray-200/50">
            <h3 className="mb-4 text-lg font-semibold text-left text-gray-700">My Account</h3>
            <div className="grid grid-cols-2 gap-4 text-center md:grid-cols-4">
                <ActionItem icon={Ticket} label="Vouchers" href="/promo" />
                <ActionItem icon={ShoppingCart} label="Cart" href="/cart" />
                <ActionItem icon={Receipt} label="Transactions" href="/transaction" />
                <ActionItem icon={Settings} label="Settings" onClick={() => setIsEditDialogOpen(true)} />
            </div>
        </div>


        <div className="pt-6 space-y-4 border-t border-gray-200/50">
            <h3 className="mb-2 text-lg font-semibold text-left text-gray-700">Contact Details</h3>
            <InfoItem icon={User} label="Full Name" value={user.name} />
            <InfoItem icon={AtSign} label="Email Address" value={user.email} />
            <InfoItem icon={Phone} label="Phone Number" value={user.phoneNumber} />
        </div>
      </div>
      
      <EditProfileDialog
        user={user}
        isOpen={isEditDialogOpen}
        setIsOpen={setIsEditDialogOpen}
        onUpdateSuccess={refetch}
      />
    </PageWrapper>
  );
};

export default UserProfile;
