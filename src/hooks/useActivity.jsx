import axios from "axios";
import { useState, useEffect } from "react";

export const useActivity = () => {
  const [activity, setActivity] = useState([]);

  const getActivity = async () => {
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
      console.log(response.data);
      setActivity(response.data.data);
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    getActivity();
  }, []);

  return {
    activity,
    getActivity,
  };
};
