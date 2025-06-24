import { useState } from "react";
import axios from "axios";
import { getCookie } from "cookies-next";

const api = axios.create({
  baseURL: "https://travel-journal-api-bootcamp.do.dibimbing.id/api/v1",
  headers: {
    apiKey: "24405e01-fbc1-45a5-9f5a-be13afcd757c",
    "Content-Type": "application/json",
  },
});

api.interceptors.request.use((config) => {
  const token = getCookie("token");
  if (token) {
    config.headers["Authorization"] = `Bearer ${token}`;
  }
  return config;
});

export const useActivityActions = () => {
  const [isMutating, setIsMutating] = useState(false);

  const createActivity = async (payload) => {
    setIsMutating(true);
    try {
      const response = await api.post("/create-activity", payload);
      return response.data;
    } finally {
      setIsMutating(false);
    }
  };

  const updateActivity = async (activityId, payload) => {
    setIsMutating(true);
    try {
      const response = await api.post(`/update-activity/${activityId}`, payload);
      return response.data;
    } finally {
      setIsMutating(false);
    }
  };

  const deleteActivity = async (activityId) => {
    setIsMutating(true);
    try {
      const response = await api.delete(`/delete-activity/${activityId}`);
      return response.data;
    } finally {
      setIsMutating(false);
    }
  };

  return { createActivity, updateActivity, deleteActivity, isMutating };
};
