import axios from "axios";
import { useState, useEffect } from "react";

export const useDetailActivity = (id) => {
  const [detailActivity, setDetailActivity] = useState(null);
  const getDetailActivity = async (id) => {
    try {
      const response = await axios.get(
        `https://travel-journal-api-bootcamp.do.dibimbing.id/api/v1/activity/${id}`,
        {
          headers: {
            "Content-Type": "application/json",
            apiKey: "24405e01-fbc1-45a5-9f5a-be13afcd757c",
          },
        }
      );
      console.log(response.data);
      setDetailActivity(response.data.data);
    } catch (error) {
      console.error(error);
    }
  }

  useEffect(() => {
    if (id) {
      getDetailActivity(id);
    }
  }, [id]);

  return {
    detailActivity,
    getDetailActivity,
  };
}