import React from 'react';
import { StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AppText } from '@/components/AppText';
import { BackButton } from '@/components/BackButton';
import { colors } from '@/constants/theme';

interface Props {
  title?: string;
  right?: React.ReactNode;
  tone?: 'dark' | 'light';
  onBack?: () => void;
}

/** Figma History header: back button at (17, 18), "Scan History" Cal Sans 30 #335321 centered at y≈85. */
export function ScreenHeader({ title, right, tone = 'light', onBack }: Props) {
  const insets = useSafeAreaInsets();
  return (
    <View style={[styles.wrap, { paddingTop: insets.top + 18 }]}>
      <View style={styles.row}>
        <BackButton tone={tone} onPress={onBack} />
        <View style={styles.right}>{right}</View>
      </View>
      {title ? (
        <AppText variant="h2" color={tone === 'dark' ? colors.white : colors.green900} align="center" style={styles.title}>
          {title}
        </AppText>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { paddingHorizontal: 17, paddingBottom: 12 },
  row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  right: { minWidth: 42, alignItems: 'flex-end' },
  title: { fontSize: 30, lineHeight: 36, marginTop: 14 },
});
