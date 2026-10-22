import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { AppText } from '@/components/AppText';
import { colors, radii, spacing } from '@/constants/theme';

interface Props {
  message: string | null | undefined;
  onRetry?: () => void;
  tone?: 'danger' | 'info';
}

export function ErrorBanner({ message, onRetry, tone = 'danger' }: Props) {
  if (!message) return null;
  const isDanger = tone === 'danger';
  return (
    <View style={[styles.banner, isDanger ? styles.danger : styles.info]} accessibilityLiveRegion="polite">
      <Ionicons name={isDanger ? 'alert-circle-outline' : 'information-circle-outline'} size={18} color={isDanger ? colors.danger : colors.green700} />
      <AppText variant="small" color={isDanger ? '#8C2416' : colors.green800} style={styles.text}>
        {message}
      </AppText>
      {onRetry ? (
        <Pressable onPress={onRetry} accessibilityRole="button" accessibilityLabel="Retry">
          <AppText variant="small" color={isDanger ? colors.danger : colors.green700} style={styles.retry}>
            Retry
          </AppText>
        </Pressable>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  banner: { flexDirection: 'row', alignItems: 'center', gap: 8, borderRadius: radii.md, padding: spacing.md, borderWidth: 1 },
  danger: { backgroundColor: '#FDECE9', borderColor: '#F5B9AF' },
  info: { backgroundColor: colors.green50, borderColor: colors.green200 },
  text: { flex: 1 },
  retry: { fontFamily: 'Poppins_600SemiBold', textDecorationLine: 'underline' },
});
