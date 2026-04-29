export const ui = {
  colors: {
    background: '#f8fafc',
    surface: '#ffffff',
    textPrimary: '#0f172a',
    textSecondary: '#475569',
    border: '#e2e8f0',
    tabActive: '#0f172a',
    tabInactive: '#64748b',
    category: {
      daily: '#fee2e2',
      weekly: '#dcfce7',
      monthly: '#ede9fe',
      yearly: '#dbeafe',
    },
    priority: {
      low: '#0284c7',
      medium: '#b45309',
      high: '#b91c1c',
    },
  },
  radius: {
    md: 14,
    lg: 18,
  },
  spacing: {
    xs: 6,
    sm: 10,
    md: 16,
    lg: 20,
  },
  shadow: {
    card: {
      shadowColor: '#0f172a',
      shadowOpacity: 0.08,
      shadowRadius: 14,
      shadowOffset: { width: 0, height: 6 },
      elevation: 3,
    },
  },
} as const;
