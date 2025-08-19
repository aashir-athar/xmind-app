import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  ActivityIndicator,
  ScrollView,
  TextInput,
  Dimensions,
} from "react-native";
import React, { useEffect, useState, useRef } from "react";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  withDelay,
  interpolate,
  runOnJS,
} from "react-native-reanimated";
import { LinearGradient } from "expo-linear-gradient";
import { BlurView } from "expo-blur";
import { BRAND_COLORS } from "@/constants/colors";
import { useProfileUpdate } from "@/hooks/useProfileUpdate";
import { useCustomAlert } from "@/hooks/useCustomAlert";
import { validateUsername } from "@/utils/usernameValidation";
import { useApiClient, userApi } from "@/utils/api";
import { 
  responsiveSize, 
  responsivePadding, 
  responsiveMargin, 
  responsiveBorderRadius, 
  responsiveFontSize, 
  responsiveIconSize,
  baseScale 
} from "@/utils/responsive";

const { width, height } = Dimensions.get("window");

interface EditProfileModalProps {
  isVisible: boolean;
  onClose: () => void;
  formData: {
    firstName: string;
    lastName: string;
    bio: string;
    location: string;
  };
  saveProfile: () => void;
  updateFormField: (field: string, value: string) => void;
  isUpdating: boolean;
}

const AnimatedTextInput = Animated.createAnimatedComponent(TextInput);

const EditProfileModal = ({
  formData,
  isUpdating,
  isVisible,
  onClose,
  saveProfile,
  updateFormField,
}: EditProfileModalProps) => {
  // Username state and functionality
  const [username, setUsername] = useState("");
  const [isUsernameUpdating, setIsUsernameUpdating] = useState(false);
  const [usernameValidation, setUsernameValidation] = useState<{
    isValid: boolean;
    errors: string[];
  }>({ isValid: true, errors: [] });
  const [isCheckingAvailability, setIsCheckingAvailability] = useState(false);
  const { updateUsername, currentUser } = useProfileUpdate();
  const { showError, showSuccess } = useCustomAlert();
  const api = useApiClient();
  
  // Debounce timer for username validation
  const debounceTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Animation values
  const modalOpacity = useSharedValue(0);
  const modalScale = useSharedValue(0.9);
  const headerOpacity = useSharedValue(0);
  const fieldsOpacity = useSharedValue(0);
  const saveButtonScale = useSharedValue(1);
  const cancelButtonScale = useSharedValue(1);

  useEffect(() => {
    if (isVisible) {
      modalOpacity.value = withTiming(1, { duration: 300 });
      modalScale.value = withSpring(1, { damping: 15 });
      headerOpacity.value = withDelay(150, withTiming(1, { duration: 200 }));
      fieldsOpacity.value = withDelay(250, withTiming(1, { duration: 400 }));
      
      // Initialize username field with current user's username
      if (currentUser?.username) {
        setUsername(currentUser.username);
      }
    } else {
      modalOpacity.value = withTiming(0, { duration: 200 });
      modalScale.value = withTiming(0.9, { duration: 200 });
      headerOpacity.value = withTiming(0, { duration: 100 });
      fieldsOpacity.value = withTiming(0, { duration: 100 });
      
      // Clear username field and validation when modal closes
      setUsername("");
      setUsernameValidation({ isValid: true, errors: [] });
    }
  }, [isVisible]); // Removed currentUser?.username dependency

  // Separate effect for username initialization to prevent infinite loops
  useEffect(() => {
    if (isVisible && currentUser?.username && username === "") {
      setUsername(currentUser.username);
    }
  }, [isVisible, currentUser?.username]); // Removed username dependency

  // Cleanup debounce timer on unmount
  useEffect(() => {
    return () => {
      if (debounceTimer.current) {
        clearTimeout(debounceTimer.current);
      }
    };
  }, []);

  const handleSave = () => {
    saveButtonScale.value = withSpring(0.95, { damping: 15 }, () => {
      saveButtonScale.value = withSpring(1);
      runOnJS(saveProfile)();
      runOnJS(onClose)();
    });
  };

  const handleCancel = () => {
    cancelButtonScale.value = withSpring(0.95, { damping: 15 }, () => {
      cancelButtonScale.value = withSpring(1);
      runOnJS(onClose)();
    });
  };

  const handleUsernameChange = async () => {
    if (!username.trim()) {
      showError("Error", "Username cannot be empty");
      return;
    }

    // Check if username is the same as current
    if (username.trim() === currentUser?.username) {
      showError("Error", "This is already your current username");
      return;
    }

    // Validate username before updating
    const validation = await validateUsername(username.trim(), { platformMode: "xMind" });
    if (!validation.valid) {
      showError("Invalid Username", validation.errors.join(", "));
      return;
    }

    setIsUsernameUpdating(true);
    try {
      const success = await updateUsername(username.trim());
      if (success) {
        showSuccess("Success", "Username updated successfully!");
        // Don't clear the input, keep the new username
      }
    } catch (error) {
      showError("Error", "Failed to update username. Please try again.");
    } finally {
      setIsUsernameUpdating(false);
    }
  };

  const handleUsernameInputChange = async (text: string) => {
    setUsername(text);
    
    // Clear validation when input is empty
    if (!text.trim()) {
      setUsernameValidation({ isValid: true, errors: [] });
      return;
    }

    // Clear previous timer
    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current);
    }

    // Set new timer for debounced validation
    debounceTimer.current = setTimeout(async () => {
      // First, validate format using usernameValidation.ts
      try {
        const validation = await validateUsername(text.trim(), { platformMode: "xMind" });
        
        if (!validation.valid) {
          setUsernameValidation({
            isValid: false,
            errors: validation.errors
          });
          return; // Don't check availability if format is invalid
        }

        // If format is valid, check database availability
        setIsCheckingAvailability(true);
        try {
          const response = await userApi.checkUsernameAvailability(api, text.trim());
          
          if (response.data.available) {
            // Username is available and format is valid
            setUsernameValidation({
              isValid: true,
              errors: []
            });
          } else {
            // Username is taken
            setUsernameValidation({
              isValid: false,
              errors: ["Username is already taken"]
            });
          }
        } catch (error) {
          console.error("Availability check error:", error);
          // If availability check fails, still show format validation
          setUsernameValidation({
            isValid: validation.valid,
            errors: validation.errors
          });
        } finally {
          setIsCheckingAvailability(false);
        }
        
      } catch (error) {
        console.error("Validation error:", error);
        setUsernameValidation({ isValid: false, errors: ["Validation error occurred"] });
      }
    }, 500); // 500ms debounce delay
  };

  const modalAnimatedStyle = useAnimatedStyle(() => ({
    opacity: modalOpacity.value,
    transform: [{ scale: modalScale.value }],
  }));

  const headerAnimatedStyle = useAnimatedStyle(() => ({
    opacity: headerOpacity.value,
    transform: [
      {
        translateY: interpolate(headerOpacity.value, [0, 1], [-10 * baseScale, 0]),
      },
    ],
  }));

  const fieldsAnimatedStyle = useAnimatedStyle(() => ({
    opacity: fieldsOpacity.value,
    transform: [
      {
        translateY: interpolate(fieldsOpacity.value, [0, 1], [20 * baseScale, 0]),
      },
    ],
  }));

  const saveButtonAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: saveButtonScale.value }],
  }));

  const cancelButtonAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: cancelButtonScale.value }],
  }));

  return (
    <Modal
      visible={isVisible}
      animationType="none"
      transparent={true}
      style={{ flex: 1 }}
    >
      <View
        style={{
          flex: 1,
          backgroundColor: `${BRAND_COLORS.PRIMARY_DARK}40`,
        }}
      >
        <BlurView
          intensity={20}
          tint="dark"
          style={{ flex: 1, justifyContent: "center", alignItems: "center" }}
        >
          <Animated.View
            style={[
              {
                flex: 1,
                width: width - responsiveSize(32),
                maxHeight: height * 0.8,
                borderRadius: responsiveBorderRadius(28),
                overflow: "hidden",
                shadowColor: BRAND_COLORS.PRIMARY,
                shadowOffset: { width: 0, height: responsiveSize(20) },
                shadowOpacity: 0.3,
                shadowRadius: responsiveSize(30),
                elevation: 20,
              },
              modalAnimatedStyle,
            ]}
          >
            <LinearGradient
              colors={[BRAND_COLORS.SURFACE, `${BRAND_COLORS.BACKGROUND}95`]}
              style={{ flex: 1 }}
            >
              {/* Enhanced Header */}
              <Animated.View style={headerAnimatedStyle}>
                <BlurView
                  intensity={10}
                  tint="light"
                  style={{ paddingHorizontal: responsivePadding(24), paddingVertical: responsivePadding(20) }}
                >
                  <View className="flex-row items-center justify-between">
                    <Animated.View style={cancelButtonAnimatedStyle}>
                      <TouchableOpacity
                        onPress={handleCancel}
                        style={{
                          paddingHorizontal: responsivePadding(16),
                          paddingVertical: responsivePadding(8),
                          borderRadius: responsiveBorderRadius(20),
                          backgroundColor: `${BRAND_COLORS.BORDER_LIGHT}20`,
                        }}
                      >
                        <Text
                          style={{
                            color: BRAND_COLORS.TEXT_SECONDARY,
                            fontSize: responsiveFontSize(16),
                            fontWeight: "600",
                          }}
                        >
                          Cancel
                        </Text>
                      </TouchableOpacity>
                    </Animated.View>

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
                          fontSize: responsiveFontSize(18),
                          fontWeight: "800",
                          color: BRAND_COLORS.TEXT_PRIMARY,
                          letterSpacing: 0.5,
                        }}
                      >
                        Edit Mind
                      </Text>
                    </View>

                    <Animated.View style={saveButtonAnimatedStyle}>
                      <TouchableOpacity
                        onPress={handleSave}
                        disabled={isUpdating}
                        style={{
                          paddingHorizontal: responsivePadding(20),
                          paddingVertical: responsivePadding(12),
                          borderRadius: responsiveBorderRadius(20),
                          backgroundColor: BRAND_COLORS.PRIMARY,
                          opacity: isUpdating ? 0.7 : 1,
                          shadowColor: BRAND_COLORS.PRIMARY,
                          shadowOffset: { width: 0, height: responsiveSize(4) },
                          shadowOpacity: 0.3,
                          shadowRadius: responsiveSize(8),
                          elevation: 6,
                        }}
                      >
                        {isUpdating ? (
                          <ActivityIndicator
                            size="small"
                            color={BRAND_COLORS.SURFACE}
                          />
                        ) : (
                          <Text
                            style={{
                              color: BRAND_COLORS.SURFACE,
                              fontSize: responsiveFontSize(16),
                              fontWeight: "700",
                              letterSpacing: 0.3,
                            }}
                          >
                            Save
                          </Text>
                        )}
                      </TouchableOpacity>
                    </Animated.View>
                  </View>
                </BlurView>
              </Animated.View>

              {/* Enhanced Form Fields */}
              <ScrollView
                style={{ flex: 1 }}
                showsVerticalScrollIndicator={false}
              >
                <Animated.View style={[{ padding: responsivePadding(24) }, fieldsAnimatedStyle]}>
                  <View style={{ gap: responsiveSize(24) }}>
                    {/* First Name Field */}
                    <View>
                      <Text
                        style={{
                          color: BRAND_COLORS.TEXT_SECONDARY,
                          fontSize: responsiveFontSize(14),
                          fontWeight: "600",
                          marginBottom: responsiveMargin(8),
                          letterSpacing: 0.3,
                        }}
                      >
                        FIRST NAME
                      </Text>
                      <View
                        style={{
                          borderRadius: responsiveBorderRadius(16),
                          backgroundColor: `${BRAND_COLORS.BACKGROUND}80`,
                          borderWidth: 1,
                          borderColor: `${BRAND_COLORS.BORDER_LIGHT}60`,
                          shadowColor: BRAND_COLORS.PRIMARY,
                          shadowOffset: { width: 0, height: responsiveSize(2) },
                          shadowOpacity: 0.05,
                          shadowRadius: responsiveSize(4),
                          elevation: 2,
                        }}
                      >
                        <TextInput
                          style={{
                            padding: responsivePadding(16),
                            fontSize: responsiveFontSize(16),
                            color: BRAND_COLORS.TEXT_PRIMARY,
                            fontWeight: "500",
                          }}
                          value={formData.firstName}
                          onChangeText={(text) =>
                            updateFormField("firstName", text)
                          }
                          placeholder="Your first name"
                          placeholderTextColor={BRAND_COLORS.PLACEHOLDER}
                        />
                      </View>
                    </View>

                    {/* Last Name Field */}
                    <View>
                      <Text
                        style={{
                          color: BRAND_COLORS.TEXT_SECONDARY,
                          fontSize: responsiveFontSize(14),
                          fontWeight: "600",
                          marginBottom: responsiveMargin(8),
                          letterSpacing: 0.3,
                        }}
                      >
                        LAST NAME
                      </Text>
                      <View
                        style={{
                          borderRadius: responsiveBorderRadius(16),
                          backgroundColor: `${BRAND_COLORS.BACKGROUND}80`,
                          borderWidth: 1,
                          borderColor: `${BRAND_COLORS.BORDER_LIGHT}60`,
                          shadowColor: BRAND_COLORS.PRIMARY,
                          shadowOffset: { width: 0, height: responsiveSize(2) },
                          shadowOpacity: 0.05,
                          shadowRadius: responsiveSize(4),
                          elevation: 2,
                        }}
                      >
                        <TextInput
                          style={{
                            padding: responsivePadding(16),
                            fontSize: responsiveFontSize(16),
                            color: BRAND_COLORS.TEXT_PRIMARY,
                            fontWeight: "500",
                          }}
                          value={formData.lastName}
                          onChangeText={(text) =>
                            updateFormField("lastName", text)
                          }
                          placeholder="Your last name"
                          placeholderTextColor={BRAND_COLORS.PLACEHOLDER}
                        />
                      </View>
                    </View>

                    {/* Username Field */}
                    <View>
                      <Text
                        style={{
                          color: BRAND_COLORS.TEXT_SECONDARY,
                          fontSize: responsiveFontSize(14),
                          fontWeight: "600",
                          marginBottom: responsiveMargin(8),
                          letterSpacing: 0.3,
                        }}
                      >
                        USERNAME
                      </Text>
                      <View
                        style={{
                          borderRadius: responsiveBorderRadius(16),
                          backgroundColor: `${BRAND_COLORS.BACKGROUND}80`,
                          borderWidth: 1,
                          borderColor: username.trim() ? 
                            (usernameValidation.isValid ? BRAND_COLORS.SUCCESS : BRAND_COLORS.DANGER) : 
                            `${BRAND_COLORS.BORDER_LIGHT}60`,
                          shadowColor: BRAND_COLORS.PRIMARY,
                          shadowOffset: { width: 0, height: responsiveSize(2) },
                          shadowOpacity: 0.05,
                          shadowRadius: responsiveSize(4),
                          elevation: 2,
                        }}
                      >
                        <TextInput
                          style={{
                            padding: responsivePadding(16),
                            fontSize: responsiveFontSize(16),
                            color: BRAND_COLORS.TEXT_PRIMARY,
                            fontWeight: "500",
                          }}
                          value={username}
                          onChangeText={handleUsernameInputChange}
                          placeholder="Choose your username"
                          placeholderTextColor={BRAND_COLORS.PLACEHOLDER}
                          autoCapitalize="none"
                          autoCorrect={false}
                        />
                      </View>
                      
                      {/* Validation Status */}
                      {username.trim() && (
                        <View style={{ marginTop: responsiveMargin(8) }}>
                          {isCheckingAvailability ? (
                            <View style={{ flexDirection: "row", alignItems: "center" }}>
                              <ActivityIndicator
                                size="small"
                                color={BRAND_COLORS.PRIMARY}
                                style={{ marginRight: responsiveMargin(8) }}
                              />
                              <Text
                                style={{
                                  color: BRAND_COLORS.TEXT_SECONDARY,
                                  fontSize: responsiveFontSize(12),
                                  fontStyle: "italic",
                                }}
                              >
                                Checking username availability...
                              </Text>
                            </View>
                          ) : usernameValidation.isValid ? (
                            <Text
                              style={{
                                color: BRAND_COLORS.SUCCESS,
                                fontSize: responsiveFontSize(12),
                                fontStyle: "italic",
                              }}
                            >
                              ✓ Username is available and valid
                            </Text>
                          ) : (
                            usernameValidation.errors.map((error, index) => (
                              <Text
                                key={index}
                                style={{
                                  color: BRAND_COLORS.DANGER,
                                  fontSize: responsiveFontSize(12),
                                  marginBottom: responsiveMargin(2),
                                  fontStyle: "italic",
                                }}
                              >
                                • {error}
                              </Text>
                            ))
                          )}
                        </View>
                      )}
                      
                      <View style={{ flexDirection: "row", alignItems: "center", marginTop: responsiveMargin(8) }}>
                        <TouchableOpacity
                          onPress={handleUsernameChange}
                          disabled={isUsernameUpdating || !username.trim() || !usernameValidation.isValid}
                          style={{
                            paddingHorizontal: responsivePadding(16),
                            paddingVertical: responsivePadding(8),
                            borderRadius: responsiveBorderRadius(12),
                            backgroundColor: (username.trim() && usernameValidation.isValid) ? BRAND_COLORS.PRIMARY : `${BRAND_COLORS.PRIMARY}40`,
                            opacity: (isUsernameUpdating || !username.trim() || !usernameValidation.isValid) ? 0.6 : 1,
                            shadowColor: BRAND_COLORS.PRIMARY,
                            shadowOffset: { width: 0, height: responsiveSize(2) },
                            shadowOpacity: 0.2,
                            shadowRadius: responsiveSize(4),
                            elevation: 3,
                          }}
                        >
                          {isUsernameUpdating ? (
                            <ActivityIndicator
                              size="small"
                              color={BRAND_COLORS.SURFACE}
                            />
                          ) : (
                            <Text
                              style={{
                                color: BRAND_COLORS.SURFACE,
                                fontSize: responsiveFontSize(14),
                                fontWeight: "600",
                                letterSpacing: 0.3,
                              }}
                            >
                              Update Username
                            </Text>
                          )}
                        </TouchableOpacity>
                        <Text
                          style={{
                            color: BRAND_COLORS.TEXT_SECONDARY,
                            fontSize: responsiveFontSize(12),
                            marginLeft: responsiveMargin(12),
                            fontStyle: "italic",
                            flex: 1,
                          }}
                        >
                          Only letters, numbers, and underscores. 4-15 characters.
                          {currentUser?.username && (
                            <Text style={{ color: BRAND_COLORS.PRIMARY }}>
                              {" "}Current: @{currentUser.username}
                            </Text>
                          )}
                        </Text>
                      </View>
                    </View>

                    {/* Bio Field */}
                    <View>
                      <Text
                        style={{
                          color: BRAND_COLORS.TEXT_SECONDARY,
                          fontSize: responsiveFontSize(14),
                          fontWeight: "600",
                          marginBottom: responsiveMargin(8),
                          letterSpacing: 0.3,
                        }}
                      >
                        BIO
                      </Text>
                      <View
                        style={{
                          borderRadius: responsiveBorderRadius(16),
                          backgroundColor: `${BRAND_COLORS.BACKGROUND}80`,
                          borderWidth: 1,
                          borderColor: `${BRAND_COLORS.BORDER_LIGHT}60`,
                          shadowColor: BRAND_COLORS.PRIMARY,
                          shadowOffset: { width: 0, height: responsiveSize(2) },
                          shadowOpacity: 0.05,
                          shadowRadius: responsiveSize(4),
                          elevation: 2,
                        }}
                      >
                        <TextInput
                          style={{
                            padding: responsivePadding(16),
                            fontSize: responsiveFontSize(16),
                            color: BRAND_COLORS.TEXT_PRIMARY,
                            fontWeight: "500",
                            minHeight: responsiveSize(80),
                            textAlignVertical: "top",
                          }}
                          value={formData.bio}
                          onChangeText={(text) => updateFormField("bio", text)}
                          placeholder="Share your mind's essence..."
                          placeholderTextColor={BRAND_COLORS.PLACEHOLDER}
                          multiline
                          numberOfLines={3}
                        />
                      </View>
                    </View>

                    {/* Location Field */}
                    <View>
                      <Text
                        style={{
                          color: BRAND_COLORS.TEXT_SECONDARY,
                          fontSize: responsiveFontSize(14),
                          fontWeight: "600",
                          marginBottom: responsiveMargin(8),
                          letterSpacing: 0.3,
                        }}
                      >
                        LOCATION
                      </Text>
                      <View
                        style={{
                          borderRadius: responsiveBorderRadius(16),
                          backgroundColor: `${BRAND_COLORS.BACKGROUND}80`,
                          borderWidth: 1,
                          borderColor: `${BRAND_COLORS.BORDER_LIGHT}60`,
                          shadowColor: BRAND_COLORS.PRIMARY,
                          shadowOffset: { width: 0, height: responsiveSize(2) },
                          shadowOpacity: 0.05,
                          shadowRadius: responsiveSize(4),
                          elevation: 2,
                        }}
                      >
                        <TextInput
                          style={{
                            padding: responsivePadding(16),
                            fontSize: responsiveFontSize(16),
                            color: BRAND_COLORS.TEXT_PRIMARY,
                            fontWeight: "500",
                          }}
                          value={formData.location}
                          onChangeText={(text) =>
                            updateFormField("location", text)
                          }
                          placeholder="Where does your mind reside?"
                          placeholderTextColor={BRAND_COLORS.PLACEHOLDER}
                        />
                      </View>
                    </View>
                  </View>
                </Animated.View>
              </ScrollView>
            </LinearGradient>
          </Animated.View>
        </BlurView>
      </View>
    </Modal>
  );
};

export default EditProfileModal;
