import useSWR from 'swr';
import axios from 'axios';

const fetcher = (url) => axios.get(url).then((res) => res.data.data);

export const useSWRDetailCategory = (id, fallbackData) => {
  const { data, error, isLoading } = useSWR(
    id ? `/api/categories/${id}` : null,
    fetcher,
    {
      fallbackData: fallbackData,
      revalidateOnFocus: false,
    }
  );

  return {
    detailCategory: data,
    isLoading,
    error,
  };
};
