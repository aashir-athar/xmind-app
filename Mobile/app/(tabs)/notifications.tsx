import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  RefreshControl,
  Dimensions,
} from "react-native";
import React, { useEffect } from "react";
import {
  SafeAreaView,
  useSafeAreaInsets,
} from "react-native-safe-area-context";
import { useNotifications } from "@/hooks/useNotifications";
import { Feather } from "@expo/vector-icons";
import NoNotificationsFound from "@/components/NoNotificationsFound";
import NotificationCard from "@/components/NotificationCard";
import { Notification } from "@/types";
import { FlashList } from "@shopify/flash-list";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  withDelay,
  interpolate,
} from "react-native-reanimated";
import { LinearGradient } from "expo-linear-gradient";
import { BlurView } from "expo-blur";
import { BRAND_COLORS, HEADER_CONFIG } from "@/constants/colors";
import { 
  responsiveSize, 
  responsivePadding, 
  responsiveMargin, 
  responsiveBorderRadius, 
  responsiveFontSize, 
  responsiveIconSize,
  baseScale,
} from "@/utils/responsive";
import CustomLoading from "@/components/CustomLoading";

const { width, height } = Dimensions.get("window");
const AnimatedScrollView = Animated.createAnimatedComponent(ScrollView);

const NotificationsScreen = () => {
  const {
    notifications,
    isLoading,
    error,
    refetch,
    isRefetching,
    deleteNotification,
  } = useNotifications();
  const insets = useSafeAreaInsets();

  // Animation values
  const headerOpacity = useSharedValue(0);
  const contentOpacity = useSharedValue(0);
  const backgroundOpacity = useSharedValue(0);

  useEffect(() => {
    // Entrance animations
    headerOpacity.value = withTiming(1, { duration: 400 });
    backgroundOpacity.value = withDelay(
      200,
      withTiming(0.1, { duration: 600 })
    );
    contentOpacity.value = withDelay(400, withTiming(1, { duration: 500 }));
  }, []);

  const headerAnimatedStyle = useAnimatedStyle(() => ({
    // Header stays fixed, no scroll effects
  }));

  const contentAnimatedStyle = useAnimatedStyle(() => ({
    opacity: contentOpacity.value,
    transform: [
      {
        translateY: interpolate(
          contentOpacity.value,
          [0, 1],
          [20 * baseScale, 0]
        ),
      },
    ],
  }));

  const backgroundAnimatedStyle = useAnimatedStyle(() => ({
    opacity: backgroundOpacity.value,
  }));

  if (error) {
    return (
      <View
        style={{
          flex: 1,
          alignItems: "center",
          justifyContent: "center",
          padding: responsivePadding(32),
          backgroundColor: BRAND_COLORS.BACKGROUND,
        }}
      >
        <View
          style={{
            width: responsiveSize(80),
            height: responsiveSize(80),
            borderRadius: responsiveBorderRadius(40),
            backgroundColor: `${BRAND_COLORS.DANGER}15`,
            justifyContent: "center",
            alignItems: "center",
            marginBottom: responsiveMargin(16),
          }}
        >
          <Feather
            name="alert-circle"
            size={responsiveIconSize(40)}
            color={BRAND_COLORS.DANGER}
          />
        </View>
        <Text
          style={{
            color: BRAND_COLORS.TEXT_SECONDARY,
            marginBottom: responsiveMargin(16),
            fontSize: responsiveFontSize(16),
            textAlign: "center",
          }}
        >
          Failed to load notifications
        </Text>
        <TouchableOpacity
          style={{
            backgroundColor: BRAND_COLORS.PRIMARY,
            paddingHorizontal: responsivePadding(24),
            paddingVertical: responsivePadding(12),
            borderRadius: responsiveBorderRadius(20),
            shadowColor: BRAND_COLORS.PRIMARY,
            shadowOffset: { width: 0, height: responsiveSize(4) },
            shadowOpacity: 0.3,
            shadowRadius: responsiveSize(8),
            elevation: 6,
          }}
          onPress={() => refetch()}
        >
          <Text
            style={{
              color: BRAND_COLORS.SURFACE,
              fontSize: responsiveFontSize(16),
              fontWeight: "700",
              letterSpacing: 0.3,
            }}
          >
            Retry
          </Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: BRAND_COLORS.BACKGROUND }}>
      {/* Dynamic Background */}
      <Animated.View
        style={[
          backgroundAnimatedStyle,
          { position: "absolute", top: 0, left: 0, right: 0, bottom: 0 },
        ]}
      >
        <LinearGradient
          colors={[`${BRAND_COLORS.PRIMARY}05`, BRAND_COLORS.BACKGROUND]}
          style={{ flex: 1 }}
        />
      </Animated.View>

      <SafeAreaView style={{ flex: 1 }} edges={["top"]}>
        {/* Enhanced Header */}
        <Animated.View style={headerAnimatedStyle}>
          <BlurView
            intensity={HEADER_CONFIG.BLUR_INTENSITY}
            tint="light"
            style={{ 
              paddingHorizontal: responsivePadding(
                HEADER_CONFIG.PADDING_HORIZONTAL
              ),
              paddingVertical: responsivePadding(
                HEADER_CONFIG.PADDING_VERTICAL
              ),
              paddingTop: responsivePadding(HEADER_CONFIG.PADDING_VERTICAL + 8), // Extra padding for status bar
            }}
          >
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "space-between",
              }}
            >
              <View
                style={{
                  paddingHorizontal: responsivePadding(20),
                  paddingVertical: responsivePadding(8),
                  borderRadius: responsiveBorderRadius(20),
                  backgroundColor: `${BRAND_COLORS.PRIMARY}15`,
                  borderWidth: 1,
                  borderColor: `${BRAND_COLORS.PRIMARY}20`,
                }}
              >
                <Text
                  style={{
                    fontSize: responsiveFontSize(HEADER_CONFIG.TITLE_SIZE),
                    fontWeight: "800",
                    color: BRAND_COLORS.TEXT_PRIMARY,
                    letterSpacing: 0.5,
                  }}
                >
          Notifications
        </Text>
              </View>

              <TouchableOpacity
                style={{
                  width: responsiveSize(HEADER_CONFIG.BUTTON_SIZE),
                  height: responsiveSize(HEADER_CONFIG.BUTTON_SIZE),
                  borderRadius: responsiveBorderRadius(
                    HEADER_CONFIG.BUTTON_BORDER_RADIUS
                  ),
                  backgroundColor: `${BRAND_COLORS.PRIMARY}15`,
                  justifyContent: "center",
                  alignItems: "center",
                  shadowColor: BRAND_COLORS.PRIMARY,
                  shadowOffset: { width: 0, height: responsiveSize(2) },
                  shadowOpacity: 0.1,
                  shadowRadius: responsiveSize(4),
                  elevation: 2,
                }}
              >
                <Feather
                  name="settings"
                  size={responsiveIconSize(HEADER_CONFIG.ICON_SIZE)}
                  color={BRAND_COLORS.PRIMARY}
                />
        </TouchableOpacity>
      </View>
          </BlurView>
        </Animated.View>

        {/* Enhanced Content */}
        <AnimatedScrollView
          style={{ flex: 1 }}
          contentContainerStyle={{
            paddingBottom: responsiveSize(120) + insets.bottom,
          }}
        showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        refreshControl={
          <RefreshControl
            refreshing={isRefetching}
            onRefresh={refetch}
              tintColor={BRAND_COLORS.PRIMARY}
              colors={[BRAND_COLORS.PRIMARY]}
            title="Getting latest notifications..."
              titleColor={BRAND_COLORS.TEXT_SECONDARY}
          />
        }
      >
          <Animated.View style={contentAnimatedStyle}>
        {isLoading ? (
              <View
                style={{
                  flex: 1,
                  backgroundColor: BRAND_COLORS.BACKGROUND,
                  justifyContent: "center",
                  alignItems: "center",
                }}
              >
                <CustomLoading
                  message="Loading notifications..."
                  size="large"
                  variant="screen"
                  colors={[
                    `${BRAND_COLORS.PRIMARY}05`,
                    `${BRAND_COLORS.SURFACE}95`,
                  ]}
                  showDots={true}
                  accessibilityLabel="Loading spinner"
                />
          </View>
        ) : notifications.length === 0 ? (
              <View
                style={{
                  backgroundColor: BRAND_COLORS.SURFACE,
                  marginHorizontal: responsiveMargin(12),
                  borderRadius: responsiveBorderRadius(24),
                  marginTop: responsiveMargin(8),
                  shadowColor: BRAND_COLORS.PRIMARY,
                  shadowOffset: { width: 0, height: responsiveSize(4) },
                  shadowOpacity: 0.08,
                  shadowRadius: responsiveSize(12),
                  elevation: 8,
                  overflow: "hidden",
                }}
              >
          <NoNotificationsFound />
              </View>
            ) : (
              <View
                style={{
                  backgroundColor: BRAND_COLORS.SURFACE,
                  marginHorizontal: responsiveMargin(12),
                  borderRadius: responsiveBorderRadius(24),
                  marginTop: responsiveMargin(8),
                  shadowColor: BRAND_COLORS.PRIMARY,
                  shadowOffset: { width: 0, height: responsiveSize(4) },
                  shadowOpacity: 0.08,
                  shadowRadius: responsiveSize(12),
                  elevation: 8,
                  overflow: "hidden",
                }}
              >
          <FlashList
            data={notifications}
            renderItem={({ item }: { item: Notification }) => (
              <NotificationCard
                notification={item}
                onDelete={deleteNotification}
              />
            )}
            keyExtractor={(item: Notification) => item._id}
            showsVerticalScrollIndicator={false}
          />
              </View>
        )}
          </Animated.View>
        </AnimatedScrollView>
    </SafeAreaView>
    </View>
  );
};

export default NotificationsScreen;
