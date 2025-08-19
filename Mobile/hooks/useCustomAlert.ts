import { useState, useCallback } from "react";
import { AlertButton } from "@/components/CustomAlert";

export interface CustomAlertOptions {
  title: string;
  message: string;
  buttons?: AlertButton[];
  type?: "default" | "success" | "error" | "warning" | "info";
}

export const useCustomAlert = () => {
  const [alertConfig, setAlertConfig] = useState<CustomAlertOptions | null>(null);
  const [isVisible, setIsVisible] = useState(false);

  const showAlert = useCallback((options: CustomAlertOptions) => {
    setAlertConfig(options);
    setIsVisible(true);
  }, []);

  const hideAlert = useCallback(() => {
    setIsVisible(false);
    setAlertConfig(null);
  }, []);

  // Convenience methods for common alert types
  const showSuccess = useCallback((title: string, message: string, buttons?: AlertButton[]) => {
    showAlert({
      title,
      message,
      buttons: buttons || [{ text: "OK" }],
      type: "success",
    });
  }, [showAlert]);

  const showError = useCallback((title: string, message: string, buttons?: AlertButton[]) => {
    showAlert({
      title,
      message,
      buttons: buttons || [{ text: "OK" }],
      type: "error",
    });
  }, [showAlert]);

  const showWarning = useCallback((title: string, message: string, buttons?: AlertButton[]) => {
    showAlert({
      title,
      message,
      buttons: buttons || [{ text: "OK" }],
      type: "warning",
    });
  }, [showAlert]);

  const showInfo = useCallback((title: string, message: string, buttons?: AlertButton[]) => {
    showAlert({
      title,
      message,
      buttons: buttons || [{ text: "OK" }],
      type: "info",
    });
  }, [showAlert]);

  const showConfirmation = useCallback((
    title: string,
    message: string,
    onConfirm: () => void,
    onCancel?: () => void,
    confirmText = "Confirm",
    cancelText = "Cancel"
  ) => {
    showAlert({
      title,
      message,
      buttons: [
        {
          text: cancelText,
          style: "cancel",
          onPress: onCancel,
        },
        {
          text: confirmText,
          style: "default",
          onPress: onConfirm,
        },
      ],
      type: "default",
    });
  }, [showAlert]);

  const showDeleteConfirmation = useCallback((
    title: string,
    message: string,
    onDelete: () => void,
    onCancel?: () => void
  ) => {
    showAlert({
      title,
      message,
      buttons: [
        {
          text: "Cancel",
          style: "cancel",
          onPress: onCancel,
        },
        {
          text: "Delete",
          style: "destructive",
          onPress: onDelete,
        },
      ],
      type: "warning",
    });
  }, [showAlert]);

  const showChoiceDialog = useCallback((
    title: string,
    message: string,
    choices: Array<{ text: string; onPress: () => void }>,
    onCancel?: () => void,
    cancelText = "Cancel"
  ) => {
    const buttons: AlertButton[] = [
      ...choices.map(choice => ({
        text: choice.text,
        onPress: choice.onPress,
      })),
      {
        text: cancelText,
        style: "cancel",
        onPress: onCancel,
      },
    ];

    showAlert({
      title,
      message,
      buttons,
      type: "info",
    });
  }, [showAlert]);

  return {
    alertConfig,
    isVisible,
    showAlert,
    hideAlert,
    showSuccess,
    showError,
    showWarning,
    showInfo,
    showConfirmation,
    showDeleteConfirmation,
    showChoiceDialog,
  };
};
