import { Platform, StyleSheet } from 'react-native';

// Terminal Brutalista — baseado em iadesconto_website/IADesconto/prototype
export const colors = {
  // === Surface ===
  background: '#0A0E17',        // Deep Space
  foreground: '#E4E8F0',        // Starlight
  card: '#111827',              // Void
  cardForeground: '#E4E8F0',
  popover: '#1A1F2E',           // dropdowns, sidebars
  popoverForeground: '#E4E8F0',

  // === Primary (Pix Green) ===
  primary: '#32D74B',
  primaryForeground: '#0A0E17',

  // === Accent (Cyan) ===
  accent: '#00B4D8',
  accentForeground: '#0A0E17',

  // === Muted ===
  muted: '#374151',
  mutedForeground: '#6B7280',

  // === Borders & Inputs ===
  border: '#1E2A3A',            // Steel
  input: '#1E2A3A',
  ring: '#32D74B',

  // === Destructive ===
  destructive: '#EF4444',
  destructiveForeground: '#FAFAFA',

  // === States ===
  success: '#32D74B',
  warning: '#F59E0B',
  error: '#EF4444',
  info: '#00B4D8',

  // === Legacy aliases (backward compat) ===
  surface: '#0A0E17',
  cardHover: '#1A1F2E',
  cardBorder: '#1E2A3A',
  accentGlow: '#32D74B25',
  accentMuted: '#32D74B12',
  text: '#E4E8F0',
  textSecondary: '#6B7280',
  textMuted: '#6B7280',
  black: '#000000',
  white: '#FFFFFF',
  danger: '#EF4444',
  codeBg: '#0A0E17',
  codeBorder: '#1E2A3A',
};

export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  xxl: 32,
};

export const borderRadius = {
  sm: 4,
  md: 8,
  lg: 12,
  xl: 16,
  full: 9999,
};

export const fonts = {
  display: Platform.select({ web: '"Instrument Sans", "Inter", sans-serif', default: undefined }),
  sans: Platform.select({ web: '"Inter", sans-serif', default: undefined }),
  mono: Platform.select({ web: '"JetBrains Mono", "Fira Code", monospace', default: 'monospace' }),
};

export const typography = StyleSheet.create({
  title: { fontSize: 22, fontWeight: '700' as const, color: colors.foreground },
  subtitle: { fontSize: 16, fontWeight: '600' as const, color: colors.foreground },
  body: { fontSize: 15, color: colors.foreground },
  caption: { fontSize: 13, color: colors.mutedForeground },
  small: { fontSize: 12, color: colors.mutedForeground },
});
