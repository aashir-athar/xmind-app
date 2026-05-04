/**
 * ProfileTabs — sub-nav for a profile screen.
 *
 * Architectural role:
 *  Twitter/Facebook-style segmented sub-navigation under the profile
 *  card. Mirrors the user's mental model of "what part of this person's
 *  output am I looking at right now". Posts, Replies, Media, Likes are
 *  the canonical four; Replies/Media/Likes are placeholder targets in
 *  V1, with copy that explains the upcoming feature instead of stubbing
 *  with a TODO.
 *
 * Psychology lever:
 *  Progressive disclosure. The sub-nav shows the user there's more to
 *  this profile than the default Posts feed without flooding the page
 *  with content the user didn't ask for. Each tab is a doorway, not
 *  another stack of UI demanding attention.
 */
import React, { memo, useCallback, useEffect, useState } from "react";
import { type LayoutChangeEvent, Pressable, View } from "react-native";
import * as Haptics from "expo-haptics";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from "react-native-reanimated";

import { Text } from "@/components/ui/Text";
import { useTheme } from "@/hooks/useTheme";

export type ProfileTab = "posts" | "replies" | "media" | "likes";

const TAB_DEFS: Array<{ id: ProfileTab; label: string }> = [
  { id: "posts", label: "Posts" },
  { id: "replies", label: "Replies" },
  { id: "media", label: "Media" },
  { id: "likes", label: "Likes" },
];

export interface ProfileTabsProps {
  active: ProfileTab;
  onChange: (next: ProfileTab) => void;
}

function ProfileTabsImpl({ active, onChange }: ProfileTabsProps) {
  const { colors, spacing } = useTheme();
  const [tabWidth, setTabWidth] = useState(0);

  const indicatorX = useSharedValue(0);
  const tabIndex = Math.max(
    0,
    TAB_DEFS.findIndex((t) => t.id === active)
  );

  useEffect(() => {
    if (tabWidth > 0) {
      indicatorX.value = withSpring(tabIndex * tabWidth, {
        damping: 22,
        stiffness: 220,
        mass: 0.9,
      });
    }
  }, [indicatorX, tabIndex, tabWidth]);

  const indicatorStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: indicatorX.value }],
  }));

  const onLayout = useCallback((e: LayoutChangeEvent) => {
    const w = e.nativeEvent.layout.width;
    if (w > 0) setTabWidth(w / TAB_DEFS.length);
  }, []);

  const onPressTab = useCallback(
    (id: ProfileTab) => {
      if (id === active) return;
      Haptics.selectionAsync().catch(() => undefined);
      onChange(id);
    },
    [active, onChange]
  );

  return (
    <View
      onLayout={onLayout}
      style={{
        flexDirection: "row",
        borderBottomWidth: 1,
        borderBottomColor: colors.border.subtle,
        backgroundColor: colors.bg.canvas,
        position: "relative",
      }}
    >
      {tabWidth > 0 ? (
        <Animated.View
          pointerEvents="none"
          style={[
            {
              position: "absolute",
              bottom: 0,
              left: 0,
              width: tabWidth,
              height: 3,
              backgroundColor: colors.tint.primary,
              borderTopLeftRadius: 3,
              borderTopRightRadius: 3,
            },
            indicatorStyle,
          ]}
        />
      ) : null}

      {TAB_DEFS.map((tab) => {
        const focused = tab.id === active;
        return (
          <Pressable
            key={tab.id}
            onPress={() => onPressTab(tab.id)}
            accessibilityRole="tab"
            accessibilityState={{ selected: focused }}
            accessibilityLabel={tab.label}
            android_ripple={{ color: colors.overlay.press }}
            style={({ pressed }) => ({
              flex: 1,
              alignItems: "center",
              justifyContent: "center",
              paddingVertical: spacing.md,
              opacity: pressed ? 0.7 : 1,
            })}
          >
            <Text
              variant="label"
              tone={focused ? "primary" : "tertiary"}
              weight={focused ? "700" : "600"}
            >
              {tab.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

export const ProfileTabs = memo(ProfileTabsImpl);
ProfileTabs.displayName = "ProfileTabs";

export default ProfileTabs;
