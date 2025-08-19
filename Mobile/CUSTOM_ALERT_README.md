# Custom Alert System

This document explains how to use the custom alert system that replaces React Native's built-in `Alert.alert` with a design-consistent, animated alert component.

## Components

### 1. CustomAlert Component

A fully customizable alert modal that matches your app's design system.

**Props:**
- `visible: boolean` - Controls alert visibility
- `title: string` - Alert title
- `message: string` - Alert message
- `buttons?: AlertButton[]` - Array of button configurations
- `onDismiss?: () => void` - Called when alert is dismissed
- `type?: "default" | "success" | "error" | "warning" | "info"` - Visual styling

**Button Interface:**
```typescript
interface AlertButton {
  text: string;
  style?: "default" | "cancel" | "destructive";
  onPress?: () => void;
}
```

### 2. useCustomAlert Hook

A convenient hook that provides easy-to-use methods for common alert types.

**Available Methods:**
- `showAlert(options)` - Show custom alert with full configuration
- `showSuccess(title, message, buttons?)` - Success alert with green styling
- `showError(title, message, buttons?)` - Error alert with red styling
- `showWarning(title, message, buttons?)` - Warning alert with yellow styling
- `showInfo(title, message, buttons?)` - Info alert with blue styling
- `showConfirmation(title, message, onConfirm, onCancel?, confirmText?, cancelText?)` - Confirmation dialog
- `showDeleteConfirmation(title, message, onDelete, onCancel?)` - Delete confirmation with destructive styling
- `showChoiceDialog(title, message, choices, onCancel?, cancelText?)` - Multiple choice dialog

## Usage Examples

### Basic Usage

```typescript
import { useCustomAlert } from "@/hooks/useCustomAlert";

const MyComponent = () => {
  const { showSuccess, showError, showConfirmation } = useCustomAlert();

  const handleSuccess = () => {
    showSuccess("Success!", "Operation completed successfully.");
  };

  const handleError = () => {
    showError("Error", "Something went wrong. Please try again.");
  };

  const handleDelete = () => {
    showConfirmation(
      "Delete Item",
      "Are you sure you want to delete this item?",
      () => console.log("Deleted!"),
      () => console.log("Cancelled!")
    );
  };

  return (
    // Your component JSX
  );
};
```

### Advanced Usage with CustomAlert Component

```typescript
import React, { useState } from "react";
import CustomAlert, { AlertButton } from "@/components/CustomAlert";

const MyComponent = () => {
  const [isAlertVisible, setIsAlertVisible] = useState(false);
  const [alertConfig, setAlertConfig] = useState({
    title: "",
    message: "",
    buttons: [] as AlertButton[],
  });

  const showCustomAlert = () => {
    setAlertConfig({
      title: "Custom Alert",
      message: "This is a custom alert with multiple buttons",
      buttons: [
        { text: "Cancel", style: "cancel" },
        { text: "Option 1", onPress: () => console.log("Option 1") },
        { text: "Option 2", onPress: () => console.log("Option 2") },
      ],
    });
    setIsAlertVisible(true);
  };

  return (
    <>
      <TouchableOpacity onPress={showCustomAlert}>
        <Text>Show Custom Alert</Text>
      </TouchableOpacity>

      <CustomAlert
        visible={isAlertVisible}
        title={alertConfig.title}
        message={alertConfig.message}
        buttons={alertConfig.buttons}
        onDismiss={() => setIsAlertVisible(false)}
        type="info"
      />
    </>
  );
};
```

## Migration from Alert.alert

### Before (React Native Alert)
```typescript
// Simple alert
Alert.alert("Success", "Operation completed successfully!");

// Confirmation dialog
Alert.alert(
  "Delete Item",
  "Are you sure you want to delete this item?",
  [
    { text: "Cancel", style: "cancel" },
    { text: "Delete", style: "destructive", onPress: handleDelete },
  ]
);

// Choice dialog
Alert.alert(
  "Choose Option",
  "Please select an option:",
  [
    { text: "Option 1", onPress: () => handleOption1() },
    { text: "Option 2", onPress: () => handleOption2() },
    { text: "Cancel", style: "cancel" },
  ]
);
```

### After (Custom Alert)
```typescript
// Simple alert
showSuccess("Success", "Operation completed successfully!");

// Confirmation dialog
showDeleteConfirmation(
  "Delete Item",
  "Are you sure you want to delete this item?",
  handleDelete
);

// Choice dialog
showChoiceDialog(
  "Choose Option",
  "Please select an option:",
  [
    { text: "Option 1", onPress: () => handleOption1() },
    { text: "Option 2", onPress: () => handleOption2() },
  ]
);
```

## Features

### Design Consistency
- Uses your app's `BRAND_COLORS` and responsive utilities
- Matches the design language of other modals (EditProfileModal, ImageModal)
- Consistent shadows, borders, and animations

### Responsive Design
- Adapts to different screen sizes using responsive utilities
- Proper spacing and sizing across devices
- Touch-friendly button sizes

### Animations
- Smooth entrance/exit animations
- Icon rotation and scaling effects
- Backdrop fade animations
- Spring-based modal movements

### Accessibility
- Proper touch targets
- Clear visual hierarchy
- Consistent button styling
- Backdrop dismissal support

### Type Safety
- Full TypeScript support
- Proper interface definitions
- Type-safe button configurations

## Alert Types and Styling

| Type | Icon | Color | Use Case |
|------|------|-------|----------|
| `default` | message-circle | Primary | General information |
| `success` | check-circle | Green | Successful operations |
| `error` | alert-circle | Red | Error messages |
| `warning` | alert-triangle | Yellow | Warnings and cautions |
| `info` | info | Blue | Informational content |

## Button Styles

| Style | Appearance | Use Case |
|-------|------------|----------|
| `default` | Primary color | Main actions |
| `cancel` | Secondary color | Cancel actions |
| `destructive` | Danger color | Destructive actions |

## Best Practices

1. **Use appropriate alert types** - Match the visual style to the message content
2. **Keep messages concise** - Long messages can make alerts hard to read
3. **Provide clear actions** - Button text should clearly indicate what will happen
4. **Handle all cases** - Always provide a way to dismiss the alert
5. **Use confirmation dialogs** - For destructive actions, always ask for confirmation

## Demo Component

Use `CustomAlertDemo.tsx` to test all alert types and see examples of proper usage. This component demonstrates:

- All alert types and their visual differences
- Different button configurations
- Proper hook usage patterns
- Responsive design behavior

## Troubleshooting

### Common Issues

1. **Alert not showing** - Check that `visible` prop is true and `alertConfig` is set
2. **Buttons not working** - Ensure `onPress` handlers are properly defined
3. **Styling issues** - Verify `BRAND_COLORS` are properly imported
4. **Animation glitches** - Check that Reanimated is properly configured

### Performance Tips

1. **Memoize callbacks** - Use `useCallback` for button press handlers
2. **Avoid unnecessary re-renders** - Only update alert state when needed
3. **Clean up properly** - Always call `hideAlert` when done

## Future Enhancements

Potential improvements for the custom alert system:

- [ ] Custom themes and color schemes
- [ ] Animated icons and illustrations
- [ ] Rich text support in messages
- [ ] Custom button layouts
- [ ] Keyboard navigation support
- [ ] Haptic feedback integration
- [ ] Accessibility improvements
- [ ] Internationalization support
