import { useState, useEffect, useCallback } from "react";
import axios from "axios";

const api = axios.create({
  baseURL: "https://travel-journal-api-bootcamp.do.dibimbing.id/api/v1",
  headers: {
    apiKey: "24405e01-fbc1-45a5-9f5a-be13afcd757c",
    "Content-Type": "application/json",
  },
});

export const useBanner = () => {
  const [banner, setBanner] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isError, setIsError] = useState(false);
  const [error, setError] = useState(null);

  const getBanner = useCallback(async () => {
    setLoading(true);
    try {
      const response = await api.get("/banners");
      setBanner(response.data.data || []);
      setIsError(false);
    } catch (error) {
      console.error("Gagal mengambil data banner:", error);
      setIsError(true);
      setError(error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    getBanner();
  }, [getBanner]);

  return {
    banner,
    getBanner,
    loading,
    isError,
    error,
  };
};
