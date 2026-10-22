import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { BackHandler, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AppText, BackButton, DemoBadge, ErrorBanner, LightBackground, LoadingRing, PrimaryButton } from '@/components';
import { DID_YOU_KNOW } from '@/constants/diseases';
import { colors, spacing } from '@/constants/theme';
import { useScanContext } from '@/context/ScanContext';
import { errorMessage } from '@/hooks/useAsync';
import { scanService } from '@/services';
import { IS_DEMO } from '@/services/config';
import type { AnalyzeProgress } from '@/types';

/** SCREEN 10 — Detecting Process */
export default function DetectingScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { uri } = useLocalSearchParams<{ uri: string }>();
  const { setCurrentResult } = useScanContext();

  const [progress, setProgress] = useState<AnalyzeProgress>({ phase: 'analyzing' });
  const [error, setError] = useState<string | null>(null);
  const [attempt, setAttempt] = useState(0);
  const inFlight = useRef(false);
  const abortRef = useRef<AbortController | null>(null);
  const tip = useMemo(() => DID_YOU_KNOW[Math.floor(Math.random() * DID_YOU_KNOW.length)], []);

  const cancel = useCallback(() => {
    abortRef.current?.abort();
    if (router.canGoBack()) router.back();
    else router.replace('/(app)/scan/camera');
  }, [router]);

  // Android hardware back cancels the analysis instead of leaving a zombie request.
  useEffect(() => {
    const sub = BackHandler.addEventListener('hardwareBackPress', () => {
      cancel();
      return true;
    });
    return () => sub.remove();
  }, [cancel]);

  useEffect(() => {
    if (!uri) {
      setError('No image to analyze.');
      return;
    }
    if (inFlight.current) return; // prevent duplicate requests (StrictMode / re-render)
    inFlight.current = true;
    const controller = new AbortController();
    abortRef.current = controller;
    setError(null);
    setProgress({ phase: IS_DEMO ? 'analyzing' : 'uploading', fraction: 0 } as AnalyzeProgress);

    scanService
      .analyze(uri, setProgress, controller.signal)
      .then((result) => {
        if (controller.signal.aborted) return;
        setCurrentResult(result);
        router.replace({ pathname: '/(app)/scan/result', params: { id: result.id } });
      })
      .catch((e: unknown) => {
        if (controller.signal.aborted) return;
        setError(errorMessage(e));
      })
      .finally(() => {
        inFlight.current = false;
      });

    return () => {
      controller.abort();
      inFlight.current = false;
    };
  }, [uri, attempt, router, setCurrentResult]);

  const determinate = progress.phase === 'uploading' ? progress.fraction : null;

  return (
    <LightBackground>
      <View style={[styles.topBar, { paddingTop: insets.top + 10 }]}>
        <BackButton tone="light" onPress={cancel} />
      </View>

      <View style={styles.body}>
        {error ? (
          <>
            <AppText variant="h1" color={colors.green800} align="center">
              Analysis failed
            </AppText>
            <View style={styles.errorBox}>
              <ErrorBanner message={error} />
            </View>
            <View style={styles.errorActions}>
              <PrimaryButton title="Try Again" onPress={() => setAttempt((a) => a + 1)} />
              <PrimaryButton title="Retake Photo" variant="outline" onPress={cancel} />
            </View>
          </>
        ) : (
          <>
            <AppText variant="h1" color={colors.text} align="center" style={styles.title}>
              Detecting...
            </AppText>
            <LoadingRing progress={determinate} />
            <AppText variant="bodyMedium" color={colors.text} align="center" style={styles.analyzing}>
              {progress.phase === 'uploading' ? 'Uploading Image' : 'Analyzing Image'}
            </AppText>
            <AppText variant="small" color={colors.textMuted} align="center">
              Please Wait...
            </AppText>
            {IS_DEMO ? (
              <View style={styles.demo}>
                <DemoBadge text="Demo Mode — result will be simulated" />
              </View>
            ) : null}
          </>
        )}
      </View>

      <View style={[styles.footer, { paddingBottom: insets.bottom + 28 }]}>
        <AppText variant="small" color={colors.text} align="center" style={styles.didYouKnow}>
          Did you know:
        </AppText>
        <AppText variant="tiny" color={colors.textMuted} align="center">
          {tip}
        </AppText>
      </View>
    </LightBackground>
  );
}

const styles = StyleSheet.create({
  topBar: { paddingHorizontal: spacing.screen },
  body: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 32, gap: 18 },
  title: { marginBottom: 4 },
  analyzing: { marginTop: 10 },
  demo: { marginTop: 6 },
  errorBox: { width: '100%' },
  errorActions: { width: '100%', gap: 12, marginTop: 8 },
  footer: { paddingHorizontal: 40 },
  didYouKnow: { fontFamily: 'Poppins_600SemiBold', fontSize: 12 },
});
