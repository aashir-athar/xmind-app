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
      const errorMessage =
        error.response?.data?.error || "Failed to update username";
      showError("Update Failed", errorMessage);
      setIsUpdating(false);
    },
  });

  const updateUsername = async (newUsername: string) => {
    const candidate = (newUsername ?? "").trim();

    if (candidate.length === 0) {
      showError("Invalid Username", "Username cannot be empty");
      return false;
    }
    if (candidate.length < 4 || candidate.length > 15) {
      showError(
        "Invalid Username",
        "Username must be between 4 and 15 characters"
      );
      return false;
    }
    if (!/^[a-zA-Z0-9_]+$/.test(candidate)) {
      showError(
        "Invalid Username",
        "Username can only contain letters, numbers, and underscores"
      );
      return false;
    }
    if (candidate.startsWith("_") || candidate.endsWith("_")) {
      showError(
        "Invalid Username",
        "Username cannot start or end with an underscore"
      );
      return false;
    }
    if (candidate.includes("__")) {
      showError(
        "Invalid Username",
        "Username cannot have consecutive underscores"
      );
      return false;
    }
    const reservedWords = [
      "admin",
      "administrator",
      "moderator",
      "system",
      "root",
      "official",
      "support",
      "help",
      "twitter",
      "facebook",
      "instagram",
      "tiktok",
      "youtube",
      "twitch",
      "discord",
      "reddit",
      "pinterest",
      "linkedin",
      "github",
      "gitlab",
      "bitbucket",
      "heroku",
      "vercel",
      "netlify",
    ];
    if (reservedWords.includes(candidate.toLowerCase())) {
      showError("Invalid Username", "Username contains a reserved word");
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
