// hooks/useGeneratePaymentMethod.js

import { useState } from "react";
import axios from "axios";
import { getCookie } from "cookies-next";

export const useGeneratePaymentMethod = () => {

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const generatePayment = async (payload) => {
    setIsLoading(true);
    setError(null);
    try {
      const token = getCookie('token');

      const response = await axios.post(
        "https://travel-journal-api-bootcamp.do.dibimbing.id/api/v1/generate-payment-methods", 
        payload, 
        {
          headers: {
            "Content-Type": "application/json",
            apiKey: "24405e01-fbc1-45a5-9f5a-be13afcd757c",
            Authorization: `Bearer ${token}`,
          },
        }
      );
      
      setIsLoading(false);
      return response.data.data;

    } catch (err) {
      console.error("Payment generation failed:", err);
      const errorMessage = err.response?.data?.message || "Terjadi kesalahan saat memproses pembayaran.";
      setError(errorMessage);
      setIsLoading(false);
      throw new Error(errorMessage);
    }
  };

  return {
    generatePayment,
    isLoading,
    error,
  };
};