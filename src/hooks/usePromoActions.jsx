import { useState } from "react";
import axios from "axios";
import { getCookie } from "cookies-next";
import { toast } from "sonner"; // Import toast

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
        return isNaN(numericValue) ? undefined : numericValue;
    };

    const createPromo = async (data) => {
        setIsMutating(true);
        const toastId = toast.loading("Creating new promo...");
        // Always use FormData for create since an image is required
        const formData = new FormData();
        
        Object.keys(data).forEach(key => {
            if (key === 'image') {
                if (data.image instanceof File) {
                    formData.append('image', data.image);
                }
            } else if (key === 'promo_discount_price' || key === 'minimum_claim_price') {
                const numericValue = cleanAndParseInt(data[key]);
                if (numericValue !== undefined) {
                    formData.append(key, numericValue);
                }
            } else if (data[key] !== null && data[key] !== undefined) {
                formData.append(key, data[key]);
            }
        });

        try {
            const response = await api.post("/create-promo", formData, {
                headers: { 'Content-Type': 'multipart/form-data' },
            });
            toast.success("Promo created successfully!", { id: toastId });
            return response.data;
        } catch (error) {
            toast.error(error.response?.data?.message || "Failed to create promo.", { id: toastId });
            throw error;
        } finally {
            setIsMutating(false);
        }
    };

    const updatePromo = async (promoId, data) => {
        setIsMutating(true);
        const toastId = toast.loading("Updating promo...");

        // Smart logic to choose Content-Type
        const hasNewImageFile = data.image instanceof File;

        let requestPayload;
        let requestConfig;

        if (hasNewImageFile) {
            // If there's a new file, use FormData
            requestPayload = new FormData();
            Object.keys(data).forEach(key => {
                if (key === 'promo_discount_price' || key === 'minimum_claim_price') {
                    const numericValue = cleanAndParseInt(data[key]);
                    if (numericValue !== undefined) {
                        requestPayload.append(key, numericValue);
                    }
                } else if (data[key] !== null && data[key] !== undefined) {
                    requestPayload.append(key, data[key]);
                }
            });
            requestConfig = { headers: { 'Content-Type': 'multipart/form-data' } };
        } else {
            // If no new file, use regular JSON
            requestPayload = {
                title: data.title,
                description: data.description,
                promo_code: data.promo_code,
                promo_discount_price: cleanAndParseInt(data.promo_discount_price),
                minimum_claim_price: cleanAndParseInt(data.minimum_claim_price),
                terms_condition: data.terms_condition,
                // Do not send the 'image' field if it's not a new file
            };
            requestConfig = { headers: { 'Content-Type': 'application/json' } };
        }

        try {
            const response = await api.post(`/update-promo/${promoId}`, requestPayload, requestConfig);
            toast.success("Promo updated successfully!", { id: toastId });
            return response.data;
        } catch (error) {
            toast.error(error.response?.data?.message || "Failed to update promo.", { id: toastId });
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
