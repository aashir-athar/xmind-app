import React, { useEffect } from "react";
import { Image, View } from "react-native";
import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { Feather } from "@expo/vector-icons";
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withRepeat,
  withSpring,
  withTiming,
} from "react-native-reanimated";

import { Button } from "@/components/ui/Button";
import { Text } from "@/components/ui/Text";
import { useTheme } from "@/hooks/useTheme";

/**
 * Welcome screen.
 *
 * Copy strategy (BAB framework — Before, After, Bridge):
 *  - Before: implicit, the user already feels social media is loud.
 *  - After: "A quieter place to think out loud."
 *  - Bridge: a single primary CTA. No "or sign up with X" noise here —
 *    that lives one tap away on the sign-in screen so the welcome can
 *    breathe (Hick's Law: fewer choices, faster decisions).
 *
 * Layout uses NativeWind classes; only Reanimated-driven transforms
 * stay inline.
 */
export default function WelcomeScreen() {
  const router = useRouter();
  const { colors } = useTheme();

  const float = useSharedValue(0);
  const fade = useSharedValue(0);
  const rise = useSharedValue(24);

  useEffect(() => {
    float.value = withRepeat(
      withTiming(1, { duration: 2400, easing: Easing.inOut(Easing.sin) }),
      -1,
      true
    );
    fade.value = withDelay(120, withTiming(1, { duration: 480 }));
    rise.value = withDelay(120, withSpring(0, { damping: 22, stiffness: 220, mass: 0.9 }));
  }, [float, fade, rise]);

  const heroStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: -float.value * 8 }],
  }));

  const contentStyle = useAnimatedStyle(() => ({
    opacity: fade.value,
    transform: [{ translateY: rise.value }],
  }));

  return (
    <View className="flex-1 bg-canvas">
      <SafeAreaView className="flex-1" edges={["top", "bottom"]}>
        <View className="flex-1 items-center justify-center px-xl">
          <Animated.View style={heroStyle}>
            <Image
              source={require("../../assets/images/auth2.png")}
              style={{ width: 280, height: 220 }}
              resizeMode="contain"
            />
          </Animated.View>

          <Animated.View
            style={contentStyle}
            className="items-center mt-xxl"
          >
            <Text
              variant="display"
              tone="primary"
              align="center"
              className="mb-md"
            >
              xMind
            </Text>
            <Text variant="title" tone="secondary" align="center" weight="500">
              A quieter place to think out loud.
            </Text>
            <Text
              variant="body"
              tone="tertiary"
              align="center"
              className="mt-base"
              style={{ maxWidth: 320 }}
            >
              Slow social, on purpose. Say what you actually think — and find the people who think too.
            </Text>
          </Animated.View>
        </View>

        <View className="px-xl pb-xl gap-sm">
          <Button
            label="Get started"
            size="lg"
            fullWidth
            onPress={() => router.push("/(auth)/sign-in")}
            trailing={<Feather name="arrow-right" size={20} color={colors.text.onTint} />}
          />
          <Text variant="caption" tone="tertiary" align="center">
            Tap continue and you're agreeing to our Terms and Privacy Policy.
          </Text>
        </View>
      </SafeAreaView>
    </View>
  );
}
