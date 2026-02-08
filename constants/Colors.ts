import { Platform } from 'react-native';

// Palette
// New Zwift-like palette (primary laranja + accents ciano/azul)
const primary = '#066699'; // Blue primary (principal)
const primaryDeep = '#044d73'; // Blue Deep (darker for highlights)

const blackCarbon = '#0D0D0D';
const graphiteDark = '#1A1A1A';
const slateGray = '#2B2B2B';
const pureWhite = '#FFFFFF';

const gray500 = '#7A7A7A';
const gray300 = '#CFCFCF';

// Accent/secondary (Zwift style warm/cold contrast)
const cyanLight = '#4EDFFF';
const cyanStrong = '#00B7EB';
const blueElectric = '#2D7FF9';

export default {
  light: {
    text: '#000000',
    background: pureWhite,
    tint: primary,
    tabIconDefault: gray500,
    tabIconSelected: primary,
    cardBackground: pureWhite,
    border: gray300,
    notification: cyanStrong,
    error: '#E84A4A',
    success: '#3CCF91',
    warning: primaryDeep,
    destructive: '#E84A4A',
  },
  dark: {
    text: pureWhite,
    background: blackCarbon,
    tint: primary,
    tabIconDefault: gray300,
    tabIconSelected: primary,
    cardBackground: graphiteDark,
    border: slateGray,
    notification: cyanLight,
    error: '#E84A4A',
    success: '#3CCF91',
    warning: primaryDeep,
    destructive: '#FF5757',
  },
  shared: {
    swim: '#0EA5E9',
    bike: '#10B981',
    run: '#F97316',
    nutrition: '#EC4899',
    profile: '#8B5CF6',
    secondary: blueElectric,
    delete: '#EF4444',
    // Core palette
    primary,
    primaryDeep,
    backgrounds: {
      blackCarbon,
      graphiteDark,
      slateGray,
      pureWhite,
    },
    neutrals: {
      gray500,
      gray300,
    },
    accents: {
      cyanLight,
      cyanStrong,
      blueElectric,
    },
  },
};