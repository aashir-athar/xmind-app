import "../global.css";

import React, { useState } from "react";
import { ClerkProvider } from "@clerk/clerk-expo";
import { tokenCache } from "@clerk/clerk-expo/token-cache";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

import { useTheme } from "@/hooks/useTheme";

/**
 * Inner layout — needs `useTheme()` so it must sit under the providers
 * that the rest of the app relies on. Splitting it out keeps StatusBar
 * style perfectly synced with the active colour scheme on every render.
 */
function ThemedStack() {
  const { statusBarStyle, colors } = useTheme();
  return (
    <>
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: colors.bg.canvas },
          animation: "slide_from_right",
        }}
      >
        <Stack.Screen name="(auth)" />
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="user-profile" />
        <Stack.Screen name="hashtag-posts" />
      </Stack>
      <StatusBar style={statusBarStyle} animated />
    </>
  );
}

/**
 * Root provider stack. Order matters:
 *   GestureHandlerRoot → SafeAreaProvider → Clerk → ReactQuery → app.
 * Gesture handler must wrap everything for swipe-back navigation, and
 * SafeAreaProvider must sit above any screen that reads insets.
 */
export default function RootLayout() {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            // Conservative defaults for mobile: trust cached data while
            // active, only refetch on focus when the data is stale.
            staleTime: 30_000,
            gcTime: 5 * 60_000,
            retry: 1,
            refetchOnWindowFocus: false,
          },
        },
      })
  );

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <ClerkProvider tokenCache={tokenCache}>
          <QueryClientProvider client={queryClient}>
            <ThemedStack />
          </QueryClientProvider>
        </ClerkProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
