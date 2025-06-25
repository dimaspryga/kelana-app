import useSWR from "swr";
import axios from "axios";

const fetcher = (url) => axios.get(url).then((res) => res.data);

export const usePromo = () => {
  const { data, error, isLoading, mutate } = useSWR("/api/promos", fetcher, {
    revalidateOnFocus: false,
  });

  return {
    promo: data?.data || [],
    isLoading,
    error,
    mutate,
  };
};
