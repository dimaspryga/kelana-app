import { useState } from "react";
import axios from "axios";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/api";

export const useImageUploadMultiple = () => {
  const [isUploading, setIsUploading] = useState(false);

  const uploadImages = async (files) => {
    if (!files || files.length === 0) return [];

    setIsUploading(true);
    try {
      const uploadPromises = files.map(async (file) => {
        const formData = new FormData();
        formData.append("image", file);

        const response = await axios.post(`${API_BASE_URL}/upload`, formData, {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        });

        return response.data.url;
      });

      const urls = await Promise.all(uploadPromises);
      return urls;
    } catch (error) {
      console.error("Error uploading images:", error);
      throw new Error("Failed to upload images");
    } finally {
      setIsUploading(false);
    }
  };

  return {
    uploadImages,
    isUploading,
  };
}; 