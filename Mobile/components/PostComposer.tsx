import React, { memo, useCallback, useState } from "react";
import { Image, Pressable, TextInput, View } from "react-native";
import { useUser } from "@clerk/clerk-expo";
import { Feather } from "@expo/vector-icons";

import { Avatar } from "@/components/ui/Avatar";
import { Button } from "@/components/ui/Button";
import { IconButton } from "@/components/ui/IconButton";
import { Surface } from "@/components/ui/Surface";
import { Text } from "@/components/ui/Text";
import { useTheme } from "@/hooks/useTheme";
import { useCreatePost } from "@/hooks/useCreatePost";

const MAX_LEN = 300;

/**
 * Post composer.
 *
 * Psychology:
 *  - Progressive disclosure — collapsed when idle, expands only on focus.
 *    Reduces blank-canvas anxiety on the home screen.
 *  - Counter turns warning amber at 90% and red at 100% — pre-emptive
 *    feedback. The user knows the cliff is coming before they fall off.
 *  - Single primary CTA. No "Save draft / Schedule / Cancel" — those
 *    add friction without serving the dominant action.
 */
function PostComposerImpl() {
  const { colors } = useTheme();
  const { user } = useUser();
  const {
    content,
    setContent,
    selectedImage,
    isCreating,
    pickImageFromGallery,
    takePhoto,
    removeImage,
    createPost,
  } = useCreatePost();

  const [focused, setFocused] = useState(false);

  const length = content.length;
  const remaining = MAX_LEN - length;
  const overrun = remaining < 0;
  const warn = remaining <= 30 && remaining >= 0;

  const counterTone = overrun ? "danger" : warn ? "tint" : "tertiary";

  const onCreate = useCallback(() => {
    if (!content.trim() && !selectedImage) return;
    createPost();
  }, [content, createPost, selectedImage]);

  const expanded = focused || length > 0 || !!selectedImage;

  return (
    <Surface
      variant="solid"
      radius={20}
      className="p-base"
      style={{
        borderWidth: 1,
        // Border colour is dynamic with focus, so it stays inline.
        borderColor: focused ? colors.border.focus : colors.border.subtle,
      }}
    >
      <View className="flex-row gap-md">
        <Avatar
          source={user?.imageUrl}
          name={`${user?.firstName ?? ""} ${user?.lastName ?? ""}`}
          size={40}
        />

        <View className="flex-1 gap-sm">
          <TextInput
            value={content}
            onChangeText={setContent}
            onFocus={() => setFocused(true)}
            onBlur={() => setFocused(false)}
            placeholder="Say something true."
            placeholderTextColor={colors.text.tertiary}
            multiline
            maxLength={MAX_LEN + 50}
            style={{
              fontSize: 16,
              lineHeight: 22,
              color: colors.text.primary,
              minHeight: expanded ? 64 : 40,
              textAlignVertical: "top",
              paddingTop: 0,
            }}
            accessibilityLabel="Post content"
          />

          {selectedImage ? (
            <View className="rounded-base overflow-hidden relative">
              <Image
                source={{ uri: selectedImage }}
                style={{ width: "100%", aspectRatio: 16 / 10 }}
                resizeMode="cover"
              />
              <Pressable
                onPress={removeImage}
                accessibilityRole="button"
                accessibilityLabel="Remove image"
                hitSlop={8}
                className="absolute top-sm right-sm w-[32px] h-[32px] rounded-full items-center justify-center"
                style={{ backgroundColor: "rgba(0,0,0,0.55)" }}
              >
                <Feather name="x" size={16} color="#fff" />
              </Pressable>
            </View>
          ) : null}

          {expanded ? (
            <View className="flex-row items-center justify-between mt-xs">
              <View className="flex-row gap-xs">
                <IconButton
                  accessibilityLabel="Add image"
                  onPress={pickImageFromGallery}
                  disabled={isCreating}
                  variant="tinted"
                  size={36}
                >
                  <Feather name="image" size={18} color={colors.tint.primary} />
                </IconButton>
                <IconButton
                  accessibilityLabel="Take photo"
                  onPress={takePhoto}
                  disabled={isCreating}
                  variant="tinted"
                  size={36}
                >
                  <Feather name="camera" size={18} color={colors.tint.primary} />
                </IconButton>
              </View>

              <View className="flex-row items-center gap-md">
                <Text variant="caption" tone={counterTone}>
                  {overrun ? `${-remaining} over` : `${remaining}`}
                </Text>
                <Button
                  label="Post"
                  size="sm"
                  loading={isCreating}
                  disabled={(!content.trim() && !selectedImage) || overrun}
                  onPress={onCreate}
                />
              </View>
            </View>
          ) : null}
        </View>
      </View>
    </Surface>
  );
}

export const PostComposer = memo(PostComposerImpl);
PostComposer.displayName = "PostComposer";

export default PostComposer;
