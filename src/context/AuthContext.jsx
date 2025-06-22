"use client";

import React, { createContext, useContext, useState, useEffect } from 'react';
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
    className="fixed inset-0 z-50 flex items-center justify-center bg-white"
  >
    <Loader2 className="w-12 h-12 text-blue-500 animate-spin" />
  </motion.div>
);


export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true); 
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  // State untuk memastikan komponen hanya merender UI dinamis di sisi klien
  const [hasMounted, setHasMounted] = useState(false);
  const router = useRouter();

  useEffect(() => {
    // Setelah komponen terpasang di klien, set state ini.
    // Ini mencegah logika loading berjalan di server.
    setHasMounted(true);
  }, []);

  useEffect(() => {
    const checkUserLoggedIn = async () => {
      const token = getCookie('token');
      if (token) {
        try {
          const response = await axios.get("https://travel-journal-api-bootcamp.do.dibimbing.id/api/v1/user", {
            headers: {
              apiKey: '24405e01-fbc1-45a5-9f5a-be13afcd757c',
              Authorization: `Bearer ${token}`
            }
          });
          setUser(response.data.data);
        } catch (error) {
          console.error("Session expired or invalid.", error);
          deleteCookie('token');
          setUser(null);
        }
      }
      setLoading(false); 
    };

    checkUserLoggedIn();
  }, []);

  const login = async (email, password) => {
    setIsLoggingIn(true);
    try {
      const loginRes = await fetch("/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const loginData = await loginRes.json();
      if (!loginRes.ok) throw new Error(loginData.message || "Login failed.");

      let token;
      if (loginData?.data?.token) token = loginData.data.token;
      else if (loginData?.token) token = loginData.token;

      if (!token) throw new Error("Login successful, but no token received.");
      
      setCookie("token", token, { expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), path: "/" });

      const userRes = await axios.get("https://travel-journal-api-bootcamp.do.dibimbing.id/api/v1/user", {
          headers: { apiKey: '24405e01-fbc1-45a5-9f5a-be13afcd757c', Authorization: `Bearer ${token}` }
      });
      const user = userRes.data.data;
      setUser(user);

      setTimeout(() => {
        const params = new URLSearchParams(window.location.search);
        const redirectPath = params.get('redirect');
        if (redirectPath) router.push(redirectPath);
        else if (user.role === 'admin') router.push('/dashboard');
        else router.push('/');
      }, 1000);
      
      return { success: true };
    } catch (err) {
      setIsLoggingIn(false);
      console.error("Login process failed:", err);
      deleteCookie('token');
      return { success: false, message: err.message };
    }
  };

  const logout = async () => {
    try {
      const token = getCookie("token");
      if (token) {
        await axios.get(`https://travel-journal-api-bootcamp.do.dibimbing.id/api/v1/logout`, {
          headers: { Authorization: `Bearer ${token}`, apiKey: '24405e01-fbc1-45a5-9f5a-be13afcd757c' },
        });
      }
    } catch (error) {
      console.error("API logout failed, but proceeding with client-side logout:", error);
    } finally {
      deleteCookie("token");
      setUser(null);
      toast.success("Logout successful!");
      router.push('/');
    }
  };

  const value = { user, loading, isLoggingIn, login, logout };
  
  // --- PERBAIKAN UTAMA DI SINI ---
  // Selalu render {children} pada render pertama di server dan klien.
  // Logika loader hanya akan aktif setelah komponen ter-mount di klien.
  return (
    <AuthContext.Provider value={value}>
      <AnimatePresence mode="wait">
        {loading && hasMounted ? (
          <FullScreenLoader />
        ) : null}
      </AnimatePresence>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
