import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet, View } from 'react-native';

import { AppText } from '@/components/AppText';
import { colors, radii } from '@/constants/theme';

/**
 * Marks any content produced by Demo Mode. Simulated predictions must always
 * carry this badge so they are never mistaken for a genuine AI diagnosis.
 */
export function DemoBadge({ compact, text }: { compact?: boolean; text?: string }) {
  return (
    <View style={[styles.badge, compact && styles.compact]} accessibilityLabel="Demo mode, simulated result">
      <Ionicons name="flask-outline" size={compact ? 10 : 12} color={colors.warning} />
      <AppText variant="tiny" color={colors.warning} style={[styles.text, compact && styles.compactText]}>
        {text ?? (compact ? 'DEMO' : 'Demo Mode — simulated result')}
      </AppText>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    alignSelf: 'flex-start',
    backgroundColor: '#FFF4D6',
    borderColor: '#F3D68A',
    borderWidth: 1,
    borderRadius: radii.pill,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  compact: { paddingHorizontal: 6, paddingVertical: 1 },
  text: { fontFamily: 'Poppins_600SemiBold', letterSpacing: 0.3 },
  compactText: { fontSize: 9 },
});
