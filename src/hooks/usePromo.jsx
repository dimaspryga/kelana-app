import axios from "axios";
import { useState, useEffect } from "react";

export const usePromo = () => {
  const [promo, setPromo] = useState([]);

  const getPromo = async () => {
    try {
      const response = await axios.get(
        "https://travel-journal-api-bootcamp.do.dibimbing.id/api/v1/promos",
        {
          headers: {
            "Content-Type": "application/json",
            apiKey: "24405e01-fbc1-45a5-9f5a-be13afcd757c",
          },
        }
      );
      console.log(response.data);
      setPromo(response.data.data);
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    getPromo();
  }, []);

  return {
    promo,
    getPromo,
  };
}