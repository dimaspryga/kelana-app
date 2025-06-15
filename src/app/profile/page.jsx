"use client";

import React from "react";
// Pastikan Anda telah menginstal hook ini dan path-nya sudah benar
import { useGetLoggedUser } from "@/hooks/useGetLoggedUser";
// Impor ikon dari lucide-react
import {
  AlertTriangle,
  User,
  Phone,
  Mail,
  RefreshCw,
  UserCircle,
  UserX,
  Edit
} from "lucide-react";

// Skeleton Loader untuk pengalaman pengguna yang lebih baik saat loading
const ProfileSkeleton = () => (
  <div className="w-full max-w-md p-8 mx-auto space-y-6 bg-white border border-gray-200 shadow-lg rounded-2xl animate-pulse">
    <div className="flex items-center space-x-6">
      <div className="w-24 h-24 bg-gray-200 rounded-full"></div>
      <div className="flex-1 space-y-4">
        <div className="w-3/4 h-6 bg-gray-200 rounded"></div>
        <div className="w-1/2 h-4 bg-gray-200 rounded"></div>
      </div>
    </div>
    <div className="pt-4 space-y-4 border-t border-gray-200">
      <div className="w-full h-5 bg-gray-200 rounded"></div>
      <div className="w-full h-5 bg-gray-200 rounded"></div>
      <div className="w-2/3 h-5 bg-gray-200 rounded"></div>
    </div>
    <div className="h-12 mt-6 bg-gray-200 rounded-lg"></div>
  </div>
);

const UserProfile = () => {
  const { user, loading, error, refetch } = useGetLoggedUser();

  // Wrapper untuk semua state agar memiliki background dan layout yang konsisten
  const PageWrapper = ({ children }) => (
    <div className="flex items-center justify-center min-h-screen p-4 font-sans text-gray-800 bg-gray-50">
      {children}
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
        <div className="w-full max-w-md p-8 text-center bg-white border-l-4 border-red-500 rounded-lg shadow-lg">
          <AlertTriangle
            className="w-16 h-16 mx-auto text-red-500"
            strokeWidth={1.5}
          />
          <h2 className="mt-4 text-2xl font-bold text-gray-900">
            Terjadi Kesalahan
          </h2>
          <p className="mt-2 text-gray-600">{error.message}</p>
          <button
            onClick={refetch}
            className="flex items-center justify-center w-full gap-2 px-4 py-3 mt-8 font-semibold text-white transition duration-300 bg-red-600 rounded-lg hover:bg-red-700 focus:outline-none focus:ring-4 focus:ring-red-300"
          >
            <RefreshCw className="w-5 h-5" />
            Coba Lagi
          </button>
        </div>
      </PageWrapper>
    );
  }

  if (!user) {
    return (
      <PageWrapper>
        <div className="w-full max-w-md p-8 text-center bg-white border-l-4 border-blue-500 rounded-lg shadow-lg">
          <UserX
            className="w-16 h-16 mx-auto text-blue-500"
            strokeWidth={1.5}
          />
          <h2 className="mt-4 text-2xl font-bold text-gray-900">
            Pengguna Tidak Ditemukan
          </h2>
          <p className="mt-2 text-gray-600">
            Sesi Anda mungkin telah berakhir. Silakan login kembali.
          </p>
        </div>
      </PageWrapper>
    );
  }

  return (
    <PageWrapper>
      <div className="w-full max-w-md p-8 mx-auto space-y-6 bg-white border border-gray-200 shadow-xl rounded-2xl">
        <div className="flex flex-col items-center text-center sm:flex-row sm:text-left sm:space-x-6">
          <div className="flex-shrink-0">
            <img
              src={user.profilePictureUrl}
              className="object-cover w-24 h-24 rounded-full shadow-md ring-4 ring-offset-2 ring-blue-500"
              onError={(e) => {
                e.target.onerror = null;
                e.target.src =
                  "https://placehold.co/96x96/e2e8f0/64748b?text=User";
              }}
            />
          </div>
          <div className="mt-4 sm:mt-0">
            <h1 className="text-2xl font-bold text-gray-900">{user.name}</h1>
          </div>
        </div>

        <div className="pt-6 space-y-4 border-t border-gray-200">
          <div className="flex items-center gap-4 text-gray-700">
            <UserCircle className="w-5 h-5 text-blue-500" />
            <span className="px-3 py-1 text-sm font-semibold tracking-wider text-teal-800 uppercase bg-teal-100 rounded-full">
              {user.role}
            </span>
          </div>
          <div className="flex items-center gap-4 text-gray-700">
            <Mail className="w-5 h-5 text-blue-500" />
            <span>{user.email}</span>
          </div>
          <div className="flex items-center gap-4 text-gray-700">
            <Phone className="w-5 h-5 text-blue-500" />
            <span>{user.phoneNumber}</span>
          </div>
        </div>

        <button
          onClick={refetch}
          className="flex items-center justify-center w-full gap-2 px-4 py-3 mt-4 font-semibold text-white transition duration-300 bg-blue-600 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-4 focus:ring-blue-300"
        >
          <Edit className="w-5 h-5" />
          Edit Data
        </button>
      </div>
    </PageWrapper>
  );
};

export default UserProfile;
