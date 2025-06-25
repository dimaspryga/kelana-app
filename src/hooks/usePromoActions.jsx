import { useState } from "react";
import axios from "axios";
import { getCookie } from "cookies-next";
import { toast } from "sonner";

// Centralized API configuration for this hook
const api = axios.create({
  baseURL: "https://travel-journal-api-bootcamp.do.dibimbing.id/api/v1",
  headers: {
    apiKey: "24405e01-fbc1-45a5-9f5a-be13afcd757c",
  },
});

// Interceptor to ensure EVERY call from this hook is authenticated
api.interceptors.request.use((config) => {
  const token = getCookie("token");
  if (token) {
    config.headers["Authorization"] = `Bearer ${token}`;
  }
  return config;
});

export const usePromoActions = () => {
    const [isMutating, setIsMutating] = useState(false);

    // Helper function to clean string data into a pure number
    const cleanAndParseInt = (value) => {
        const numericString = String(value).replace(/[^0-9]/g, '');
        const numericValue = parseInt(numericString, 10);
        return isNaN(numericValue) ? 0 : numericValue;
    };

    const createPromo = async (data) => {
        setIsMutating(true);
        const toastId = toast.loading("Creating new promo...");
        
        const payload = {
            title: data.title,
            description: data.description,
            terms_condition: data.terms_condition,
            promo_code: data.promo_code,
            promo_discount_price: cleanAndParseInt(data.promo_discount_price),
            minimum_claim_price: cleanAndParseInt(data.minimum_claim_price),
            imageUrl: data.imageUrl, // Using the already uploaded imageUrl
        };

        try {
            const response = await api.post("/create-promo", payload, {
                headers: { 'Content-Type': 'application/json' },
            });
            toast.success("Promo created successfully!", { id: toastId });
            return response.data;
        } catch (error) {
            const serverErrors = error.response?.data?.errors;
            const errorMessage = serverErrors ? serverErrors.map(e => e.message).join(', ') : "Failed to create promo.";
            toast.error(errorMessage, { id: toastId });
            throw error;
        } finally {
            setIsMutating(false);
        }
    };

    const updatePromo = async (promoId, data) => {
        setIsMutating(true);
        const toastId = toast.loading("Updating promo...");
        
        const payload = {
            title: data.title,
            description: data.description,
            terms_condition: data.terms_condition,
            promo_code: data.promo_code,
            promo_discount_price: cleanAndParseInt(data.promo_discount_price),
            minimum_claim_price: cleanAndParseInt(data.minimum_claim_price),
            imageUrl: data.imageUrl,
        };

        try {
            const response = await api.post(`/update-promo/${promoId}`, payload, {
                headers: { 'Content-Type': 'application/json' },
            });
            toast.success("Promo updated successfully!", { id: toastId });
            return response.data;
        } catch (error) {
            const serverErrors = error.response?.data?.errors;
            const errorMessage = serverErrors ? serverErrors.map(e => e.message).join(', ') : "Failed to update promo.";
            toast.error(errorMessage, { id: toastId });
            throw error;
        } finally {
            setIsMutating(false);
        }
    };

    const deletePromo = async (promoId) => {
        setIsMutating(true);
        const toastId = toast.loading("Deleting promo...");
        try {
            const response = await api.delete(`/delete-promo/${promoId}`);
            toast.success("Promo deleted successfully!", { id: toastId });
            return response.data;
        } catch (error) {
            toast.error(error.response?.data?.message || "Failed to delete promo.", { id: toastId });
            throw error;
        } finally {
            setIsMutating(false);
        }
    };

    return { createPromo, updatePromo, deletePromo, isMutating };
};
