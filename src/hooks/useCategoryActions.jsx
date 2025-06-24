import { useState } from "react";
import axios from "axios";
import { getCookie } from "cookies-next";
import { toast } from "sonner";

const API_BASE_URL =
  "https://travel-journal-api-bootcamp.do.dibimbing.id/api/v1";
const API_KEY = "24405e01-fbc1-45a5-9f5a-be13afcd757c";

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    apiKey: API_KEY,
  },
});

api.interceptors.request.use((config) => {
  const token = getCookie("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const useCategoryActions = () => {

  const [isMutating, setIsMutating] = useState(false);

  const createCategory = async (data) => {
    setIsMutating(true);
    const loadingToast = toast.loading("Creating new category...");
    try {
      const formData = new FormData();
      formData.append("name", data.name);
      formData.append("imageUrl", data.imageFile);

      const response = await api.post("/create-category", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      toast.success(response.data.message || "Category created successfully!", {
        id: loadingToast,
      });
      return response.data;
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to create category.", {
        id: loadingToast,
      });
      throw err;
    } finally {
      setIsMutating(false);
    }
  };

  const updateCategory = async (categoryId, data) => {
    setIsMutating(true);
    const loadingToast = toast.loading("Updating category...");
    try {
      const formData = new FormData();
      formData.append("name", data.name);
      if (data.imageFile) {
        formData.append("imageUrl", data.imageFile);
      }

      const response = await api.post(
        `/update-category/${categoryId}`,
        formData,
        {
          headers: { "Content-Type": "multipart/form-data" },
        }
      );

      toast.success(response.data.message || "Category updated successfully!", {
        id: loadingToast,
      });
      return response.data;
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to update category.", {
        id: loadingToast,
      });
      throw err;
    } finally {
      setIsMutating(false);
    }
  };

  const deleteCategory = async (categoryId) => {
    setIsMutating(true);
    try {
      const response = await api.delete(`/delete-category/${categoryId}`);
      return response.data;
    } catch (err) {
      throw err;
    } finally {
      setIsMutating(false);
    }
  };

  return { createCategory, updateCategory, deleteCategory, isMutating };
};
