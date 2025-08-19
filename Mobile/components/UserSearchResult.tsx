import React from "react";
import { View, Text, Image, TouchableOpacity } from "react-native";
import { BRAND_COLORS } from "@/constants/colors";
import { User } from "@/types";
import { useRouter } from "expo-router";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { Feather } from "@expo/vector-icons";
import { 
  responsiveSize, 
  responsivePadding, 
  responsiveMargin, 
  responsiveBorderRadius, 
  responsiveFontSize, 
  responsiveIconSize
} from "@/utils/responsive";

interface UserSearchResultProps {
  user: User;
}

const UserSearchResult = ({ user }: UserSearchResultProps) => {
  const router = useRouter();
  const { currentUser } = useCurrentUser();
  const isOwnProfile = currentUser?._id === user._id;

  const handleUserPress = () => {
    if (isOwnProfile) {
      // Navigate to own profile
      router.push("/(tabs)/profile");
    } else {
      // Navigate to user profile
      router.push({
        pathname: "/user-profile",
        params: {
          userId: user._id,
          username: user.username,
        },
      });
    }
  };

  return (
    <TouchableOpacity
      onPress={handleUserPress}
      style={{
        flexDirection: "row",
        alignItems: "center",
        paddingVertical: responsivePadding(16),
        paddingHorizontal: responsivePadding(20),
        borderBottomWidth: 1,
        borderBottomColor: `${BRAND_COLORS.BORDER_LIGHT}20`,
      }}
      activeOpacity={0.7}
    >
      <View
        style={{
          width: responsiveSize(56),
          height: responsiveSize(56),
          borderRadius: responsiveBorderRadius(28),
          marginRight: responsiveMargin(16),
          overflow: "hidden",
          borderWidth: 2,
          borderColor: `${BRAND_COLORS.PRIMARY}25`,
          shadowColor: BRAND_COLORS.PRIMARY,
          shadowOffset: { width: 0, height: responsiveSize(2) },
          shadowOpacity: 0.15,
          shadowRadius: responsiveSize(4),
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Image
          source={
            user.profilePicture
              ? { uri: user.profilePicture }
              : require("@/assets/images/default-avatar.jpeg")
          }
          style={{ width: responsiveSize(56), height: responsiveSize(56) }}
          resizeMode="cover"
        />
      </View>

      <View style={{ flex: 1, marginLeft: responsiveMargin(16) }}>
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            marginBottom: responsiveMargin(4),
          }}
        >
          <Text
            style={{
              fontSize: responsiveFontSize(16),
              fontWeight: "700",
              color: BRAND_COLORS.TEXT_PRIMARY,
              letterSpacing: 0.2,
            }}
          >
            {user.firstName} {user.lastName}
          </Text>
          {user.verified && (
            <View
              style={{
                width: responsiveSize(18),
                height: responsiveSize(18),
                borderRadius: responsiveBorderRadius(9),
                backgroundColor: BRAND_COLORS.PRIMARY,
                justifyContent: "center",
                alignItems: "center",
                marginLeft: responsiveMargin(8),
                shadowColor: BRAND_COLORS.PRIMARY,
                shadowOffset: { width: 0, height: responsiveSize(1) },
                shadowOpacity: 0.3,
                shadowRadius: responsiveSize(2),
                elevation: 2,
              }}
            >
              <Text
                style={{
                  color: BRAND_COLORS.SURFACE,
                  fontSize: responsiveFontSize(10),
                  fontWeight: "700",
                }}
              >
                ✓
              </Text>
            </View>
          )}
        </View>

        <Text
          style={{
            fontSize: responsiveFontSize(14),
            color: BRAND_COLORS.PRIMARY,
            fontWeight: "600",
            marginBottom: responsiveMargin(6),
            letterSpacing: 0.1,
          }}
        >
          @{user.username}
        </Text>

        {user.bio && (
          <Text
            style={{
              fontSize: responsiveFontSize(14),
              color: BRAND_COLORS.TEXT_SECONDARY,
              lineHeight: responsiveSize(20),
            }}
          >
            {user.bio}
          </Text>
        )}
      </View>

      <View
        style={{
          width: responsiveSize(32),
          height: responsiveSize(32),
          borderRadius: responsiveBorderRadius(16),
          backgroundColor: `${BRAND_COLORS.PRIMARY}10`,
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <Feather name="chevron-right" size={responsiveIconSize(16)} color={BRAND_COLORS.PRIMARY} />
      </View>
    </TouchableOpacity>
  );
};

export default UserSearchResult;
