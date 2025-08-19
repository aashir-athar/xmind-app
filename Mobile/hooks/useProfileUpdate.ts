import { useState } from "react";
import { Platform } from "react-native";
import * as ImagePicker from "expo-image-picker";
import { useCurrentUser } from "./useCurrentUser";
import { useApiClient, uploadApi } from "@/utils/api";
import { BRAND_COLORS } from "@/constants/colors";
import { useCustomAlert } from "@/hooks/useCustomAlert";
import { validateUsername } from "@/utils/usernameValidation";

interface ProfileUpdateData {
  profilePicture?: string;
  bannerImage?: string;
  firstName?: string;
  lastName?: string;
  username?: string;
  bio?: string;
  location?: string;
  verified?: boolean;
}

export const useProfileUpdate = () => {
  const { currentUser, refetch: refetchUser } = useCurrentUser();
  const api = useApiClient();
  const { showInfo, showError, showSuccess, showChoiceDialog } = useCustomAlert();
  const [isUpdating, setIsUpdating] = useState(false);
  const [updateType, setUpdateType] = useState<"profilePicture" | "bannerImage" | "bio" | "location" | "verified" | null>(null);

  // Request permissions for camera and photo library
  const requestPermissions = async () => {
    if (Platform.OS !== "web") {
      const { status: cameraStatus } = await ImagePicker.requestCameraPermissionsAsync();
      const { status: libraryStatus } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      
      if (cameraStatus !== "granted" || libraryStatus !== "granted") {
        showInfo(
          "Permission Required",
          "Camera and photo library access is required to update your profile images."
        );
        return false;
      }
    }
    return true;
  };

  // Upload image to Cloudinary
  const uploadImageToCloudinary = async (imageUri: string): Promise<string> => {
    try {
      // Convert image URI to blob
      const response = await fetch(imageUri);
      const blob = await response.blob();
      
      // Create FormData
      const formData = new FormData();
      formData.append('image', blob, 'profile-image.jpg');
      
      // Upload to backend
      const uploadResponse = await uploadApi.uploadImage(api, formData);
      
      if (uploadResponse.data.success) {
        return uploadResponse.data.data.url;
      } else {
        throw new Error(uploadResponse.data.message || 'Upload failed');
      }
    } catch (error) {
      console.error('Image upload error:', error);
      throw new Error('Failed to upload image. Please try again.');
    }
  };

  // Show image source selection dialog
  const showImageSourceDialog = (type: "profilePicture" | "bannerImage") => {
    showChoiceDialog(
      `Update ${type === "profilePicture" ? "Profile Picture" : "Banner Image"}`,
      "Choose image source:",
      [
        { text: "Camera", onPress: () => pickImage(type, "camera") },
        { text: "Photo Library", onPress: () => pickImage(type, "library") }
      ]
    );
  };

  // Pick image from camera or library
  const pickImage = async (type: "profilePicture" | "bannerImage", source: "camera" | "library") => {
    if (!(await requestPermissions())) return;

    try {
      const options: ImagePicker.ImagePickerOptions = {
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        quality: 0.8,
        aspect: type === "profilePicture" ? [1, 1] : [16, 9], // Square for profile, 16:9 for banner
      };

      let result;
      if (source === "camera") {
        result = await ImagePicker.launchCameraAsync(options);
      } else {
        result = await ImagePicker.launchImageLibraryAsync(options);
      }

      if (!result.canceled && result.assets && result.assets[0]) {
        const imageUri = result.assets[0].uri;
        
        // Upload image to Cloudinary first
        const cloudinaryUrl = await uploadImageToCloudinary(imageUri);
        
        // Then update profile with Cloudinary URL
        if (type === "profilePicture") {
          await updateProfilePicture(cloudinaryUrl);
        } else {
          await updateBannerImage(cloudinaryUrl);
        }
      }
    } catch (error) {
      console.error("Image picking error:", error);
      showError("Error", error instanceof Error ? error.message : "Failed to pick image. Please try again.");
    }
  };

  const updateProfile = async (updateData: ProfileUpdateData) => {
    if (!currentUser?._id) {
      showError("Error", "User not found");
      return false;
    }

    setIsUpdating(true);
    
    try {
      // Determine what type of update this is
      if (updateData.profilePicture) setUpdateType("profilePicture");
      else if (updateData.bannerImage) setUpdateType("bannerImage");
      else if (updateData.bio !== undefined) setUpdateType("bio");
      else if (updateData.location !== undefined) setUpdateType("location");
      else if (updateData.verified !== undefined) setUpdateType("verified");

      const response = await api.put("/users/profile", updateData);

      if (response.data.user) {
        // Refetch user data to get updated information
        await refetchUser();
        
        // Show success message based on update type
        let successMessage = "Profile updated successfully";
        if (updateType === "profilePicture") successMessage = "Profile picture updated successfully";
        else if (updateType === "bannerImage") successMessage = "Banner image updated successfully";
        else if (updateType === "bio") successMessage = "Bio updated successfully";
        else if (updateType === "location") successMessage = "Location updated successfully";
        else if (updateType === "verified") successMessage = "Verification status updated successfully";
        
        showSuccess("Success", successMessage);
        return true;
      } else {
        throw new Error("Failed to update profile");
      }
    } catch (error) {
      console.error("Profile update error:", error);
      
      let errorMessage = "Failed to update profile";
      if (updateType === "profilePicture") errorMessage = "Failed to update profile picture";
      else if (updateType === "bannerImage") errorMessage = "Failed to update banner image";
      else if (updateType === "bio") errorMessage = "Failed to update bio";
      else if (updateType === "location") errorMessage = "Failed to update location";
      else if (updateType === "verified") errorMessage = "Failed to update verification status";
      
      showError("Error", errorMessage);
      return false;
    } finally {
      setIsUpdating(false);
      setUpdateType(null);
    }
  };

  const updateProfilePicture = async (imageUrl: string) => {
    return await updateProfile({ profilePicture: imageUrl });
  };

  const updateBannerImage = async (imageUrl: string) => {
    return await updateProfile({ bannerImage: imageUrl });
  };

  const updateBio = async (bio: string) => {
    return await updateProfile({ bio });
  };

  const updateLocation = async (location: string) => {
    return await updateProfile({ location });
  };

  const updateUsername = async (username: string) => {
    // Validate username before updating
    const validation = await validateUsername(username, { platformMode: "xMind" });
    
    if (!validation.valid) {
      showError("Invalid Username", validation.errors.join(", "));
      return false;
    }

    // Use the dedicated username endpoint instead of general profile update
    try {
      const response = await api.put("/users/username", { username });
      
      if (response.data.user) {
        // Refetch user data to get updated information
        await refetchUser();
        return true;
      } else {
        throw new Error("Failed to update username");
      }
    } catch (error: any) {
      console.error("Username update error:", error);
      showError("Error", error.response?.data?.error || "Failed to update username");
      return false;
    }
  };

  const updateVerification = async (verified: boolean) => {
    return await updateProfile({ verified });
  };

  return {
    updateProfile,
    updateProfilePicture,
    updateBannerImage,
    updateBio,
    updateLocation,
    updateUsername,
    updateVerification,
    showImageSourceDialog,
    isUpdating,
    updateType,
    currentUser,
  };
};
