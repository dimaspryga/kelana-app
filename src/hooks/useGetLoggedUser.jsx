import { useState, useEffect } from 'react';
import axios from 'axios';
import { getCookie } from 'cookies-next';

/**
 * Custom hook to fetch the logged-in user's data.
 * It retrieves the authentication token from cookies.
 * * @returns {object} An object containing the user data, loading state, and error state.
 * @property {object|null} user - The logged-in user's data.
 * @property {boolean} loading - The loading state of the API request.
 * @property {Error|null} error - The error object if the request fails.
 * @property {Function} refetch - A function to manually trigger a data refetch.
 */
export const useGetLoggedUser = () => {
  // State for user data, loading status, and errors
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [trigger, setTrigger] = useState(0); // State to trigger refetch

  // Function to manually refetch data
  const refetch = () => {
    setTrigger(prev => prev + 1);
  };

  useEffect(() => {
    const fetchLoggedUser = async () => {
      // Retrieve the token from cookies.
      // Make sure the cookie name 'token' matches what you set during login.
      const token = getCookie('token');

      // If no token is found, stop loading and set an error.
      if (!token) {
        setLoading(false);
        setError(new Error('Token otentikasi tidak ditemukan di cookies.'));
        setUser(null); // Clear previous user data if any
        return;
      }

      setLoading(true);
      setError(null);

      try {
        // Make the GET request with the token and API key in the headers
        const response = await axios.get('https://travel-journal-api-bootcamp.do.dibimbing.id/api/v1/user', {
          headers: {
            'Authorization': `Bearer ${token}`,
            'apiKey': '24405e01-fbc1-45a5-9f5a-be13afcd757c'
          }
        });
        // Set user data from the response
        setUser(response.data.data);
      } catch (err) {
        // Set error state if the request fails
        setError(err);
        setUser(null); // Clear user data on error
      } finally {
        // Stop loading state regardless of success or failure
        setLoading(false);
      }
    };

    fetchLoggedUser();
  }, [trigger]); // Re-run the effect when the trigger changes

  // Return the state and the refetch function
  return { user, loading, error, refetch };
};

