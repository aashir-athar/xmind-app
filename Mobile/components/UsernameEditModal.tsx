import React, { memo, useCallback, useEffect, useMemo, useState } from "react";
import { Modal, Pressable, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Feather } from "@expo/vector-icons";

import { Button } from "@/components/ui/Button";
import { IconButton } from "@/components/ui/IconButton";
import { Surface } from "@/components/ui/Surface";
import { Text } from "@/components/ui/Text";
import { TextField } from "@/components/ui/TextField";
import { useTheme } from "@/hooks/useTheme";
import { useUsernameUpdate } from "@/hooks/useUsernameUpdate";

export interface UsernameEditModalProps {
  visible: boolean;
  currentUsername: string;
  onClose: () => void;
}

/**
 * Sheet for editing a username in isolation. Validation happens locally
 * — only allowed characters and length — and the parent hook handles
 * uniqueness and the network roundtrip.
 */
function UsernameEditModalImpl({ visible, currentUsername, onClose }: UsernameEditModalProps) {
  const { colors, spacing, radii } = useTheme();
  const { updateUsername, isUpdating } = useUsernameUpdate();
  const [next, setNext] = useState(currentUsername);

  useEffect(() => {
    if (visible) setNext(currentUsername);
  }, [currentUsername, visible]);

  const error = useMemo(() => {
    const value = next.trim();
    if (value.length === 0) return "Pick a username.";
    if (value.length < 3 || value.length > 30) return "Use 3 to 30 characters.";
    if (!/^[a-zA-Z0-9_]+$/.test(value)) return "Letters, numbers, and underscores only.";
    return undefined;
  }, [next]);

  const onSave = useCallback(async () => {
    if (error) return;
    await updateUsername(next.trim());
    onClose();
  }, [error, next, onClose, updateUsername]);

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
      statusBarTranslucent
    >
      <View
        style={{
          flex: 1,
          backgroundColor: colors.overlay.scrim,
          alignItems: "center",
          justifyContent: "center",
          padding: spacing.lg,
        }}
      >
        <SafeAreaView style={{ width: "100%", alignItems: "center" }}>
          <Surface
            variant="solid"
            radius={radii.xl}
            style={{
              width: "100%",
              maxWidth: 360,
              padding: spacing.lg,
              borderWidth: 1,
              borderColor: colors.border.subtle,
              gap: spacing.md,
            }}
          >
            <View style={{ flexDirection: "row", alignItems: "center", gap: spacing.md }}>
              <Text variant="title" tone="primary" style={{ flex: 1 }}>
                Edit username
              </Text>
              <IconButton accessibilityLabel="Close" onPress={onClose}>
                <Feather name="x" size={20} color={colors.text.primary} />
              </IconButton>
            </View>

            <Text variant="bodySm" tone="secondary">
              Your @handle. People use it to find you and tag you.
            </Text>

            <TextField
              value={next}
              onChangeText={(t) => setNext(t.toLowerCase())}
              placeholder="username"
              autoCapitalize="none"
              autoCorrect={false}
              error={error}
              helper="Letters, numbers, underscores. 3–30 characters."
            />

            <View style={{ flexDirection: "row", gap: spacing.sm, justifyContent: "flex-end", marginTop: spacing.sm }}>
              <Button label="Cancel" variant="secondary" onPress={onClose} />
              <Button label="Save" loading={isUpdating} disabled={!!error} onPress={onSave} />
            </View>
          </Surface>
        </SafeAreaView>
      </View>
    </Modal>
  );
}

export const UsernameEditModal = memo(UsernameEditModalImpl);
UsernameEditModal.displayName = "UsernameEditModal";

export default UsernameEditModal;
