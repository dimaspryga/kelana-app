import { useState, useEffect, useCallback } from "react";
import axios from "axios";
import { getCookie } from "cookies-next";

const API_BASE_URL = "https://travel-journal-api-bootcamp.do.dibimbing.id/api/v1";
const API_KEY = "24405e01-fbc1-45a5-9f5a-be13afcd757c";

export const useAllUsers = () => {
    const [users, setUsers] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchAllUsers = useCallback(async () => {
        setIsLoading(true);
        setError(null);
        const token = getCookie("token");

        if (!token) {
            setError(new Error("Authentication token not found. Please log in."));
            setIsLoading(false);
            return;
        }

        try {
            const response = await axios.get(`${API_BASE_URL}/all-user`, {
                headers: {
                    apiKey: API_KEY,
                    Authorization: `Bearer ${token}`,
                },
            });
            setUsers(response.data.data || []);
        } catch (err) {
            const errorMessage = err.response?.data?.message || "Failed to fetch users.";
            setError(new Error(errorMessage));
            console.error("Error fetching all users:", errorMessage);
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchAllUsers();
    }, [fetchAllUsers]);

    return { users, isLoading, error, refetch: fetchAllUsers };
};
