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
      const response = await axios.get(
        "https://travel-journal-api-bootcamp.do.dibimbing.id/api/v1/activities",
        {
          headers: {
            "Content-Type": "application/json",
            apiKey: "24405e01-fbc1-45a5-9f5a-be13afcd757c",
          },
        }
      );

      setActivity(response.data.data || []);
    } catch (err) {
      console.error("Error fetching activities:", err);

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
