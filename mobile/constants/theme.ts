/**
 * CocoScan design tokens — values read from the Figma file
 * (db28yB0uReqfa2W18qae7J) via the Figma MCP connector on 2026-10-22.
 * Frames are 375 × 812; sizes below are in dp at that scale.
 */
export const colors = {
  // Greens (Figma hex values)
  green900: '#335321', // dark headings ("Detection Result", "Logout"), sheet gradient end
  green800: '#43662E', // dark buttons (Login / OK / Save / Logout), home banner
  green700: '#4F7730', // primary text + headings on light screens
  green600: '#84B46E', // light buttons (Cancel / Retry / Scan Again / Scan New)
  green500: '#9CCB81', // updates card border + "Scan complete!"
  green300: '#C5E2B3', // progress ring track
  green100: '#E6F1DF',
  green50: '#F3F8EF',

  // Status
  success: '#34BA38', // confidence score
  danger: '#FF4141', // "Disease Detected!", disease labels
  warning: '#D98E04', // Uncertain state, Demo badge

  // Neutrals
  white: '#FFFFFF',
  black: '#000000',
  text: '#335321',
  textMuted: '#4F7730',
  textFaint: '#7F9876',
  border: '#D9E3D3',
  surface: '#FFFFFF',
  background: '#FBFCFA',
  overlay: 'rgba(0,0,0,0.42)',
  photoTint: 'rgba(37,71,11,0.2)',
  glassBorder: 'rgba(255,255,255,0.68)',
} as const;

export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  xxxl: 32,
  screen: 28, // Figma content gutter on Home / Read
} as const;

export const radii = {
  input: 10,
  button: 11,
  card: 8,
  cardLg: 20,
  sheet: 30,
  pill: 999,
} as const;

export const fonts = {
  heading: 'CalSans_400Regular',
  regular: 'Poppins_400Regular',
  medium: 'Poppins_500Medium',
  semiBold: 'Poppins_600SemiBold',
  bold: 'Poppins_700Bold',
  italic: 'Poppins_400Regular_Italic',
  lightItalic: 'Poppins_300Light_Italic',
} as const;

export const typography = {
  // Cal Sans (display / headings / buttons)
  display: { fontFamily: fonts.heading, fontSize: 40, lineHeight: 42 },
  h1: { fontFamily: fonts.heading, fontSize: 35, lineHeight: 40 },
  h2: { fontFamily: fonts.heading, fontSize: 26, lineHeight: 30 },
  h3: { fontFamily: fonts.heading, fontSize: 20, lineHeight: 24 },
  title: { fontFamily: fonts.heading, fontSize: 16, lineHeight: 20 },
  label: { fontFamily: fonts.heading, fontSize: 14, lineHeight: 18 },
  // Poppins (body)
  body: { fontFamily: fonts.regular, fontSize: 14, lineHeight: 21 },
  bodyMedium: { fontFamily: fonts.medium, fontSize: 14, lineHeight: 21 },
  small: { fontFamily: fonts.regular, fontSize: 12, lineHeight: 18 },
  smallMedium: { fontFamily: fonts.medium, fontSize: 12, lineHeight: 18 },
  tiny: { fontFamily: fonts.regular, fontSize: 10, lineHeight: 14 },
  micro: { fontFamily: fonts.regular, fontSize: 8, lineHeight: 11 },
  button: { fontFamily: fonts.heading, fontSize: 14, lineHeight: 18 },
} as const;

export const shadows = {
  // 1px 2px 4px 1px rgba(0,0,0,0.16) — Home cards
  card: {
    shadowColor: '#000',
    shadowOpacity: 0.16,
    shadowRadius: 4,
    shadowOffset: { width: 1, height: 2 },
    elevation: 3,
  },
  // 0 4px 4px rgba(0,0,0,0.25) — History cards / Updates rows
  cardLg: {
    shadowColor: '#000',
    shadowOpacity: 0.25,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4,
  },
  // 0 2px 7.5px rgba(0,0,0,0.25) — buttons / banner
  button: {
    shadowColor: '#000',
    shadowOpacity: 0.25,
    shadowRadius: 7.5,
    shadowOffset: { width: 0, height: 2 },
    elevation: 3,
  },
  // 0 12px 10.7px rgba(0,0,0,0.25) — modals / result header
  modal: {
    shadowColor: '#000',
    shadowOpacity: 0.25,
    shadowRadius: 10.7,
    shadowOffset: { width: 0, height: 12 },
    elevation: 10,
  },
} as const;

/** Figma button footprint used in pairs (Retry/OK, Cancel/Logout, Scan Again/Save). */
export const BUTTON = { width: 126, height: 42 } as const;

export const hitSlop = { top: 10, bottom: 10, left: 10, right: 10 } as const;
