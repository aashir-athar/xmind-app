import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import * as ImagePicker from "expo-image-picker";
import { useApiClient } from "../utils/api";
import { useCurrentUser } from "./useCurrentUser";
import { useCustomAlert } from "@/hooks/useCustomAlert";
import { useExistingUsernames } from "./useExistingUsernames";
import {
  checkVerificationEligibility,
  getVerificationProgress,
  getVerificationStatusMessage,
  getVerificationRequirements,
  VerificationResult,
} from "@/utils/verification";
import { usePosts } from "./usePosts";
import {
  validateUsername,
  ValidationConfig,
} from "../utils/usernameValidation";

export interface ProfileFormData {
  firstName: string;
  lastName: string;
  bio: string;
  location: string;
  username: string;
  profilePicture: string;
  bannerImage: string;
}

export const useProfile = () => {
  const api = useApiClient();
  const { showSuccess, showError, showInfo } = useCustomAlert();
  const queryClient = useQueryClient();
  const { currentUser, refetch: refetchCurrentUser } = useCurrentUser();
  const { posts: userPosts } = usePosts(currentUser?.username);
  const { existingUsernames } = useExistingUsernames();

  // Modal state
  const [isEditModalVisible, setIsEditModalVisible] = useState(false);

  // Form data state
  const [formData, setFormData] = useState<ProfileFormData>({
    firstName: "",
    lastName: "",
    bio: "",
    location: "",
    username: "",
    profilePicture: "",
    bannerImage: "",
  });

  // Image states
  const [selectedProfileImage, setSelectedProfileImage] = useState<
    string | null
  >(null);
  const [selectedBannerImage, setSelectedBannerImage] = useState<string | null>(
    null
  );
  const [usernameValidate, setusernameValidate] = useState<boolean>(false);
  const [usernameValidateErrors, setusernameValidateErrors] = useState<string[]>(
    []
  );

  // Verification state
  const [verificationResult, setVerificationResult] =
    useState<VerificationResult | null>(null);

  // Profile update mutation (handles text fields + images)
  const updateProfileMutation = useMutation({
    mutationFn: async (profileData: ProfileFormData) => {
      const formDataToSend = new FormData();

      // Add text fields if they have values
      if (profileData.firstName?.trim())
        formDataToSend.append("firstName", profileData.firstName.trim());
      if (profileData.lastName?.trim())
        formDataToSend.append("lastName", profileData.lastName.trim());
      if (profileData.bio?.trim())
        formDataToSend.append("bio", profileData.bio.trim());
      if (profileData.location?.trim())
        formDataToSend.append("location", profileData.location.trim());

      // Handle profile picture upload (same logic as useCreatePost)
      if (selectedProfileImage) {
        const uriParts = selectedProfileImage.split(".");
        const fileType = uriParts[uriParts.length - 1].toLowerCase();

        const mimeTypeMap: Record<string, string> = {
          png: "image/png",
          gif: "image/gif",
          webp: "image/webp",
        };
        const mimeType = mimeTypeMap[fileType] || "image/jpeg";
        const normalizedExt = mimeType.split("/")[1];

        formDataToSend.append("profilePicture", {
          uri: selectedProfileImage,
          name: `profile-image.${normalizedExt}`,
          type: mimeType,
        } as any);
      }

      // Handle banner image upload (same logic as useCreatePost)
      if (selectedBannerImage) {
        const uriParts = selectedBannerImage.split(".");
        const fileType = uriParts[uriParts.length - 1].toLowerCase();

        const mimeTypeMap: Record<string, string> = {
          png: "image/png",
          gif: "image/gif",
          webp: "image/webp",
        };
        const mimeType = mimeTypeMap[fileType] || "image/jpeg";
        const normalizedExt = mimeType.split("/")[1];

        formDataToSend.append("bannerImage", {
          uri: selectedBannerImage,
          name: `banner-image.${normalizedExt}`,
          type: mimeType,
        } as any);
      }

      return api.post("/users/profile", formDataToSend, {
        headers: { "Content-Type": "multipart/form-data" },
      });
    },
    onSuccess: async () => {
      console.log("Profile update successful, refreshing data...");

      // Clear selected images
      setSelectedProfileImage(null);
      setSelectedBannerImage(null);

      // Invalidate and refetch user data
      await queryClient.invalidateQueries({ queryKey: ["authUser"] });
      await queryClient.refetchQueries({ queryKey: ["authUser"] });
      await refetchCurrentUser();

      // Close modal and show success
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

  // Username update mutation (separate endpoint)
  const updateUsernameMutation = useMutation({
    mutationFn: async (username: string) => {
      const lowercaseUsername = username.toLowerCase();
      return api.put("/users/username", { username: lowercaseUsername });
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["authUser"] });
      await queryClient.refetchQueries({ queryKey: ["authUser"] });
      await refetchCurrentUser();
      showSuccess("Success", "Username updated successfully!");
    },
    onError: (error: any) => {
      console.error("Username update error:", error);
      showError(
        "Error",
        error.response?.data?.error || "Failed to update username"
      );
    },
  });

  // Auto-verification mutation
  const autoVerificationMutation = useMutation({
    mutationFn: async () => {
      // This would call your verification endpoint
      return api.post("/users/verify");
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["authUser"] });
      await refetchCurrentUser();
      showSuccess(
        "🎉 Account Verified!",
        "Congratulations! Your account has been automatically verified."
      );
    },
    onError: (error: any) => {
      console.error("Auto-verification failed:", error);
      showInfo(
        "Verification Update",
        "Your verification status will be updated shortly."
      );
    },
  });

  // Image picker functions
  const requestPermissions = async (useCamera: boolean) => {
    const permissionResult = useCamera
      ? await ImagePicker.requestCameraPermissionsAsync()
      : await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (permissionResult.status !== "granted") {
      const source = useCamera ? "camera" : "photo library";
      showInfo(
        "Permission needed",
        `Please grant permission to access your ${source}`
      );
      return false;
    }
    return true;
  };

  const handleImagePicker = async (
    type: "profilePicture" | "bannerImage",
    useCamera: boolean = false
  ) => {
    const hasPermission = await requestPermissions(useCamera);
    if (!hasPermission) return;

    const pickerOptions = {
      allowsEditing: true,
      aspect:
        type === "profilePicture"
          ? ([1, 1] as [number, number])
          : ([3, 1] as [number, number]),
      quality: 0.8,
    };

    const result = useCamera
      ? await ImagePicker.launchCameraAsync(pickerOptions)
      : await ImagePicker.launchImageLibraryAsync({
          ...pickerOptions,
          mediaTypes: ["images"],
        });

    if (!result.canceled) {
      if (type === "profilePicture") {
        setSelectedProfileImage(result.assets[0].uri);
      } else {
        setSelectedBannerImage(result.assets[0].uri);
      }
    }
  };

  // Username validation
  const usernameValidation = async (username: string): Promise<boolean> => {
    const candidate = (username ?? "").trim();

    const result = await validateUsername(currentUser?.username, candidate, undefined, existingUsernames);
    if (result.valid) {
      setusernameValidate(true);
      setusernameValidateErrors([]);
      return true;
    } else {
      setusernameValidate(false);
      setusernameValidateErrors(result.errors);
      return false;
    }
  };

  // Verification functions
  const checkVerification = () => {
    if (currentUser) {
      // You would need to get post count from somewhere (maybe pass it as parameter)
      const result = checkVerificationEligibility(currentUser, 0);
      setVerificationResult(result);
      return result;
    }
    return null;
  };

  const handleAutoVerification = async () => {
    if (currentUser?.verified || !verificationResult?.isEligible) {
      return;
    }
    autoVerificationMutation.mutate();
  };

  const getVerificationProgressValue = () => {
    if (currentUser) {
      return getVerificationProgress(currentUser, userPosts?.length || 0);
    }
    return 0;
  };

  const getVerificationStatusMessageValue = () => {
    if (currentUser) {
      return getVerificationStatusMessage(currentUser, userPosts?.length || 0);
    }
    return "";
  };

  const getVerificationRequirementsValue = () => {
    if (currentUser) {
      return getVerificationRequirements(currentUser, userPosts?.length || 0);
    }
    return [];
  };

  // Modal functions
  const openEditModal = () => {
    if (currentUser) {
      setFormData({
        firstName: currentUser.firstName || "",
        lastName: currentUser.lastName || "",
        bio: currentUser.bio || "",
        location: currentUser.location || "",
        username: currentUser.username || "",
        profilePicture: currentUser.profilePicture || "",
        bannerImage: currentUser.bannerImage || "",
      });

      // Clear any previously selected images
      setSelectedProfileImage(null);
      setSelectedBannerImage(null);
    }
    setIsEditModalVisible(true);
  };

  const closeEditModal = () => {
    setIsEditModalVisible(false);
    // Clear form data and selected images
    setSelectedProfileImage(null);
    setSelectedBannerImage(null);
  };

  // Form field update
  const updateFormField = (field: keyof ProfileFormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  // Save profile function - handles all updates
  const saveProfile = async () => {
    // Check if username needs to be updated separately
    const usernameChanged = formData.username !== currentUser?.username;

    // Check if we have any profile data to update
    const hasTextData =
      formData.firstName ||
      formData.lastName ||
      formData.bio ||
      formData.location;
    const hasImages = selectedProfileImage || selectedBannerImage;

    if (!hasTextData && !hasImages && !usernameChanged) {
      showInfo("No Changes", "Please make some changes before saving");
      return;
    }

    try {
      // Update username first if changed
      if (usernameChanged) {
        if (!usernameValidation(formData.username)) {
          return;
        }
        await updateUsernameMutation.mutateAsync(formData.username);
      }

      // Update profile data (including images) if there are changes
      if (hasTextData || hasImages) {
        await updateProfileMutation.mutateAsync(formData);
      }

      // If only username was changed and no other data, close modal manually
      if (usernameChanged && !hasTextData && !hasImages) {
        setIsEditModalVisible(false);
        showSuccess("Success", "Username updated successfully!");
      }
    } catch (error) {
      console.error("Error saving profile:", error);
    }
  };

  // Image functions
  const pickImageFromGallery = (type: "profilePicture" | "bannerImage") => {
    handleImagePicker(type, false);
  };

  const takePhoto = (type: "profilePicture" | "bannerImage") => {
    handleImagePicker(type, true);
  };

  const removeImage = (type: "profilePicture" | "bannerImage") => {
    if (type === "profilePicture") {
      setSelectedProfileImage(null);
    } else {
      setSelectedBannerImage(null);
    }
  };

  // Refetch function
  const refetch = () => {
    queryClient.invalidateQueries({ queryKey: ["authUser"] });
    refetchCurrentUser();
  };

  return {
    // Modal state
    isEditModalVisible,
    openEditModal,
    closeEditModal,

    // Form data
    formData,
    updateFormField,

    // Save function
    saveProfile,
    isUpdating:
      updateProfileMutation.isPending || updateUsernameMutation.isPending,

    // Image functions
    selectedProfileImage,
    selectedBannerImage,
    pickImageFromGallery,
    takePhoto,
    removeImage,

    // Verification functions
    verificationResult,
    checkVerification,
    handleAutoVerification,
    getVerificationProgressValue,
    getVerificationStatusMessageValue,
    getVerificationRequirementsValue,
    isCheckingVerification: autoVerificationMutation.isPending,

    // Username functions
    usernameValidation,
    usernameValidate,
    usernameValidateErrors,
    existingUsernames, // New: Available usernames for validation
    // Utility
    refetch,
  };
};
