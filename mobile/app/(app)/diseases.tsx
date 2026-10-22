import { StatusBar } from 'expo-status-bar';
import React from 'react';
import { ActivityIndicator, Image, ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AppText, BackButton, ErrorBanner } from '@/components';
import { DISEASES, INTRO_TEXT } from '@/constants/diseases';
import { colors, fonts, radii } from '@/constants/theme';
import { useAsync } from '@/hooks/useAsync';
import { scanService } from '@/services';
import type { DiseaseInfo } from '@/types';

const HERO_HEIGHT = 390;
const PANEL_OVERLAP = 95;

/**
 * SCREEN 5 — Disease Information (Figma 18:484 "Read about Coconuts").
 * Hero photo 390 tall at 85 % + 31 % black, white panel from y=295 with radius 30,
 * 40 × 4 dark handle, Cal Sans 26 title, Poppins Medium body in #4F7730.
 */
export default function DiseasesScreen() {
  const insets = useSafeAreaInsets();
  const { data, loading, error, reload } = useAsync(() => scanService.diseases(), []);
  const diseases: DiseaseInfo[] = data && data.length > 0 ? orderForDisplay(data) : DISEASES;

  return (
    <View style={styles.root}>
      <StatusBar style="light" />
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: insets.bottom + 32 }}>
        <View style={styles.hero}>
          <Image source={require('@/assets/images/coconut-tree.png')} style={styles.heroImage} resizeMode="cover" />
          <View style={styles.heroTint} />
          <View style={[styles.heroBack, { top: insets.top + 17 }]}>
            <BackButton tone="dark" />
          </View>
        </View>

        <View style={styles.panel}>
          <View style={styles.handle} />
          <AppText variant="h2" color={colors.green700} style={styles.title}>
            Types of Coconut{'\n'}Diseases
          </AppText>

          {error && !data ? <ErrorBanner message={`Showing offline content. ${error}`} onRetry={reload} tone="info" /> : null}
          {loading && !data ? <ActivityIndicator color={colors.green700} style={styles.loader} /> : null}

          <View style={styles.introRow}>
            <View style={styles.accentLine} />
            <AppText color={colors.green700} style={styles.paragraph}>
              {INTRO_TEXT}
            </AppText>
          </View>

          {diseases.map((d, i) => (
            <View key={d.key} style={styles.section}>
              <AppText color={colors.green700} style={styles.sectionTitle}>
                {i + 1}. {d.name}
              </AppText>
              <AppText color={colors.green700} style={styles.paragraph}>
                {d.description}
              </AppText>
              <AppText color={colors.green700} style={styles.subhead}>
                What to look for
              </AppText>
              {d.symptoms.map((s) => (
                <Bullet key={s} text={s} />
              ))}
              <AppText color={colors.green700} style={styles.subhead}>
                General management
              </AppText>
              {d.management.map((m) => (
                <Bullet key={m} text={m} />
              ))}
            </View>
          ))}

          <AppText variant="micro" color={colors.textFaint} style={styles.disclaimer}>
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
      <AppText color={colors.green700} style={styles.bulletText}>
        {text}
      </AppText>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.white },
  hero: { height: HERO_HEIGHT, backgroundColor: '#1F3A14' },
  heroImage: { width: '100%', height: HERO_HEIGHT, opacity: 0.85 },
  heroTint: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.31)' },
  heroBack: { position: 'absolute', left: 19 },
  panel: { marginTop: -PANEL_OVERLAP, backgroundColor: colors.white, borderTopLeftRadius: radii.sheet, borderTopRightRadius: radii.sheet, paddingHorizontal: 28, paddingTop: 13, paddingBottom: 12 },
  handle: { alignSelf: 'center', width: 40, height: 4, borderRadius: 2, backgroundColor: colors.green800, marginBottom: 23 },
  title: { fontSize: 26, lineHeight: 28, marginBottom: 12, textShadowColor: 'rgba(0,0,0,0.11)', textShadowRadius: 4, textShadowOffset: { width: 0, height: 2 } },
  loader: { marginVertical: 8 },
  introRow: { flexDirection: 'row' },
  accentLine: { width: 1, backgroundColor: colors.green700, opacity: 0.6, marginRight: 8, marginTop: 4, marginBottom: 14 },
  paragraph: { flex: 1, fontFamily: fonts.medium, fontSize: 10.5, lineHeight: 15, textAlign: 'justify', marginBottom: 12 },
  section: { marginTop: 6 },
  sectionTitle: { fontFamily: fonts.bold, fontSize: 12, lineHeight: 16, marginBottom: 6 },
  subhead: { fontFamily: fonts.semiBold, fontSize: 11, lineHeight: 15, marginBottom: 4 },
  bullet: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: 6, paddingRight: 8 },
  bulletDot: { width: 5, height: 5, borderRadius: 3, backgroundColor: colors.green600, marginTop: 6, marginRight: 8 },
  bulletText: { flex: 1, fontFamily: fonts.medium, fontSize: 10.5, lineHeight: 15 },
  disclaimer: { marginTop: 18, fontStyle: 'italic' },
});
