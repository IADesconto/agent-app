export const colors = {
  background: '#0a0a0a',
  card: '#1a1a1a',
  cardBorder: '#2a2a2a',
  accent: '#00d46a',
  accentLight: '#00d46a20',
  accentMuted: '#00d46a10',
  text: '#fff',
  textSecondary: '#888',
  textMuted: '#666',
  danger: '#ff4444',
  warning: '#f0a020',
};

export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 32,
};

export const borderRadius = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  full: 999,
};

export const typography = {
  title: { fontSize: 22, fontWeight: '700' as const, color: colors.text },
  subtitle: { fontSize: 16, fontWeight: '600' as const, color: colors.text },
  body: { fontSize: 15, color: colors.text },
  caption: { fontSize: 13, color: colors.textSecondary },
  small: { fontSize: 12, color: colors.textMuted },
};
