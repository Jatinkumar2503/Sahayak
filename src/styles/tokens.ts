/**
 * Sahayak 3D Design Tokens
 * Colorblind-safe palettes (Okabe-Ito / Paul Tol standards)
 * Optimized for high-contrast accessibility (WCAG AAA/AA)
 */

export const tokens = {
  colors: {
    // Colorblind-Safe Status Colors
    status: {
      onTime: {
        primary: '#059669', // Emerald / Sea Green
        light: '#D1FAE5',
        dark: '#065F46',
        border: '#34D399',
        glow: 'rgba(16, 185, 129, 0.4)',
        label: 'On Time / समय पर',
      },
      delay: {
        primary: '#D97706', // High-contrast Ochre / Amber
        light: '#FEF3C7',
        dark: '#78350F',
        border: '#FBBF24',
        glow: 'rgba(217, 119, 6, 0.4)',
        label: 'Delayed / विलंबित',
      },
      cancelled: {
        primary: '#E11D48', // High-contrast Crimson Vermilion
        light: '#FFE4E6',
        dark: '#881337',
        border: '#FB7185',
        glow: 'rgba(225, 29, 72, 0.4)',
        label: 'Cancelled / रद्द',
      },
      rerouted: {
        primary: '#2563EB', // Ultramarine / Sky Blue
        light: '#DBEAFE',
        dark: '#1E40AF',
        border: '#60A5FA',
        glow: 'rgba(37, 99, 235, 0.4)',
        label: 'Rerouted / मार्ग परिवर्तित',
      },
    },

    // Railway Corridor Palette
    railway: {
      heritageNavy: '#0F172A',
      irDeepBlue: '#1E3A8A',
      irCoachBlue: '#2563EB',
      irYellowStripe: '#F59E0B',
      locoCrimson: '#B91C1C',
      ballastGrey: '#334155',
      steelRail: '#94A3B8',
      sleepersConcrete: '#CBD5E1',
      sleeperWood: '#78350F',
    },

    // Environmental 3D Palettes
    environment: {
      day: {
        skyTop: '#38BDF8',
        skyBottom: '#BAE6FD',
        sun: '#FFFBEB',
        sunIntensity: 1.8,
        ambient: '#F0F9FF',
        ambientIntensity: 0.65,
        fog: '#BAE6FD',
        fogNear: 40,
        fogFar: 140,
        terrainGrass: '#4ADE80',
        terrainHill: '#22C55E',
        terrainSoil: '#A16207',
      },
      dusk: {
        skyTop: '#1E1B4B',
        skyBottom: '#FB923C',
        sun: '#F97316',
        sunIntensity: 1.4,
        ambient: '#FED7AA',
        ambientIntensity: 0.45,
        fog: '#C2410C',
        fogNear: 30,
        fogFar: 120,
        terrainGrass: '#15803D',
        terrainHill: '#166534',
        terrainSoil: '#78350F',
      },
    },

    // Surface & Glassmorphism
    surface: {
      glassDark: 'rgba(15, 23, 42, 0.82)',
      glassBorder: 'rgba(255, 255, 255, 0.14)',
      glassHighlight: 'rgba(255, 255, 255, 0.05)',
      cardBg: '#0F172A',
      textPrimary: '#F8FAFC',
      textSecondary: '#94A3B8',
      textMuted: '#64748B',
    },
  },

  // Motion timings
  motion: {
    durationInstant: '150ms',
    durationSnappy: '300ms',
    durationSmooth: '600ms',
    durationCinematic: '1200ms',
    easingDefault: 'cubic-bezier(0.16, 1, 0.3, 1)',
  },

  // Typography Scale
  typography: {
    fontSans: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    fontDisplay: '"Outfit", "Inter", sans-serif',
    scale: {
      xs: '0.75rem',
      sm: '0.875rem',
      base: '1rem',
      lg: '1.125rem',
      xl: '1.25rem',
      '2xl': '1.5rem',
      '3xl': '1.875rem',
      '4xl': '2.25rem',
    },
  },

  // Accessibility
  a11y: {
    focusRing: '3px solid #F59E0B',
    focusOffset: '2px',
    minTouchTarget: '48px',
  },
} as const;

export type DesignTokens = typeof tokens;
