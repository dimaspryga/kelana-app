import axios from "axios";
import { useState, useEffect } from "react";

export const usePaymentMethod = () => {
  const [paymentMethod, setPaymentMethod] = useState([]);
  const getPaymentMethod = async () => {
    try {
      const response = await axios.get(
        "https://travel-journal-api-bootcamp.do.dibimbing.id/api/v1/payment-methods",
        {
          headers: {
            "Content-Type": "application/json",
            apiKey: "24405e01-fbc1-45a5-9f5a-be13afcd757c",
          },
        }
      );
      console.log(response.data);
      setPaymentMethod(response.data.data);
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    getPaymentMethod();
  }, []);

  return {
    paymentMethod,
    getPaymentMethod,
  };
};
