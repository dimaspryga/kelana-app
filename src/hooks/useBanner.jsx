import { useState, useEffect, useCallback } from "react";
import axios from "axios";

const api = axios.create();

export const useBanner = () => {
  const [banner, setBanner] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isError, setIsError] = useState(false);
  const [error, setError] = useState(null);

  const getBanner = useCallback(async () => {
    setLoading(true);
    try {
      const response = await api.get("/api/banners");
      setBanner(response.data.data || []);
      setIsError(false);
    } catch (error) {
      console.error("Failed to fetch banner:", error);
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
