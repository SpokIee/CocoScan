import { useRouter, type Href } from 'expo-router';
import React from 'react';
import { Pressable, StyleSheet, type StyleProp, type ViewStyle } from 'react-native';
import Svg, { Path, Rect } from 'react-native-svg';

import { colors, hitSlop } from '@/constants/theme';

interface Props {
  /** "dark" = white glyph on photos (Figma Group 19); "light" = green glyph on light screens (Group 17/18). */
  tone?: 'dark' | 'light';
  fallbackHref?: Href;
  onPress?: () => void;
  style?: StyleProp<ViewStyle>;
}

/**
 * Exact replica of the Figma back button: 42 × 42, 3 px rounded-square
 * stroke (radius 10.5, 68 % opacity) with a left arrow.
 */
export function BackButton({ tone = 'light', fallbackHref = '/(app)/home', onPress, style }: Props) {
  const router = useRouter();
  const handle = () => {
    if (onPress) return onPress();
    if (router.canGoBack()) router.back();
    else router.replace(fallbackHref);
  };
  const stroke = tone === 'dark' ? colors.white : colors.green700;
  return (
    <Pressable accessibilityRole="button" accessibilityLabel="Go back" hitSlop={hitSlop} onPress={handle} style={({ pressed }) => [styles.base, pressed && styles.pressed, style]}>
      <Svg width={42} height={42} viewBox="0 0 42 42" fill="none">
        <Rect x={1.5} y={1.5} width={39} height={39} rx={10.5} stroke={stroke} strokeOpacity={0.68} strokeWidth={3} fill={tone === 'dark' ? 'rgba(0,0,0,0.15)' : 'rgba(255,255,255,0.6)'} />
        <Path
          d="M28 21V20H14V21V22H28V21ZM13.2929 20.2929C12.9024 20.6834 12.9024 21.3166 13.2929 21.7071L19.6569 28.0711C20.0474 28.4616 20.6805 28.4616 21.0711 28.0711C21.4616 27.6805 21.4616 27.0474 21.0711 26.6569L15.4142 21L21.0711 15.3431C21.4616 14.9526 21.4616 14.3195 21.0711 13.9289C20.6805 13.5384 20.0474 13.5384 19.6569 13.9289L13.2929 20.2929Z"
          fill={stroke}
        />
      </Svg>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: { width: 42, height: 42 },
  pressed: { opacity: 0.7 },
});
