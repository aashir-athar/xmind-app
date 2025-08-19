import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Image,
  Dimensions,
} from "react-native";
import { Notification } from "@/types";
import { Feather } from "@expo/vector-icons";
import { BlurView } from "expo-blur";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
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
  baseScale,
} from "@/utils/responsive";
import { useCustomAlert } from "@/hooks/useCustomAlert";
import CustomAlert from "./CustomAlert";

interface NotificationCardProps {
  notification: Notification;
  onDelete: (notificationId: string) => void;
}

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get("window");
const aspectRatio = SCREEN_HEIGHT / SCREEN_WIDTH;
const scale = Math.min(
  Math.max((SCREEN_WIDTH / 430) * (aspectRatio > 2 ? 0.9 : 1), 0.85),
  1.2
);

const NotificationCard = ({
  notification,
  onDelete,
}: NotificationCardProps) => {
  const { showDeleteConfirmation, alertConfig, isVisible, hideAlert } =
    useCustomAlert();
  const avatarScale = useSharedValue(1);
  const deleteScale = useSharedValue(1);

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
            size={responsiveIconSize(20)}
            color={BRAND_COLORS.PRIMARY_LIGHT}
          />
        );
      case "comment":
        return (
          <Feather
            name="message-circle"
            size={responsiveIconSize(20)}
            color={BRAND_COLORS.ACCENT_YELLOW}
          />
        );
      case "follow":
        return (
          <Feather
            name="user-plus"
            size={responsiveIconSize(20)}
            color={BRAND_COLORS.ACCENT_MINT}
          />
        );
      default:
        return (
          <Feather
            name="bell"
            size={responsiveIconSize(20)}
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
        style={[styles.cardContainer, { transform: [{ scale: scale }] }]}
      >
        <BlurView intensity={60} tint="light" style={styles.blurContainer}>
          <LinearGradient
            colors={[
              `${BRAND_COLORS.SURFACE}CC`,
              `${BRAND_COLORS.SURFACE_MUTED}CC`,
            ]}
            style={StyleSheet.absoluteFill}
          />
          <View style={styles.innerContainer}>
            <TouchableOpacity
              onPressIn={handleAvatarPressIn}
              onPressOut={handleAvatarPressOut}
              activeOpacity={1}
            >
              <Animated.View
                style={[styles.avatarContainer, avatarAnimatedStyle]}
              >
                <Image
                  source={{ uri: notification.from.profilePicture }}
                  style={styles.avatar}
                />
                <View style={styles.iconContainer}>
                  {getNotificationIcon()}
                </View>
              </Animated.View>
            </TouchableOpacity>

            <View style={styles.contentContainer}>
              <View style={styles.header}>
                <View style={styles.userInfo}>
                  <Text style={styles.userName}>
                    {notification.from.firstName} {notification.from.lastName}{" "}
                    <Text style={styles.username}>
                      @{notification.from.username}
                    </Text>
                  </Text>
                  <Text style={styles.notificationText}>
                    {getNotificationText()}
                  </Text>
                </View>
                <TouchableOpacity
                  onPress={handleDelete}
                  onPressIn={handleDeletePressIn}
                  onPressOut={handleDeletePressOut}
                  activeOpacity={1}
                >
                  <Animated.View style={deleteAnimatedStyle}>
                    <Feather
                      name="trash"
                      size={responsiveIconSize(16)}
                      color={BRAND_COLORS.DANGER}
                    />
                  </Animated.View>
                </TouchableOpacity>
              </View>

              {notification.post && (
                <View style={styles.postContainer}>
                  <Text style={styles.postContent} numberOfLines={3}>
                    {notification.post.content}
                  </Text>
                  {notification.post.image && (
                    <Image
                      source={{ uri: notification.post.image }}
                      style={styles.postImage}
                      resizeMode="cover"
                    />
                  )}
                </View>
              )}

              {notification.comment && (
                <View style={styles.commentContainer}>
                  <Text style={styles.commentLabel}>Comment:</Text>
                  <Text style={styles.commentContent} numberOfLines={2}>
                    &ldquo;{notification.comment.content}&rdquo;
                  </Text>
                </View>
              )}

              <Text style={styles.timestamp}>
                {formatDate(notification.createdAt)}
              </Text>
            </View>
          </View>
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

const styles = StyleSheet.create({
  cardContainer: {
    borderBottomWidth: 1,
    borderBottomColor: BRAND_COLORS.BORDER_LIGHT,
    marginVertical: responsiveMargin(4),
    borderRadius: responsiveBorderRadius(16),
    overflow: "hidden",
    shadowColor: BRAND_COLORS.PRIMARY_DARK,
    shadowOffset: { width: 0, height: responsiveSize(4) },
    shadowOpacity: 0.2,
    shadowRadius: responsiveSize(8),
    elevation: 8,
  },
  blurContainer: {
    padding: responsivePadding(16),
  },
  innerContainer: {
    flexDirection: "row",
  },
  avatarContainer: {
    marginRight: responsiveMargin(12),
    position: "relative",
  },
  avatar: {
    width: responsiveSize(48),
    height: responsiveSize(48),
    borderRadius: responsiveBorderRadius(24),
  },
  iconContainer: {
    position: "absolute",
    bottom: responsiveSize(-2),
    right: responsiveSize(-2),
    width: responsiveSize(24),
    height: responsiveSize(24),
    borderRadius: responsiveBorderRadius(12),
    backgroundColor: `${BRAND_COLORS.SURFACE_MUTED}CC`,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: BRAND_COLORS.PRIMARY_DARK,
    shadowOffset: { width: 0, height: responsiveSize(2) },
    shadowOpacity: 0.2,
    shadowRadius: responsiveSize(4),
    elevation: 4,
  },
  contentContainer: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: responsiveMargin(8),
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: responsiveFontSize(16),
    fontWeight: "600",
    color: BRAND_COLORS.TEXT_PRIMARY,
    marginBottom: responsiveMargin(4),
  },
  username: {
    fontSize: responsiveFontSize(14),
    color: BRAND_COLORS.TEXT_SECONDARY,
  },
  notificationText: {
    fontSize: responsiveFontSize(14),
    color: BRAND_COLORS.TEXT_PRIMARY,
  },
  postContainer: {
    backgroundColor: `${BRAND_COLORS.SURFACE}80`,
    borderRadius: responsiveBorderRadius(12),
    padding: responsivePadding(12),
    marginBottom: responsiveMargin(8),
  },
  postContent: {
    fontSize: responsiveFontSize(14),
    color: BRAND_COLORS.TEXT_PRIMARY,
    marginBottom: responsiveMargin(8),
  },
  postImage: {
    width: "100%",
    height: responsiveSize(128),
    borderRadius: responsiveBorderRadius(12),
    marginTop: responsiveMargin(8),
  },
  commentContainer: {
    backgroundColor: `${BRAND_COLORS.SURFACE}80`,
    borderRadius: responsiveBorderRadius(12),
    padding: responsivePadding(12),
    marginBottom: responsiveMargin(8),
  },
  commentLabel: {
    fontSize: responsiveFontSize(12),
    color: BRAND_COLORS.TEXT_SECONDARY,
    marginBottom: responsiveMargin(4),
  },
  commentContent: {
    fontSize: responsiveFontSize(14),
    color: BRAND_COLORS.TEXT_SECONDARY,
  },
  timestamp: {
    fontSize: responsiveFontSize(12),
    color: BRAND_COLORS.TEXT_SECONDARY,
  },
});

export default NotificationCard;
