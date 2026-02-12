// ─── Modern Unified Palette ─────────────────────────────────────────
// Primary blue dominates. Sport-specific colors used only where
// differentiation is essential (zone screens).

const primary = '#2563EB';       // Vibrant blue (main brand color)
const primaryDark = '#1D4ED8';   // Darker variant for pressed states
const primaryLight = '#3B82F6';  // Lighter variant for dark-mode tint

const blackCarbon = '#0F172A';   // Slate 900 – deep dark background
const graphiteDark = '#1E293B';  // Slate 800 – dark card surface
const slateGray = '#334155';     // Slate 700 – dark borders

const pureWhite = '#FFFFFF';

const gray500 = '#64748B';       // Slate 500 – secondary text
const gray400 = '#94A3B8';       // Slate 400 – muted/placeholder
const gray300 = '#CBD5E1';       // Slate 300 – light borders
const gray100 = '#F1F5F9';       // Slate 100 – subtle background

// Accent
const accent = '#06B6D4';        // Cyan 500
const accentLight = '#22D3EE';   // Cyan 400

export default {
  light: {
    text: '#0F172A',
    background: '#F8FAFC',          // Slate 50
    tint: primary,
    tabIconDefault: gray400,
    tabIconSelected: primary,
    cardBackground: pureWhite,
    border: '#E2E8F0',              // Slate 200
    notification: accent,
    error: '#EF4444',
    success: '#10B981',
    warning: '#F59E0B',
    destructive: '#EF4444',
  },
  dark: {
    text: '#F1F5F9',
    background: blackCarbon,
    tint: primaryLight,
    tabIconDefault: gray500,
    tabIconSelected: primaryLight,
    cardBackground: graphiteDark,
    border: slateGray,
    notification: accentLight,
    error: '#EF4444',
    success: '#10B981',
    warning: '#F59E0B',
    destructive: '#FF5757',
  },
  shared: {
    // Sport colors – used ONLY in zone-detail screens for differentiation
    swim: '#0EA5E9',
    bike: '#10B981',
    run: '#F97316',

    // UI semantics
    nutrition: primary,
    profile: primary,
    secondary: accent,
    delete: '#EF4444',

    // Core palette tokens
    primary,
    primaryDark,
    primaryLight,

    backgrounds: {
      blackCarbon,
      graphiteDark,
      slateGray,
      pureWhite,
    },
    neutrals: {
      gray500,
      gray400,
      gray300,
      gray100,
    },
    accents: {
      accent,
      accentLight,
    },
  },
};