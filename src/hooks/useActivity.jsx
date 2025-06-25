import axios from "axios";
import { useState, useEffect, useCallback } from "react";

export const useActivity = () => {
  const [activity, setActivity] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchActivities = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      // Panggil API route lokal, bukan API eksternal
      const response = await axios.get("/api/activities");
      setActivity(response.data.data || []);
    } catch (err) {
      console.error("Failed to fetch activities:", err);
      setError(err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchActivities();
  }, [fetchActivities]);

  return {
    activity,
    isLoading,
    error,
    refetch: fetchActivities,
  };
};
