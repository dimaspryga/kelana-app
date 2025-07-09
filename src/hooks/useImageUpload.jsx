import { useState } from "react";
import axios from "axios";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/api";

export const useImageUpload = () => {
  const [isUploading, setIsUploading] = useState(false);

  const uploadImage = async (file) => {
    if (!file) return null;

    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append("image", file);

      const response = await axios.post(`${API_BASE_URL}/upload`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      return response.data.url;
    } catch (error) {
      console.error("Error uploading image:", error);
      throw new Error("Failed to upload image");
    } finally {
      setIsUploading(false);
    }
  };

  return {
    uploadImage,
    isUploading,
  };
}; 