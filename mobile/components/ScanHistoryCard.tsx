import { Image } from 'expo-image';
import React from 'react';
import { StyleSheet, View } from 'react-native';
import Svg, { Path } from 'react-native-svg';

import { AppText } from '@/components/AppText';
import { Card } from '@/components/Card';
import { DemoBadge } from '@/components/DemoBadge';
import { colors, radii } from '@/constants/theme';
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

/** Figma "Line 6" chevron: 3 px round stroke, rotated to point right. */
export function Chevron({ color = colors.green700, size = 24 }: { color?: string; size?: number }) {
  return (
    <Svg width={size * 0.5} height={size} viewBox="0 0 9.42 18" fill="none">
      <Path d="M1.5 1.5L7.5 9L1.5 16.5" stroke={color} strokeWidth={3} strokeLinecap="round" />
    </Svg>
  );
}

/** Figma "Group 21": 342 × 132 white card, radius 20, 101 px rounded thumbnail, Cal Sans 15 texts. */
export function ScanHistoryCard({ scan, onPress }: Props) {
  const tone = toneFor(scan.predictedClass);
  return (
    <Card size="lg" onPress={onPress} style={styles.card} accessibilityLabel={`${scan.label}, ${formatConfidence(scan.confidence)}, ${formatDate(scan.createdAt)}`}>
      <Image source={imageSource(scan.imageUri)} style={styles.thumb} contentFit="cover" transition={150} />
      <View style={styles.body}>
        <AppText variant="label" color={toneColor(tone)} numberOfLines={1} style={styles.title}>
          {scan.label}
        </AppText>
        <AppText variant="label" color={colors.green900} style={styles.score}>
          Confidence Score:{' '}
          <AppText variant="label" color={colors.success} style={styles.score}>
            {formatConfidence(scan.confidence)}
          </AppText>
        </AppText>
        <AppText variant="tiny" color={colors.green900}>
          Date: {formatDate(scan.createdAt)}
        </AppText>
        {scan.isSimulated ? (
          <View style={styles.badge}>
            <DemoBadge compact />
          </View>
        ) : null}
      </View>
      <View style={styles.chevron}>
        <Chevron />
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  card: { flexDirection: 'row', alignItems: 'flex-start', minHeight: 132, padding: 10, paddingTop: 15, marginBottom: 23 },
  thumb: { width: 101, height: 101, borderRadius: radii.cardLg, backgroundColor: colors.green100 },
  body: { flex: 1, marginLeft: 7, marginTop: 4 },
  title: { fontSize: 15, lineHeight: 20 },
  score: { fontSize: 15, lineHeight: 20 },
  badge: { marginTop: 6 },
  chevron: { alignSelf: 'center', paddingHorizontal: 6 },
});
