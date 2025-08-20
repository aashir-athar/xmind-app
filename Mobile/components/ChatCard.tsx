import { ConversationType } from "@/data/conversations";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  ImageErrorEventData,
  NativeSyntheticEvent,
} from "react-native";
import { BRAND_COLORS } from "@/constants/colors";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  withDelay,
  interpolate,
  runOnJS,
  withSequence,
  withRepeat,
} from "react-native-reanimated";
import {
  responsiveSize,
  responsivePadding,
  responsiveMargin,
  responsiveBorderRadius,
  responsiveFontSize,
  responsiveIconSize,
  baseScale,
} from "@/utils/responsive";
import { useEffect, useState } from "react";

interface ChatCardProps {
  conversation: ConversationType;
  index: number;
  onPress: () => void;
  onLongPress: () => void;
}

const AnimatedTouchableOpacity =
  Animated.createAnimatedComponent(TouchableOpacity);

const ChatCard: React.FC<ChatCardProps> = ({
  conversation,
  index,
  onPress,
  onLongPress,
}) => {
  const [avatarError, setAvatarError] = useState(false);

  // Animation values - simplified like PostCard
  const cardScale = useSharedValue(1);
  const cardOpacity = useSharedValue(0);
  const avatarScale = useSharedValue(1);
  const contentOpacity = useSharedValue(0);
  const pulseAnimation = useSharedValue(1);

  useEffect(() => {
    // Staggered entrance animation matching PostCard pattern
    const delay = index * 100;
    cardOpacity.value = withTiming(1, { duration: 400 });
    contentOpacity.value = withDelay(delay, withTiming(1, { duration: 300 }));
    avatarScale.value = withDelay(delay + 100, withSpring(1, { damping: 15 }));

    // Continuous pulse animation
    pulseAnimation.value = withRepeat(
      withSequence(
        withTiming(1.1, { duration: 1000 }),
        withTiming(1, { duration: 1000 })
      ),
      -1, // infinite repeats
      false // don't reverse
    );
  }, [index]);

  const handleAvatarError = (
    error: NativeSyntheticEvent<ImageErrorEventData>
  ) => {
    setAvatarError(true);
  };

  const cardAnimatedStyle = useAnimatedStyle(() => ({
    opacity: cardOpacity.value,
    transform: [{ scale: cardScale.value }],
  }));

  const avatarAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: avatarScale.value }],
  }));

  const contentAnimatedStyle = useAnimatedStyle(() => ({
    opacity: contentOpacity.value,
  }));

  const pulseAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: pulseAnimation.value }],
  }));

  // Safety check for conversation data
  if (!conversation || !conversation.user) {
    return null;
  }

  return (
    <Animated.View style={cardAnimatedStyle}>
      <AnimatedTouchableOpacity
        style={{
            flexDirection: "row",
            alignItems: "center",
          padding: responsivePadding(16),
            marginHorizontal: responsiveMargin(4),
          marginVertical: responsiveMargin(4),
            borderRadius: responsiveBorderRadius(24),
          backgroundColor: BRAND_COLORS.SURFACE,
            borderWidth: 1,
          borderColor: BRAND_COLORS.BORDER_LIGHT,
          shadowColor: BRAND_COLORS.PRIMARY,
          shadowOffset: { width: 0, height: responsiveSize(2) },
          shadowOpacity: 0.05,
          shadowRadius: responsiveSize(8),
          elevation: 2,
        }}
        onPress={onPress}
        onLongPress={onLongPress}
        activeOpacity={0.7}
        delayLongPress={500}
      >
        <View
          style={{
            position: "relative",
            marginRight: responsiveMargin(16),
          }}
        >
          <Animated.View style={avatarAnimatedStyle}>
          <View
            style={{
              width: responsiveSize(56),
              height: responsiveSize(56),
              borderRadius: responsiveBorderRadius(28),
              overflow: "hidden",
              borderWidth: 3,
              borderColor: `${BRAND_COLORS.PRIMARY}20`,
              shadowColor: BRAND_COLORS.PRIMARY,
              shadowOffset: { width: 0, height: responsiveSize(4) },
              shadowOpacity: 0.3,
              shadowRadius: responsiveSize(12),
              elevation: 8,
                backgroundColor: BRAND_COLORS.SURFACE_MUTED,
                alignItems: "center",
                justifyContent: "center",
            }}
          >
              {!avatarError ? (
            <Image
              source={{ uri: conversation.user.avatar }}
              style={{
                width: responsiveSize(56),
                height: responsiveSize(56),
                borderRadius: responsiveBorderRadius(28),
              }}
                  onError={handleAvatarError}
                  defaultSource={require("@/assets/images/default-avatar.jpeg")}
                />
              ) : (
                <View
                  style={{
                    width: responsiveSize(56),
                    height: responsiveSize(56),
                    borderRadius: responsiveBorderRadius(28),
                    backgroundColor: BRAND_COLORS.PRIMARY_LIGHT,
                    justifyContent: "center",
                    alignItems: "center",
                  }}
                >
                  <Text
                    style={{
                      fontSize: responsiveFontSize(24),
                      fontWeight: "800",
                      color: BRAND_COLORS.SURFACE,
                      letterSpacing: 0.5,
                    }}
                  >
                    {conversation.user.name?.charAt(0)?.toUpperCase() || "?"}
                  </Text>
                </View>
              )}
          </View>
          </Animated.View>

          {/* Online indicator */}
          <Animated.View
            style={[
              {
                position: "absolute",
                bottom: responsiveSize(2),
                right: responsiveSize(2),
                width: responsiveSize(16),
                height: responsiveSize(16),
                borderRadius: responsiveBorderRadius(8),
                backgroundColor: BRAND_COLORS.SUCCESS,
                borderWidth: 3,
                borderColor: BRAND_COLORS.SURFACE,
                shadowColor: BRAND_COLORS.SUCCESS,
                shadowOffset: { width: 0, height: responsiveSize(2) },
                shadowOpacity: 0.6,
                shadowRadius: responsiveSize(4),
                elevation: 4,
              },
              pulseAnimatedStyle,
            ]}
          />
        </View>

        <Animated.View style={[contentAnimatedStyle, { flex: 1 }]}>
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "space-between",
              marginBottom: responsiveMargin(6),
            }}
          >
            <View
              style={{ flexDirection: "row", alignItems: "center", flex: 1 }}
            >
              <Text
                style={{
                  fontWeight: "800",
                  color: BRAND_COLORS.TEXT_PRIMARY,
                  fontSize: responsiveFontSize(17),
                  letterSpacing: 0.3,
                }}
                numberOfLines={1}
              >
                {conversation.user.name || "Unknown User"}
              </Text>

              {conversation.user.verified && (
                <View
                  style={{
                    width: responsiveSize(20),
                    height: responsiveSize(20),
                    borderRadius: responsiveBorderRadius(10),
                    backgroundColor: BRAND_COLORS.PRIMARY,
                    justifyContent: "center",
                    alignItems: "center",
                    marginLeft: responsiveMargin(6),
                    shadowColor: BRAND_COLORS.PRIMARY,
                    shadowOffset: { width: 0, height: responsiveSize(2) },
                    shadowOpacity: 0.4,
                    shadowRadius: responsiveSize(6),
                    elevation: 4,
                  }}
                >
                  <MaterialCommunityIcons
                    name="check"
                    size={responsiveIconSize(12)}
                    color={BRAND_COLORS.SURFACE}
                  />
                </View>
              )}

              <Text
                style={{
                  color: BRAND_COLORS.TEXT_SECONDARY,
                  fontSize: responsiveFontSize(14),
                  marginLeft: responsiveMargin(8),
                  fontWeight: "500",
                }}
                numberOfLines={1}
              >
                @{conversation.user.username || "unknown"}
              </Text>
            </View>

            <View style={{ alignItems: "flex-end" }}>
              <Text
                style={{
                  color: BRAND_COLORS.TEXT_SECONDARY,
                  fontSize: responsiveFontSize(13),
                  fontWeight: "600",
                }}
              >
                {conversation.time || "now"}
              </Text>

              <View
                style={{
                  backgroundColor: `${BRAND_COLORS.ACCENT_MINT}15`,
                  borderRadius: responsiveBorderRadius(12),
                  paddingHorizontal: responsivePadding(8),
                  paddingVertical: responsivePadding(2),
                  marginTop: responsiveMargin(4),
                  borderWidth: 1,
                  borderColor: `${BRAND_COLORS.ACCENT_MINT}20`,
                }}
              >
                <Text
                  style={{
                    color: BRAND_COLORS.ACCENT_MINT,
                    fontSize: responsiveFontSize(11),
                    fontWeight: "700",
                  }}
                >
                  {conversation.messages?.length || 0}
                </Text>
              </View>
            </View>
          </View>

          <Text
            style={{
              fontSize: responsiveFontSize(15),
              color: BRAND_COLORS.TEXT_SECONDARY,
              lineHeight: responsiveSize(22),
              fontWeight: "500",
            }}
            numberOfLines={2}
          >
            {conversation.lastMessage || "No messages yet"}
          </Text>
        </Animated.View>
      </AnimatedTouchableOpacity>
    </Animated.View>
  );
};

export default ChatCard;
