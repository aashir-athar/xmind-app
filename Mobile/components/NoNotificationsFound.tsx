import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { Feather } from "@expo/vector-icons";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  Easing,
} from "react-native-reanimated";
import { BRAND_COLORS } from "@/constants/colors";
import { BlurView } from "expo-blur";

const NoNotificationsFound = () => {
  const pulse = useSharedValue(1);

  const animatedIconStyle = useAnimatedStyle(() => ({
    transform: [
      {
        scale: withTiming(pulse.value, {
          duration: 1000,
          easing: Easing.inOut(Easing.ease),
        }),
      },
    ],
  }));

  React.useEffect(() => {
    pulse.value = 1.1;
    const interval = setInterval(() => {
      pulse.value = pulse.value === 1 ? 1.1 : 1;
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <View style={styles.container}>
      <Animated.View style={animatedIconStyle}>
        <Feather name="bell" size={80} color={BRAND_COLORS.ICON_SECONDARY} />
      </Animated.View>
      <Text style={styles.title}>No notifications yet</Text>
      <Text style={styles.description}>
        When people like, comment, or follow you, you&apos;ll see it here.
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 32,
    minHeight: 400,
  },
  blurContainer: {
    alignItems: "center",
    padding: 24,
    borderRadius: 60,
    backgroundColor: `${BRAND_COLORS.SURFACE}80`,
    shadowColor: BRAND_COLORS.PRIMARY_DARK,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
  },
  title: {
    fontSize: 24,
    fontWeight: "600",
    color: BRAND_COLORS.TEXT_SECONDARY,
    marginTop: 16,
    marginBottom: 8,
  },
  description: {
    fontSize: 16,
    color: BRAND_COLORS.PLACEHOLDER,
    textAlign: "center",
    maxWidth: 240,
    lineHeight: 24,
  },
});

export default NoNotificationsFound;
