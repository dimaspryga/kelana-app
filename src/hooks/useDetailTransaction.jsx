'use client';

import { useState, useCallback } from "react";
import axios from "axios";
import { getCookie } from "cookies-next";


export const useDetailTransaction = () => {
  const [transactionDetail, setTransactionDetail] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchTransactionDetail = useCallback(async (transactionId) => {
    if (!transactionId) {
      setError("ID Transaksi tidak ditemukan.");
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);
    
    try {
      const token = getCookie('token');
      const response = await axios.get(
        `https://travel-journal-api-bootcamp.do.dibimbing.id/api/v1/transaction/${transactionId}`,
        {
          headers: {
            apiKey: '24405e01-fbc1-45a5-9f5a-be13afcd757c',
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setTransactionDetail(response.data.data);
    } catch (err) {
      const errorMessage = err.response?.data?.message || "Gagal mengambil detail transaksi.";
      setError(errorMessage);
      console.error("Failed to fetch transaction detail:", err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  return {
    transactionDetail,
    isLoading,
    error,
    fetchTransactionDetail,
  };
};