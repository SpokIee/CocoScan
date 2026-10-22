import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import React from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AppText } from '@/components/AppText';
import { BackButton } from '@/components/BackButton';
import { DemoBadge } from '@/components/DemoBadge';
import { ErrorBanner } from '@/components/ErrorBanner';
import { PrimaryButton } from '@/components/PrimaryButton';
import { imageSource } from '@/components/ScanHistoryCard';
import { DISEASES } from '@/constants/diseases';
import { colors, radii, shadows, spacing } from '@/constants/theme';
import { formatConfidence, formatDate, formatTime, headlineFor, toneColor, toneFor } from '@/services/labels';
import type { ScanResult } from '@/types';

interface Props {
  result: ScanResult;
  /** "fresh" = just analyzed (Scan Again + Save); "saved" = opened from history. */
  mode: 'fresh' | 'saved';
  saving?: boolean;
  saveError?: string | null;
  onBack: () => void;
  onScanAgain: () => void;
  onSave?: () => void;
  onReadMore?: () => void;
}

/** SCREEN 11 — Detection Result layout, shared with the history detail view. */
export function ResultPanel({ result, mode, saving, saveError, onBack, onScanAgain, onSave, onReadMore }: Props) {
  const insets = useSafeAreaInsets();
  const tone = toneFor(result.predictedClass);
  const accent = toneColor(tone);
  const notConfigured = result.predictedClass === 'not_configured' || result.modelStatus !== 'ok';
  const disease = DISEASES.find((d) => d.key === result.predictedClass);

  return (
    <View style={styles.root}>
      <Image source={imageSource(result.imageUri)} style={styles.image} contentFit="cover" transition={150} />

      {/* Header card */}
      <View style={[styles.header, { paddingTop: insets.top + 10 }]}>
        <View style={styles.headerRow}>
          <BackButton tone="light" onPress={onBack} />
          <AppText variant="h2" color={colors.green800} align="center" style={styles.headerTitle}>
            Detection Result
          </AppText>
          <View style={styles.headerSpacer} />
        </View>
      </View>

      {/* Result sheet */}
      <View style={styles.sheet}>
        <ScrollView contentContainerStyle={[styles.sheetContent, { paddingBottom: insets.bottom + 20 }]} showsVerticalScrollIndicator={false}>
          {result.isSimulated ? (
            <View style={styles.demo}>
              <DemoBadge />
            </View>
          ) : null}

          <AppText variant="h3" color={accent} align="center">
            {headlineFor(result.predictedClass)}
          </AppText>
          <AppText variant="bodyMedium" color={colors.text} align="center" style={styles.label}>
            {result.label}
          </AppText>

          {notConfigured ? (
            <View style={styles.block}>
              <ErrorBanner tone="info" message={result.message ?? 'The CNN model is not configured on the server yet. No prediction was produced for this image.'} />
            </View>
          ) : (
            <>
              <AppText variant="bodyMedium" color={colors.text} align="center" style={styles.score}>
                Confidence Score:{' '}
                <AppText variant="bodyMedium" color={colors.green500} style={styles.bold}>
                  {formatConfidence(result.confidence)}
                </AppText>
              </AppText>
              <AppText variant="small" color={colors.textMuted} align="center">
                Date:{' '}
                <AppText variant="small" color={colors.text}>
                  {formatDate(result.createdAt)}
                </AppText>
              </AppText>
              <AppText variant="tiny" color={colors.textMuted} align="center">
                {formatTime(result.createdAt)}
              </AppText>
            </>
          )}

          {result.predictedClass === 'uncertain' ? (
            <View style={styles.block}>
              <ErrorBanner tone="info" message={result.message ?? 'The model was not confident enough. Please capture a clearer, well-lit photo of a single leaflet.'} />
            </View>
          ) : null}

          {result.warnings.map((w) => (
            <View key={w} style={styles.block}>
              <ErrorBanner tone="info" message={w} />
            </View>
          ))}

          {disease && (result.predictedClass === 'gray_leaf_spot' || result.predictedClass === 'leaf_rot') ? (
            <View style={styles.info}>
              <AppText variant="bodyMedium" color={colors.green800} style={styles.infoTitle}>
                About {disease.name.includes('(') ? disease.name.replace(/.*\((.*)\).*/, '$1') : disease.name}
              </AppText>
              {disease.symptoms.slice(0, 2).map((s) => (
                <View key={s} style={styles.bullet}>
                  <View style={styles.dot} />
                  <AppText variant="tiny" color={colors.text} style={styles.bulletText}>
                    {s}
                  </AppText>
                </View>
              ))}
              {onReadMore ? (
                <AppText variant="tiny" color={colors.green700} style={styles.readMore} onPress={onReadMore} accessibilityRole="link">
                  Read more about this disease <Ionicons name="arrow-forward" size={10} color={colors.green700} />
                </AppText>
              ) : null}
            </View>
          ) : null}

          {result.predictedClass === 'healthy' ? (
            <AppText variant="tiny" color={colors.textMuted} align="center" style={styles.healthyNote}>
              No signs of gray leaf spot or leaf rot were detected. Keep inspecting fronds regularly.
            </AppText>
          ) : null}

          {result.probabilities ? (
            <View style={styles.probs}>
              {Object.entries(result.probabilities).map(([k, v]) => (
                <View key={k} style={styles.probRow}>
                  <AppText variant="tiny" color={colors.textMuted} style={styles.probKey}>
                    {k.replace(/_/g, ' ')}
                  </AppText>
                  <View style={styles.probBar}>
                    <View style={[styles.probFill, { width: `${Math.round(v * 100)}%`, backgroundColor: k === result.predictedClass ? accent : colors.green200 }]} />
                  </View>
                  <AppText variant="tiny" color={colors.textMuted} style={styles.probVal}>
                    {(v * 100).toFixed(1)}%
                  </AppText>
                </View>
              ))}
            </View>
          ) : null}

          {saveError ? (
            <View style={styles.block}>
              <ErrorBanner message={saveError} />
            </View>
          ) : null}

          <View style={styles.actions}>
            <PrimaryButton title="Scan Again" variant="light" size="sm" onPress={onScanAgain} style={styles.btn} />
            {mode === 'fresh' ? (
              <PrimaryButton
                title={result.isSaved ? 'Saved' : 'Save'}
                variant="dark"
                size="sm"
                onPress={onSave ?? (() => undefined)}
                loading={saving}
                disabled={notConfigured || result.isSaved}
                style={styles.btn}
              />
            ) : (
              <PrimaryButton title="Back" variant="dark" size="sm" onPress={onBack} style={styles.btn} />
            )}
          </View>
          {notConfigured && mode === 'fresh' ? (
            <AppText variant="tiny" color={colors.textMuted} align="center" style={styles.saveNote}>
              Results can only be saved once a trained model produces a prediction.
            </AppText>
          ) : null}
        </ScrollView>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.green900 },
  image: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 },
  header: { backgroundColor: colors.white, paddingHorizontal: spacing.screen, paddingBottom: 14, borderBottomLeftRadius: radii.xl, borderBottomRightRadius: radii.xl, ...shadows.card },
  headerRow: { flexDirection: 'row', alignItems: 'center' },
  headerTitle: { flex: 1 },
  headerSpacer: { width: 34 },
  sheet: { position: 'absolute', left: 0, right: 0, bottom: 0, maxHeight: '58%', backgroundColor: colors.white, borderTopLeftRadius: radii.xxl, borderTopRightRadius: radii.xxl, ...shadows.modal },
  sheetContent: { paddingHorizontal: spacing.xxl, paddingTop: 22 },
  demo: { alignItems: 'center', marginBottom: 10 },
  label: { marginTop: 2 },
  score: { marginTop: 12 },
  bold: { fontFamily: 'Poppins_600SemiBold' },
  block: { marginTop: 12 },
  info: { marginTop: 14, backgroundColor: colors.green50, borderRadius: radii.md, padding: 12 },
  infoTitle: { fontSize: 12, marginBottom: 6 },
  bullet: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: 4 },
  dot: { width: 5, height: 5, borderRadius: 3, backgroundColor: colors.green500, marginTop: 5, marginRight: 8 },
  bulletText: { flex: 1 },
  readMore: { marginTop: 6, fontFamily: 'Poppins_600SemiBold' },
  healthyNote: { marginTop: 12 },
  probs: { marginTop: 14, gap: 6 },
  probRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  probKey: { width: 88, textTransform: 'capitalize' },
  probBar: { flex: 1, height: 6, borderRadius: 3, backgroundColor: colors.green100, overflow: 'hidden' },
  probFill: { height: '100%', borderRadius: 3 },
  probVal: { width: 44, textAlign: 'right' },
  actions: { flexDirection: 'row', gap: 14, marginTop: 20, justifyContent: 'center' },
  btn: { flex: 1, maxWidth: 160 },
  saveNote: { marginTop: 10 },
});
