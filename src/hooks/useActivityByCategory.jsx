import { useState, useEffect } from "react";
import axios from "axios";

export const useActivityByCategory = (id) => {
  const [activityByCategory, setActivityByCategory] = useState([]);

  const getActivityByCategory = async (id) => {
    try {
      const response = await axios.get(
        `https://travel-journal-api-bootcamp.do.dibimbing.id/api/v1/activities-by-category/${id}`,
        {
          headers: {
            "Content-Type": "application/json",
            apiKey: "24405e01-fbc1-45a5-9f5a-be13afcd757c",
          },
        }
      );
      console.log("API Response:", response.data.data); // debug
      setActivityByCategory(response.data.data || []);
    } catch (error) {
      console.error("API Error:", error);
    }
  };

  useEffect(() => {
    if (id) getActivityByCategory(id);
  }, [id]);

  return {
    activityByCategory,
  };
};

