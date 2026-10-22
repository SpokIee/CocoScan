import React from 'react';
import { StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AppText } from '@/components/AppText';
import { BackButton } from '@/components/BackButton';
import { colors, spacing } from '@/constants/theme';

interface Props {
  title?: string;
  right?: React.ReactNode;
  tone?: 'dark' | 'light';
  onBack?: () => void;
}

/** Back button + centered title row used by History / Result / Diseases. */
export function ScreenHeader({ title, right, tone = 'light', onBack }: Props) {
  const insets = useSafeAreaInsets();
  return (
    <View style={[styles.row, { paddingTop: insets.top + spacing.sm }]}>
      <BackButton tone={tone} onPress={onBack} />
      <View style={styles.center} pointerEvents="none">
        {title ? (
          <AppText variant="h2" color={tone === 'dark' ? colors.white : colors.green800} align="center">
            {title}
          </AppText>
        ) : null}
      </View>
      <View style={styles.right}>{right}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: spacing.screen, paddingBottom: spacing.sm },
  center: { position: 'absolute', left: 64, right: 64, top: 0, bottom: 0, justifyContent: 'flex-end', paddingBottom: spacing.sm },
  right: { marginLeft: 'auto', minWidth: 34, alignItems: 'flex-end' },
});
