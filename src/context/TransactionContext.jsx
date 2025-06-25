'use client';

import React, { createContext, useState, useCallback } from 'react';
import axios from 'axios';

export const TransactionContext = createContext(null);

export const TransactionProvider = ({ children }) => {
  const [transactions, setTransactions] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchTransactions = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await axios.get("/api/my-transactions");
      
      const sortedData = response.data.data.sort((a, b) => new Date(b.orderDate) - new Date(a.orderDate));
      setTransactions(sortedData);
    } catch (err) {
      const errorMessage = err.response?.data?.message || "Failed to load transaction history.";
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
