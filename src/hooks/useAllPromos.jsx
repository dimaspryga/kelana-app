import { useQuery } from "@tanstack/react-query";
import axios from "axios";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/api";

export const useAllPromos = () => {
  return useQuery({
    queryKey: ["promos"],
    queryFn: async () => {
      const response = await axios.get(`${API_BASE_URL}/promos`);
      return response.data;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });
}; 