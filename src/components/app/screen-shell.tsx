import React, { type PropsWithChildren, type ReactNode } from 'react';
import { ScrollView, StyleSheet, View, useWindowDimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Text, useTheme as usePaperTheme } from 'react-native-paper';

import { MaxContentWidth, Spacing } from '@/constants/theme';

type ScreenShellProps = PropsWithChildren<{
  title: string;
  subtitle?: string;
  footer?: ReactNode;
  scrollEnabled?: boolean;
}>;

export function ScreenShell({
  children,
  footer,
  scrollEnabled = true,
  subtitle,
  title,
}: ScreenShellProps) {
  const theme = usePaperTheme();
  const { width } = useWindowDimensions();
  const isCompact = width < 430;
  const content = (
    <View
      style={[
        styles.content,
        isCompact ? styles.contentCompact : styles.contentRegular,
      ]}>
      <View style={styles.header}>
        <Text variant={isCompact ? 'headlineSmall' : 'headlineMedium'}>{title}</Text>
        {subtitle ? (
          <Text style={[styles.subtitle, { color: theme.colors.onSurfaceVariant }]} variant="bodyLarge">
            {subtitle}
          </Text>
        ) : null}
      </View>

      <View style={styles.body}>{children}</View>
      {footer ? <View style={styles.footer}>{footer}</View> : null}
    </View>
  );

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <SafeAreaView style={styles.safeArea}>
        {scrollEnabled ? (
          <ScrollView
            style={styles.scrollView}
            contentContainerStyle={styles.scrollContent}
            horizontal={false}
            showsVerticalScrollIndicator={false}>
            {content}
          </ScrollView>
        ) : (
          content
        )}
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  body: {
    gap: Spacing.three,
    minWidth: 0,
    width: '100%',
  },
  container: {
    flex: 1,
  },
  content: {
    alignSelf: 'center',
    flexGrow: 1,
    minWidth: 0,
    maxWidth: MaxContentWidth,
    width: '100%',
    gap: Spacing.four,
    paddingVertical: Spacing.four,
  },
  contentCompact: {
    paddingHorizontal: Spacing.three,
  },
  contentRegular: {
    paddingHorizontal: Spacing.four,
  },
  footer: {
    gap: Spacing.two,
    marginTop: 'auto',
    minWidth: 0,
    width: '100%',
  },
  header: {
    gap: Spacing.two,
    minWidth: 0,
  },
  safeArea: {
    flex: 1,
    width: '100%',
  },
  scrollView: {
    flex: 1,
    width: '100%',
  },
  scrollContent: {
    flexGrow: 1,
    width: '100%',
    alignItems: 'stretch',
    overflow: 'hidden',
  },
  subtitle: {
    lineHeight: 22,
  },
});
