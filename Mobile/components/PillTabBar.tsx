import React, { memo, useCallback, useEffect, useMemo } from "react";
import { Platform, Pressable, StyleSheet, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from "react-native-reanimated";
import type { BottomTabBarProps } from "@react-navigation/bottom-tabs";

import { Surface } from "@/components/ui/Surface";
import { useTheme } from "@/hooks/useTheme";

type IoniconName = React.ComponentProps<typeof Ionicons>["name"];

interface RouteMeta {
  label: string;
  icon: IoniconName;
  iconActive: IoniconName;
}

const ROUTE_META: Record<string, RouteMeta> = {
  index: { label: "Home", icon: "home-outline", iconActive: "home" },
  search: { label: "Search", icon: "search-outline", iconActive: "search" },
  notifications: {
    label: "Inbox",
    icon: "notifications-outline",
    iconActive: "notifications",
  },
  messages: {
    label: "Messages",
    icon: "chatbubble-outline",
    iconActive: "chatbubble",
  },
  profile: {
    label: "Profile",
    icon: "person-outline",
    iconActive: "person",
  },
};

const TAB_ORDER = ["index", "search", "notifications", "messages", "profile"] as const;

const TAB_SIZE = 56;
const CONTAINER_PADDING = 6;
const GAP = 4;

/**
 * 2026 Pill Tab Bar.
 *
 * Visual contract:
 *  - Capsule (pill) container floating above content with a translucent
 *    material on iOS (Liquid Glass on iOS 26+, BlurView on earlier),
 *    and a flat themed surface on Android (no BlurView on Android per
 *    project policy — BlurView forces software composition on most
 *    low-end Android GPUs and tanks scroll FPS).
 *  - A sliding pill indicator highlights the active tab. The indicator
 *    is animated entirely on the UI thread via Reanimated, so list
 *    scrolling never starves the indicator's spring.
 *  - Active state: filled icon + tinted indicator. Inactive: outline
 *    icon at lower contrast. Hierarchy is unmistakable at a glance.
 *
 * Performance:
 *  - One shared value drives the indicator's translateX. Each tap
 *    mutates a single signal — no JS bridge crossings during the spring.
 *  - The whole bar is `memo`'d, so screen content re-renders never
 *    re-render the bar.
 *  - All sizes precomputed; no per-render layout math.
 *
 * Accessibility:
 *  - Each tab is a tab role with `selected` state.
 *  - Hit slop expands the tap target so reaching the bar from a thumb
 *    on a 6.7" phone never misses (Fitts's Law).
 */
function PillTabBarImpl({ state, navigation }: BottomTabBarProps) {
  const { colors, radii, spacing, mode } = useTheme();
  const insets = useSafeAreaInsets();

  const tabsOrdered = useMemo(
    () =>
      state.routes
        .filter((r) => ROUTE_META[r.name])
        .sort(
          (a, b) =>
            TAB_ORDER.indexOf(a.name as (typeof TAB_ORDER)[number]) -
            TAB_ORDER.indexOf(b.name as (typeof TAB_ORDER)[number])
        ),
    [state.routes]
  );

  const activeIndex = useMemo(() => {
    const focused = state.routes[state.index];
    const idx = tabsOrdered.findIndex((r) => r.key === focused?.key);
    return idx < 0 ? 0 : idx;
  }, [state.index, state.routes, tabsOrdered]);

  const indicatorX = useSharedValue(activeIndex * (TAB_SIZE + GAP));

  useEffect(() => {
    indicatorX.value = withSpring(activeIndex * (TAB_SIZE + GAP), {
      damping: 22,
      stiffness: 220,
      mass: 0.9,
    });
  }, [activeIndex, indicatorX]);

  const indicatorAnimated = useAnimatedStyle(() => ({
    transform: [{ translateX: indicatorX.value }],
  }));

  const onPressTab = useCallback(
    (routeName: string, key: string, isFocused: boolean) => {
      const event = navigation.emit({
        type: "tabPress",
        target: key,
        canPreventDefault: true,
      });
      if (!isFocused && !event.defaultPrevented) {
        Haptics.selectionAsync().catch(() => undefined);
        navigation.navigate(routeName);
      }
    },
    [navigation]
  );

  return (
    <View
      style={{
        position: "absolute",
        bottom: insets.bottom + spacing.sm,
        left: 0,
        right: 0,
        alignItems: "center",
        // Allow taps to pass through outside the pill.
        pointerEvents: "box-none",
      }}
    >
      <View
        style={{
          // Shadow lives on the outer view; clipping lives on the
          // Surface. Combining both on a single layer forces iOS to
          // rasterise the view off-screen — that costs measurable FPS
          // when the indicator springs over the tab.
          shadowColor: "#000",
          shadowOpacity: mode === "dark" ? 0.45 : 0.12,
          shadowRadius: 24,
          shadowOffset: { width: 0, height: 8 },
          elevation: 12,
          borderRadius: radii.pill,
        }}
      >
      <Surface
        variant="glass"
        radius={radii.pill}
        intensity={Platform.OS === "ios" ? 50 : 0}
        tintColor={mode === "dark" ? "#1A1A24" : "#FFFFFF"}
        interactive
        style={{
          flexDirection: "row",
          alignItems: "center",
          padding: CONTAINER_PADDING,
          gap: GAP,
          overflow: "hidden",
          borderWidth: StyleSheet.hairlineWidth,
          borderColor: colors.border.subtle,
          // Android opaque fallback — Surface tints translucently when
          // liquid glass + BlurView are both unavailable.
          backgroundColor:
            Platform.OS === "android" ? colors.surface.raised : undefined,
        }}
      >
        {/* Sliding pill indicator */}
        <Animated.View
          pointerEvents="none"
          style={[
            {
              position: "absolute",
              left: CONTAINER_PADDING,
              top: CONTAINER_PADDING,
              width: TAB_SIZE,
              height: TAB_SIZE,
              borderRadius: TAB_SIZE / 2,
              backgroundColor: colors.tint.primary,
            },
            indicatorAnimated,
          ]}
        />

        {tabsOrdered.map((route, i) => {
          const meta = ROUTE_META[route.name];
          const isFocused = i === activeIndex;
          return (
            <Pressable
              key={route.key}
              accessibilityRole="tab"
              accessibilityState={{ selected: isFocused }}
              accessibilityLabel={meta.label}
              onPress={() => onPressTab(route.name, route.key, isFocused)}
              hitSlop={6}
              style={{
                width: TAB_SIZE,
                height: TAB_SIZE,
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Ionicons
                name={isFocused ? meta.iconActive : meta.icon}
                size={24}
                color={isFocused ? colors.text.onTint : colors.text.secondary}
              />
              {/* Twitter-style: no visible labels at rest. The `accessibilityLabel`
                  on the Pressable still announces the tab to screen readers. */}
            </Pressable>
          );
        })}
      </Surface>
      </View>
    </View>
  );
}

export const PillTabBar = memo(PillTabBarImpl);
PillTabBar.displayName = "PillTabBar";

export default PillTabBar;
