import React from 'react';
import { StyleSheet } from 'react-native';
import { ActivityIndicator, Text } from 'react-native-paper';

import { ScreenShell } from '@/components/app/screen-shell';
import { Spacing } from '@/constants/theme';

type LoadingScreenProps = {
  title: string;
  message: string;
};

export function LoadingScreen({ message, title }: LoadingScreenProps) {
  return (
    <ScreenShell title={title} scrollEnabled={false}>
      <ActivityIndicator size="small" />
      <Text style={styles.message} variant="bodyLarge">
        {message}
      </Text>
    </ScreenShell>
  );
}

const styles = StyleSheet.create({
  message: {
    paddingTop: Spacing.two,
  },
});
