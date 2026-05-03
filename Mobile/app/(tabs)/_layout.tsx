import React from "react";
import { Redirect, Tabs } from "expo-router";
import { useAuth } from "@clerk/clerk-expo";

import PillTabBar from "@/components/PillTabBar";

/**
 * Tab navigator. Auth gating happens here so the tab UI never paints
 * for an anonymous user — a single redirect keeps the entry feel
 * instant instead of flashing a logged-in shell.
 */
export default function TabsLayout() {
  const { isSignedIn, isLoaded } = useAuth();

  if (!isLoaded) return null;
  if (!isSignedIn) return <Redirect href="/(auth)" />;

  return (
    <Tabs
      initialRouteName="index"
      screenOptions={{
        headerShown: false,
        // Prevents the system tab bar from briefly painting before the
        // custom one mounts when navigating from auth → tabs.
        tabBarStyle: { display: "none" },
      }}
      tabBar={(props) => <PillTabBar {...props} />}
    >
      <Tabs.Screen name="index" />
      <Tabs.Screen name="search" />
      <Tabs.Screen name="notifications" />
      <Tabs.Screen name="messages" />
      <Tabs.Screen name="profile" />
    </Tabs>
  );
}
