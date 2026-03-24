import React from 'react';
import { StyleSheet } from 'react-native';
import { Text } from 'react-native-paper';

import { PrimaryButton } from '@/components/app/primary-button';
import { ScreenShell } from '@/components/app/screen-shell';

type ErrorStateScreenProps = {
  title: string;
  message: string;
  retryLabel: string;
  onRetry: () => void;
};

export function ErrorStateScreen({
  message,
  onRetry,
  retryLabel,
  title,
}: ErrorStateScreenProps) {
  return (
    <ScreenShell
      title={title}
      scrollEnabled={false}
      footer={<PrimaryButton label={retryLabel} onPress={onRetry} />}>
      <Text style={styles.message} variant="bodyLarge">
        {message}
      </Text>
    </ScreenShell>
  );
}

const styles = StyleSheet.create({
  message: {
    lineHeight: 24,
  },
});
