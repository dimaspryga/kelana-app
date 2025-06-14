import { useState, useEffect } from "react";
import axios from "axios";

export const useBanner = () => {
  const [banner, setBanner] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isError, setIsError] = useState(false);
  const [error, setError] = useState(null);

  const getBanner = async () => {
    try {
      const response = await axios.get(
        "https://travel-journal-api-bootcamp.do.dibimbing.id/api/v1/banners",
        {
          headers: {
            "Content-Type": "application/json",
            apiKey: "24405e01-fbc1-45a5-9f5a-be13afcd757c",
          },
        }
      );
      console.log(response.data);
      setBanner(response.data.data);
    } catch (error) {
      console.error(error);
      setIsError(true);
      setError(error);
    }
  };

  useEffect(() => {
    getBanner();
  }, []);

  return {
    banner,
    getBanner,
    loading,
    isError,
    error,
  };
};
