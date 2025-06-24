import axios from "axios";
import { useState, useEffect, useCallback } from "react";

export const usePaymentMethod = () => {
    const [paymentMethod, setPaymentMethod] = useState([]);
    const [isLoading, setIsLoading] = useState(true); // FIX: Add isLoading state

    const getPaymentMethod = useCallback(async () => {
        setIsLoading(true); // Set loading to true before fetching
        try {
            const response = await axios.get(
                "https://travel-journal-api-bootcamp.do.dibimbing.id/api/v1/payment-methods",
                {
                    headers: {
                        "Content-Type": "application/json",
                        "apiKey": "24405e01-fbc1-45a5-9f5a-be13afcd757c",
                    },
                }
            );
            setPaymentMethod(response.data.data || []);
        } catch (error) {
            console.error(error);
        } finally {
            setIsLoading(false); // Set loading to false after fetching
        }
    }, []);

    useEffect(() => {
        getPaymentMethod();
    }, [getPaymentMethod]);

    return {
        paymentMethod,
        isLoading, // FIX: Export isLoading state
        getPaymentMethod,
    };
};
