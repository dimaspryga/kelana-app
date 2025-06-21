"use client";

import React, { createContext, useState, useEffect, useCallback } from "react";
import { getCookie } from "cookies-next";
import { toast } from "sonner";

// Define API constants
const API_BASE_URL = "https://travel-journal-api-bootcamp.do.dibimbing.id";
const API_KEY = "24405e01-fbc1-45a5-9f5a-be13afcd757c";

export const CartContext = createContext(null);

export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const token = getCookie("token");

  // Standard function to fetch cart data from the server
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
        throw new Error(result.message || "Failed to fetch cart data.");
      setCartItems(result.data || []);
    } catch (err) {
      setError(err.message);
      // Toast notification for error during initial fetch
      toast.error(err.message || "Failed to fetch cart data.");
    } finally {
      setIsLoading(false);
    }
  }, [token]);

  useEffect(() => {
    fetchCart();
  }, [fetchCart]);

  // Using toast.promise for addToCart
  const addToCart = async (activityId, quantity) => {
    const promise = new Promise(async (resolve, reject) => {
      // This API ignores 'quantity', so we call it repeatedly
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
          // Stop the process and reject the promise if one fails
          return reject(
            new Error(
              errorData.message || `Failed to add item #${i + 1}.`
            )
          );
        }
      }
      // Resolve the promise if all succeed
      return resolve({ quantity });
    });

    // Display toast based on promise status
    toast.promise(promise, {
      loading: `Adding ${quantity} item(s) to the cart...`,
      success: (data) => {
        fetchCart(); // Fetch the latest cart data after success
        return `${data.quantity} item(s) successfully added to the cart!`;
      },
      error: (err) => {
        fetchCart(); // Still refresh for synchronization
        return err.message || "An error occurred while adding the item.";
      },
    });
  };

  // Using toast for confirmation and error notifications
  const updateItemQuantity = async (cartItemId, newQuantity) => {
    // If the new quantity is less than 1, show a confirmation to delete
    if (newQuantity < 1) {
      toast.warning("Quantity will be 0. Delete this item?", {
        action: {
          label: "Delete",
          onClick: () => removeFromCart(cartItemId),
        },
        cancel: {
          label: "Cancel",
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
        throw new Error(errData.message || "Failed to update quantity.");
      }

      toast.success("Quantity updated successfully.");
      await fetchCart(); // Re-fetch for synchronization
    } catch (err) {
      toast.error(err.message);
      console.error("Failed to update quantity:", err);
    }
  };

  // Using toast for error notifications
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
        throw new Error(errData.message || "Failed to remove item.");
      }
      // Let the calling component provide the success notification if needed
      // to avoid double notifications
      await fetchCart();
    } catch (err) {
      toast.error(err.message || "Failed to remove item.");
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
