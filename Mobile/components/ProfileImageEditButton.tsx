import React from "react";
import { TouchableOpacity, ActivityIndicator } from "react-native";
import { Feather } from "@expo/vector-icons";
import { BRAND_COLORS } from "@/constants/colors";
import {
  responsiveSize,
  responsivePadding,
  responsiveBorderRadius,
  responsiveIconSize,
  responsiveMargin,
} from "@/utils/responsive";

interface ProfileImageEditButtonProps {
  onPress: () => void;
  isLoading?: boolean;
  size?: "small" | "medium" | "large";
  position?: "top-right" | "bottom-right" | "center" | "above-profile";
  variant?: "profile" | "banner";
}

export const ProfileImageEditButton: React.FC<ProfileImageEditButtonProps> = ({
  onPress,
  isLoading = false,
  size = "medium",
  position = "bottom-right",
  variant = "profile",
}) => {
  // Size configurations
  const sizeConfig = {
    small: {
      buttonSize: responsiveSize(32),
      iconSize: responsiveIconSize(14),
      padding: responsivePadding(6),
    },
    medium: {
      buttonSize: responsiveSize(40),
      iconSize: responsiveIconSize(18),
      padding: responsivePadding(8),
    },
    large: {
      buttonSize: responsiveSize(48),
      iconSize: responsiveIconSize(22),
      padding: responsivePadding(10),
    },
  };

  const config = sizeConfig[size];

  // Position configurations
  const positionConfig = {
    "top-right": {
      top: responsivePadding(8),
      right: responsivePadding(8),
    },
    "bottom-right": {
      bottom: responsivePadding(8),
      right: responsivePadding(8),
    },
    "center": {
      top: responsivePadding(8),
      left: responsivePadding(8),
      transform: [
        { translateX: -config.buttonSize / 2 },
        { translateY: -config.buttonSize / 2 },
      ],
    },
    "above-profile": {
      top: responsiveMargin(-20),
      right: responsivePadding(8),
    },
  };

  const positionStyle = positionConfig[position];

  // Variant-specific styling
  const variantConfig = {
    profile: {
      backgroundColor: BRAND_COLORS.PRIMARY,
      borderColor: BRAND_COLORS.SURFACE,
      iconColor: BRAND_COLORS.SURFACE,
    },
    banner: {
      backgroundColor: BRAND_COLORS.SURFACE,
      borderColor: BRAND_COLORS.PRIMARY,
      iconColor: BRAND_COLORS.PRIMARY,
    },
  };

  const variantStyle = variantConfig[variant];

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={isLoading}
      style={{
        position: "absolute",
        width: config.buttonSize,
        height: config.buttonSize,
        borderRadius: responsiveBorderRadius(
          config.buttonSize / 2
        ),
        backgroundColor: variantStyle.backgroundColor,
        borderWidth: 2,
        borderColor: variantStyle.borderColor,
        justifyContent: "center",
        alignItems: "center",
        shadowColor: BRAND_COLORS.PRIMARY,
        shadowOffset: { width: 0, height: responsiveSize(2) },
        shadowOpacity: 0.2,
        shadowRadius: responsiveSize(4),
        elevation: 4,
        zIndex: 10,
        ...positionStyle,
      }}
      activeOpacity={0.8}
    >
      {isLoading ? (
        <ActivityIndicator size="small" color={variantStyle.iconColor} />
      ) : (
        <Feather
          name="edit-3"
          size={config.iconSize}
          color={variantStyle.iconColor}
        />
      )}
    </TouchableOpacity>
  );
};

export default ProfileImageEditButton;
