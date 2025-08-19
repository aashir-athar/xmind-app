import React from "react";
import { View, Text, TouchableOpacity, ScrollView } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { BlurView } from "expo-blur";
import { BRAND_COLORS } from "@/constants/colors";
import {
  responsiveSize,
  responsivePadding,
  responsiveMargin,
  responsiveBorderRadius,
  responsiveFontSize,
  responsiveIconSize,
} from "@/utils/responsive";
import { Feather } from "@expo/vector-icons";
import CustomAlert from "./CustomAlert";
import { useCustomAlert } from "@/hooks/useCustomAlert";

const CustomAlertDemo: React.FC = () => {
  const {
    alertConfig,
    isVisible,
    hideAlert,
    showSuccess,
    showError,
    showWarning,
    showInfo,
    showConfirmation,
    showDeleteConfirmation,
    showChoiceDialog,
  } = useCustomAlert();

  const handleShowSuccess = () => {
    showSuccess("Success!", "Operation completed successfully.");
  };

  const handleShowError = () => {
    showError("Error", "Something went wrong. Please try again.");
  };

  const handleShowWarning = () => {
    showWarning("Warning", "This action cannot be undone.");
  };

  const handleShowInfo = () => {
    showInfo("Information", "Here's some important information for you.");
  };

  const handleShowConfirmation = () => {
    showConfirmation(
      "Confirm Action",
      "Are you sure you want to proceed with this action?",
      () => console.log("Confirmed!"),
      () => console.log("Cancelled!")
    );
  };

  const handleShowDeleteConfirmation = () => {
    showDeleteConfirmation(
      "Delete Item",
      "Are you sure you want to delete this item? This action cannot be undone.",
      () => console.log("Deleted!"),
      () => console.log("Delete cancelled!")
    );
  };

  const handleShowChoiceDialog = () => {
    showChoiceDialog(
      "Choose Option",
      "Please select one of the following options:",
      [
        { text: "Option 1", onPress: () => console.log("Option 1 selected") },
        { text: "Option 2", onPress: () => console.log("Option 2 selected") },
        { text: "Option 3", onPress: () => console.log("Option 3 selected") },
      ],
      () => console.log("Choice cancelled!")
    );
  };

  const DemoButton: React.FC<{
    title: string;
    subtitle: string;
    icon: string;
    onPress: () => void;
    color: string;
  }> = ({ title, subtitle, icon, onPress, color }) => (
    <TouchableOpacity
      style={{
        marginBottom: responsiveMargin(16),
        borderRadius: responsiveBorderRadius(16),
        overflow: "hidden",
        shadowColor: color,
        shadowOffset: { width: 0, height: responsiveSize(4) },
        shadowOpacity: 0.2,
        shadowRadius: responsiveSize(8),
        elevation: 6,
      }}
      onPress={onPress}
      activeOpacity={0.8}
    >
      <BlurView intensity={8} tint="light">
        <LinearGradient
          colors={[`${color}15`, `${color}08`]}
          style={{
            padding: responsivePadding(20),
            flexDirection: "row",
            alignItems: "center",
          }}
        >
          <View
            style={{
              width: responsiveSize(48),
              height: responsiveSize(48),
              borderRadius: responsiveBorderRadius(24),
              backgroundColor: `${color}20`,
              justifyContent: "center",
              alignItems: "center",
              marginRight: responsiveMargin(16),
            }}
          >
            <Feather name={icon as any} size={responsiveIconSize(24)} color={color} />
          </View>
           <View style={{ flex: 1 }}>
              <Text
                style={{
                  fontSize: responsiveFontSize(16),
                  fontWeight: "600",
                  color: BRAND_COLORS.TEXT_PRIMARY,
                  marginBottom: responsiveMargin(4),
                }}
              >
                {title}
              </Text>
              <Text
                style={{
                  fontSize: responsiveFontSize(14),
                  color: BRAND_COLORS.TEXT_SECONDARY,
                }}
              >
                {subtitle}
              </Text>
            </View>
            <Feather
              name="chevron-right"
              size={responsiveIconSize(20)}
              color={BRAND_COLORS.TEXT_SECONDARY}
            />
          </LinearGradient>
        </BlurView>
      </TouchableOpacity>
    </TouchableOpacity>
  );

  return (
    <View style={{ flex: 1, backgroundColor: BRAND_COLORS.BACKGROUND }}>
      <LinearGradient
        colors={[BRAND_COLORS.PRIMARY, BRAND_COLORS.BACKGROUND]}
        style={{ flex: 1 }}
      >
        <ScrollView
          style={{ flex: 1 }}
          contentContainerStyle={{
            padding: responsivePadding(20),
            paddingBottom: responsivePadding(40),
          }}
        >
          <View
            style={{
              alignItems: "center",
              marginBottom: responsiveMargin(32),
            }}
          >
            <View
              style={{
                width: responsiveSize(80),
                height: responsiveSize(80),
                borderRadius: responsiveBorderRadius(40),
                backgroundColor: `${BRAND_COLORS.PRIMARY}15`,
                justifyContent: "center",
                alignItems: "center",
                marginBottom: responsiveMargin(16),
                borderWidth: 2,
                borderColor: `${BRAND_COLORS.PRIMARY}25`,
              }}
            >
              <Feather
                name="message-circle"
                size={responsiveIconSize(40)}
                color={BRAND_COLORS.PRIMARY}
              />
            </View>
            <Text
              style={{
                fontSize: responsiveFontSize(24),
                fontWeight: "700",
                color: BRAND_COLORS.TEXT_PRIMARY,
                marginBottom: responsiveMargin(8),
                textAlign: "center",
              }}
            >
              Custom Alert Demo
            </Text>
            <Text
              style={{
                fontSize: responsiveFontSize(16),
                color: BRAND_COLORS.TEXT_SECONDARY,
                textAlign: "center",
                lineHeight: responsiveSize(22),
              }}
            >
              Tap any button below to see different types of custom alerts
            </Text>
          </View>

          <DemoButton
            title="Success Alert"
            subtitle="Show a success message with green styling"
            icon="check-circle"
            onPress={handleShowSuccess}
            color="#10B981"
          />

          <DemoButton
            title="Error Alert"
            subtitle="Show an error message with red styling"
            icon="alert-circle"
            onPress={handleShowError}
            color={BRAND_COLORS.DANGER}
          />

          <DemoButton
            title="Warning Alert"
            subtitle="Show a warning message with yellow styling"
            icon="alert-triangle"
            onPress={handleShowWarning}
            color="#F59E0B"
          />

          <DemoButton
            title="Info Alert"
            subtitle="Show an information message with blue styling"
            icon="info"
            onPress={handleShowInfo}
            color={BRAND_COLORS.PRIMARY}
          />

          <DemoButton
            title="Confirmation Dialog"
            subtitle="Show a confirmation dialog with two buttons"
            icon="help-circle"
            onPress={handleShowConfirmation}
            color={BRAND_COLORS.SECONDARY}
          />

          <DemoButton
            title="Delete Confirmation"
            subtitle="Show a delete confirmation with destructive styling"
            icon="trash-2"
            onPress={handleShowDeleteConfirmation}
            color={BRAND_COLORS.DANGER}
          />

          <DemoButton
            title="Choice Dialog"
            subtitle="Show a dialog with multiple choice options"
            icon="list"
            onPress={handleShowChoiceDialog}
            color={BRAND_COLORS.ACCENT_MINT}
          />
        </ScrollView>

        {/* Custom Alert Component */}
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
      </LinearGradient>
    </View>
  );
};

export default CustomAlertDemo;
