import React, { useEffect } from "react";
import { View } from "react-native";
import { Image as ExpoImage } from "expo-image";
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
 * Copy strategy (PAS — Problem, Agitate, Solution):
 *  - Problem: feeds are noisy and forgettable.
 *  - Agitate: implicit — every other social app already does this.
 *  - Solution: a fast, clean place to share what's actually happening.
 *
 * Motion strategy:
 *  - The hero illustration breathes on a slow vertical loop and a
 *    second decorative layer counter-rotates very slightly to imply
 *    parallax depth without ever crossing into the kind of motion
 *    that triggers reduced-motion settings or vestibular discomfort.
 *  - Title + body fade and rise once on mount. Single, intentional
 *    cue — never a "look at me" entrance.
 *
 * Layout uses NativeWind classes; only Reanimated-driven transforms
 * stay inline. A single primary CTA reduces decision time (Hick's Law).
 */
export default function WelcomeScreen() {
  const router = useRouter();
  const { colors } = useTheme();

  const float = useSharedValue(0);
  const drift = useSharedValue(0);
  const fade = useSharedValue(0);
  const rise = useSharedValue(24);

  useEffect(() => {
    float.value = withRepeat(
      withTiming(1, { duration: 2400, easing: Easing.inOut(Easing.sin) }),
      -1,
      true
    );
    // Slower counter-loop on the back layer for the parallax effect.
    drift.value = withRepeat(
      withTiming(1, { duration: 4800, easing: Easing.inOut(Easing.sin) }),
      -1,
      true
    );
    fade.value = withDelay(120, withTiming(1, { duration: 480 }));
    rise.value = withDelay(120, withSpring(0, { damping: 22, stiffness: 220, mass: 0.9 }));
  }, [drift, fade, float, rise]);

  // Foreground hero — moves more
  const heroStyle = useAnimatedStyle(() => ({
    transform: [
      { translateY: -float.value * 10 },
      { translateX: float.value * 4 },
    ],
  }));

  // Background glow halo — moves less, opposite direction. The two
  // layers together produce a parallax depth cue without any 3D math.
  const haloStyle = useAnimatedStyle(() => ({
    opacity: 0.35 + drift.value * 0.15,
    transform: [
      { translateY: drift.value * 6 },
      { translateX: -drift.value * 3 },
      { scale: 1 + drift.value * 0.04 },
    ],
  }));

  const contentStyle = useAnimatedStyle(() => ({
    opacity: fade.value,
    transform: [{ translateY: rise.value }],
  }));

  return (
    <View className="flex-1 bg-canvas">
      <SafeAreaView className="flex-1" edges={["top", "bottom"]}>
        <View className="flex-1 items-center justify-center px-xl">
          <View
            style={{
              width: 320,
              height: 260,
              alignItems: "center",
              justifyContent: "center",
              position: "relative",
            }}
          >
            {/* Halo backdrop — soft tint glow. */}
            <Animated.View
              pointerEvents="none"
              style={[
                {
                  position: "absolute",
                  width: 280,
                  height: 280,
                  borderRadius: 140,
                  backgroundColor: colors.tint.primary,
                  opacity: 0.18,
                },
                haloStyle,
              ]}
            />
            <Animated.View style={heroStyle}>
              <ExpoImage
                source={require("../../assets/images/auth2.png")}
                style={{ width: 280, height: 220 }}
                contentFit="contain"
                cachePolicy="memory-disk"
                transition={200}
              />
            </Animated.View>
          </View>

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
              Share what's happening. Right now.
            </Text>
            <Text
              variant="body"
              tone="tertiary"
              align="center"
              className="mt-base"
              style={{ maxWidth: 320 }}
            >
              Post in a tap. Follow people who get it. Catch the conversation while it's still hot.
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