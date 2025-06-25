import useSWR from 'swr';
import axios from 'axios';

const fetcher = (url) => axios.get(url).then((res) => res.data.data);

export const useSWRDetailActivity = (id, fallbackData) => {
  const { data, error, isLoading } = useSWR(
    id ? `/api/activities/${id}` : null,
    fetcher,
    {
      fallbackData: fallbackData,
      revalidateOnFocus: false,
    }
  );

  return {
    detailActivity: data,
    isLoading,
    error,
  };
};
