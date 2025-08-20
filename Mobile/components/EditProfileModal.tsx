import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  ScrollView,
  Image,
  TextInput,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Dimensions,
  ActionSheetIOS,
  Alert,
} from "react-native";
import React, { useEffect } from "react";
import { useSafeAreaInsets } from "react-native-safe-area-context";
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
import { Feather, MaterialCommunityIcons } from "@expo/vector-icons";
import {
  responsiveSize,
  responsivePadding,
  responsiveMargin,
  responsiveBorderRadius,
  responsiveFontSize,
  responsiveIconSize,
  baseScale,
} from "@/utils/responsive";
import { ProfileFormData } from "@/hooks/useProfile";

const { width, height } = Dimensions.get("window");

interface EditProfileModalProps {
  isVisible: boolean;
  onClose: () => void;
  formData: ProfileFormData;
  saveProfile: () => Promise<void>;
  updateFormField: (field: keyof ProfileFormData, value: string) => void;
  isUpdating: boolean;
  selectedProfileImage: string | null;
  selectedBannerImage: string | null;
  pickImageFromGallery: (type: "profilePicture" | "bannerImage") => void;
  takePhoto: (type: "profilePicture" | "bannerImage") => void;
  removeImage: (type: "profilePicture" | "bannerImage") => void;
}

const EditProfileModal = ({
  isVisible,
  onClose,
  formData,
  saveProfile,
  updateFormField,
  isUpdating,
  selectedProfileImage,
  selectedBannerImage,
  pickImageFromGallery,
  takePhoto,
  removeImage,
}: EditProfileModalProps) => {
  const insets = useSafeAreaInsets();

  // Animation values (same structure as CommentsModal)
  const modalOpacity = useSharedValue(0);
  const modalScale = useSharedValue(0.9);
  const headerOpacity = useSharedValue(0);
  const contentOpacity = useSharedValue(0);

  useEffect(() => {
    if (isVisible) {
      modalOpacity.value = withTiming(1, { duration: 300 });
      modalScale.value = withSpring(1, { damping: 15 });
      headerOpacity.value = withDelay(150, withTiming(1, { duration: 200 }));
      contentOpacity.value = withDelay(250, withTiming(1, { duration: 400 }));
    } else {
      modalOpacity.value = withTiming(0, { duration: 200 });
      modalScale.value = withTiming(0.9, { duration: 200 });
      headerOpacity.value = withTiming(0, { duration: 100 });
      contentOpacity.value = withTiming(0, { duration: 100 });
    }
  }, [isVisible]);

  const handleClose = () => {
    // Same close logic as CommentsModal
    onClose();
  };

  const handleSave = async () => {
    await saveProfile();
  };

  const showImageActionSheet = (type: "profilePicture" | "bannerImage") => {
    const title =
      type === "profilePicture" ? "Profile Picture" : "Banner Image";
    const hasCurrentImage =
      type === "profilePicture" ? selectedProfileImage : selectedBannerImage;

    const options = ["Choose from Library", "Take Photo"];
    const destructiveButtonIndex = hasCurrentImage ? 2 : -1;

    if (hasCurrentImage) {
      options.push("Remove Image");
    }
    options.push("Cancel");

    if (Platform.OS === "ios") {
      ActionSheetIOS.showActionSheetWithOptions(
        {
          title: `Select ${title}`,
          options: options,
          cancelButtonIndex: options.length - 1,
          destructiveButtonIndex: destructiveButtonIndex,
        },
        (buttonIndex) => {
          switch (buttonIndex) {
            case 0:
              pickImageFromGallery(type);
              break;
            case 1:
              takePhoto(type);
              break;
            case 2:
              if (hasCurrentImage) {
                removeImage(type);
              }
              break;
          }
        }
      );
    } else {
      Alert.alert(`Select ${title}`, "", [
        {
          text: "Choose from Library",
          onPress: () => pickImageFromGallery(type),
        },
        { text: "Take Photo", onPress: () => takePhoto(type) },
        ...(hasCurrentImage
          ? [
              {
                text: "Remove Image",
                onPress: () => removeImage(type),
                style: "destructive" as const,
              },
            ]
          : []),
        { text: "Cancel", style: "cancel" as const },
      ]);
    }
  };

  const modalAnimatedStyle = useAnimatedStyle(() => ({
    opacity: modalOpacity.value,
    transform: [{ scale: modalScale.value }],
  }));

  const headerAnimatedStyle = useAnimatedStyle(() => ({
    opacity: headerOpacity.value,
    transform: [
      {
        translateY: interpolate(
          headerOpacity.value,
          [0, 1],
          [-10 * baseScale, 0]
        ),
      },
    ],
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
                width: width - responsiveSize(32),
                maxHeight: height * 0.9,
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
                  style={{
                    paddingHorizontal: responsivePadding(24),
                    paddingVertical: responsivePadding(20),
                  }}
                >
                  <View
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                      justifyContent: "space-between",
                    }}
                  >
                    <TouchableOpacity
                      onPress={handleClose}
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
                        Edit Profile
                      </Text>
                    </View>

                    <TouchableOpacity
                      onPress={handleSave}
                      disabled={isUpdating}
                      style={{
                        paddingHorizontal: responsivePadding(16),
                        paddingVertical: responsivePadding(8),
                        borderRadius: responsiveBorderRadius(20),
                        backgroundColor: isUpdating
                          ? `${BRAND_COLORS.BORDER_LIGHT}40`
                          : BRAND_COLORS.PRIMARY,
                        shadowColor: BRAND_COLORS.PRIMARY,
                        shadowOffset: { width: 0, height: responsiveSize(4) },
                        shadowOpacity: isUpdating ? 0 : 0.3,
                        shadowRadius: responsiveSize(8),
                        elevation: isUpdating ? 0 : 6,
                      }}
                    >
                      {isUpdating ? (
                        <ActivityIndicator
                          size="small"
                          color={BRAND_COLORS.TEXT_SECONDARY}
                        />
                      ) : (
                        <Text
                          style={{
                            color: BRAND_COLORS.SURFACE,
                            fontSize: responsiveFontSize(16),
                            fontWeight: "700",
                          }}
                        >
                          Save
                        </Text>
                      )}
                    </TouchableOpacity>
                  </View>
                </BlurView>
              </Animated.View>

              {/* Enhanced Content */}
              <KeyboardAvoidingView
                behavior={Platform.OS === "ios" ? "padding" : "height"}
                keyboardVerticalOffset={insets.bottom + responsiveSize(60)}
                style={{ flex: 1 }}
              >
                <ScrollView
                  style={{ flex: 1 }}
                  showsVerticalScrollIndicator={false}
                >
                  <Animated.View
                    style={[
                      { padding: responsivePadding(24) },
                      contentAnimatedStyle,
                    ]}
                  >
                    {/* Banner Image Section */}
                    <View style={{ marginBottom: responsiveMargin(24) }}>
                      <Text
                        style={{
                          fontSize: responsiveFontSize(16),
                          fontWeight: "700",
                          color: BRAND_COLORS.TEXT_PRIMARY,
                          marginBottom: responsiveMargin(12),
                        }}
                      >
                        Banner Image
                      </Text>

                      <TouchableOpacity
                        onPress={() => showImageActionSheet("bannerImage")}
                        style={{
                          width: "100%",
                          height: responsiveSize(120),
                          borderRadius: responsiveBorderRadius(16),
                          borderWidth: 2,
                          borderColor: `${BRAND_COLORS.BORDER_LIGHT}60`,
                          borderStyle: "dashed",
                          overflow: "hidden",
                          backgroundColor: `${BRAND_COLORS.BACKGROUND}80`,
                        }}
                      >
                        {selectedBannerImage ? (
                          <>
                            <Image
                              source={{ uri: selectedBannerImage }}
                              style={{ width: "100%", height: "100%" }}
                              resizeMode="cover"
                            />
                            <View
                              style={{
                                position: "absolute",
                                top: responsiveSize(8),
                                right: responsiveSize(8),
                                backgroundColor: `${BRAND_COLORS.DANGER}90`,
                                borderRadius: responsiveBorderRadius(12),
                                padding: responsivePadding(4),
                              }}
                            >
                              <Feather
                                name="x"
                                size={responsiveIconSize(12)}
                                color={BRAND_COLORS.SURFACE}
                              />
                            </View>
                          </>
                        ) : formData.bannerImage ? (
                          <>
                            <Image
                              source={{ uri: formData.bannerImage }}
                              style={{ width: "100%", height: "100%" }}
                              resizeMode="cover"
                            />
                            <View
                              style={{
                                position: "absolute",
                                top: 0,
                                left: 0,
                                right: 0,
                                bottom: 0,
                                backgroundColor: `${BRAND_COLORS.PRIMARY}20`,
                                justifyContent: "center",
                                alignItems: "center",
                              }}
                            >
                              <Feather
                                name="camera"
                                size={responsiveIconSize(24)}
                                color={BRAND_COLORS.PRIMARY}
                              />
                              <Text
                                style={{
                                  color: BRAND_COLORS.PRIMARY,
                                  fontSize: responsiveFontSize(12),
                                  fontWeight: "600",
                                  marginTop: responsiveMargin(4),
                                }}
                              >
                                Change Banner
                              </Text>
                            </View>
                          </>
                        ) : (
                          <View
                            style={{
                              flex: 1,
                              justifyContent: "center",
                              alignItems: "center",
                            }}
                          >
                            <Feather
                              name="image"
                              size={responsiveIconSize(32)}
                              color={BRAND_COLORS.TEXT_SECONDARY}
                            />
                            <Text
                              style={{
                                color: BRAND_COLORS.TEXT_SECONDARY,
                                fontSize: responsiveFontSize(14),
                                fontWeight: "500",
                                marginTop: responsiveMargin(8),
                              }}
                            >
                              Add Banner Image
                            </Text>
                          </View>
                        )}
                      </TouchableOpacity>
                    </View>

                    {/* Profile Picture Section */}
                    <View style={{ marginBottom: responsiveMargin(24) }}>
                      <Text
                        style={{
                          fontSize: responsiveFontSize(16),
                          fontWeight: "700",
                          color: BRAND_COLORS.TEXT_PRIMARY,
                          marginBottom: responsiveMargin(12),
                        }}
                      >
                        Profile Picture
                      </Text>

                      <View style={{ alignItems: "center" }}>
                        <TouchableOpacity
                          onPress={() => showImageActionSheet("profilePicture")}
                          style={{
                            width: responsiveSize(120),
                            height: responsiveSize(120),
                            borderRadius: responsiveBorderRadius(60),
                            borderWidth: 2,
                            borderColor: `${BRAND_COLORS.BORDER_LIGHT}60`,
                            borderStyle: "dashed",
                            overflow: "hidden",
                            backgroundColor: `${BRAND_COLORS.BACKGROUND}80`,
                          }}
                        >
                          {selectedProfileImage ? (
                            <>
                              <Image
                                source={{ uri: selectedProfileImage }}
                                style={{ width: "100%", height: "100%" }}
                                resizeMode="cover"
                              />
                              <View
                                style={{
                                  position: "absolute",
                                  top: responsiveSize(4),
                                  right: responsiveSize(4),
                                  backgroundColor: `${BRAND_COLORS.DANGER}90`,
                                  borderRadius: responsiveBorderRadius(10),
                                  padding: responsivePadding(2),
                                }}
                              >
                                <Feather
                                  name="x"
                                  size={responsiveIconSize(10)}
                                  color={BRAND_COLORS.SURFACE}
                                />
                              </View>
                            </>
                          ) : formData.profilePicture ? (
                            <>
                              <Image
                                source={{ uri: formData.profilePicture }}
                                style={{ width: "100%", height: "100%" }}
                                resizeMode="cover"
                              />
                              <View
                                style={{
                                  position: "absolute",
                                  top: 0,
                                  left: 0,
                                  right: 0,
                                  bottom: 0,
                                  backgroundColor: `${BRAND_COLORS.PRIMARY}20`,
                                  justifyContent: "center",
                                  alignItems: "center",
                                  borderRadius: responsiveBorderRadius(60),
                                }}
                              >
                                <Feather
                                  name="camera"
                                  size={responsiveIconSize(20)}
                                  color={BRAND_COLORS.PRIMARY}
                                />
                              </View>
                            </>
                          ) : (
                            <View
                              style={{
                                flex: 1,
                                justifyContent: "center",
                                alignItems: "center",
                              }}
                            >
                              <Feather
                                name="user"
                                size={responsiveIconSize(32)}
                                color={BRAND_COLORS.TEXT_SECONDARY}
                              />
                              <Text
                                style={{
                                  color: BRAND_COLORS.TEXT_SECONDARY,
                                  fontSize: responsiveFontSize(12),
                                  fontWeight: "500",
                                  marginTop: responsiveMargin(4),
                                }}
                              >
                                Add Photo
                              </Text>
                            </View>
                          )}
                        </TouchableOpacity>
                      </View>
                    </View>

                    {/* Form Fields */}
                    <View style={{ gap: responsiveSize(20) }}>
                      {/* First Name */}
                      <View>
                        <Text
                          style={{
                            fontSize: responsiveFontSize(16),
                            fontWeight: "700",
                            color: BRAND_COLORS.TEXT_PRIMARY,
                            marginBottom: responsiveMargin(8),
                          }}
                        >
                          First Name
                        </Text>
                        <TextInput
                          style={{
                            borderWidth: 1,
                            borderColor: `${BRAND_COLORS.BORDER_LIGHT}60`,
                            borderRadius: responsiveBorderRadius(12),
                            padding: responsivePadding(16),
                            fontSize: responsiveFontSize(16),
                            color: BRAND_COLORS.TEXT_PRIMARY,
                            backgroundColor: `${BRAND_COLORS.BACKGROUND}80`,
                          }}
                          placeholder="Enter your first name"
                          placeholderTextColor={BRAND_COLORS.PLACEHOLDER}
                          value={formData.firstName}
                          onChangeText={(text) =>
                            updateFormField("firstName", text)
                          }
                        />
                      </View>

                      {/* Last Name */}
                      <View>
                        <Text
                          style={{
                            fontSize: responsiveFontSize(16),
                            fontWeight: "700",
                            color: BRAND_COLORS.TEXT_PRIMARY,
                            marginBottom: responsiveMargin(8),
                          }}
                        >
                          Last Name
                        </Text>
                        <TextInput
                          style={{
                            borderWidth: 1,
                            borderColor: `${BRAND_COLORS.BORDER_LIGHT}60`,
                            borderRadius: responsiveBorderRadius(12),
                            padding: responsivePadding(16),
                            fontSize: responsiveFontSize(16),
                            color: BRAND_COLORS.TEXT_PRIMARY,
                            backgroundColor: `${BRAND_COLORS.BACKGROUND}80`,
                          }}
                          placeholder="Enter your last name"
                          placeholderTextColor={BRAND_COLORS.PLACEHOLDER}
                          value={formData.lastName}
                          onChangeText={(text) =>
                            updateFormField("lastName", text)
                          }
                        />
                      </View>

                      {/* Username */}
                      <View>
                        <Text
                          style={{
                            fontSize: responsiveFontSize(16),
                            fontWeight: "700",
                            color: BRAND_COLORS.TEXT_PRIMARY,
                            marginBottom: responsiveMargin(8),
                          }}
                        >
                          Username
                        </Text>
                        <TextInput
                          style={{
                            borderWidth: 1,
                            borderColor: `${BRAND_COLORS.BORDER_LIGHT}60`,
                            borderRadius: responsiveBorderRadius(12),
                            padding: responsivePadding(16),
                            fontSize: responsiveFontSize(16),
                            color: BRAND_COLORS.TEXT_PRIMARY,
                            backgroundColor: `${BRAND_COLORS.BACKGROUND}80`,
                          }}
                          placeholder="Enter your username"
                          placeholderTextColor={BRAND_COLORS.PLACEHOLDER}
                          value={formData.username}
                          onChangeText={(text) =>
                            updateFormField("username", text.toLowerCase())
                          }
                          autoCapitalize="none"
                        />
                      </View>

                      {/* Bio */}
                      <View>
                        <Text
                          style={{
                            fontSize: responsiveFontSize(16),
                            fontWeight: "700",
                            color: BRAND_COLORS.TEXT_PRIMARY,
                            marginBottom: responsiveMargin(8),
                          }}
                        >
                          Bio
                        </Text>
                        <TextInput
                          style={{
                            borderWidth: 1,
                            borderColor: `${BRAND_COLORS.BORDER_LIGHT}60`,
                            borderRadius: responsiveBorderRadius(12),
                            padding: responsivePadding(16),
                            fontSize: responsiveFontSize(16),
                            color: BRAND_COLORS.TEXT_PRIMARY,
                            backgroundColor: `${BRAND_COLORS.BACKGROUND}80`,
                            minHeight: responsiveSize(100),
                            textAlignVertical: "top",
                          }}
                          placeholder="Tell us about yourself..."
                          placeholderTextColor={BRAND_COLORS.PLACEHOLDER}
                          value={formData.bio}
                          onChangeText={(text) => updateFormField("bio", text)}
                          multiline
                          numberOfLines={4}
                          maxLength={160}
                        />
                        <Text
                          style={{
                            fontSize: responsiveFontSize(12),
                            color: BRAND_COLORS.TEXT_SECONDARY,
                            textAlign: "right",
                            marginTop: responsiveMargin(4),
                          }}
                        >
                          {formData.bio.length}/160
                        </Text>
                      </View>

                      {/* Location */}
                      <View>
                        <Text
                          style={{
                            fontSize: responsiveFontSize(16),
                            fontWeight: "700",
                            color: BRAND_COLORS.TEXT_PRIMARY,
                            marginBottom: responsiveMargin(8),
                          }}
                        >
                          Location
                        </Text>
                        <TextInput
                          style={{
                            borderWidth: 1,
                            borderColor: `${BRAND_COLORS.BORDER_LIGHT}60`,
                            borderRadius: responsiveBorderRadius(12),
                            padding: responsivePadding(16),
                            fontSize: responsiveFontSize(16),
                            color: BRAND_COLORS.TEXT_PRIMARY,
                            backgroundColor: `${BRAND_COLORS.BACKGROUND}80`,
                          }}
                          placeholder="Where are you located?"
                          placeholderTextColor={BRAND_COLORS.PLACEHOLDER}
                          value={formData.location}
                          onChangeText={(text) =>
                            updateFormField("location", text)
                          }
                        />
                      </View>
                    </View>

                    {/* Bottom Spacing */}
                    <View style={{ height: responsiveSize(40) }} />
                  </Animated.View>
                </ScrollView>
              </KeyboardAvoidingView>
            </LinearGradient>
          </Animated.View>
        </BlurView>
      </View>
    </Modal>
  );
};

export default EditProfileModal;
