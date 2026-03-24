import React, { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withSequence,
  withTiming,
} from 'react-native-reanimated';
import { Text } from 'react-native-paper';

import { Spacing } from '@/constants/theme';

type CompletionCelebrationOverlayProps = {
  message: string;
  token: number;
  visible: boolean;
};

export function CompletionCelebrationOverlay({
  message,
  token,
  visible,
}: CompletionCelebrationOverlayProps) {
  const opacity = useSharedValue(0);
  const scale = useSharedValue(0.9);
  const burstScale = useSharedValue(0.3);

  useEffect(() => {
    if (!visible) {
      opacity.value = 0;
      scale.value = 0.9;
      burstScale.value = 0.3;
      return;
    }

    opacity.value = withSequence(
      withTiming(1, { duration: 180, easing: Easing.out(Easing.cubic) }),
      withDelay(850, withTiming(0, { duration: 220, easing: Easing.in(Easing.cubic) }))
    );
    scale.value = withSequence(
      withTiming(1.04, { duration: 220, easing: Easing.out(Easing.back(1.4)) }),
      withDelay(700, withTiming(1, { duration: 180, easing: Easing.out(Easing.cubic) }))
    );
    burstScale.value = withSequence(
      withTiming(1, { duration: 320, easing: Easing.out(Easing.back(1.2)) }),
      withDelay(650, withTiming(0.65, { duration: 220, easing: Easing.in(Easing.cubic) }))
    );
  }, [burstScale, opacity, scale, token, visible]);

  const containerStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ scale: scale.value }],
  }));

  const burstStyle = useAnimatedStyle(() => ({
    opacity: opacity.value * 0.8,
    transform: [{ scale: burstScale.value }],
  }));

  if (!visible) {
    return null;
  }

  return (
    <View pointerEvents="none" style={styles.overlay}>
      <Animated.View style={[styles.burst, burstStyle]} />
      <Animated.View style={[styles.card, containerStyle]}>
        <Text style={styles.title} variant="headlineSmall">
          Completed
        </Text>
        <Text style={styles.message} variant="bodyLarge">
          {message}
        </Text>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  burst: {
    backgroundColor: 'rgba(255, 141, 126, 0.28)',
    borderRadius: 160,
    height: 220,
    position: 'absolute',
    width: 220,
  },
  card: {
    alignItems: 'center',
    backgroundColor: 'rgba(31, 33, 38, 0.92)',
    borderRadius: 28,
    gap: Spacing.two,
    maxWidth: 280,
    paddingHorizontal: Spacing.four,
    paddingVertical: Spacing.four,
  },
  message: {
    color: '#fff7f4',
    textAlign: 'center',
  },
  overlay: {
    alignItems: 'center',
    bottom: 0,
    justifyContent: 'center',
    left: 0,
    position: 'absolute',
    right: 0,
    top: 0,
  },
  title: {
    color: '#ffffff',
  },
});
