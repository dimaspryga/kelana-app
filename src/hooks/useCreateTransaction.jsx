import { useState } from "react";
import axios from "axios";
import { getCookie } from "cookies-next";

export const useCreateTransaction = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  // Fungsi ini SEKARANG MENERIMA PAYLOAD
  const createTransaction = async (payload) => {
    setIsLoading(true);
    setError(null);
    try {
      const token = getCookie('token');
      const response = await axios.post(
        "https://travel-journal-api-bootcamp.do.dibimbing.id/api/v1/create-transaction",
        payload, // Mengirim payload { cartIds, paymentMethodId }
        {
          headers: {
            "Content-Type": "application/json",
            apiKey: "24405e01-fbc1-45a5-9f5a-be13afcd757c",
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setIsLoading(false);
      return response.data;

    } catch (err) {
      setIsLoading(false);
      console.error("Error during create-transaction:", err);
      // Lempar error agar bisa ditangkap oleh komponen dan menampilkan log detail
      throw err;
    }
  };

  return {
    createTransaction,
    isLoading,
    error,
  };
};