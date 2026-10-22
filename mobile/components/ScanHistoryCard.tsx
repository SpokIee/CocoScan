import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import React from 'react';
import { StyleSheet, View } from 'react-native';

import { AppText } from '@/components/AppText';
import { Card } from '@/components/Card';
import { DemoBadge } from '@/components/DemoBadge';
import { colors, radii, spacing } from '@/constants/theme';
import { getAuthToken } from '@/services/api/client';
import { formatConfidence, formatDate, toneColor, toneFor } from '@/services/labels';
import type { ScanResult } from '@/types';

interface Props {
  scan: ScanResult;
  onPress: () => void;
}

export function imageSource(uri: string) {
  const token = getAuthToken();
  if (/^https?:\/\//i.test(uri) && token) return { uri, headers: { Authorization: `Bearer ${token}` } };
  return { uri };
}

export function ScanHistoryCard({ scan, onPress }: Props) {
  const tone = toneFor(scan.predictedClass);
  return (
    <Card onPress={onPress} style={styles.card} accessibilityLabel={`${scan.label}, ${formatConfidence(scan.confidence)}, ${formatDate(scan.createdAt)}`}>
      <Image source={imageSource(scan.imageUri)} style={styles.thumb} contentFit="cover" transition={150} />
      <View style={styles.body}>
        <View style={styles.titleRow}>
          <AppText variant="bodyMedium" color={toneColor(tone)} numberOfLines={1} style={styles.title}>
            {scan.label}
          </AppText>
          {scan.isSimulated ? <DemoBadge compact /> : null}
        </View>
        <AppText variant="small" color={colors.text}>
          Confidence Score:{' '}
          <AppText variant="small" color={colors.green500} style={styles.bold}>
            {formatConfidence(scan.confidence)}
          </AppText>
        </AppText>
        <AppText variant="tiny" color={colors.textMuted}>
          Date: {formatDate(scan.createdAt)}
        </AppText>
      </View>
      <Ionicons name="chevron-forward" size={18} color={colors.textMuted} />
    </Card>
  );
}

const styles = StyleSheet.create({
  card: { flexDirection: 'row', alignItems: 'center', padding: spacing.md, marginBottom: spacing.md },
  thumb: { width: 56, height: 56, borderRadius: radii.md, backgroundColor: colors.green100 },
  body: { flex: 1, marginHorizontal: spacing.md },
  titleRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  title: { flexShrink: 1 },
  bold: { fontFamily: 'Poppins_600SemiBold' },
});
