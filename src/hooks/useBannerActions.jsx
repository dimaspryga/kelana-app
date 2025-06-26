// File: hooks/useBannerActions.js

import { useState } from "react";
import axios from "axios";
import { getCookie } from "cookies-next";

const API_BASE_URL = "https://travel-journal-api-bootcamp.do.dibimbing.id/api/v1";
const API_KEY = "24405e01-fbc1-45a5-9f5a-be13afcd757c";

const api = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'apiKey': API_KEY,
        'Content-Type': 'application/json',
    }
});

api.interceptors.request.use(config => {
    const token = getCookie("token");
    if (token) {
        config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
});

export const useBannerActions = () => {
    const [isMutating, setIsMutating] = useState(false);
    
    const createBanner = async (payload) => {
        setIsMutating(true);
        try {
            // Mengirim payload sebagai JSON
            const response = await api.post('/create-banner', payload);
            return response.data;
        } finally {
            setIsMutating(false);
        }
    };

    const updateBanner = async (bannerId, payload) => {
        setIsMutating(true);
        try {
            // Mengirim payload sebagai JSON dengan metode POST
            const response = await api.post(`/update-banner/${bannerId}`, payload);
            return response.data;
        } finally {
            setIsMutating(false);
        }
    };

    const deleteBanner = async (bannerId) => {
        setIsMutating(true);
        try {
            const response = await api.delete(`/delete-banner/${bannerId}`);
            return response.data;
        } finally {
            setIsMutating(false);
        }
    };

    return { createBanner, updateBanner, deleteBanner, isMutating };
};