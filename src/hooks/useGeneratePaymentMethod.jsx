// hooks/useGeneratePaymentMethod.js

import { useState } from "react";
import axios from "axios";
import { getCookie } from "cookies-next";

export const useGeneratePaymentMethod = () => {
  // State untuk melacak status proses pembayaran
  const [isLoading, setIsLoading] = useState(false);
  // State untuk menyimpan pesan error jika pembayaran gagal
  const [error, setError] = useState(null);

  // Ini adalah fungsi utama yang akan dipanggil oleh komponen
  // Menerima 'payload' sebagai argumen, berisi semua data yang dibutuhkan API
  const generatePayment = async (payload) => {
    setIsLoading(true);
    setError(null);
    try {
      const token = getCookie('token');

      // Panggil API untuk membuat transaksi/booking
      // PERBAIKAN KUNCI:
      // - Parameter kedua adalah 'payload' (body dari request)
      // - Parameter ketiga adalah objek konfigurasi yang berisi 'headers'
      const response = await axios.post(
        "https://travel-journal-api-bootcamp.do.dibimbing.id/api/v1/generate-payment-methods", 
        payload, // Body request berisi detail booking
        {
          headers: {
            "Content-Type": "application/json",
            apiKey: "24405e01-fbc1-45a5-9f5a-be13afcd757c",
            Authorization: `Bearer ${token}`,
          },
        }
      );
      
      setIsLoading(false);
      // Mengembalikan data jika berhasil, agar komponen bisa merespon
      return response.data.data;

    } catch (err) {
      console.error("Payment generation failed:", err);
      const errorMessage = err.response?.data?.message || "Terjadi kesalahan saat memproses pembayaran.";
      setError(errorMessage);
      setIsLoading(false);
      // Melempar error agar bisa ditangkap oleh komponen jika perlu
      throw new Error(errorMessage);
    }
  };

  // Hook ini tidak lagi menggunakan useEffect
  // Hanya mengembalikan fungsi dan state-nya
  return {
    generatePayment,
    isLoading,
    error,
  };
};