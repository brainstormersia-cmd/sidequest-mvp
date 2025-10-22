export const theme = {
  colors: {
    background: '#F5F7FB',
    surface: '#FFFFFF',
    surfaceAlt: '#EEF3FF',
    primary: '#4F8BFF',
    accent: '#4F8BFF',
    textPrimary: '#0B0C0E',
    textSecondary: '#4A4E59',
    border: '#D5DCEE',
    success: '#1BAF6B',
    error: '#E5484D',
    focus: '#C8DAFF',
    onPrimary: '#FFFFFF',
    onSurface: '#0B0C0E',
  },
  spacing: {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
  },
  radius: {
    sm: 8,
    md: 12,
    lg: 16,
  },
  typography: {
    xs: 13,
    sm: 14,
    md: 16,
    lg: 24,
  },
};

export type Theme = typeof theme;
