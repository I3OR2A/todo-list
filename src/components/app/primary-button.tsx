import React from 'react';
import { StyleSheet, type StyleProp, type ViewStyle } from 'react-native';
import { Button } from 'react-native-paper';

type PrimaryButtonProps = {
  disabled?: boolean;
  fullWidth?: boolean;
  label: string;
  onPress?: () => void;
  style?: StyleProp<ViewStyle>;
  variant?: 'primary' | 'secondary';
};

export function PrimaryButton({
  disabled,
  fullWidth = true,
  label,
  onPress,
  style,
  variant = 'primary',
}: PrimaryButtonProps) {
  return (
    <Button
      compact={false}
      contentStyle={styles.content}
      disabled={disabled}
      mode={variant === 'primary' ? 'contained' : 'outlined'}
      onPress={onPress}
      style={[styles.button, fullWidth && styles.fullWidth, style]}>
      {label}
    </Button>
  );
}

const styles = StyleSheet.create({
  button: {
    borderRadius: 14,
  },
  content: {
    minHeight: 52,
  },
  fullWidth: {
    width: '100%',
  },
});
