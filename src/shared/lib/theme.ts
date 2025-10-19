export const theme = {
  colors: {
    background: '#05050A', // BG - contrast AA con testo primario
    surface: '#111120', // superfici cards
    surfaceAlt: '#1C1C2E',
    primary: '#8B5CF6', // viola con contrasto AA su surface
    accent: '#F59E0B',
    textPrimary: '#F5F5FF',
    textSecondary: '#C1C1D0',
    border: '#2E2E46',
    success: '#34D399',
    error: '#F87171',
    focus: '#E0E7FF',
  },
  spacing: {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
  },
  radius: {
    sm: 8,
    md: 12,
    lg: 16,
  },
  typography: {
    xs: 14,
    sm: 16,
    md: 18,
    lg: 22,
  },
};

export type Theme = typeof theme;
