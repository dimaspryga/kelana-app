import { useState } from "react";
import axios from "axios";
import { getCookie } from "cookies-next";

export const useCancelTransaction = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const cancelTransaction = async (transactionId) => {
    setIsLoading(true);
    setError(null);

    try {
      const token = getCookie('token');
      const response = await axios.post(
        `https://travel-journal-api-bootcamp.do.dibimbing.id/api/v1/cancel-transaction/${transactionId}`,
        {},
        {
          headers: {
            apiKey: '24405e01-fbc1-45a5-9f5a-be13afcd757c',
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setIsLoading(false);
      return response.data;
    } catch (err) {
      setIsLoading(false);
      console.error("Error cancelling transaction:", err.response?.data || err.message);
      throw err;
    }
  };

  return {
    cancelTransaction,
    isLoading,
    error,
  };
};