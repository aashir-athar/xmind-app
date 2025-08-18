import React from "react";
import { TouchableOpacity, StyleSheet, View } from "react-native";
import { Feather } from "@expo/vector-icons";
import { BlurView } from "expo-blur";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from "react-native-reanimated";
import { BRAND_COLORS } from "@/constants/colors";
import { useSignOut } from "@/hooks/useSignOut";

const SignOutButton = () => {
  const { handleSignOut, isSigningOut } = useSignOut();
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { scale: withSpring(scale.value, { damping: 15, stiffness: 100 }) },
    ],
  }));

  // Animation values
  const headerOpacity = useSharedValue(1);
  const headerScale = useSharedValue(1);
  const scrollY = useSharedValue(0);
  const logoRotation = useSharedValue(0);
  const gradientProgress = useSharedValue(0);

  const handlePressIn = () => {
    scale.value = 0.95;
  };

  const handlePressOut = () => {
    scale.value = 1;
  };

  const logoAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${logoRotation.value}deg` }],
  }));

  return (
    <TouchableOpacity
      onPress={handleSignOut}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      disabled={isSigningOut}
      activeOpacity={1}
    >
      <Animated.View style={logoAnimatedStyle}>
        <View
          style={{
            width: 40,
            height: 40,
            borderRadius: 20,
            backgroundColor: BRAND_COLORS.ACCENT_MINT,
            justifyContent: "center",
            alignItems: "center",
            shadowColor: BRAND_COLORS.PRIMARY,
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.3,
            shadowRadius: 8,
            elevation: 8,
          }}
        >
          <Feather name="log-out" size={20} color={BRAND_COLORS.SURFACE} />
        </View>
      </Animated.View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: 16,
    overflow: "hidden",
    shadowColor: BRAND_COLORS.PRIMARY_DARK,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  blurContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: BRAND_COLORS.PRIMARY,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: BRAND_COLORS.PRIMARY,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
});

export default SignOutButton;
