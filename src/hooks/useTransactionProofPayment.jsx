import { useState } from "react";
import axios from "axios";
import { getCookie } from "cookies-next";

export const useTransactionProofPayment = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const submitProofUrl = async (transactionId, imageUrl) => {
    setIsLoading(true);
    setError(null);
    const payload = { proofPaymentUrl: imageUrl };

    try {
      const token = getCookie('token');
      const response = await axios.post(
        `https://travel-journal-api-bootcamp.do.dibimbing.id/api/v1/update-transaction-proof-payment/${transactionId}`,
        payload,
        {
          headers: {
            "Content-Type": "application/json",
            apiKey: '24405e01-fbc1-45a5-9f5a-be13afcd757c',
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setIsLoading(false);
      return response.data;
    } catch (err) {
      setIsLoading(false);
      console.error("Error submitting proof URL:", err.response?.data || err.message);
      throw err;
    }
  };

  return {
    submitProofUrl,
    isLoading,
    error,
  };
};