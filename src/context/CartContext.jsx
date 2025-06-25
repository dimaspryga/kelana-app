"use client";

import React, { createContext, useState, useEffect, useCallback } from "react";
import { toast } from "sonner";
import axios from "axios"; // Gunakan axios untuk konsistensi

const API_BASE_URL = "/api"; // Gunakan path API lokal

export const CartContext = createContext(null);

export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchCart = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await axios.get(`${API_BASE_URL}/carts`);
      setCartItems(response.data.data || []);
    } catch (err) {
      const errorMessage = err.response?.data?.message || "Failed to fetch cart data.";
      setError(errorMessage);
      // Hanya tampilkan toast jika bukan error 401 (not authenticated)
      if (err.response?.status !== 401) {
          toast.error(errorMessage);
      }
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCart();
  }, [fetchCart]);

  const addToCart = async (activityId, quantity) => {
    const promise = new Promise(async (resolve, reject) => {
      for (let i = 0; i < quantity; i++) {
        try {
            await axios.post(`${API_BASE_URL}/add-cart`, { activityId });
        } catch (err) {
             const errorData = err.response?.data;
             return reject(
                new Error(errorData?.message || `Failed to add item #${i + 1}.`)
             );
        }
      }
      return resolve({ quantity });
    });

    toast.promise(promise, {
      loading: `Adding ${quantity} item to cart...`,
      success: (data) => {
        fetchCart();
        return `${data.quantity} Item successfully added!`;
      },
      error: (err) => {
        fetchCart();
        return err.message || "Failed to add item.";
      },
    });
  };

  const updateItemQuantity = async (cartItemId, newQuantity) => {
    if (newQuantity < 1) {
      removeFromCart(cartItemId);
      return;
    }
    
    const toastId = toast.loading("Updating quantity...");
    try {
      await axios.post(`${API_BASE_URL}/update-cart/${cartItemId}`, { quantity: newQuantity });
      toast.success("Quantity updated successfully.", { id: toastId });
      await fetchCart();
    } catch (err) {
      const errorMessage = err.response?.data?.message || "Failed to update quantity.";
      toast.error(errorMessage, { id: toastId });
    }
  };

  const removeFromCart = async (cartItemId) => {
    const toastId = toast.loading("Deleting item...");
    try {
      await axios.delete(`${API_BASE_URL}/delete-cart/${cartItemId}`);
      toast.success("Item deleted successfully.", { id: toastId });
      await fetchCart();
    } catch (err) {
       const errorMessage = err.response?.data?.message || "Failed to delete item.";
       toast.error(errorMessage, { id: toastId });
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
