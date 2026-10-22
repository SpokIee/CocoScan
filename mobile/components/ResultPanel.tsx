import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
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
import { colors, fonts, radii, shadows } from '@/constants/theme';
import { CLASS_DISEASE_NAME, formatConfidence, formatDate, formatTime, headlineFor, toneColor, toneFor } from '@/services/labels';
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

/**
 * Figma "Results": white header (151 tall, 30 px bottom radius, shadow) with
 * "Detection Result", the captured photo behind, and a bottom sheet
 * (radius 30, light-green gradient) holding the verdict + Scan Again / Save.
 * The red detection rectangles from the mock-up are intentionally not drawn:
 * a classifier has no spatial output.
 */
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
      <View style={[styles.header, { paddingTop: insets.top + 18 }]}>
        <BackButton tone="light" onPress={onBack} />
        <AppText variant="h1" color={colors.green900} align="center" style={styles.headerTitle}>
          Detection Result
        </AppText>
      </View>

      {/* Result sheet */}
      <View style={styles.sheet}>
        <LinearGradient colors={['rgba(217,217,217,0)', 'rgba(180,255,137,0.2)']} style={StyleSheet.absoluteFill} pointerEvents="none" />
        <ScrollView contentContainerStyle={[styles.sheetContent, { paddingBottom: insets.bottom + 22 }]} showsVerticalScrollIndicator={false}>
          {result.isSimulated ? (
            <View style={styles.demo}>
              <DemoBadge />
            </View>
          ) : null}

          <AppText variant="h3" color={accent} align="center">
            {headlineFor(result.predictedClass)}
          </AppText>
          <AppText variant="h3" color={accent} align="center" style={styles.diseaseName}>
            {CLASS_DISEASE_NAME[result.predictedClass]}
          </AppText>

          {notConfigured ? (
            <View style={styles.block}>
              <ErrorBanner tone="info" message={result.message ?? 'The CNN model is not configured on the server yet. No prediction was produced for this image.'} />
            </View>
          ) : (
            <>
              <AppText variant="h3" color={colors.green900} align="center" style={styles.score}>
                Confidence Score:{' '}
                <AppText variant="h3" color={colors.success}>
                  {formatConfidence(result.confidence)}
                </AppText>
              </AppText>
              <AppText variant="body" color={colors.green700} align="center" style={styles.date}>
                <AppText variant="body" color={colors.green700} style={styles.dateLabel}>
                  Date:
                </AppText>{' '}
                {formatDate(result.createdAt)}
              </AppText>
              <AppText variant="small" color={colors.green700} align="center" style={styles.time}>
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
              {disease.symptoms.slice(0, 2).map((s) => (
                <View key={s} style={styles.bullet}>
                  <View style={styles.dot} />
                  <AppText variant="tiny" color={colors.green700} style={styles.bulletText}>
                    {s}
                  </AppText>
                </View>
              ))}
              {onReadMore ? (
                <AppText variant="tiny" color={colors.green700} style={styles.readMore} onPress={onReadMore} accessibilityRole="link">
                  Read more about this disease →
                </AppText>
              ) : null}
            </View>
          ) : null}

          {result.predictedClass === 'healthy' ? (
            <AppText variant="tiny" color={colors.green700} align="center" style={styles.healthyNote}>
              No signs of gray leaf spot or leaf rot were detected. Keep inspecting fronds regularly.
            </AppText>
          ) : null}

          {result.probabilities ? (
            <View style={styles.probs}>
              {Object.entries(result.probabilities).map(([k, v]) => (
                <View key={k} style={styles.probRow}>
                  <AppText variant="micro" color={colors.green700} style={styles.probKey}>
                    {k.replace(/_/g, ' ')}
                  </AppText>
                  <View style={styles.probBar}>
                    <View style={[styles.probFill, { width: `${Math.round(v * 100)}%`, backgroundColor: k === result.predictedClass ? accent : colors.green300 }]} />
                  </View>
                  <AppText variant="micro" color={colors.green700} style={styles.probVal}>
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
            <PrimaryButton title="Scan Again" variant="light" onPress={onScanAgain} />
            {mode === 'fresh' ? (
              <PrimaryButton title={result.isSaved ? 'Saved' : 'Save'} variant="primary" onPress={onSave ?? (() => undefined)} loading={saving} disabled={notConfigured || result.isSaved} />
            ) : (
              <PrimaryButton title="Back" variant="primary" onPress={onBack} />
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
  root: { flex: 1, backgroundColor: '#1F3A14' },
  image: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 },
  header: { backgroundColor: colors.white, paddingHorizontal: 14, paddingBottom: 22, borderBottomLeftRadius: radii.sheet, borderBottomRightRadius: radii.sheet, ...shadows.modal },
  headerTitle: { fontSize: 32, lineHeight: 38, marginTop: 12 },
  sheet: { position: 'absolute', left: 0, right: 0, bottom: 0, maxHeight: '52%', backgroundColor: colors.white, borderTopLeftRadius: radii.sheet, borderTopRightRadius: radii.sheet, overflow: 'hidden', ...shadows.modal },
  sheetContent: { paddingHorizontal: 28, paddingTop: 36 },
  demo: { alignItems: 'center', marginBottom: 10 },
  diseaseName: { marginTop: 4 },
  score: { marginTop: 14 },
  date: { marginTop: 2 },
  dateLabel: { fontFamily: fonts.semiBold },
  time: { fontFamily: fonts.lightItalic },
  block: { marginTop: 12 },
  info: { marginTop: 14, backgroundColor: colors.green50, borderRadius: radii.input, padding: 12 },
  bullet: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: 4 },
  dot: { width: 5, height: 5, borderRadius: 3, backgroundColor: colors.green600, marginTop: 5, marginRight: 8 },
  bulletText: { flex: 1 },
  readMore: { marginTop: 6, fontFamily: fonts.semiBold },
  healthyNote: { marginTop: 12 },
  probs: { marginTop: 14, gap: 6 },
  probRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  probKey: { width: 88, textTransform: 'capitalize' },
  probBar: { flex: 1, height: 6, borderRadius: 3, backgroundColor: colors.green100, overflow: 'hidden' },
  probFill: { height: '100%', borderRadius: 3 },
  probVal: { width: 44, textAlign: 'right' },
  actions: { flexDirection: 'row', gap: 13, marginTop: 26, justifyContent: 'center' },
  saveNote: { marginTop: 10 },
});
