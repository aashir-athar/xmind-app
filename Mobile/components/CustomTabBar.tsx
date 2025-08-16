import React, { useEffect } from "react";
import { View, Dimensions } from "react-native";
import type { BottomTabBarProps } from "@react-navigation/bottom-tabs";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useSharedValue, withSpring } from "react-native-reanimated";
import { TabIcon } from "./TabIcon";
import { TabBackground } from "./TabBackground";
import { AnimatedTabContainer } from "./AnimatedTabContainer";
import { TAB_CONFIG } from "../constants/colors";

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get("window");
const aspectRatio = SCREEN_HEIGHT / SCREEN_WIDTH;
const scale = Math.min(
  Math.max((SCREEN_WIDTH / 430) * (aspectRatio > 2 ? 0.9 : 1), 0.85),
  1.2
);

export default function CustomTabBar({
  state,
  descriptors,
  navigation,
}: BottomTabBarProps) {
  const insets = useSafeAreaInsets();
  const TAB_WIDTH =
    (SCREEN_WIDTH - 80 * scale) / Math.max(1, state.routes.length);

  const backgroundMorph = useSharedValue(0);

  useEffect(() => {
    backgroundMorph.value = withSpring(state.index, {
      damping: 15,
      stiffness: 120,
    });
  }, [state.index]);

  const handleTabPress = (route: any, isFocused: boolean) => {
    const event = navigation.emit({
      type: "tabPress",
      target: route.key,
      canPreventDefault: true,
    });

    if (!isFocused && !event.defaultPrevented) {
      navigation.navigate(route.name);
    }
  };

  return (
    <AnimatedTabContainer insets={insets}>
      <TabBackground
        backgroundMorph={backgroundMorph}
        routesLength={state.routes.length}
      />
      <View
        style={{
          flexDirection: "row",
          justifyContent: "space-around",
          alignItems: "center",
          paddingHorizontal: 10 * scale,
          paddingVertical: 15 * scale,
          minHeight: TAB_CONFIG.CONTAINER_HEIGHT * scale,
        }}
      >
        {state.routes.map((route, index) => {
          const isFocused = state.index === index;

          return (
            <TabIcon
              key={route.key}
              route={route}
              isFocused={isFocused}
              onPress={() => handleTabPress(route, isFocused)}
              index={index}
              tabWidth={TAB_WIDTH}
            />
          );
        })}
      </View>
    </AnimatedTabContainer>
  );
}
