import { useState, useEffect } from 'react';
import axios from 'axios';
import { getCookie } from 'cookies-next';

/**
 * @property {object|null} user
 * @property {boolean} loading
 * @property {Error|null} error
 * @property {Function} refetch
 */
export const useGetLoggedUser = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [trigger, setTrigger] = useState(0);

  const refetch = () => {
    setTrigger(prev => prev + 1);
  };

  useEffect(() => {
    const fetchLoggedUser = async () => {

      const token = getCookie('token');

      if (!token) {
        setLoading(false);
        setError(new Error('Token otentikasi tidak ditemukan di cookies.'));
        setUser(null);
      }

      setLoading(true);
      setError(null);

      try {
        const response = await axios.get('https://travel-journal-api-bootcamp.do.dibimbing.id/api/v1/user', {
          headers: {
            'Authorization': `Bearer ${token}`,
            'apiKey': '24405e01-fbc1-45a5-9f5a-be13afcd757c'
          }
        });
        setUser(response.data.data);
      } catch (err) {
        setError(err);
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    fetchLoggedUser();
  }, [trigger]);
  
  return { user, loading, error, refetch };
};

