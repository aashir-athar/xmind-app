import React, { useEffect } from "react";
import { View } from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  withDelay,
} from "react-native-reanimated";
import { TAB_CONFIG } from "../constants/colors";

interface AnimatedTabContainerProps {
  children: React.ReactNode;
  insets: { bottom: number };
}

export const AnimatedTabContainer: React.FC<AnimatedTabContainerProps> = ({
  children,
  insets,
}) => {
  const slideUpAnimation = useSharedValue(100);
  const scaleAnimation = useSharedValue(0.8);
  const opacityAnimation = useSharedValue(0);

  useEffect(() => {
    // Initial entrance animation with staggered timing
    slideUpAnimation.value = withDelay(
      300,
      withSpring(0, { damping: 12, stiffness: 100 })
    );
    scaleAnimation.value = withDelay(
      200,
      withSpring(1, { damping: 10, stiffness: 150 })
    );
    opacityAnimation.value = withDelay(100, withTiming(1, { duration: 400 }));
  }, []);

  const animatedContainerStyle = useAnimatedStyle(() => ({
    transform: [
      { translateY: slideUpAnimation.value },
      { scale: scaleAnimation.value },
    ],
    opacity: opacityAnimation.value,
  }));

  return (
    <Animated.View
      style={[
        {
          position: "absolute",
          left: 20,
          right: 20,
          bottom: insets.bottom + 20,
          borderRadius: TAB_CONFIG.BORDER_RADIUS,
          overflow: "hidden",
        },
        animatedContainerStyle,
      ]}
    >
      {children}
    </Animated.View>
  );
};
