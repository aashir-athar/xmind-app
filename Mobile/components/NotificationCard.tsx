import React, { useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Image,
} from "react-native";
import { Notification } from "@/types";
import { Feather } from "@expo/vector-icons";
import { BlurView } from "expo-blur";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  withDelay,
} from "react-native-reanimated";
import { BRAND_COLORS } from "@/constants/colors";
import { formatDate } from "@/utils/formatter";
import { LinearGradient } from "expo-linear-gradient";
import {
  responsiveSize,
  responsivePadding,
  responsiveMargin,
  responsiveBorderRadius,
  responsiveFontSize,
  responsiveIconSize,
} from "@/utils/responsive";
import { useCustomAlert } from "@/hooks/useCustomAlert";
import CustomAlert from "./CustomAlert";

interface NotificationCardProps {
  notification: Notification;
  onDelete: (notificationId: string) => void;
}

const NotificationCard = ({
  notification,
  onDelete,
}: NotificationCardProps) => {
  const { showDeleteConfirmation, alertConfig, isVisible, hideAlert } =
    useCustomAlert();
  const avatarScale = useSharedValue(1);
  const deleteScale = useSharedValue(1);
  const cardOpacity = useSharedValue(0);
  const contentOpacity = useSharedValue(0);
  const borderOpacity = useSharedValue(0);

  // Staggered entrance animation (like PostCard)
  useEffect(() => {
    cardOpacity.value = withTiming(1, { duration: 300 });
    contentOpacity.value = withDelay(100, withTiming(1, { duration: 250 }));
    borderOpacity.value = withDelay(200, withTiming(0.6, { duration: 400 }));
  }, [cardOpacity, contentOpacity, borderOpacity]);

  const avatarAnimatedStyle = useAnimatedStyle(() => ({
    transform: [
      { scale: withSpring(avatarScale.value, { damping: 15, stiffness: 100 }) },
    ],
  }));

  const deleteAnimatedStyle = useAnimatedStyle(() => ({
    transform: [
      { scale: withSpring(deleteScale.value, { damping: 15, stiffness: 100 }) },
    ],
  }));

  const cardAnimatedStyle = useAnimatedStyle(() => ({
    opacity: cardOpacity.value,
  }));

  const contentAnimatedStyle = useAnimatedStyle(() => ({
    opacity: contentOpacity.value,
  }));

  const borderAnimatedStyle = useAnimatedStyle(() => ({
    opacity: borderOpacity.value,
  }));

  const getNotificationText = () => {
    const name = `${notification.from.firstName} ${notification.from.lastName}`;
    switch (notification.type) {
      case "like":
        return `${name} liked your post`;
      case "comment":
        return `${name} commented on your post`;
      case "follow":
        return `${name} started following you`;
      default:
        return "";
    }
  };

  const getNotificationIcon = () => {
    switch (notification.type) {
      case "like":
        return (
          <Feather
            name="heart"
            size={responsiveIconSize(16)}
            color={BRAND_COLORS.PRIMARY_LIGHT}
          />
        );
      case "comment":
        return (
          <Feather
            name="message-circle"
            size={responsiveIconSize(16)}
            color={BRAND_COLORS.ACCENT_YELLOW}
          />
        );
      case "follow":
        return (
          <Feather
            name="user-plus"
            size={responsiveIconSize(16)}
            color={BRAND_COLORS.ACCENT_MINT}
          />
        );
      default:
        return (
          <Feather
            name="bell"
            size={responsiveIconSize(16)}
            color={BRAND_COLORS.ICON_SECONDARY}
          />
        );
    }
  };

  const handleAvatarPressIn = () => {
    avatarScale.value = 0.95;
  };

  const handleAvatarPressOut = () => {
    avatarScale.value = 1;
  };

  const handleDeletePressIn = () => {
    deleteScale.value = 0.95;
  };

  const handleDeletePressOut = () => {
    deleteScale.value = 1;
  };

  const handleDelete = () => {
    showDeleteConfirmation(
      "Delete Notification",
      "Are you sure you want to delete this notification?",
      () => onDelete(notification._id)
    );
  };

  return (
    <>
      <Animated.View
        style={[
          {
            marginHorizontal: responsiveMargin(12),
            marginVertical: responsiveMargin(6), // Smaller margin than PostCard
            shadowColor: BRAND_COLORS.PRIMARY,
            shadowOffset: { width: 0, height: responsiveSize(3) }, // Smaller shadow
            shadowOpacity: 0.08,
            shadowRadius: responsiveSize(8), // Smaller shadow radius
            elevation: 6, // Smaller elevation
          },
          cardAnimatedStyle,
        ]}
      >
        <BlurView
          intensity={5}
          tint="light"
          style={{
            borderRadius: responsiveBorderRadius(16), // Smaller radius than PostCard
            overflow: "hidden",
          }}
        >
          <LinearGradient
            colors={[`${BRAND_COLORS.SURFACE}95`, `${BRAND_COLORS.SURFACE}85`]}
            style={{ padding: responsivePadding(16) }} // Smaller padding than PostCard
          >
            {/* Animated Border - like PostCard */}
            <Animated.View
              style={[
                {
                  position: "absolute",
                  top: 0,
                  left: 0,
                  right: 0,
                  height: responsiveSize(2),
                  backgroundColor: BRAND_COLORS.PRIMARY_LIGHT,
                  borderRadius: responsiveBorderRadius(1),
                },
                borderAnimatedStyle,
              ]}
            />

            <View className="flex-row">
              <TouchableOpacity onPress={handleAvatarPressIn} onPressOut={handleAvatarPressOut}>
                <Animated.View style={[avatarAnimatedStyle]}>
                  <View
                    style={{
                      width: responsiveSize(40), // Smaller than PostCard (48)
                      height: responsiveSize(40), // Smaller than PostCard (48)
                      borderRadius: responsiveBorderRadius(20), // Smaller radius
                      marginRight: responsiveMargin(12), // Smaller margin
                      overflow: "hidden",
                      borderWidth: 2,
                      borderColor: `${BRAND_COLORS.PRIMARY}25`,
                      shadowColor: BRAND_COLORS.PRIMARY,
                      shadowOffset: { width: 0, height: responsiveSize(2) },
                      shadowOpacity: 0.15,
                      shadowRadius: responsiveSize(4),
                      alignItems: "center",
                      justifyContent: "center",
                      position: "relative", // For notification icon
                    }}
                  >
                    <Image
                      source={
                        notification.from.profilePicture
                          ? { uri: notification.from.profilePicture }
                          : require("@/assets/images/default-avatar.jpeg")
                      }
                      style={{
                        width: responsiveSize(40),
                        height: responsiveSize(40),
                      }}
                      resizeMode="cover"
                    />
                    
                    {/* Notification Icon - positioned like PostCard verified badge */}
                    <View
                      style={{
                        position: "absolute",
                        bottom: responsiveSize(-2),
                        right: responsiveSize(-2),
                        width: responsiveSize(20), // Smaller than before
                        height: responsiveSize(20), // Smaller than before
                        borderRadius: responsiveBorderRadius(10),
                        backgroundColor: `${BRAND_COLORS.SURFACE_MUTED}CC`,
                        alignItems: "center",
                        justifyContent: "center",
                        shadowColor: BRAND_COLORS.PRIMARY_DARK,
                        shadowOffset: { width: 0, height: responsiveSize(1) },
                        shadowOpacity: 0.2,
                        shadowRadius: responsiveSize(2),
                        elevation: 3,
                      }}
                    >
                      {getNotificationIcon()}
                    </View>
                  </View>
                </Animated.View>
              </TouchableOpacity>

              <View className="flex-1">
                <Animated.View style={contentAnimatedStyle}>
                  <View className="flex-row items-center justify-between mb-2">
                    <View className="flex-row items-center flex-1">
                      <TouchableOpacity>
                        <Text
                          style={{
                            fontSize: responsiveFontSize(14), // Smaller than PostCard (16)
                            fontWeight: "700",
                            color: BRAND_COLORS.TEXT_PRIMARY,
                          }}
                        >
                          {notification.from.firstName} {notification.from.lastName}
                        </Text>
                      </TouchableOpacity>
                      
                      {/* Username - styled like PostCard */}
                      <Text
                        style={{
                          fontSize: responsiveFontSize(12), // Smaller than PostCard
                          color: BRAND_COLORS.TEXT_SECONDARY,
                          fontWeight: "500",
                          marginLeft: responsiveMargin(6),
                        }}
                      >
                        @{notification.from.username}
                      </Text>
                    </View>

                    {/* Delete Button - styled like PostCard action buttons */}
                    <TouchableOpacity
                      onPress={handleDelete}
                      onPressIn={handleDeletePressIn}
                      onPressOut={handleDeletePressOut}
                      activeOpacity={1}
                      style={{
                        flexDirection: "row",
                        alignItems: "center",
                        paddingHorizontal: responsivePadding(8),
                        paddingVertical: responsivePadding(6),
                        borderRadius: responsiveBorderRadius(16),
                        backgroundColor: `${BRAND_COLORS.DANGER}08`,
                      }}
                    >
                      <Animated.View style={deleteAnimatedStyle}>
                        <Feather
                          name="trash"
                          size={responsiveIconSize(14)}
                          color={BRAND_COLORS.DANGER}
                        />
                      </Animated.View>
                    </TouchableOpacity>
                  </View>

                  {/* Notification Text - styled like PostCard content */}
                  <Text
                    style={{
                      fontSize: responsiveFontSize(13),
                      color: BRAND_COLORS.TEXT_PRIMARY,
                      marginBottom: responsiveMargin(8),
                      lineHeight: responsiveFontSize(18),
                    }}
                  >
                    {getNotificationText()}
                  </Text>

                  {/* Post Content Preview - styled like PostCard content */}
                  {notification.post && (
                    <View
                      style={{
                        backgroundColor: `${BRAND_COLORS.SURFACE}60`,
                        borderRadius: responsiveBorderRadius(12),
                        padding: responsivePadding(10),
                        marginBottom: responsiveMargin(8),
                        borderLeftWidth: 3,
                        borderLeftColor: BRAND_COLORS.PRIMARY_LIGHT,
                      }}
                    >
                      <Text
                        style={{
                          fontSize: responsiveFontSize(12),
                          color: BRAND_COLORS.TEXT_SECONDARY,
                          marginBottom: responsiveMargin(6),
                          fontStyle: "italic",
                        }}
                      >
                        Post preview:
                      </Text>
                      <Text
                        style={{
                          fontSize: responsiveFontSize(12),
                          color: BRAND_COLORS.TEXT_PRIMARY,
                          marginBottom: responsiveMargin(6),
                        }}
                        numberOfLines={2}
                      >
                        {notification.post.content}
                      </Text>
                      {notification.post.image && (
                        <Image
                          source={{ uri: notification.post.image }}
                          style={{
                            width: "100%",
                            height: responsiveSize(80), // Smaller than before
                            borderRadius: responsiveBorderRadius(8),
                            marginTop: responsiveMargin(4),
                          }}
                          resizeMode="cover"
                        />
                      )}
                    </View>
                  )}

                  {/* Comment Content - styled like PostCard content */}
                  {notification.comment && (
                    <View
                      style={{
                        backgroundColor: `${BRAND_COLORS.ACCENT_YELLOW}15`,
                        borderRadius: responsiveBorderRadius(12),
                        padding: responsivePadding(10),
                        marginBottom: responsiveMargin(8),
                        borderLeftWidth: 3,
                        borderLeftColor: BRAND_COLORS.ACCENT_YELLOW,
                      }}
                    >
                      <Text
                        style={{
                          fontSize: responsiveFontSize(12),
                          color: BRAND_COLORS.ACCENT_YELLOW,
                          marginBottom: responsiveMargin(4),
                          fontWeight: "600",
                        }}
                      >
                        Comment:
                      </Text>
                      <Text
                        style={{
                          fontSize: responsiveFontSize(12),
                          color: BRAND_COLORS.TEXT_PRIMARY,
                          fontStyle: "italic",
                        }}
                        numberOfLines={2}
                      >
                        &ldquo;{notification.comment.content}&rdquo;
                      </Text>
                    </View>
                  )}

                  {/* Timestamp - styled like PostCard timestamp */}
                  <Text
                    style={{
                      fontSize: responsiveFontSize(11),
                      color: BRAND_COLORS.TEXT_SECONDARY,
                      marginTop: responsiveMargin(4),
                    }}
                  >
                    {formatDate(notification.createdAt)}
                  </Text>
                </Animated.View>
              </View>
            </View>
          </LinearGradient>
        </BlurView>
      </Animated.View>

      {/* Custom Alert */}
      {alertConfig && (
        <CustomAlert
          visible={isVisible}
          title={alertConfig.title}
          message={alertConfig.message}
          buttons={alertConfig.buttons}
          type={alertConfig.type}
          onDismiss={hideAlert}
        />
      )}
    </>
  );
};

export default NotificationCard;
