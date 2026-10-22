import { StatusBar } from 'expo-status-bar';
import React from 'react';
import { ActivityIndicator, Image, ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AppText, BackButton, ErrorBanner } from '@/components';
import { DISEASES, INTRO_TEXT } from '@/constants/diseases';
import { colors, radii, spacing } from '@/constants/theme';
import { useAsync } from '@/hooks/useAsync';
import { scanService } from '@/services';
import type { DiseaseInfo } from '@/types';

const IMAGE_HEIGHT = 300;

/** SCREEN 5 — Disease Information ("Types of Coconut Diseases") */
export default function DiseasesScreen() {
  const insets = useSafeAreaInsets();
  const { data, loading, error, reload } = useAsync(() => scanService.diseases(), []);
  // Bundled content is the fallback so the screen is never empty offline.
  const diseases: DiseaseInfo[] = data && data.length > 0 ? orderForDisplay(data) : DISEASES;

  return (
    <View style={styles.root}>
      <StatusBar style="light" />
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: insets.bottom + 32 }}>
        <View style={styles.hero}>
          <Image source={require('@/assets/images/coconut-tree.png')} style={styles.heroImage} resizeMode="cover" />
          <View style={[styles.heroBack, { top: insets.top + 10 }]}>
            <BackButton tone="dark" />
          </View>
        </View>

        <View style={styles.panel}>
          <View style={styles.handle} />
          <AppText variant="h1" color={colors.green600} style={styles.title}>
            Types of Coconut{'\n'}Diseases
          </AppText>

          {error && !data ? <ErrorBanner message={`Showing offline content. ${error}`} onRetry={reload} tone="info" /> : null}
          {loading && !data ? <ActivityIndicator color={colors.green700} style={styles.loader} /> : null}

          <AppText variant="small" color={colors.text} style={styles.paragraph}>
            {INTRO_TEXT}
          </AppText>

          {diseases.map((d, i) => (
            <View key={d.key} style={styles.section}>
              <AppText variant="h3" color={colors.green800} style={styles.sectionTitle}>
                {i + 1}. {d.name}
              </AppText>
              <AppText variant="small" color={colors.text} style={styles.paragraph}>
                {d.description}
              </AppText>
              <AppText variant="bodyMedium" color={colors.green700} style={styles.subhead}>
                What to look for
              </AppText>
              {d.symptoms.map((s) => (
                <Bullet key={s} text={s} />
              ))}
              <AppText variant="bodyMedium" color={colors.green700} style={styles.subhead}>
                General management
              </AppText>
              {d.management.map((m) => (
                <Bullet key={m} text={m} />
              ))}
            </View>
          ))}

          <AppText variant="tiny" color={colors.textMuted} style={styles.disclaimer}>
            CocoScan is a screening and decision-support tool, not a replacement for a certified plant pathologist. Always confirm a suspected disease with an agricultural technician before treatment.
          </AppText>
        </View>
      </ScrollView>
    </View>
  );
}

function orderForDisplay(list: DiseaseInfo[]): DiseaseInfo[] {
  const order = ['gray_leaf_spot', 'leaf_rot', 'healthy'];
  return [...list].sort((a, b) => order.indexOf(a.key) - order.indexOf(b.key));
}

function Bullet({ text }: { text: string }) {
  return (
    <View style={styles.bullet}>
      <View style={styles.bulletDot} />
      <AppText variant="small" color={colors.text} style={styles.bulletText}>
        {text}
      </AppText>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.white },
  hero: { height: IMAGE_HEIGHT, backgroundColor: colors.green800 },
  heroImage: { width: '100%', height: IMAGE_HEIGHT },
  heroBack: { position: 'absolute', left: spacing.screen },
  panel: { marginTop: -28, backgroundColor: colors.white, borderTopLeftRadius: radii.xxl, borderTopRightRadius: radii.xxl, paddingHorizontal: spacing.screen + 4, paddingTop: 12, paddingBottom: 12 },
  handle: { alignSelf: 'center', width: 44, height: 3, borderRadius: 2, backgroundColor: colors.green800, marginBottom: 18 },
  title: { marginBottom: 10 },
  loader: { marginVertical: 8 },
  paragraph: { textAlign: 'justify', marginBottom: 10, fontSize: 12, lineHeight: 19 },
  section: { marginTop: 8 },
  sectionTitle: { marginBottom: 6, fontSize: 15, lineHeight: 21 },
  subhead: { fontSize: 12, marginBottom: 4 },
  bullet: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: 6, paddingRight: 8 },
  bulletDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: colors.green500, marginTop: 7, marginRight: 8 },
  bulletText: { flex: 1, fontSize: 12, lineHeight: 18 },
  disclaimer: { marginTop: 18, fontStyle: 'italic' },
});
