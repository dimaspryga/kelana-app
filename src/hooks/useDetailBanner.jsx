import axios from "axios";
import { useState, useEffect } from "react";

export const useDetailBanner = (id) => {
  const [detailBanner, setDetailBanner] = useState(null);
  const getDetailBanner = async (id) => {
    try {
      const response = await axios.get(
        `https://travel-journal-api-bootcamp.do.dibimbing.id/api/v1/banner/${id}`,
        {
          headers: {
            "Content-Type": "application/json",
            apiKey: "24405e01-fbc1-45a5-9f5a-be13afcd757c",
          },
        }
      );
      console.log(response.data);
      setDetailBanner(response.data.data);
    } catch (error) {
      console.error(error);
    }
  }

  useEffect(() => {
    if (id) {
      getDetailBanner(id);
    }
  }, [id]);

  return {
    detailBanner,
    getDetailBanner,
  };
}