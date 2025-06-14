'use client';

import React, { createContext, useState, useCallback } from 'react';
import axios from 'axios';
import { getCookie } from 'cookies-next';

// 1. Definisikan dan ekspor Context
export const TransactionContext = createContext(null);

// 2. Definisikan dan ekspor Provider
export const TransactionProvider = ({ children }) => {
  const [transactions, setTransactions] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchTransactions = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const token = getCookie('token');
      const response = await axios.get(
        "https://travel-journal-api-bootcamp.do.dibimbing.id/api/v1/my-transactions",
        {
          headers: {
            apiKey: "24405e01-fbc1-45a5-9f5a-be13afcd757c",
            Authorization: `Bearer ${token}`
          },
        }
      );
      console.log(response.data.data);
      const sortedData = response.data.data.sort((a, b) => new Date(b.orderDate) - new Date(a.orderDate));
      setTransactions(sortedData);
    } catch (err) {
      const errorMessage = err.response?.data?.message || "Gagal memuat riwayat transaksi.";
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const value = {
    transactions,
    isLoading,
    error,
    fetchTransactions,
  };

  return (
    <TransactionContext.Provider value={value}>
      {children}
    </TransactionContext.Provider>
  );
};