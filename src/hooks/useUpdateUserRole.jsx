import { useState } from "react";
import axios from "axios";
import { getCookie } from "cookies-next";

const API_BASE_URL = "https://travel-journal-api-bootcamp.do.dibimbing.id/api/v1";

export const useUpdateUserRole = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [data, setData] = useState(null);

  const updateUserRole = async (userId, role) => {
    setLoading(true);
    setError(null);
    setData(null);

    const token = getCookie("token");
    if (!token) {
      setError(new Error("No authentication token found. Please login again."));
      setLoading(false);
      return;
    }

    try {
      const response = await axios.post(
        `${API_BASE_URL}/update-user-role/${userId}`,
        { role }, // Body request adalah objek JSON
        {
          headers: {
            apiKey: "24405e01-fbc1-45a5-9f5a-be13afcd757c", // API Key Anda
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setData(response.data);
    } catch (err) {
      const errorMessage = err.response?.data?.message || err.message || "An unexpected error occurred.";
      setError(new Error(errorMessage));
    } finally {
      setLoading(false);
    }
  };

  return { updateUserRole, loading, error, data };
};