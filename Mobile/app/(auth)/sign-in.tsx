import React, { useCallback } from "react";
import { ActivityIndicator, Image, Pressable, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import * as Haptics from "expo-haptics";

import { Surface } from "@/components/ui/Surface";
import { Text } from "@/components/ui/Text";
import { useTheme } from "@/hooks/useTheme";
import { useSocialAuth } from "@/hooks/useSocialAuth";

/**
 * Sign-in screen.
 *
 * Copy strategy (FAB framework — Feature, Advantage, Benefit):
 *  - Feature: continue with Apple / Google.
 *  - Advantage: one tap, no password to remember.
 *  - Benefit: less friction in, less data shared.
 *
 * Design:
 *  - Two equally-weighted CTAs because both options are first-class
 *    auth providers; we don't lie about preference (no fake "recommended"
 *    badge — that's a dark pattern under the 2026 ethics rubric).
 *  - Logo, headline, providers, terms — four stops, scannable.
 */
export default function SignInScreen() {
  const { colors } = useTheme();
  const { handleSocialAuth, isLoading } = useSocialAuth();

  const press = useCallback(
    (provider: "oauth_apple" | "oauth_google") => {
      Haptics.selectionAsync().catch(() => undefined);
      handleSocialAuth(provider);
    },
    [handleSocialAuth]
  );

  return (
    <View className="flex-1 bg-canvas">
      <SafeAreaView className="flex-1" edges={["top", "bottom"]}>
        <View className="flex-1 px-xl">
          <View className="flex-1 items-center justify-center">
            <View
              className="w-[96px] h-[96px] rounded-xl items-center justify-center mb-xl"
              style={{ backgroundColor: colors.tint.primary }}
            >
              <Image
                source={require("../../assets/images/xMind-Logo1.png")}
                style={{ width: 56, height: 56, tintColor: colors.text.onTint }}
                resizeMode="contain"
              />
            </View>

            <Text variant="headline" tone="primary" align="center">
              Sign in to xMind
            </Text>
            <Text
              variant="body"
              tone="secondary"
              align="center"
              className="mt-sm"
              style={{ maxWidth: 320 }}
            >
              One tap. No passwords. We only keep what we need.
            </Text>
          </View>

          <View className="gap-md mb-lg">
            <ProviderButton
              label="Continue with Apple"
              icon={require("../../assets/images/apple.png")}
              loading={isLoading}
              onPress={() => press("oauth_apple")}
            />
            <ProviderButton
              label="Continue with Google"
              icon={require("../../assets/images/google.png")}
              loading={isLoading}
              onPress={() => press("oauth_google")}
            />
          </View>

          <Text
            variant="caption"
            tone="tertiary"
            align="center"
            className="mb-lg"
          >
            By continuing you agree to our Terms and Privacy Policy.
          </Text>
        </View>
      </SafeAreaView>
    </View>
  );
}

interface ProviderButtonProps {
  label: string;
  icon: number;
  loading: boolean;
  onPress: () => void;
}

function ProviderButton({ label, icon, loading, onPress }: ProviderButtonProps) {
  const { colors } = useTheme();
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ busy: loading }}
      onPress={onPress}
      disabled={loading}
      style={({ pressed }) => ({
        opacity: loading ? 0.6 : pressed ? 0.85 : 1,
      })}
    >
      <Surface
        variant="solid"
        className="h-[56px] px-lg flex-row items-center justify-center gap-md border border-subtle"
        radius={999}
      >
        {loading ? (
          <ActivityIndicator color={colors.tint.primary} />
        ) : (
          <>
            <Image source={icon} style={{ width: 22, height: 22 }} resizeMode="contain" />
            <Text variant="subtitle" tone="primary">
              {label}
            </Text>
          </>
        )}
      </Surface>
    </Pressable>
  );
}
