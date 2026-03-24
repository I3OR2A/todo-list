import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Chip, Text } from 'react-native-paper';

import { InfoCard } from '@/components/app/info-card';
import { Spacing } from '@/constants/theme';

type OnboardingPageCardProps = {
  body: string;
  index: number;
  title: string;
  bullets: string[];
};

export function OnboardingPageCard({
  body,
  bullets,
  index,
  title,
}: OnboardingPageCardProps) {
  return (
    <InfoCard>
      <Chip compact>{`Step ${index + 1}`}</Chip>
      <Text variant="headlineSmall">{title}</Text>
      <Text variant="bodyLarge">{body}</Text>
      <View style={styles.bulletGroup}>
        {bullets.map((bullet) => (
          <Text key={bullet} variant="bodyMedium">
            • {bullet}
          </Text>
        ))}
      </View>
    </InfoCard>
  );
}

const styles = StyleSheet.create({
  bulletGroup: {
    gap: Spacing.one,
  },
});
