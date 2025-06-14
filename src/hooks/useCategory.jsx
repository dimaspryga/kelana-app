import axios from "axios";
import { useEffect, useState } from "react";

export const useCategory = () => {
  const [category, setCategory] = useState([]);
  const getCatergory = async () => {
    try {
      const response = await axios.get(
        "https://travel-journal-api-bootcamp.do.dibimbing.id/api/v1/categories",
        {
          headers: {
            "Content-Type": "application/json",
            apiKey: "24405e01-fbc1-45a5-9f5a-be13afcd757c",
          },
        }
      );
      console.log(response.data);
      setCategory(response.data.data);
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    getCatergory();
  }, []);

  return {
    category,
    getCatergory,
  };
};
