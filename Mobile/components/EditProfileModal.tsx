import React, { memo, useCallback } from "react";
import {
  ActionSheetIOS,
  Alert,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  View,
} from "react-native";
import { Image as ExpoImage } from "expo-image";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import { Feather } from "@expo/vector-icons";

import { Button } from "@/components/ui/Button";
import { IconButton } from "@/components/ui/IconButton";
import { Surface } from "@/components/ui/Surface";
import { Text } from "@/components/ui/Text";
import { TextField } from "@/components/ui/TextField";
import { useTheme } from "@/hooks/useTheme";
import type { ProfileFormData } from "@/hooks/useProfile";

export interface EditProfileModalProps {
  isVisible: boolean;
  onClose: () => void;
  formData: ProfileFormData;
  saveProfile: () => Promise<void>;
  updateFormField: (field: keyof ProfileFormData, value: string) => void;
  isUpdating: boolean;
  selectedProfileImage: string | null;
  selectedBannerImage: string | null;
  pickImageFromGallery: (type: "profilePicture" | "bannerImage") => void;
  takePhoto: (type: "profilePicture" | "bannerImage") => void;
  removeImage: (type: "profilePicture" | "bannerImage") => void;
  usernameValidation: (username: string) => Promise<boolean>;
  usernameValidate: boolean;
  usernameValidateErrors: string[];
}

/**
 * Edit profile sheet.
 *
 * Form architecture:
 *  - Each field is independently controlled by `updateFormField`. We
 *    don't run username validation on every keystroke — that's the
 *    parent hook's job, debounced upstream.
 *  - Image actions go through a platform-aware menu: ActionSheet on iOS,
 *    Alert on Android. Both routes terminate in the same handlers.
 *
 * Performance: the modal is mounted in the tree but only paints when
 * `isVisible`, which keeps form state hot without a re-mount cost.
 */
function EditProfileModalImpl({
  isVisible,
  onClose,
  formData,
  saveProfile,
  updateFormField,
  isUpdating,
  selectedProfileImage,
  selectedBannerImage,
  pickImageFromGallery,
  takePhoto,
  removeImage,
  usernameValidation,
  usernameValidate,
  usernameValidateErrors,
}: EditProfileModalProps) {
  const { colors, spacing, radii } = useTheme();
  const insets = useSafeAreaInsets();

  const showImageMenu = useCallback(
    (type: "profilePicture" | "bannerImage") => {
      const options = ["Cancel", "Choose from gallery", "Take photo", "Remove"];
      if (Platform.OS === "ios") {
        ActionSheetIOS.showActionSheetWithOptions(
          { options, cancelButtonIndex: 0, destructiveButtonIndex: 3 },
          (i: number) => {
            if (i === 1) pickImageFromGallery(type);
            if (i === 2) takePhoto(type);
            if (i === 3) removeImage(type);
          }
        );
      } else {
        Alert.alert("Update image", undefined, [
          { text: "Choose from gallery", onPress: () => pickImageFromGallery(type) },
          { text: "Take photo", onPress: () => takePhoto(type) },
          { text: "Remove", style: "destructive", onPress: () => removeImage(type) },
          { text: "Cancel", style: "cancel" },
        ]);
      }
    },
    [pickImageFromGallery, removeImage, takePhoto]
  );

  const onSave = useCallback(async () => {
    const ok = formData.username ? await usernameValidation(formData.username) : true;
    if (!ok) return;
    await saveProfile();
  }, [formData.username, saveProfile, usernameValidation]);

  return (
    <Modal
      visible={isVisible}
      animationType="slide"
      transparent
      onRequestClose={onClose}
      statusBarTranslucent
    >
      <View style={{ flex: 1, backgroundColor: colors.overlay.scrim }}>
        <SafeAreaView edges={["top", "bottom"]} style={{ flex: 1 }}>
          <KeyboardAvoidingView
            behavior={Platform.OS === "ios" ? "padding" : "height"}
            keyboardVerticalOffset={insets.top + 8}
            style={{ flex: 1, padding: spacing.base }}
          >
            <Surface
              variant="solid"
              radius={radii.xl}
              style={{
                flex: 1,
                overflow: "hidden",
                borderWidth: 1,
                borderColor: colors.border.subtle,
              }}
            >
              {/* Header */}
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  paddingHorizontal: spacing.lg,
                  paddingVertical: spacing.md,
                  borderBottomWidth: 1,
                  borderBottomColor: colors.border.subtle,
                  gap: spacing.md,
                }}
              >
                <IconButton accessibilityLabel="Close" onPress={onClose}>
                  <Feather name="x" size={20} color={colors.text.primary} />
                </IconButton>
                <Text variant="title" tone="primary" style={{ flex: 1 }}>
                  Edit profile
                </Text>
                <Button label="Save" size="sm" loading={isUpdating} onPress={onSave} />
              </View>

              <ScrollView
                contentContainerStyle={{ padding: spacing.lg, gap: spacing.lg }}
                showsVerticalScrollIndicator={false}
                keyboardShouldPersistTaps="handled"
              >
                {/* Banner */}
                <Pressable
                  onPress={() => showImageMenu("bannerImage")}
                  accessibilityRole="button"
                  accessibilityLabel="Change banner image"
                  style={{
                    height: 140,
                    borderRadius: radii.lg,
                    overflow: "hidden",
                    backgroundColor: colors.surface.secondary,
                    justifyContent: "center",
                    alignItems: "center",
                  }}
                >
                  {selectedBannerImage || formData.bannerImage ? (
                    <ExpoImage
                      source={{ uri: selectedBannerImage || formData.bannerImage }}
                      style={{ width: "100%", height: "100%" }}
                      contentFit="cover"
                      cachePolicy="memory-disk"
                    />
                  ) : (
                    <Feather name="image" size={28} color={colors.text.tertiary} />
                  )}
                  <View
                    style={{
                      position: "absolute",
                      right: spacing.sm,
                      bottom: spacing.sm,
                      width: 36,
                      height: 36,
                      borderRadius: 18,
                      backgroundColor: "rgba(0,0,0,0.55)",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <Feather name="camera" size={16} color="#fff" />
                  </View>
                </Pressable>

                {/* Avatar */}
                <View style={{ alignItems: "center", marginTop: -64 }}>
                  <Pressable
                    onPress={() => showImageMenu("profilePicture")}
                    accessibilityRole="button"
                    accessibilityLabel="Change profile picture"
                    style={{
                      width: 96,
                      height: 96,
                      borderRadius: 48,
                      overflow: "hidden",
                      borderWidth: 4,
                      borderColor: colors.surface.primary,
                      backgroundColor: colors.surface.secondary,
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    {selectedProfileImage || formData.profilePicture ? (
                      <ExpoImage
                        source={{ uri: selectedProfileImage || formData.profilePicture }}
                        style={{ width: 96, height: 96 }}
                        contentFit="cover"
                        cachePolicy="memory-disk"
                      />
                    ) : (
                      <Feather name="user" size={28} color={colors.text.tertiary} />
                    )}
                    <View
                      style={{
                        position: "absolute",
                        right: 0,
                        bottom: 0,
                        width: 28,
                        height: 28,
                        borderRadius: 14,
                        backgroundColor: colors.tint.primary,
                        alignItems: "center",
                        justifyContent: "center",
                        borderWidth: 2,
                        borderColor: colors.surface.primary,
                      }}
                    >
                      <Feather name="camera" size={12} color={colors.text.onTint} />
                    </View>
                  </Pressable>
                </View>

                {/* Fields */}
                <TextField
                  label="First name"
                  value={formData.firstName}
                  onChangeText={(t) => updateFormField("firstName", t)}
                  placeholder="First name"
                  autoCapitalize="words"
                  returnKeyType="next"
                />
                <TextField
                  label="Last name"
                  value={formData.lastName}
                  onChangeText={(t) => updateFormField("lastName", t)}
                  placeholder="Last name"
                  autoCapitalize="words"
                  returnKeyType="next"
                />
                <TextField
                  label="Username"
                  value={formData.username}
                  onChangeText={(t) => updateFormField("username", t.toLowerCase())}
                  placeholder="username"
                  autoCapitalize="none"
                  autoCorrect={false}
                  error={usernameValidate ? undefined : usernameValidateErrors[0]}
                  helper="Letters, numbers, underscores. 3–30 characters."
                />
                <TextField
                  label="Bio"
                  value={formData.bio}
                  onChangeText={(t) => updateFormField("bio", t)}
                  placeholder="A short line about you"
                  multiline
                  maxLength={160}
                  helper={`${formData.bio.length}/160`}
                  style={{ height: 96, textAlignVertical: "top" }}
                />
                <TextField
                  label="Location"
                  value={formData.location}
                  onChangeText={(t) => updateFormField("location", t)}
                  placeholder="City, country (optional)"
                />
              </ScrollView>
            </Surface>
          </KeyboardAvoidingView>
        </SafeAreaView>
      </View>
    </Modal>
  );
}

export const EditProfileModal = memo(EditProfileModalImpl);
EditProfileModal.displayName = "EditProfileModal";

export default EditProfileModal;
