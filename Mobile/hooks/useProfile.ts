import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useApiClient, userApi } from "../utils/api";
import { useCurrentUser } from "./useCurrentUser";
import { useCustomAlert } from "@/hooks/useCustomAlert";

export const useProfile = () => {
  const api = useApiClient();
  const { showSuccess, showError } = useCustomAlert();

  const queryClient = useQueryClient();
  const [isEditModalVisible, setIsEditModalVisible] = useState(false);
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    bio: "",
    location: "",
    profilePicture: "",
    bannerImage: "",
  });
  const { currentUser } = useCurrentUser();

  const updateProfileMutation = useMutation({
    mutationFn: (profileData: any) => userApi.updateProfile(api, profileData),
    onSuccess: async () => {
      console.log("Profile update successful, refreshing data...");
      
      // Invalidate and refetch the current user data
      await queryClient.invalidateQueries({ queryKey: ["authUser"] });
      await queryClient.refetchQueries({ queryKey: ["authUser"] });
      
      // Also update the local form data to reflect changes immediately
      if (currentUser) {
        setFormData({
          firstName: formData.firstName,
          lastName: formData.lastName,
          bio: formData.bio,
          location: formData.location,
          profilePicture: formData.profilePicture,
          bannerImage: formData.bannerImage,
        });
      }
      
      setIsEditModalVisible(false);
      showSuccess("Success", "Profile updated successfully!");
    },
    onError: (error: any) => {
      console.error("Profile update error:", error);
      showError(
        "Error",
        error.response?.data?.error || "Failed to update profile"
      );
    },
  });

  const openEditModal = () => {
    if (currentUser) {
      setFormData({
        firstName: currentUser.firstName || "",
        lastName: currentUser.lastName || "",
        bio: currentUser.bio || "",
        location: currentUser.location || "",
        profilePicture: currentUser.profilePicture || "",
        bannerImage: currentUser.bannerImage || "",
      });
    }
    setIsEditModalVisible(true);
  };

  const updateFormField = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  return {
    isEditModalVisible,
    formData,
    openEditModal,
    closeEditModal: () => setIsEditModalVisible(false),
    saveProfile: () => updateProfileMutation.mutate(formData),
    updateFormField,
    isUpdating: updateProfileMutation.isPending,
    refetch: () => queryClient.invalidateQueries({ queryKey: ["authUser"] }),
  };
};
