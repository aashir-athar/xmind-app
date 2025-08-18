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
import React, { useEffect } from "react";
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
    } else {
      modalOpacity.value = withTiming(0, { duration: 200 });
      modalScale.value = withTiming(0.9, { duration: 200 });
      headerOpacity.value = withTiming(0, { duration: 100 });
      fieldsOpacity.value = withTiming(0, { duration: 100 });
    }
  }, [isVisible]);

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

  const modalAnimatedStyle = useAnimatedStyle(() => ({
    opacity: modalOpacity.value,
    transform: [{ scale: modalScale.value }],
  }));

  const headerAnimatedStyle = useAnimatedStyle(() => ({
    opacity: headerOpacity.value,
    transform: [
      {
        translateY: interpolate(headerOpacity.value, [0, 1], [-10, 0]),
      },
    ],
  }));

  const fieldsAnimatedStyle = useAnimatedStyle(() => ({
    opacity: fieldsOpacity.value,
    transform: [
      {
        translateY: interpolate(fieldsOpacity.value, [0, 1], [20, 0]),
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
      presentationStyle="pageSheet"
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
                width: width - 32,
                maxHeight: height * 0.8,
                borderRadius: 28,
                overflow: "hidden",
                shadowColor: BRAND_COLORS.PRIMARY,
                shadowOffset: { width: 0, height: 20 },
                shadowOpacity: 0.3,
                shadowRadius: 30,
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
                  style={{ paddingHorizontal: 24, paddingVertical: 20 }}
                >
                  <View className="flex-row items-center justify-between">
                    <Animated.View style={cancelButtonAnimatedStyle}>
                      <TouchableOpacity
                        onPress={handleCancel}
                        style={{
                          paddingHorizontal: 16,
                          paddingVertical: 8,
                          borderRadius: 20,
                          backgroundColor: `${BRAND_COLORS.BORDER_LIGHT}20`,
                        }}
                      >
                        <Text
                          style={{
                            color: BRAND_COLORS.TEXT_SECONDARY,
                            fontSize: 16,
                            fontWeight: "600",
                          }}
                        >
                          Cancel
                        </Text>
                      </TouchableOpacity>
                    </Animated.View>

                    <View
                      style={{
                        paddingHorizontal: 20,
                        paddingVertical: 8,
                        borderRadius: 20,
                        backgroundColor: `${BRAND_COLORS.PRIMARY}15`,
                        borderWidth: 1,
                        borderColor: `${BRAND_COLORS.PRIMARY}20`,
                      }}
                    >
                      <Text
                        style={{
                          fontSize: 18,
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
                          paddingHorizontal: 20,
                          paddingVertical: 12,
                          borderRadius: 20,
                          backgroundColor: BRAND_COLORS.PRIMARY,
                          opacity: isUpdating ? 0.7 : 1,
                          shadowColor: BRAND_COLORS.PRIMARY,
                          shadowOffset: { width: 0, height: 4 },
                          shadowOpacity: 0.3,
                          shadowRadius: 8,
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
                              fontSize: 16,
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
                <Animated.View style={[{ padding: 24 }, fieldsAnimatedStyle]}>
                  <View style={{ gap: 24 }}>
                    {/* First Name Field */}
                    <View>
                      <Text
                        style={{
                          color: BRAND_COLORS.TEXT_SECONDARY,
                          fontSize: 14,
                          fontWeight: "600",
                          marginBottom: 8,
                          letterSpacing: 0.3,
                        }}
                      >
                        FIRST NAME
                      </Text>
                      <View
                        style={{
                          borderRadius: 16,
                          backgroundColor: `${BRAND_COLORS.BACKGROUND}80`,
                          borderWidth: 1,
                          borderColor: `${BRAND_COLORS.BORDER_LIGHT}60`,
                          shadowColor: BRAND_COLORS.PRIMARY,
                          shadowOffset: { width: 0, height: 2 },
                          shadowOpacity: 0.05,
                          shadowRadius: 4,
                          elevation: 2,
                        }}
                      >
                        <TextInput
                          style={{
                            padding: 16,
                            fontSize: 16,
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
                          fontSize: 14,
                          fontWeight: "600",
                          marginBottom: 8,
                          letterSpacing: 0.3,
                        }}
                      >
                        LAST NAME
                      </Text>
                      <View
                        style={{
                          borderRadius: 16,
                          backgroundColor: `${BRAND_COLORS.BACKGROUND}80`,
                          borderWidth: 1,
                          borderColor: `${BRAND_COLORS.BORDER_LIGHT}60`,
                          shadowColor: BRAND_COLORS.PRIMARY,
                          shadowOffset: { width: 0, height: 2 },
                          shadowOpacity: 0.05,
                          shadowRadius: 4,
                          elevation: 2,
                        }}
                      >
                        <TextInput
                          style={{
                            padding: 16,
                            fontSize: 16,
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

                    {/* Bio Field */}
                    <View>
                      <Text
                        style={{
                          color: BRAND_COLORS.TEXT_SECONDARY,
                          fontSize: 14,
                          fontWeight: "600",
                          marginBottom: 8,
                          letterSpacing: 0.3,
                        }}
                      >
                        BIO
                      </Text>
                      <View
                        style={{
                          borderRadius: 16,
                          backgroundColor: `${BRAND_COLORS.BACKGROUND}80`,
                          borderWidth: 1,
                          borderColor: `${BRAND_COLORS.BORDER_LIGHT}60`,
                          shadowColor: BRAND_COLORS.PRIMARY,
                          shadowOffset: { width: 0, height: 2 },
                          shadowOpacity: 0.05,
                          shadowRadius: 4,
                          elevation: 2,
                        }}
                      >
                        <TextInput
                          style={{
                            padding: 16,
                            fontSize: 16,
                            color: BRAND_COLORS.TEXT_PRIMARY,
                            fontWeight: "500",
                            minHeight: 80,
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
                          fontSize: 14,
                          fontWeight: "600",
                          marginBottom: 8,
                          letterSpacing: 0.3,
                        }}
                      >
                        LOCATION
                      </Text>
                      <View
                        style={{
                          borderRadius: 16,
                          backgroundColor: `${BRAND_COLORS.BACKGROUND}80`,
                          borderWidth: 1,
                          borderColor: `${BRAND_COLORS.BORDER_LIGHT}60`,
                          shadowColor: BRAND_COLORS.PRIMARY,
                          shadowOffset: { width: 0, height: 2 },
                          shadowOpacity: 0.05,
                          shadowRadius: 4,
                          elevation: 2,
                        }}
                      >
                        <TextInput
                          style={{
                            padding: 16,
                            fontSize: 16,
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
