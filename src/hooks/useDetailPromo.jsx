import axios from "axios";
import { useState, useEffect } from "react";

export const useDetailPromo = (id) => {
  const [detailPromo, setDetailPromo] = useState(null);
  const getDetailPromo = async (id) => {
    try {
      const response = await axios.get(
        `https://travel-journal-api-bootcamp.do.dibimbing.id/api/v1/promo/${id}`,
        {
          headers: {
            "Content-Type": "application/json",
            apiKey: "24405e01-fbc1-45a5-9f5a-be13afcd757c",
          },
        }
      );
      console.log(response.data);
      setDetailPromo(response.data.data);
    } catch (error) {
      console.error(error);
    }
  }

  useEffect(() => {
    if (id) {
      getDetailPromo(id);
    }
  }, [id]);

  return {
    detailPromo,
    getDetailPromo,
  };
}