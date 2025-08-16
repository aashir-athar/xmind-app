import React, { useEffect } from "react";
import { Dimensions } from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  withDelay,
} from "react-native-reanimated";
import { TAB_CONFIG } from "../constants/colors";

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get("window");
const aspectRatio = SCREEN_HEIGHT / SCREEN_WIDTH;
const scale = Math.min(
  Math.max((SCREEN_WIDTH / 430) * (aspectRatio > 2 ? 0.9 : 1), 0.85),
  1.2
);

interface AnimatedTabContainerProps {
  children: React.ReactNode;
  insets: { bottom: number };
}

export const AnimatedTabContainer: React.FC<AnimatedTabContainerProps> = ({
  children,
  insets,
}) => {
  const slideUpAnimation = useSharedValue(100 * scale);
  const scaleAnimation = useSharedValue(0.8);
  const opacityAnimation = useSharedValue(0);

  useEffect(() => {
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
          left: 20 * scale,
          right: 20 * scale,
          bottom: insets.bottom * scale,
          borderRadius: TAB_CONFIG.BORDER_RADIUS * scale,
          overflow: "hidden",
        },
        animatedContainerStyle,
      ]}
    >
      {children}
    </Animated.View>
  );
};
