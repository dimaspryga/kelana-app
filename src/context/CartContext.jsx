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

  const addToCart = async (activityId, quantity = 1) => {
    if (!user) {
        toast.error("Please log in to add items to your cart.");
        return;
    }

    console.log('Adding to cart:', { activityId, quantity });
    
    const toastId = toast.loading("Adding to cart...");
    try {
      const response = await axios.post(`${API_BASE_URL}/cart-add`, { activityId, quantity });
      console.log('Add to cart response:', response.data);
      toast.success("Added to cart successfully.", { id: toastId });
      await fetchCart();
    } catch (err) {
      console.error('Add to cart error:', err.response?.data || err.message);
      const errorMessage = err.response?.data?.message || "Failed to add to cart.";
      toast.error(errorMessage, { id: toastId });
      throw err; // Re-throw to let the UI handle the error
    }
  };

  const updateItemQuantity = async (cartItemId, newQuantity) => {
    if (!user) {
        toast.error("Please log in to update your cart.");
        return;
    }

    console.log('Updating quantity:', { cartItemId, newQuantity });

    if (newQuantity < 1) {
      removeFromCart(cartItemId);
      return;
    }
    
    const toastId = toast.loading("Updating quantity...");
    try {
      const response = await axios.post(`${API_BASE_URL}/cart-update/${cartItemId}`, { quantity: newQuantity });
      console.log('Update quantity response:', response.data);
      toast.success("Quantity updated successfully.", { id: toastId });
      await fetchCart();
    } catch (err) {
      console.error('Update quantity error:', err.response?.data || err.message);
      const errorMessage = err.response?.data?.message || "Failed to update quantity.";
      toast.error(errorMessage, { id: toastId });
      throw err; // Re-throw to let the UI handle the error
    }
  };

  const removeFromCart = async (cartItemId) => {
    if (!user) {
        toast.error("Please log in to remove items from your cart.");
        return;
    }

    console.log('Removing from cart:', cartItemId);
    
    const toastId = toast.loading("Removing from cart...");
    try {
      const response = await axios.delete(`${API_BASE_URL}/cart-delete/${cartItemId}`);
      console.log('Remove from cart response:', response.data);
      toast.success("Removed from cart successfully.", { id: toastId });
      await fetchCart();
    } catch (err) {
      console.error('Remove from cart error:', err.response?.data || err.message);
      const errorMessage = err.response?.data?.message || "Failed to remove from cart.";
      toast.error(errorMessage, { id: toastId });
      throw err; // Re-throw to let the UI handle the error
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
