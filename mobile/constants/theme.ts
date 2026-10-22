/**
 * CocoScan design tokens, sampled from the Figma frames.
 * Keep every color / radius / spacing here so screens stay consistent.
 */
export const colors = {
  // Greens
  green900: '#1B3A19',
  green800: '#2E5B2A', // dark coconut green: banner, Logout button, About card
  green700: '#3C6B34', // primary buttons (Get Started / Login / Sign Up)
  green600: '#4E8A3F', // headings on light screens
  green500: '#5BA23B', // confidence score, result-saved ring
  green400: '#79B45C', // Cancel button
  green300: '#8DC46B',
  green200: '#BFDDAA',
  green100: '#E3F0DC',
  green50: '#F2F7EE',

  // Status
  danger: '#E0462F',
  warning: '#D98E04',
  neutral: '#8A8F86',

  // Neutrals
  white: '#FFFFFF',
  black: '#000000',
  text: '#1F2A1C',
  textMuted: '#6B7A66',
  textFaint: '#9AA596',
  border: '#D9E3D3',
  surface: '#FFFFFF',
  background: '#F7FAF5',
  overlay: 'rgba(0,0,0,0.55)',
  glass: 'rgba(255,255,255,0.14)',
  glassBorder: 'rgba(255,255,255,0.35)',
} as const;

export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  xxxl: 32,
  screen: 20, // horizontal gutter
} as const;

export const radii = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 28,
  pill: 999,
} as const;

export const fonts = {
  regular: 'Poppins_400Regular',
  medium: 'Poppins_500Medium',
  semiBold: 'Poppins_600SemiBold',
  bold: 'Poppins_700Bold',
} as const;

export const typography = {
  display: { fontFamily: fonts.semiBold, fontSize: 32, lineHeight: 38 },
  h1: { fontFamily: fonts.semiBold, fontSize: 26, lineHeight: 32 },
  h2: { fontFamily: fonts.semiBold, fontSize: 22, lineHeight: 28 },
  h3: { fontFamily: fonts.semiBold, fontSize: 18, lineHeight: 24 },
  body: { fontFamily: fonts.regular, fontSize: 14, lineHeight: 21 },
  bodyMedium: { fontFamily: fonts.medium, fontSize: 14, lineHeight: 21 },
  small: { fontFamily: fonts.regular, fontSize: 12, lineHeight: 18 },
  tiny: { fontFamily: fonts.regular, fontSize: 10, lineHeight: 14 },
  button: { fontFamily: fonts.semiBold, fontSize: 15, lineHeight: 20 },
} as const;

export const shadows = {
  card: {
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 3,
  },
  modal: {
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 24,
    shadowOffset: { width: 0, height: 10 },
    elevation: 10,
  },
} as const;

export const hitSlop = { top: 10, bottom: 10, left: 10, right: 10 } as const;
