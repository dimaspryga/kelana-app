import useSWR from 'swr';
import axios from 'axios';

const fetcher = (url) => axios.get(url).then((res) => res.data.data);

export const useSWRActivityByCategory = (categoryId, fallbackData) => {
  const { data, error, isLoading } = useSWR(
    categoryId ? `/api/activities-by-category/${categoryId}` : null,
    fetcher,
    {
      fallbackData: fallbackData,
      revalidateOnFocus: false,
    }
  );

  return {
    activityByCategory: data,
    isLoading,
    error,
  };
};
