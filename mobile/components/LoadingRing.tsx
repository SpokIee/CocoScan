import React, { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, { Easing, cancelAnimation, useAnimatedStyle, useSharedValue, withRepeat, withTiming } from 'react-native-reanimated';
import Svg, { Circle, Defs, LinearGradient, Stop } from 'react-native-svg';

import { AppText } from '@/components/AppText';
import { colors } from '@/constants/theme';

interface Props {
  size?: number;
  strokeWidth?: number;
  /**
   * 0..1 for determinate progress (e.g. upload fraction). Omit / null for an
   * indeterminate spinner. A percentage label is shown ONLY when determinate.
   */
  progress?: number | null;
}

/** Circular green progress ring matching the Figma "Detecting..." screen. */
export function LoadingRing({ size = 170, strokeWidth = 14, progress = null }: Props) {
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
  const fraction = determinate ? Math.max(0, Math.min(1, progress)) : 0.72;
  const dash = c * fraction;

  return (
    <View style={{ width: size, height: size }} accessibilityRole="progressbar" accessibilityValue={determinate ? { now: Math.round(fraction * 100), min: 0, max: 100 } : undefined}>
      <Animated.View style={[StyleSheet.absoluteFill, spin]}>
        <Svg width={size} height={size}>
          <Defs>
            <LinearGradient id="ring" x1="0" y1="0" x2="1" y2="1">
              <Stop offset="0" stopColor={colors.green300} />
              <Stop offset="1" stopColor={colors.green700} />
            </LinearGradient>
          </Defs>
          <Circle cx={size / 2} cy={size / 2} r={r} stroke={colors.green100} strokeWidth={strokeWidth} fill="none" />
          <Circle
            cx={size / 2}
            cy={size / 2}
            r={r}
            stroke="url(#ring)"
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
          <AppText variant="h1" color={colors.text} style={styles.percent}>
            {Math.round(fraction * 100)}%
          </AppText>
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  center: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, alignItems: 'center', justifyContent: 'center' },
  percent: { fontSize: 34, lineHeight: 40, fontFamily: 'Poppins_700Bold' },
});
