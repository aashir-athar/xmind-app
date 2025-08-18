import React from "react";
import {
  View,
  Text,
  Alert,
  TouchableOpacity,
  StyleSheet,
  Image,
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

interface NotificationCardProps {
  notification: Notification;
  onDelete: (notificationId: string) => void;
}

const NotificationCard = ({
  notification,
  onDelete,
}: NotificationCardProps) => {
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
          <Feather name="heart" size={20} color={BRAND_COLORS.PRIMARY_LIGHT} />
        );
      case "comment":
        return (
          <Feather
            name="message-circle"
            size={20}
            color={BRAND_COLORS.ACCENT_YELLOW}
          />
        );
      case "follow":
        return (
          <Feather
            name="user-plus"
            size={20}
            color={BRAND_COLORS.ACCENT_MINT}
          />
        );
      default:
        return (
          <Feather name="bell" size={20} color={BRAND_COLORS.ICON_SECONDARY} />
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
    Alert.alert(
      "Delete Notification",
      "Are you sure you want to delete this notification?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: () => onDelete(notification._id),
        },
      ]
    );
  };

  return (
    <Animated.View style={styles.cardContainer}>
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
              <View style={styles.iconContainer}>{getNotificationIcon()}</View>
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
                  <Feather name="trash" size={16} color={BRAND_COLORS.DANGER} />
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
  );
};

const styles = StyleSheet.create({
  cardContainer: {
    borderBottomWidth: 1,
    borderBottomColor: BRAND_COLORS.BORDER_LIGHT,
    marginVertical: 4,
    borderRadius: 16,
    overflow: "hidden",
    shadowColor: BRAND_COLORS.PRIMARY_DARK,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
  },
  blurContainer: {
    padding: 16,
  },
  innerContainer: {
    flexDirection: "row",
  },
  avatarContainer: {
    marginRight: 12,
    position: "relative",
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
  },
  iconContainer: {
    position: "absolute",
    bottom: -2,
    right: -2,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: `${BRAND_COLORS.SURFACE_MUTED}CC`,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: BRAND_COLORS.PRIMARY_DARK,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  contentContainer: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 16,
    fontWeight: "600",
    color: BRAND_COLORS.TEXT_PRIMARY,
    marginBottom: 4,
  },
  username: {
    fontSize: 14,
    color: BRAND_COLORS.TEXT_SECONDARY,
  },
  notificationText: {
    fontSize: 14,
    color: BRAND_COLORS.TEXT_PRIMARY,
  },
  postContainer: {
    backgroundColor: `${BRAND_COLORS.SURFACE}80`,
    borderRadius: 12,
    padding: 12,
    marginBottom: 8,
  },
  postContent: {
    fontSize: 14,
    color: BRAND_COLORS.TEXT_PRIMARY,
    marginBottom: 8,
  },
  postImage: {
    width: "100%",
    height: 128,
    borderRadius: 12,
    marginTop: 8,
  },
  commentContainer: {
    backgroundColor: `${BRAND_COLORS.SURFACE}80`,
    borderRadius: 12,
    padding: 12,
    marginBottom: 8,
  },
  commentLabel: {
    fontSize: 12,
    color: BRAND_COLORS.TEXT_SECONDARY,
    marginBottom: 4,
  },
  commentContent: {
    fontSize: 14,
    color: BRAND_COLORS.TEXT_SECONDARY,
  },
  timestamp: {
    fontSize: 12,
    color: BRAND_COLORS.TEXT_SECONDARY,
  },
});

export default NotificationCard;
