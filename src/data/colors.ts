import { ColorDef, HexColorId } from '../types';

export const HEX_COLORS: Record<HexColorId, ColorDef> = {
  'ruby-red': {
    id: 'ruby-red',
    name: 'Ruby Red',
    primary: '#E11D48',
    highlight: '#FB7185',
    shadow: '#9F1239',
    glow: 'rgba(225, 29, 72, 0.6)',
    textColor: '#FFFFFF',
    symbol: '★', // Star
    symbolName: 'Star',
  },
  'tangerine-orange': {
    id: 'tangerine-orange',
    name: 'Tangerine',
    primary: '#F97316',
    highlight: '#FDBA74',
    shadow: '#C2410C',
    glow: 'rgba(249, 115, 22, 0.6)',
    textColor: '#FFFFFF',
    symbol: '▲', // Triangle
    symbolName: 'Triangle',
  },
  'sunburst-yellow': {
    id: 'sunburst-yellow',
    name: 'Sunburst Yellow',
    primary: '#EAB308',
    highlight: '#FEF08A',
    shadow: '#A16207',
    glow: 'rgba(234, 179, 8, 0.6)',
    textColor: '#713F12',
    symbol: '●', // Circle
    symbolName: 'Circle',
  },
  'emerald-green': {
    id: 'emerald-green',
    name: 'Emerald Green',
    primary: '#10B981',
    highlight: '#6EE7B7',
    shadow: '#047857',
    glow: 'rgba(16, 185, 129, 0.6)',
    textColor: '#FFFFFF',
    symbol: '◆', // Diamond
    symbolName: 'Diamond',
  },
  'lime-spring': {
    id: 'lime-spring',
    name: 'Lime Spring',
    primary: '#84CC16',
    highlight: '#BEF264',
    shadow: '#4D7C0F',
    glow: 'rgba(132, 204, 22, 0.6)',
    textColor: '#365314',
    symbol: '✚', // Cross
    symbolName: 'Cross',
  },
  'cyan-breeze': {
    id: 'cyan-breeze',
    name: 'Cyan Breeze',
    primary: '#06B6D4',
    highlight: '#67E8F9',
    shadow: '#0E7490',
    glow: 'rgba(6, 182, 212, 0.6)',
    textColor: '#FFFFFF',
    symbol: '✦', // Sparkle
    symbolName: 'Sparkle',
  },
  'azure-blue': {
    id: 'azure-blue',
    name: 'Azure Blue',
    primary: '#3B82F6',
    highlight: '#93C5FD',
    shadow: '#1D4ED8',
    glow: 'rgba(59, 130, 246, 0.6)',
    textColor: '#FFFFFF',
    symbol: '■', // Square
    symbolName: 'Square',
  },
  'royal-purple': {
    id: 'royal-purple',
    name: 'Royal Purple',
    primary: '#8B5CF6',
    highlight: '#C4B5FD',
    shadow: '#5B21B6',
    glow: 'rgba(139, 92, 246, 0.6)',
    textColor: '#FFFFFF',
    symbol: '⬟', // Pentagon
    symbolName: 'Pentagon',
  },
  'bubblegum-pink': {
    id: 'bubblegum-pink',
    name: 'Bubblegum Pink',
    primary: '#EC4899',
    highlight: '#F472B6',
    shadow: '#BE185D',
    glow: 'rgba(236, 72, 153, 0.6)',
    textColor: '#FFFFFF',
    symbol: '♥', // Heart
    symbolName: 'Heart',
  },
  'orchid-magenta': {
    id: 'orchid-magenta',
    name: 'Orchid Magenta',
    primary: '#D946EF',
    highlight: '#F0ABFC',
    shadow: '#A21CAF',
    glow: 'rgba(217, 70, 239, 0.6)',
    textColor: '#FFFFFF',
    symbol: '✿', // Flower
    symbolName: 'Flower',
  },
  'ocean-teal': {
    id: 'ocean-teal',
    name: 'Ocean Teal',
    primary: '#14B8A6',
    highlight: '#5EEAD4',
    shadow: '#0F766E',
    glow: 'rgba(20, 184, 166, 0.6)',
    textColor: '#FFFFFF',
    symbol: '☾', // Crescent
    symbolName: 'Crescent',
  },
  'wild-rainbow': {
    id: 'wild-rainbow',
    name: 'Wild Rainbow',
    primary: '#F43F5E',
    highlight: '#FDA4AF',
    shadow: '#9F1239',
    glow: 'rgba(244, 63, 94, 0.8)',
    textColor: '#FFFFFF',
    symbol: '🌈',
    symbolName: 'Rainbow',
  },
};

export const COLOR_KEYS = Object.keys(HEX_COLORS) as HexColorId[];
