import React, { useCallback, useDeferredValue, useState } from "react";
import { Pressable, ScrollView, View } from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { Feather } from "@expo/vector-icons";

import { Card } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/EmptyState";
import { Surface } from "@/components/ui/Surface";
import { Text } from "@/components/ui/Text";
import { TextField } from "@/components/ui/TextField";
import UserSearchResult from "@/components/UserSearchResult";
import { useTheme } from "@/hooks/useTheme";
import { useSearch } from "@/hooks/useSearch";

/**
 * Search.
 *
 * Psychology:
 *  - Resting state shows trending hashtags. Empty input ≠ empty screen.
 *    Filling the void with relevant alternatives is the antidote to
 *    decision paralysis (Hick's Law) and is the single most-effective
 *    pattern for first-touch search retention.
 *  - Results count is honest ("4 results" not "many results"). Specific
 *    numbers build trust.
 *
 * Performance:
 *  - `useDeferredValue` keeps typing snappy by deferring the heavy
 *    filter step until the input is idle. Cheap on the main thread,
 *    deferrable when the user is mid-keystroke.
 */
export default function SearchScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { colors } = useTheme();
  const { trendingHashtags, searchUsers } = useSearch();

  const [query, setQuery] = useState("");
  const deferredQuery = useDeferredValue(query);
  const results = searchUsers(deferredQuery);
  const showResults = deferredQuery.trim().length > 0;

  const onClear = useCallback(() => setQuery(""), []);

  const onHashtag = useCallback(
    (hashtag: string) =>
      router.push({ pathname: "/hashtag-posts", params: { hashtag } }),
    [router]
  );

  return (
    <View className="flex-1 bg-canvas">
      <SafeAreaView edges={["top"]}>
        <View className="px-lg py-md gap-md">
          <Text variant="headline" tone="primary">
            Search
          </Text>
          <TextField
            value={query}
            onChangeText={setQuery}
            placeholder="Find a name or a hashtag"
            autoFocus={false}
            returnKeyType="search"
            leading={<Feather name="search" size={18} color={colors.text.tertiary} />}
            trailing={
              query.length > 0 ? (
                <Pressable
                  onPress={onClear}
                  hitSlop={8}
                  accessibilityRole="button"
                  accessibilityLabel="Clear search"
                  className="w-[28px] h-[28px] rounded-pill items-center justify-center bg-surface-sunken"
                >
                  <Feather name="x" size={14} color={colors.text.secondary} />
                </Pressable>
              ) : null
            }
          />
        </View>
      </SafeAreaView>

      <ScrollView
        contentContainerStyle={{
          paddingHorizontal: 16,
          paddingBottom: 140 + insets.bottom,
          gap: 12,
        }}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {showResults ? (
          results.length > 0 ? (
            <Card variant="solid" padding={0}>
              <View className="p-base">
                <Text variant="label" tone="tertiary">
                  {results.length} {results.length === 1 ? "result" : "results"}
                </Text>
              </View>
              {results.map((u) => (
                <UserSearchResult key={u._id} user={u} />
              ))}
            </Card>
          ) : (
            <EmptyState
              icon={<Feather name="search" size={26} color={colors.tint.primary} />}
              title="Nothing matches yet"
              description="Try a different spelling, a shorter name, or a hashtag."
            />
          )
        ) : (
          <Card variant="solid">
            <Text
              variant="title"
              tone="primary"
              className="mb-md"
            >
              Trending now
            </Text>

            {trendingHashtags.length > 0 ? (
              trendingHashtags.map((item, i) => (
                <Pressable
                  key={`${item.hashtag}-${i}`}
                  onPress={() => onHashtag(item.hashtag)}
                  android_ripple={{ color: colors.overlay.press }}
                  style={({ pressed }) => ({
                    paddingVertical: 12,
                    borderTopWidth: i === 0 ? 0 : 1,
                    borderTopColor: colors.border.subtle,
                    opacity: pressed ? 0.7 : 1,
                  })}
                >
                  <Text variant="caption" tone="tertiary">
                    Trending
                  </Text>
                  <Text variant="subtitle" tone="tint" weight="700">
                    {item.hashtag}
                  </Text>
                  <Text variant="bodySm" tone="secondary">
                    {item.count} {item.count === 1 ? "post" : "posts"}
                  </Text>
                </Pressable>
              ))
            ) : (
              <Surface
                variant="sunken"
                radius={16}
                className="p-lg items-center gap-sm"
              >
                <Feather name="hash" size={22} color={colors.text.tertiary} />
                <Text variant="body" tone="secondary" align="center">
                  No trends yet. Post with a hashtag and you might start one.
                </Text>
              </Surface>
            )}
          </Card>
        )}
      </ScrollView>
    </View>
  );
}
