import { useState } from "react";
import axios from "axios";
import { getCookie } from "cookies-next";

export const useUploadImage = () => {
  const [isLoading, setIsLoading] = useState(false);

  const uploadImage = async (file) => {
    setIsLoading(true);
    const formData = new FormData();
    // 'image' adalah key yang umum, sesuaikan jika backend Anda menggunakan nama lain
    formData.append('image', file); 

    try {
      const token = getCookie('token');
      const response = await axios.post(
        "https://travel-journal-api-bootcamp.do.dibimbing.id/api/v1/upload-image",
        formData,
        {
          headers: {
            apiKey: '24405e01-fbc1-45a5-9f5a-be13afcd757c',
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setIsLoading(false);
      // Ambil URL dari respons API Anda
      return response.data.url;

    } catch (err) {
      setIsLoading(false);
      console.error("Error uploading image to own server:", err.response?.data || err.message);
      throw new Error("Gagal mengunggah gambar.");
    }
  };

  return {
    uploadImage,
    isLoading,
  };
};