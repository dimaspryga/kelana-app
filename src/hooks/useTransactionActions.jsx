import { useState } from "react";
import axios from "axios";
import { getCookie } from "cookies-next";

// Konfigurasi API terpusat untuk hook ini
const api = axios.create({
  baseURL: "https://travel-journal-api-bootcamp.do.dibimbing.id/api/v1",
  headers: {
    apiKey: "24405e01-fbc1-45a5-9f5a-be13afcd757c",
    "Content-Type": "application/json",
  },
});

// Interceptor untuk memastikan SETIAP panggilan dari hook ini terotentikasi
api.interceptors.request.use((config) => {
  const token = getCookie("token");
  if (token) {
    config.headers["Authorization"] = `Bearer ${token}`;
  }
  return config;
});


export const useTransactionActions = () => {
    const [isMutating, setIsMutating] = useState(false);

    /**
     * Updates the status of a specific transaction.
     * @param {string} transactionId - The ID of the transaction to update.
     * @param {string} status - The new status (e.g., 'SUCCESS', 'PENDING', 'CANCELLED').
     */
    const updateTransactionStatus = async (transactionId, status) => {
        setIsMutating(true);
        try {
            const response = await api.post(`/update-transaction-status/${transactionId}`, { status });
            return response.data;
        } finally {
            setIsMutating(false);
        }
    };

    /**
     * Cancels a specific transaction.
     * @param {string} transactionId - The ID of the transaction to cancel.
     */
    const cancelTransaction = async (transactionId) => {
        setIsMutating(true);
        try {
            const response = await api.post(`/cancel-transaction/${transactionId}`);
            return response.data;
        } finally {
            setIsMutating(false);
        }
    };

    return { updateTransactionStatus, cancelTransaction, isMutating };
};
