import axios from "axios";
import { useState, useEffect } from "react";

export const useDetailCategory = (id) => {
  const [detailCategory, setDetailCategory] = useState(null);
  const getDetailCategory = async (id) => {
    try {
      const response = await axios.get(
        `https://travel-journal-api-bootcamp.do.dibimbing.id/api/v1/category/${id}`,
        {
          headers: {
            "Content-Type": "application/json",
            apiKey: "24405e01-fbc1-45a5-9f5a-be13afcd757c",
          },
        }
      );
      console.log(response.data);
      setDetailCategory(response.data.data);
    } catch (error) {
      console.error(error);
    }
  }

  useEffect(() => {
    if (id) {
      getDetailCategory(id);
    }
  }, [id]);

  return {
    detailCategory,
    getDetailCategory,
  };
}