import useSWR from 'swr';
import axios from 'axios';
import { getCookie } from 'cookies-next';
import { useMemo } from 'react';

// --- Konfigurasi API Fetcher ---
const api = axios.create({
  baseURL: "https://travel-journal-api-bootcamp.do.dibimbing.id/api/v1",
  headers: {
    apiKey: "24405e01-fbc1-45a5-9f5a-be13afcd757c",
    "Content-Type": "application/json",
  },
});
api.interceptors.request.use((config) => {
  const token = getCookie("token");
  if (token) config.headers["Authorization"] = `Bearer ${token}`;
  return config;
});
const fetcher = url => api.get(url).then(res => res.data.data);

// --- Custom Hook untuk Data Dasbor ---
export const useDashboardData = () => {
    const { data: usersData, error: usersError } = useSWR('/all-user', fetcher);
    const { data: bannersData, error: bannersError } = useSWR('/banners', fetcher);
    const { data: categoriesData, error: categoriesError } = useSWR('/categories', fetcher);
    const { data: activitiesData, error: activitiesError } = useSWR('/activities', fetcher);
    const { data: promosData, error: promosError } = useSWR('/promos', fetcher);
    const { data: transactionsData, error: transactionsError } = useSWR('/all-transactions', fetcher);

    const isLoading = !usersData && !bannersData && !categoriesData && !activitiesData && !promosData && !transactionsData;
    const error = usersError || bannersError || categoriesError || activitiesError || promosError || transactionsError;

    // Helper function to map API status to display status
    const mapApiStatusToDisplayStatus = (transaction) => {
        const apiStatus = transaction.status?.toUpperCase();
        const hasPaymentProof = !!transaction.proofPaymentUrl;
        if (apiStatus === "PENDING") {
            return hasPaymentProof ? "CONFIRMATION" : "UNPAID";
        }
        return apiStatus;
    };

    // Process and enrich data once it's available
    const stats = useMemo(() => {
        const statusCounts = {
            UNPAID: 0,
            CONFIRMATION: 0,
            SUCCESS: 0,
            CANCELLED: 0,
            FAILED: 0,
        };

        if (Array.isArray(transactionsData)) {
            transactionsData.forEach((t) => {
                const displayStatus = mapApiStatusToDisplayStatus(t);
                if (displayStatus in statusCounts) {
                    statusCounts[displayStatus]++;
                }
            });
        }
        
        return {
            users: usersData?.length || 0,
            banners: bannersData?.length || 0,
            categories: categoriesData?.length || 0,
            activities: activitiesData?.length || 0,
            promos: promosData?.length || 0,
            orders: transactionsData?.length || 0,
            ...statusCounts,
        };
    }, [usersData, bannersData, categoriesData, activitiesData, promosData, transactionsData]);

    const enrichedTransactions = useMemo(() => {
        if (isLoading || !Array.isArray(transactionsData) || !Array.isArray(usersData)) return [];
        const usersMap = new Map(usersData.map(user => [user.id, user]));
        return transactionsData
            .sort((a, b) => new Date(b.orderDate) - new Date(a.orderDate))
            .map(transaction => ({
                ...transaction,
                user: usersMap.get(transaction.userId) || null,
                displayStatus: mapApiStatusToDisplayStatus(transaction),
            }));
    }, [transactionsData, usersData, isLoading]);

    return { stats, enrichedTransactions, isLoading, error };
};
