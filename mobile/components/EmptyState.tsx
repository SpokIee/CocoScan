import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet, View } from 'react-native';

import { AppText } from '@/components/AppText';
import { PrimaryButton } from '@/components/PrimaryButton';
import { colors, spacing } from '@/constants/theme';

interface Props {
  icon: React.ComponentProps<typeof Ionicons>['name'];
  title: string;
  message: string;
  actionLabel?: string;
  onAction?: () => void;
}

export function EmptyState({ icon, title, message, actionLabel, onAction }: Props) {
  return (
    <View style={styles.wrap}>
      <View style={styles.iconCircle}>
        <Ionicons name={icon} size={30} color={colors.green700} />
      </View>
      <AppText variant="h3" color={colors.green800} align="center">
        {title}
      </AppText>
      <AppText variant="small" color={colors.textMuted} align="center" style={styles.message}>
        {message}
      </AppText>
      {actionLabel && onAction ? <PrimaryButton title={actionLabel} onPress={onAction} size="sm" style={styles.action} /> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { alignItems: 'center', paddingHorizontal: spacing.xxl, paddingVertical: spacing.xxxl },
  iconCircle: { width: 64, height: 64, borderRadius: 32, backgroundColor: colors.green100, alignItems: 'center', justifyContent: 'center', marginBottom: spacing.lg },
  message: { marginTop: spacing.xs, maxWidth: 280 },
  action: { marginTop: spacing.xl },
});
