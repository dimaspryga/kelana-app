"use client";

import React, { createContext, useState, useEffect, useCallback } from "react";
import { toast } from "sonner";
import axios from "axios";
import { useAuth } from '@/context/AuthContext';

const API_BASE_URL = "/api"; 

export const CartContext = createContext(null);

export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const { user, loading: loadingAuth, logout } = useAuth();

  const fetchCart = useCallback(async () => {
    if (loadingAuth) {
      setIsLoading(true);
      return; 
    }

    if (!user) {
      setCartItems([]);
      setIsLoading(false);
      setError(null);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await axios.get(`${API_BASE_URL}/carts`);
      setCartItems(response.data.data || []);
    } catch (err) {
      const errorMessage = err.response?.data?.message || "Failed to fetch cart data.";
      setError(errorMessage);

      if (err.response?.status === 401) {
          toast.error("Session expired or unauthorized. Please log in again.");
          logout();
      } else {
          toast.error(errorMessage);
      }
      setCartItems([]);
    } finally {
      setIsLoading(false);
    }
  }, [user, loadingAuth, logout]);

  useEffect(() => {
    fetchCart();
  }, [fetchCart]);

  const addToCart = async (activityId, quantity) => {
    if (!user) {
        toast.error("Please log in to add items to your cart.");
        return;
    }

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
    if (!user) {
        toast.error("Please log in to update your cart.");
        return;
    }

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
    if (!user) {
        toast.error("Please log in to remove items from your cart.");
        return;
    }

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
