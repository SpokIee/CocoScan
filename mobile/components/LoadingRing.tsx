import React, { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, { Easing, cancelAnimation, useAnimatedStyle, useSharedValue, withRepeat, withTiming } from 'react-native-reanimated';
import Svg, { Circle } from 'react-native-svg';

import { AppText } from '@/components/AppText';
import { colors, fonts } from '@/constants/theme';

interface Props {
  size?: number;
  strokeWidth?: number;
  /**
   * 0..1 for determinate progress (e.g. upload fraction). Omit / null for an
   * indeterminate spinner. The percentage label is shown ONLY when determinate.
   */
  progress?: number | null;
}

/** Figma "Group 15": 244 px ring, light-green track, #84B46E arc, Poppins Bold 40 label. */
export function LoadingRing({ size = 244, strokeWidth = 16, progress = null }: Props) {
  const rotation = useSharedValue(0);
  const determinate = typeof progress === 'number';

  useEffect(() => {
    if (determinate) {
      cancelAnimation(rotation);
      rotation.value = withTiming(0, { duration: 200 });
      return;
    }
    rotation.value = withRepeat(withTiming(360, { duration: 1400, easing: Easing.linear }), -1, false);
    return () => cancelAnimation(rotation);
  }, [determinate, rotation]);

  const spin = useAnimatedStyle(() => ({ transform: [{ rotate: `${rotation.value}deg` }] }));

  const r = (size - strokeWidth) / 2;
  const c = 2 * Math.PI * r;
  const fraction = determinate ? Math.max(0, Math.min(1, progress)) : 0.65;
  const dash = c * fraction;

  return (
    <View style={{ width: size, height: size }} accessibilityRole="progressbar" accessibilityValue={determinate ? { now: Math.round(fraction * 100), min: 0, max: 100 } : undefined}>
      <Animated.View style={[StyleSheet.absoluteFill, spin]}>
        <Svg width={size} height={size}>
          <Circle cx={size / 2} cy={size / 2} r={r} stroke={colors.green300} strokeWidth={strokeWidth} fill="none" />
          <Circle
            cx={size / 2}
            cy={size / 2}
            r={r}
            stroke={colors.green600}
            strokeWidth={strokeWidth}
            fill="none"
            strokeLinecap="round"
            strokeDasharray={`${dash} ${c - dash}`}
            transform={`rotate(-90 ${size / 2} ${size / 2})`}
          />
        </Svg>
      </Animated.View>
      {determinate ? (
        <View style={styles.center} pointerEvents="none">
          <AppText color={colors.black} style={styles.percent}>
            {Math.round(fraction * 100)}%
          </AppText>
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  center: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, alignItems: 'center', justifyContent: 'center' },
  percent: { fontSize: 40, lineHeight: 48, fontFamily: fonts.bold },
});
