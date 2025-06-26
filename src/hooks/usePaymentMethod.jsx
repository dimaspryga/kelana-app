import axios from "axios";
import { useState, useEffect, useCallback } from "react";

export const usePaymentMethod = () => {
    const [paymentMethod, setPaymentMethod] = useState([]);
    const [isLoading, setIsLoading] = useState(true); 

    const getPaymentMethod = useCallback(async () => {
        setIsLoading(true);
        try {
            const response = await axios.get("/api/payment-methods");
            setPaymentMethod(response.data.data || []);
        } catch (error) {
            console.error(error);
        } finally {
            setIsLoading(false); 
        }
    }, []);

    useEffect(() => {
        getPaymentMethod();
    }, [getPaymentMethod]);

    return {
        paymentMethod,
        isLoading,
        getPaymentMethod,
    };
};
