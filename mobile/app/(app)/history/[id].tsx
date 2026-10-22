import { useLocalSearchParams, useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';

import { AppText, ErrorBanner, PrimaryButton } from '@/components';
import { ResultPanel } from '@/components/ResultPanel';
import { colors } from '@/constants/theme';
import { useScanContext } from '@/context/ScanContext';
import { useAsync } from '@/hooks/useAsync';
import { scanService } from '@/services';

/** SCREEN 13b — Previous scan details (opened from History or Updates) */
export default function HistoryDetailScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { currentResult } = useScanContext();
  const { data, loading, error, reload } = useAsync(async () => {
    if (currentResult && currentResult.id === id) return currentResult;
    return scanService.get(id ?? '');
  }, [id]);

  const back = () => (router.canGoBack() ? router.back() : router.replace('/(app)/history'));

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator color={colors.green700} />
      </View>
    );
  }
  if (error || !data) {
    return (
      <View style={styles.center}>
        <StatusBar style="dark" />
        <AppText variant="h3" color={colors.green800} align="center">
          Scan not found
        </AppText>
        {error ? (
          <View style={styles.gap}>
            <ErrorBanner message={error} onRetry={reload} />
          </View>
        ) : null}
        <PrimaryButton title="Back to History" onPress={back} style={styles.gap} />
      </View>
    );
  }

  return (
    <>
      <StatusBar style="dark" />
      <ResultPanel result={data} mode="saved" onBack={back} onScanAgain={() => router.push('/(app)/scan/camera')} onReadMore={() => router.push('/(app)/diseases')} />
    </>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 32, backgroundColor: colors.background },
  gap: { marginTop: 12, width: '100%' },
});
