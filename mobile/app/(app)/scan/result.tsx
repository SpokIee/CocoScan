import { useLocalSearchParams, useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React, { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';

import { AppText, PrimaryButton } from '@/components';
import { ResultPanel } from '@/components/ResultPanel';
import { colors } from '@/constants/theme';
import { useScanContext } from '@/context/ScanContext';
import { errorMessage } from '@/hooks/useAsync';
import { scanService } from '@/services';
import type { ScanResult } from '@/types';

/** SCREEN 11 — Detection Result (fresh analysis) */
export default function ResultScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { currentResult, setCurrentResult, bumpVersion } = useScanContext();
  const [result, setResult] = useState<ScanResult | null>(currentResult && currentResult.id === id ? currentResult : null);
  const [loading, setLoading] = useState(!result);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const saveLock = useRef(false);

  // Fallback when the screen is reached without context (e.g. deep link / reload).
  useEffect(() => {
    if (result || !id) {
      setLoading(false);
      return;
    }
    scanService
      .get(id)
      .then((r) => {
        setResult(r);
        if (r) setCurrentResult(r);
      })
      .finally(() => setLoading(false));
  }, [id, result, setCurrentResult]);

  const goHome = () => router.replace('/(app)/home');
  const scanAgain = () => router.replace('/(app)/scan/camera');

  const save = async () => {
    if (!result || saveLock.current || result.isSaved) return; // prevent duplicate saves
    saveLock.current = true;
    setSaving(true);
    setSaveError(null);
    try {
      const saved = await scanService.save(result.id);
      setResult(saved);
      setCurrentResult(saved);
      bumpVersion();
      router.replace('/(app)/scan/saved');
    } catch (e) {
      setSaveError(errorMessage(e));
      saveLock.current = false;
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator color={colors.green700} />
      </View>
    );
  }

  if (!result) {
    return (
      <View style={styles.center}>
        <StatusBar style="dark" />
        <AppText variant="h3" color={colors.green800} align="center">
          Result not found
        </AppText>
        <AppText variant="small" color={colors.textMuted} align="center" style={styles.gap}>
          This scan result is no longer available.
        </AppText>
        <PrimaryButton title="Back to Home" onPress={goHome} style={styles.gap} />
      </View>
    );
  }

  return (
    <>
      <StatusBar style="dark" />
      <ResultPanel result={result} mode="fresh" saving={saving} saveError={saveError} onBack={goHome} onScanAgain={scanAgain} onSave={save} onReadMore={() => router.push('/(app)/diseases')} />
    </>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 32, backgroundColor: colors.background },
  gap: { marginTop: 12 },
});
