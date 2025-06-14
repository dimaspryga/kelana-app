"use client";

import React, { createContext, useState, useEffect, useCallback } from "react";
import { getCookie } from "cookies-next";
import { toast } from "sonner"; // --- PERBAIKAN: Impor toast dari sonner

// PENTING:
// File ini adalah Context Provider dan tidak merender UI.
// Pastikan Anda telah menambahkan komponen <Toaster /> di file layout utama Anda
// (misal: app/layout.tsx) agar notifikasi toast ini dapat ditampilkan.

// Definisikan konstanta API
const API_BASE_URL = "https://travel-journal-api-bootcamp.do.dibimbing.id";
const API_KEY = "24405e01-fbc1-45a5-9f5a-be13afcd757c";

export const CartContext = createContext(null);

export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const token = getCookie("token");

  // Fungsi standar untuk mengambil data keranjang dari server
  const fetchCart = useCallback(async () => {
    if (!token) {
      setIsLoading(false);
      setCartItems([]);
      return;
    }
    setIsLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/api/v1/carts`, {
        method: "GET",
        headers: { apiKey: API_KEY, Authorization: `Bearer ${token}` },
      });
      const result = await response.json();
      if (!response.ok)
        throw new Error(result.message || "Gagal mengambil data keranjang.");
      setCartItems(result.data || []);
    } catch (err) {
      setError(err.message);
      // Notifikasi toast untuk error saat fetch data awal
      toast.error(err.message || "Gagal mengambil data keranjang.");
    } finally {
      setIsLoading(false);
    }
  }, [token]);

  useEffect(() => {
    fetchCart();
  }, [fetchCart]);

  // --- PERBAIKAN: Menggunakan toast.promise untuk addToCart ---
  const addToCart = async (activityId, quantity) => {
    const promise = new Promise(async (resolve, reject) => {
      // API ini mengabaikan 'quantity', jadi kita panggil berulang
      for (let i = 0; i < quantity; i++) {
        const response = await fetch(`${API_BASE_URL}/api/v1/add-cart`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            apiKey: API_KEY,
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ activityId }),
        });
        if (!response.ok) {
          const errorData = await response.json();
          // Hentikan proses dan tolak promise jika ada satu yang gagal
          return reject(
            new Error(
              errorData.message || `Gagal menambahkan item ke-${i + 1}.`
            )
          );
        }
      }
      // Selesaikan promise jika semua berhasil
      return resolve({ quantity });
    });

    // Tampilkan toast berdasarkan status promise
    toast.promise(promise, {
      loading: `Menambahkan ${quantity} item ke keranjang...`,
      success: (data) => {
        fetchCart(); // Ambil data keranjang terbaru setelah berhasil
        return `${data.quantity} item berhasil ditambahkan ke keranjang!`;
      },
      error: (err) => {
        fetchCart(); // Tetap refresh untuk sinkronisasi
        return err.message || "Terjadi kesalahan saat menambahkan item.";
      },
    });
  };

  // --- PERBAIKAN: Menggunakan toast untuk konfirmasi dan notifikasi error ---
  const updateItemQuantity = async (cartItemId, newQuantity) => {
    // Jika kuantitas baru kurang dari 1, tampilkan konfirmasi untuk menghapus
    if (newQuantity < 1) {
      toast.warning("Kuantitas akan menjadi 0. Hapus item ini?", {
        action: {
          label: "Hapus",
          onClick: () => removeFromCart(cartItemId),
        },
        cancel: {
          label: "Batal",
        },
      });
      return;
    }

    try {
      const response = await fetch(
        `${API_BASE_URL}/api/v1/update-cart/${cartItemId}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            apiKey: API_KEY,
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ quantity: newQuantity }),
        }
      );

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.message || "Gagal mengubah kuantitas.");
      }

      toast.success("Kuantitas berhasil diperbarui.");
      await fetchCart(); // Fetch ulang untuk sinkronisasi
    } catch (err) {
      toast.error(err.message);
      console.error("Failed to update quantity:", err);
    }
  };

  // --- PERBAIKAN: Menggunakan toast untuk notifikasi error ---
  const removeFromCart = async (cartItemId) => {
    try {
      const response = await fetch(
        `${API_BASE_URL}/api/v1/delete-cart/${cartItemId}`,
        {
          method: "DELETE",
          headers: { apiKey: API_KEY, Authorization: `Bearer ${token}` },
        }
      );
      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.message || "Gagal menghapus item.");
      }
      // Biarkan komponen pemanggil yang memberikan notifikasi sukses jika perlu
      // agar tidak ada notifikasi ganda
      await fetchCart();
    } catch (err) {
      toast.error(err.message || "Gagal menghapus item.");
      console.error("Failed to remove item:", err);
    }
  };

  const value = {
    cartItems,
    cartCount: cartItems.reduce(
      (total, item) => total + (item.quantity || 0),
      0
    ),
    isLoading,
    error,
    addToCart,
    updateItemQuantity,
    removeFromCart,
    refetchCart: fetchCart,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};
