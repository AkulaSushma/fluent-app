export const palette = {
  paper: '#F4F1EB',
  card: '#FFFFFF',
  ink: '#171511',
  ink2: '#5A554C',
  ink3: '#9A958C',
  line: '#E8E3DA',
  line2: '#F0ECE4',
  accent: '#37563D',
  accent2: '#557A5C',
  accentSoft: '#E9EFEA',
  accentInk: '#2A422F',
  amber: '#B26B22',
  amberSoft: '#F6EADB',
  gold: '#D9A441',
  dark1: '#23201A',
  dark2: '#15130F',
} as const;

export const space = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 22,
  xxl: 32,
} as const;

export const radius = {
  sm: 12,
  md: 16,
  lg: 20,
  xl: 24,
  pill: 999,
} as const;

export const shadow = {
  card: {
    shadowColor: '#171511',
    shadowOpacity: 0.1,
    shadowRadius: 24,
    shadowOffset: { width: 0, height: 12 },
    elevation: 6,
  },
  raised: {
    shadowColor: '#37563D',
    shadowOpacity: 0.45,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: 10 },
    elevation: 10,
  },
  fab: {
    shadowColor: '#171511',
    shadowOpacity: 0.5,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 10 },
    elevation: 12,
  },
} as const;

export const spring = { damping: 18, stiffness: 220, mass: 0.9 } as const;
export const springSoft = { damping: 22, stiffness: 140, mass: 1 } as const;
