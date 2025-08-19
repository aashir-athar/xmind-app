import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useApiClient, userApi } from "../utils/api";
import { useCustomAlert } from "./useCustomAlert";

export const useUsernameUpdate = () => {
  const [isUpdating, setIsUpdating] = useState(false);
  const api = useApiClient();
  const queryClient = useQueryClient();
  const { showSuccess, showError, showInfo } = useCustomAlert();

  const updateUsernameMutation = useMutation({
    mutationFn: (username: string) => userApi.updateUsername(api, username),
    onSuccess: (response) => {
      showSuccess(
        "Username Updated!",
        `Your username has been successfully changed to @${response.data.user.username}`
      );
      
      // Invalidate and refetch user data
      queryClient.invalidateQueries({ queryKey: ["currentUser"] });
      queryClient.invalidateQueries({ queryKey: ["userProfile"] });
      
      setIsUpdating(false);
    },
    onError: (error: any) => {
      const errorMessage = error.response?.data?.error || "Failed to update username";
      showError("Update Failed", errorMessage);
      setIsUpdating(false);
    },
  });

  const updateUsername = async (newUsername: string) => {
    // Client-side validation
    if (!newUsername || newUsername.trim().length === 0) {
      showError("Invalid Username", "Username cannot be empty");
      return false;
    }

    if (newUsername.length < 3) {
      showError("Invalid Username", "Username must be at least 3 characters long");
      return false;
    }

    if (newUsername.length > 30) {
      showError("Invalid Username", "Username cannot exceed 30 characters");
      return false;
    }

    if (!/^[a-zA-Z0-9_]+$/.test(newUsername)) {
      showError(
        "Invalid Username", 
        "Username can only contain letters, numbers, and underscores"
      );
      return false;
    }

    setIsUpdating(true);
    updateUsernameMutation.mutate(newUsername.trim());
    return true;
  };

  return {
    updateUsername,
    isUpdating,
    updateUsernameMutation,
  };
};
