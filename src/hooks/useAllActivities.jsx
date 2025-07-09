import { useQuery } from "@tanstack/react-query";
import axios from "axios";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/api";

export const useAllActivities = () => {
  return useQuery({
    queryKey: ["activities"],
    queryFn: async () => {
      const response = await axios.get(`${API_BASE_URL}/activities`);
      return response.data;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });
}; 