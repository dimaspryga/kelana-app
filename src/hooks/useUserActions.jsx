import { useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { toast } from "sonner";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/api";

export const useUserActions = () => {
  const queryClient = useQueryClient();

  // Create user mutation
  const createUserMutation = useMutation({
    mutationFn: async (userData) => {
      const response = await axios.post(`${API_BASE_URL}/users`, userData, {
        headers: {
          "Content-Type": "application/json",
        },
      });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
    },
  });

  // Update user mutation
  const updateUserMutation = useMutation({
    mutationFn: async ({ userId, userData }) => {
      const response = await axios.put(`${API_BASE_URL}/users/${userId}`, userData, {
        headers: {
          "Content-Type": "application/json",
        },
      });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
    },
  });

  // Delete user mutation
  const deleteUserMutation = useMutation({
    mutationFn: async (userId) => {
      const response = await axios.delete(`${API_BASE_URL}/users/${userId}`);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
    },
  });

  // Create user function
  const createUser = async (userData) => {
    try {
      const result = await createUserMutation.mutateAsync(userData);
      toast.success("User created successfully!");
      return result;
    } catch (error) {
      const errorMessage = error.response?.data?.message || "Failed to create user.";
      toast.error(errorMessage);
      throw error;
    }
  };

  // Update user function
  const updateUser = async (userId, userData) => {
    try {
      const result = await updateUserMutation.mutateAsync({ userId, userData });
      toast.success("User updated successfully!");
      return result;
    } catch (error) {
      const errorMessage = error.response?.data?.message || "Failed to update user.";
      toast.error(errorMessage);
      throw error;
    }
  };

  // Delete user function
  const deleteUser = async (userId) => {
    try {
      const result = await deleteUserMutation.mutateAsync(userId);
      toast.success("User deleted successfully!");
      return result;
    } catch (error) {
      const errorMessage = error.response?.data?.message || "Failed to delete user.";
      toast.error(errorMessage);
      throw error;
    }
  };

  return {
    createUser,
    updateUser,
    deleteUser,
    isCreating: createUserMutation.isPending,
    isUpdating: updateUserMutation.isPending,
    isDeleting: deleteUserMutation.isPending,
  };
}; 