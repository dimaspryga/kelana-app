import { useState } from "react";
import axios from "axios";
import { getCookie } from "cookies-next";

// --- PERBAIKAN ---
// Kita duplikasi konfigurasi 'api' di sini agar konsisten.
const api = axios.create({
  baseURL: "https://travel-journal-api-bootcamp.do.dibimbing.id/api/v1",
  headers: {
    apiKey: "24405e01-fbc1-45a5-9f5a-be13afcd757c",
  },
});

api.interceptors.request.use((config) => {
  const token = getCookie("token");
  if (token) {
    config.headers["Authorization"] = `Bearer ${token}`;
  }
  return config;
});
// --- AKHIR PERBAIKAN ---


export const useUploadImage = () => {
  const [isLoading, setIsLoading] = useState(false);

  const uploadImage = async (file) => {
    setIsLoading(true);
    const formData = new FormData();
    formData.append("image", file);

    try {
      // Gunakan instance 'api' yang sudah dikonfigurasi.
      // Header otentikasi akan ditambahkan otomatis oleh interceptor.
      const response = await api.post("/upload-image", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      return response.data.url;
    } catch (err) {
      console.error(
        "Error uploading image:",
        err.response?.data || err.message
      );
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    uploadImage,
    isLoading,
  };
};
