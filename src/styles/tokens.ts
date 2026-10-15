/**
 * Sahayak 3D Design Tokens
 * Authentic Okabe-Ito Colorblind-Safe Standard:
 * - On-Time: Bluish Green (#009E73)
 * - Delay: Amber / Orange (#E69F00)
 * - Cancelled / Section Halt: Vermilion (#D55E00)
 * - Rerouted: Blue (#0072B2)
 * Tested against Protanopia, Deuteranopia, Tritanopia, and Monochromacy.
 */

export const tokens = {
  colors: {
    // Authentic Okabe-Ito Colorblind-Safe Palette
    status: {
      onTime: {
        primary: '#009E73', // Okabe-Ito Bluish Green
        light: '#D1FAE5',
        dark: '#004D38',
        border: '#009E73',
        glow: 'rgba(0, 158, 115, 0.4)',
        label: 'On Time / समय पर',
      },
      delay: {
        primary: '#E69F00', // Okabe-Ito Orange / Amber
        light: '#FEF3C7',
        dark: '#7A5400',
        border: '#E69F00',
        glow: 'rgba(230, 159, 0, 0.4)',
        label: 'Delayed / विलंबित',
      },
      cancelled: {
        primary: '#D55E00', // Okabe-Ito Vermilion
        light: '#FFE4E6',
        dark: '#6E3100',
        border: '#D55E00',
        glow: 'rgba(213, 94, 0, 0.4)',
        label: 'Cancelled / रद्द',
      },
      rerouted: {
        primary: '#0072B2', // Okabe-Ito Blue
        light: '#DBEAFE',
        dark: '#003B5C',
        border: '#0072B2',
        glow: 'rgba(0, 114, 178, 0.4)',
        label: 'Rerouted / मार्ग परिवर्तित',
      },
      skyBlue: '#56B4E9',
      reddishPurple: '#CC79A7',
    },

    // Railway Corridor Palette
    railway: {
      heritageNavy: '#0F172A',
      irDeepBlue: '#1E3A8A',
      irCoachBlue: '#0072B2',
      irYellowStripe: '#E69F00',
      locoCrimson: '#B91C1C',
      ballastGrey: '#334155',
      steelRail: '#94A3B8',
      sleepersConcrete: '#CBD5E1',
      sleeperWood: '#78350F',
    },

    // Environmental 3D Palettes
    environment: {
      day: {
        skyTop: '#56B4E9',
        skyBottom: '#BAE6FD',
        sun: '#FFFBEB',
        sunIntensity: 1.6,
        ambient: '#F0F9FF',
        ambientIntensity: 0.65,
        fog: '#BAE6FD',
        fogNear: 45,
        fogFar: 160,
        terrainGrass: '#34D399',
        terrainHill: '#059669',
        terrainSoil: '#A16207',
      },
      dusk: {
        skyTop: '#1E1B4B',
        skyBottom: '#FB923C',
        sun: '#F97316',
        sunIntensity: 1.3,
        ambient: '#FED7AA',
        ambientIntensity: 0.45,
        fog: '#C2410C',
        fogNear: 35,
        fogFar: 130,
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
    focusRing: '3px solid #E69F00',
    focusOffset: '2px',
    minTouchTarget: '48px',
  },
} as const;

export type DesignTokens = typeof tokens;
