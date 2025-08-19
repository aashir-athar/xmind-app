import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Modal,
  Dimensions,
} from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  withDelay,
  withSequence,
} from "react-native-reanimated";
import { LinearGradient } from "expo-linear-gradient";
import { BlurView } from "expo-blur";
import { Feather } from "@expo/vector-icons";
import { BRAND_COLORS } from "@/constants/colors";
import {
  responsiveSize,
  responsivePadding,
  responsiveMargin,
  responsiveBorderRadius,
  responsiveFontSize,
  responsiveIconSize,
} from "@/utils/responsive";
import { useUsernameUpdate } from "@/hooks/useUsernameUpdate";

const { width: SCREEN_WIDTH } = Dimensions.get("window");

interface UsernameEditModalProps {
  visible: boolean;
  currentUsername: string;
  onClose: () => void;
}

const UsernameEditModal: React.FC<UsernameEditModalProps> = ({
  visible,
  currentUsername,
  onClose,
}) => {
  const [newUsername, setNewUsername] = useState(currentUsername);
  const [isValid, setIsValid] = useState(true);
  const { updateUsername, isUpdating } = useUsernameUpdate();

  // Animation values
  const scale = useSharedValue(0.7);
  const opacity = useSharedValue(0);
  const backdropOpacity = useSharedValue(0);
  const inputScale = useSharedValue(1);

  useEffect(() => {
    if (visible) {
      setNewUsername(currentUsername);
      backdropOpacity.value = withTiming(0.6, { duration: 200 });
      scale.value = withSpring(1, { damping: 15, stiffness: 150 });
      opacity.value = withTiming(1, { duration: 200 });
    } else {
      scale.value = withTiming(0.7, { duration: 150 });
      opacity.value = withTiming(0, { duration: 150 });
      backdropOpacity.value = withTiming(0, { duration: 200 });
    }
  }, [visible]);

  useEffect(() => {
    // Validate username as user types
    if (newUsername.length === 0) {
      setIsValid(true); // Don't show error for empty input
    } else if (newUsername.length < 3) {
      setIsValid(false);
    } else if (newUsername.length > 30) {
      setIsValid(false);
    } else if (!/^[a-zA-Z0-9_]+$/.test(newUsername)) {
      setIsValid(false);
    } else {
      setIsValid(true);
    }
  }, [newUsername]);

  const handleSave = async () => {
    if (newUsername === currentUsername) {
      onClose();
      return;
    }

    if (!isValid) {
      return;
    }

    const success = await updateUsername(newUsername);
    if (success) {
      onClose();
    }
  };

  const handleCancel = () => {
    setNewUsername(currentUsername);
    onClose();
  };

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: opacity.value,
  }));

  const backdropAnimatedStyle = useAnimatedStyle(() => ({
    opacity: backdropOpacity.value,
  }));

  const inputAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: inputScale.value }],
  }));

  const handleInputFocus = () => {
    inputScale.value = withSpring(1.02, { damping: 15, stiffness: 150 });
  };

  const handleInputBlur = () => {
    inputScale.value = withSpring(1, { damping: 15, stiffness: 150 });
  };

  const handleInputError = () => {
    inputScale.value = withSequence(
      withTiming(0.98, { duration: 100 }),
      withTiming(1.02, { duration: 100 }),
      withTiming(1, { duration: 100 })
    );
  };

  return (
    <Modal transparent visible={visible} animationType="none" onRequestClose={onClose}>
      <Animated.View
        style={[
          {
            flex: 1,
            backgroundColor: "rgba(0,0,0,0.7)",
            alignItems: "center",
            justifyContent: "center",
          },
          backdropAnimatedStyle,
        ]}
      >
        <Animated.View style={animatedStyle}>
          <BlurView
            intensity={10}
            tint="dark"
            style={{
              borderRadius: responsiveBorderRadius(24),
              overflow: "hidden",
              width: SCREEN_WIDTH * 0.85,
              maxWidth: responsiveSize(400),
              shadowColor: BRAND_COLORS.PRIMARY_DARK,
              shadowOffset: { width: 0, height: responsiveSize(10) },
              shadowOpacity: 0.3,
              shadowRadius: responsiveSize(20),
              elevation: 20,
            }}
          >
            <LinearGradient
              colors={[`${BRAND_COLORS.SURFACE}E0`, `${BRAND_COLORS.SURFACE_MUTED}E0`]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={{
                padding: responsivePadding(24),
                alignItems: "center",
              }}
            >
              {/* Header */}
              <View
                style={{
                  width: responsiveSize(60),
                  height: responsiveSize(60),
                  borderRadius: responsiveBorderRadius(30),
                  backgroundColor: `${BRAND_COLORS.PRIMARY}20`,
                  justifyContent: "center",
                  alignItems: "center",
                  marginBottom: responsiveMargin(16),
                  borderWidth: 2,
                  borderColor: `${BRAND_COLORS.PRIMARY}40`,
                }}
              >
                <Feather name="edit-3" size={responsiveIconSize(32)} color={BRAND_COLORS.PRIMARY} />
              </View>

              <Text
                style={{
                  fontSize: responsiveFontSize(20),
                  fontWeight: "800",
                  color: BRAND_COLORS.TEXT_PRIMARY,
                  textAlign: "center",
                  marginBottom: responsiveMargin(8),
                  letterSpacing: 0.5,
                }}
              >
                Change Username
              </Text>

              <Text
                style={{
                  fontSize: responsiveFontSize(14),
                  color: BRAND_COLORS.TEXT_SECONDARY,
                  textAlign: "center",
                  marginBottom: responsiveMargin(24),
                  lineHeight: responsiveSize(20),
                }}
              >
                Choose a unique username for your profile. This will be your public identifier.
              </Text>

              {/* Username Input */}
              <Animated.View style={[inputAnimatedStyle, { width: "100%" }]}>
                <View
                  style={{
                    marginBottom: responsiveMargin(16),
                  }}
                >
                  <Text
                    style={{
                      fontSize: responsiveFontSize(12),
                      fontWeight: "600",
                      color: BRAND_COLORS.TEXT_SECONDARY,
                      marginBottom: responsiveMargin(8),
                      textTransform: "uppercase",
                      letterSpacing: 0.5,
                    }}
                  >
                    Current Username
                  </Text>
                  <Text
                    style={{
                      fontSize: responsiveFontSize(16),
                      fontWeight: "700",
                      color: BRAND_COLORS.TEXT_PRIMARY,
                      paddingVertical: responsivePadding(12),
                      paddingHorizontal: responsivePadding(16),
                      backgroundColor: `${BRAND_COLORS.SURFACE_MUTED}40`,
                      borderRadius: responsiveBorderRadius(12),
                      borderWidth: 1,
                      borderColor: `${BRAND_COLORS.TEXT_SECONDARY}20`,
                    }}
                  >
                    @{currentUsername}
                  </Text>
                </View>

                <View style={{ marginBottom: responsiveMargin(20) }}>
                  <Text
                    style={{
                      fontSize: responsiveFontSize(12),
                      fontWeight: "600",
                      color: BRAND_COLORS.TEXT_SECONDARY,
                      marginBottom: responsiveMargin(8),
                      textTransform: "uppercase",
                      letterSpacing: 0.5,
                    }}
                  >
                    New Username
                  </Text>
                  <TextInput
                    value={newUsername}
                    onChangeText={setNewUsername}
                    onFocus={handleInputFocus}
                    onBlur={handleInputBlur}
                    style={{
                      fontSize: responsiveFontSize(16),
                      fontWeight: "600",
                      color: BRAND_COLORS.TEXT_PRIMARY,
                      paddingVertical: responsivePadding(12),
                      paddingHorizontal: responsivePadding(16),
                      backgroundColor: BRAND_COLORS.SURFACE,
                      borderRadius: responsiveBorderRadius(12),
                      borderWidth: 2,
                      borderColor: isValid
                        ? `${BRAND_COLORS.PRIMARY}30`
                        : BRAND_COLORS.DANGER,
                      shadowColor: isValid ? BRAND_COLORS.PRIMARY : BRAND_COLORS.DANGER,
                      shadowOffset: { width: 0, height: responsiveSize(2) },
                      shadowOpacity: isValid ? 0.1 : 0.2,
                      shadowRadius: responsiveSize(4),
                      elevation: 2,
                    }}
                    placeholder="Enter new username"
                    placeholderTextColor={BRAND_COLORS.TEXT_SECONDARY}
                    autoCapitalize="none"
                    autoCorrect={false}
                    autoFocus={true}
                    maxLength={30}
                  />
                </View>

                {/* Validation Message */}
                {newUsername.length > 0 && !isValid && (
                  <View
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                      marginBottom: responsiveMargin(16),
                      paddingHorizontal: responsivePadding(12),
                      paddingVertical: responsivePadding(8),
                      backgroundColor: `${BRAND_COLORS.DANGER}10`,
                      borderRadius: responsiveBorderRadius(8),
                      borderWidth: 1,
                      borderColor: `${BRAND_COLORS.DANGER}20`,
                    }}
                  >
                    <Feather
                      name="alert-circle"
                      size={responsiveIconSize(14)}
                      color={BRAND_COLORS.DANGER}
                      style={{ marginRight: responsiveMargin(8) }}
                    />
                    <Text
                      style={{
                        fontSize: responsiveFontSize(12),
                        color: BRAND_COLORS.DANGER,
                        fontWeight: "500",
                        flex: 1,
                      }}
                    >
                      {newUsername.length < 3
                        ? "Username must be at least 3 characters"
                        : newUsername.length > 30
                        ? "Username cannot exceed 30 characters"
                        : "Username can only contain letters, numbers, and underscores"}
                    </Text>
                  </View>
                )}

                {/* Username Rules */}
                <View
                  style={{
                    backgroundColor: `${BRAND_COLORS.PRIMARY}08`,
                    borderRadius: responsiveBorderRadius(12),
                    padding: responsivePadding(16),
                    marginBottom: responsiveMargin(24),
                    borderWidth: 1,
                    borderColor: `${BRAND_COLORS.PRIMARY}15`,
                  }}
                >
                  <Text
                    style={{
                      fontSize: responsiveFontSize(12),
                      fontWeight: "600",
                      color: BRAND_COLORS.PRIMARY,
                      marginBottom: responsiveMargin(8),
                      textTransform: "uppercase",
                      letterSpacing: 0.5,
                    }}
                  >
                    Username Rules
                  </Text>
                  <View style={{ paddingLeft: responsivePadding(8) }}>
                    {[
                      "3-30 characters long",
                      "Letters, numbers, and underscores only",
                      "Must be unique across the platform",
                      "Cannot be changed frequently",
                    ].map((rule, index) => (
                      <View
                        key={index}
                        style={{
                          flexDirection: "row",
                          alignItems: "center",
                          marginBottom: responsiveMargin(4),
                        }}
                      >
                        <View
                          style={{
                            width: responsiveSize(4),
                            height: responsiveSize(4),
                            borderRadius: responsiveBorderRadius(2),
                            backgroundColor: BRAND_COLORS.PRIMARY,
                            marginRight: responsiveMargin(8),
                          }}
                        />
                        <Text
                          style={{
                            fontSize: responsiveFontSize(11),
                            color: BRAND_COLORS.TEXT_SECONDARY,
                            fontWeight: "500",
                          }}
                        >
                          {rule}
                        </Text>
                      </View>
                    ))}
                  </View>
                </View>
              </Animated.View>

              {/* Action Buttons */}
              <View
                style={{
                  flexDirection: "row",
                  width: "100%",
                  justifyContent: "space-between",
                }}
              >
                <TouchableOpacity
                  onPress={handleCancel}
                  disabled={isUpdating}
                  style={{
                    flex: 1,
                    backgroundColor: `${BRAND_COLORS.TEXT_SECONDARY}20`,
                    paddingVertical: responsivePadding(14),
                    borderRadius: responsiveBorderRadius(16),
                    marginRight: responsiveMargin(8),
                    alignItems: "center",
                    justifyContent: "center",
                    shadowColor: BRAND_COLORS.TEXT_SECONDARY,
                    shadowOffset: { width: 0, height: responsiveSize(2) },
                    shadowOpacity: 0.1,
                    shadowRadius: responsiveSize(4),
                    elevation: 2,
                  }}
                >
                  <Text
                    style={{
                      color: BRAND_COLORS.TEXT_SECONDARY,
                      fontSize: responsiveFontSize(16),
                      fontWeight: "700",
                      letterSpacing: 0.5,
                    }}
                  >
                    Cancel
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={handleSave}
                  disabled={!isValid || isUpdating || newUsername === currentUsername}
                  style={{
                    flex: 1,
                    backgroundColor: isValid && newUsername !== currentUsername
                      ? BRAND_COLORS.PRIMARY
                      : `${BRAND_COLORS.TEXT_SECONDARY}30`,
                    paddingVertical: responsivePadding(14),
                    borderRadius: responsiveBorderRadius(16),
                    marginLeft: responsiveMargin(8),
                    alignItems: "center",
                    justifyContent: "center",
                    shadowColor: isValid && newUsername !== currentUsername
                      ? BRAND_COLORS.PRIMARY
                      : BRAND_COLORS.TEXT_SECONDARY,
                    shadowOffset: { width: 0, height: responsiveSize(4) },
                    shadowOpacity: isValid && newUsername !== currentUsername ? 0.3 : 0.1,
                    shadowRadius: responsiveSize(8),
                    elevation: isValid && newUsername !== currentUsername ? 6 : 2,
                  }}
                >
                  <Text
                    style={{
                      color: isValid && newUsername !== currentUsername
                        ? BRAND_COLORS.SURFACE
                        : BRAND_COLORS.TEXT_SECONDARY,
                      fontSize: responsiveFontSize(16),
                      fontWeight: "700",
                      letterSpacing: 0.5,
                    }}
                  >
                    {isUpdating ? "Updating..." : "Save Changes"}
                  </Text>
                </TouchableOpacity>
              </View>
            </LinearGradient>
          </BlurView>
        </Animated.View>
      </Animated.View>
    </Modal>
  );
};

export default UsernameEditModal;
