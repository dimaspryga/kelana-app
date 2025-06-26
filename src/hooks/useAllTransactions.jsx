import useSWR from "swr";
import axios from "axios";
import { getCookie } from "cookies-next";

const api = axios.create({
  baseURL: "https://travel-journal-api-bootcamp.do.dibimbing.id/api/v1",
  headers: {
    apiKey: "24405e01-fbc1-45a5-9f5a-be13afcd757c",
    "Content-Type": "application/json",
  },
});

// Interceptor untuk memastikan SETIAP panggilan dari hook ini terotentikasi
api.interceptors.request.use((config) => {
  const token = getCookie("token");
  if (token) {
    config.headers["Authorization"] = `Bearer ${token}`;
  }
  return config;
});

const fetcher = (url) => api.get(url).then((res) => res.data);

export const useAllTransactions = () => {
  const { data, error, isLoading, mutate } = useSWR("/all-transactions", fetcher, {
    revalidateOnFocus: false,
  });

  return {
    transactions: data?.data || [],
    isLoading,
    error,
    mutate,
  };
};
