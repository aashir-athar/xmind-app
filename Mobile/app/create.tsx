/**
 * Create — full-screen modal hosting the post composer.
 *
 * Lever: dedicated focus.
 *  Lifting the composer out of the home feed turns posting into a
 *  deliberate moment — fewer competing affordances, less friction
 *  toward typing the first character. IG and FB both ship this pattern;
 *  it's the right place for the user's attention when they reach the
 *  centre create button.
 */
import React, { useCallback, useEffect } from "react";
import { Platform, Pressable, TextInput, View } from "react-native";
import { Image as ExpoImage } from "expo-image";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { useUser } from "@clerk/clerk-expo";
import { Feather } from "@expo/vector-icons";
import { KeyboardAvoidingView } from "react-native-keyboard-controller";

import { Avatar } from "@/components/ui/Avatar";
import { Button } from "@/components/ui/Button";
import { CharCounterRing } from "@/components/ui/CharCounterRing";
import { IconButton } from "@/components/ui/IconButton";
import { Text } from "@/components/ui/Text";
import { useTheme } from "@/hooks/useTheme";
import { useCreatePost } from "@/hooks/useCreatePost";

const MAX_LEN = 300;

export default function CreateScreen() {
  const { colors, spacing } = useTheme();
  const router = useRouter();
  const { user } = useUser();
  const {
    content,
    setContent,
    selectedImage,
    isCreating,
    pickImageFromGallery,
    removeImage,
    createPost,
  } = useCreatePost();

  const handlePost = useCallback(() => {
    if (!content.trim() && !selectedImage) return;
    createPost();
    router.back();
  }, [content, createPost, router, selectedImage]);

  const length = content.length;
  const overrun = length > MAX_LEN;
  const canPost = (content.trim().length > 0 || !!selectedImage) && !overrun;

  useEffect(() => {
    return () => {
      setContent("");
    };
  }, [setContent]);

  return (
    <View style={{ flex: 1, backgroundColor: colors.bg.canvas }}>
      <SafeAreaView edges={["top"]}>
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            paddingHorizontal: spacing.lg,
            paddingVertical: spacing.md,
            borderBottomWidth: 0.5,
            borderBottomColor: colors.border.subtle,
            gap: spacing.md,
          }}
        >
          <IconButton
            accessibilityLabel="Cancel"
            onPress={() => router.back()}
            variant="filled"
          >
            <Feather name="x" size={20} color={colors.text.primary} />
          </IconButton>
          <Text variant="title" tone="primary" style={{ flex: 1 }}>
            New post
          </Text>
          <Button
            label={isCreating ? "Posting" : "Post"}
            size="sm"
            loading={isCreating}
            disabled={!canPost}
            onPress={handlePost}
          />
        </View>
      </SafeAreaView>

      <KeyboardAvoidingView
        // iOS uses `padding` so the inset grows under the composer; Android
        // uses `height` because `padding` clashes with the system soft-keyboard
        // resize on edge-to-edge layouts (RN's documented platform split).
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1 }}
        keyboardVerticalOffset={0}
      >
        <View style={{ flex: 1, padding: spacing.lg }}>
          <View style={{ flexDirection: "row", gap: spacing.md }}>
            <Avatar
              source={user?.imageUrl}
              name={`${user?.firstName ?? ""} ${user?.lastName ?? ""}`}
              size={44}
            />
            <View style={{ flex: 1 }}>
              <Text variant="subtitle" tone="primary" weight="700">
                {user?.firstName} {user?.lastName}
              </Text>
              <Text variant="caption" tone="tertiary">
                Posting publicly
              </Text>
            </View>
          </View>

          <View style={{ marginTop: spacing.lg, flex: 1 }}>
            <TextInput
              autoFocus
              multiline
              value={content}
              onChangeText={setContent}
              placeholder="What's on your mind?"
              placeholderTextColor={colors.text.tertiary}
              style={{
                flex: 1,
                fontSize: 18,
                lineHeight: 26,
                color: colors.text.primary,
                textAlignVertical: "top",
              }}
              accessibilityLabel="Post content"
            />
          </View>

          {selectedImage ? (
            <View
              style={{
                borderRadius: 18,
                overflow: "hidden",
                marginTop: spacing.md,
                position: "relative",
              }}
            >
              <ExpoImage
                source={{ uri: selectedImage }}
                style={{ width: "100%", aspectRatio: 1 }}
                contentFit="cover"
                transition={120}
              />
              <Pressable
                onPress={removeImage}
                accessibilityRole="button"
                accessibilityLabel="Remove image"
                hitSlop={8}
                style={{
                  position: "absolute",
                  top: 8,
                  right: 8,
                  width: 32,
                  height: 32,
                  borderRadius: 16,
                  backgroundColor: "rgba(0,0,0,0.55)",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Feather name="x" size={16} color="#fff" />
              </Pressable>
            </View>
          ) : null}
        </View>

        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
            paddingHorizontal: spacing.lg,
            paddingVertical: spacing.md,
            borderTopWidth: 0.5,
            borderTopColor: colors.border.subtle,
            backgroundColor: colors.bg.canvas,
          }}
        >
          <View style={{ flexDirection: "row", gap: spacing.sm }}>
            <IconButton
              accessibilityLabel="Add image"
              onPress={pickImageFromGallery}
              variant="filled"
            >
              <Feather name="image" size={20} color={colors.tint.primary} />
            </IconButton>
            <IconButton
              accessibilityLabel="Add hashtag"
              onPress={() => setContent((prev) => `${prev} #`)}
              variant="filled"
            >
              <Feather name="hash" size={20} color={colors.tint.primary} />
            </IconButton>
          </View>
          <CharCounterRing current={length} max={MAX_LEN} size={28} strokeWidth={3} />
        </View>
      </KeyboardAvoidingView>
    </View>
  );
}
