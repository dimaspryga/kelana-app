"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import { setCookie, getCookie, deleteCookie } from 'cookies-next';
import { toast } from "sonner";
import { motion, AnimatePresence } from 'framer-motion'; 
import { Loader2 } from 'lucide-react'; 

const AuthContext = createContext(null);

const FullScreenLoader = () => (
  <motion.div
    key="loader"
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    exit={{ opacity: 0 }}
    transition={{ duration: 0.3 }}
    className="fixed inset-0 z-50 flex items-center justify-center bg-white/80 backdrop-blur-sm"
  >
    <Loader2 className="w-12 h-12 text-blue-500 animate-spin" />
  </motion.div>
);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true); 
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [hasMounted, setHasMounted] = useState(false);
  const router = useRouter();

  useEffect(() => {
    setHasMounted(true);
  }, []);

  const checkUserLoggedIn = useCallback(async () => {
    const token = getCookie('token');
    if (token) {
      try {
        // Menggunakan API route /api/verify untuk memeriksa token
        const response = await axios.get("/api/verify");
        setUser(response.data.data);
      } catch (error) {
        console.error("Session expired or invalid.", error);
        deleteCookie('token');
        setUser(null);
      }
    }
    setLoading(false); 
  }, []);

  useEffect(() => {
    if(hasMounted) {
        checkUserLoggedIn();
    }
  }, [hasMounted, checkUserLoggedIn]);

  const login = async (email, password) => {
    setIsLoggingIn(true);
    const toastId = toast.loading("Logging in...");
    try {
      const response = await axios.post("/api/login", { email, password });
      
      const { token, user } = response.data;
      
      if (!token || !user) {
        throw new Error("Login successful, but no token or user data received.");
      }
      
      setCookie("token", token, { expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), path: "/" });
      setUser(user);
      
      toast.success("Login successful!", { id: toastId });

      setTimeout(() => {
        const params = new URLSearchParams(window.location.search);
        const redirectPath = params.get('redirect');
        if (redirectPath) {
          router.push(redirectPath);
        } else if (user.role === 'admin') {
          router.push('/dashboard');
        } else {
          router.push('/');
        }
      }, 500);
      
      return { success: true };

    } catch (err) {
      const errorMessage = err.response?.data?.message || "Login process failed.";
      toast.error(errorMessage, { id: toastId });
      console.error("Login process failed:", err);
      deleteCookie('token');
      return { success: false, message: errorMessage };
    } finally {
        setIsLoggingIn(false);
    }
  };

  const logout = async () => {
    const toastId = toast.loading("Logging out...");
    try {
      await axios.get(`/api/logout`);
      toast.success("Logout successful!", { id: toastId });
    } catch (error) {
      console.error("API logout failed, but proceeding with client-side logout:", error);
      toast.error("Logout failed, but you have been logged out locally.", { id: toastId });
    } finally {
      setUser(null);

      deleteCookie("token");
      router.push('/');
    }
  };

  const value = { user, loading, isLoggingIn, login, logout, refetchUser: checkUserLoggedIn };
  
  return (
    <AuthContext.Provider value={value}>
      <AnimatePresence mode="wait">
        {loading && hasMounted ? (
          <FullScreenLoader />
        ) : null}
      </AnimatePresence>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
