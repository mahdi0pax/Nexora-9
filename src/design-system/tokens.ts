/**
 * Nexora Design System — Shared Tokens v2
 * New palette: #0B1020 void, #141B2D surface, #1C2640 card,
 * #7C5CFC violet, #00D4FF cyan, #FFB84D amber, #00C896 emerald, #E6EDF7 frost
 */

// ── Color Tokens ──────────────────────────────────────────────────────────
export const colors = {
  void:    '#0B1020',
  surface: '#141B2D',
  card:    '#1C2640',
  violet:  '#7C5CFC',
  cyan:    '#00D4FF',
  amber:   '#FFB84D',
  emerald: '#00C896',
  frost:   '#E6EDF7',

  violetShades: {
    light: '#9B81FF',
    DEFAULT: '#7C5CFC',
    dark:  '#5E3DE8',
    dim:   'rgba(124,92,252,0.08)',
    low:   'rgba(124,92,252,0.12)',
    mid:   'rgba(124,92,252,0.22)',
    glow:  'rgba(124,92,252,0.35)',
  },
  cyanShades: {
    light: '#33DEFF',
    DEFAULT: '#00D4FF',
    dark:  '#00A8CC',
    dim:   'rgba(0,212,255,0.08)',
    low:   'rgba(0,212,255,0.12)',
    mid:   'rgba(0,212,255,0.22)',
    glow:  'rgba(0,212,255,0.35)',
  },
  amberShades: {
    light: '#FFD080',
    DEFAULT: '#FFB84D',
    dark:  '#E8960A',
    dim:   'rgba(255,184,77,0.08)',
    low:   'rgba(255,184,77,0.12)',
    mid:   'rgba(255,184,77,0.22)',
    glow:  'rgba(255,184,77,0.35)',
  },
  emeraldShades: {
    light: '#33E8B8',
    DEFAULT: '#00C896',
    dark:  '#009E78',
    dim:   'rgba(0,200,150,0.08)',
    low:   'rgba(0,200,150,0.12)',
    mid:   'rgba(0,200,150,0.22)',
    glow:  'rgba(0,200,150,0.35)',
  },
  frostShades: {
    DEFAULT: '#E6EDF7',
    muted:   'rgba(230,237,247,0.55)',
    dim:     'rgba(230,237,247,0.35)',
    faint:   'rgba(230,237,247,0.15)',
    ghost:   'rgba(230,237,247,0.07)',
  },

  // Legacy aliases for game pages
  accent:  '#7C5CFC',
  accentShades: {
    200: '#9B81FF',
    300: '#7C5CFC',
    glow:'rgba(124,92,252,0.35)',
  },
  ink:     '#E6EDF7',
  inkShades: {
    50:    '#F5F8FC',
    100:   '#E6EDF7',
    200:   '#C9D8EC',
    300:   '#9BB0CC',
    muted: 'rgba(230,237,247,0.55)',
    dim:   'rgba(230,237,247,0.35)',
  },
  ember:   '#FFB84D',

  semantic: {
    success: '#00C896',
    warning: '#FFB84D',
    error:   '#FF5A5A',
    info:    '#00D4FF',
  },

  rank: {
    bronze:   '#CD7F32',
    silver:   '#A0A9BA',
    gold:     '#FFB84D',
    platinum: '#8FCDDD',
    diamond:  '#B9F2FF',
    nexora:   '#9B81FF',
  },
} as const;

// ── Typography Tokens ─────────────────────────────────────────────────────
export const typography = {
  fontFamily: {
    sans:  "'Inter', system-ui, sans-serif",
    title: "'Space Grotesk', 'Inter', sans-serif",
    mono:  "'JetBrains Mono', monospace",
  },
  fontWeight: {
    light:     300,
    normal:    400,
    medium:    500,
    semibold:  600,
    bold:      700,
    extrabold: 800,
  },
  letterSpacing: {
    tight:  '-0.03em',
    normal: '0',
    wide:   '0.04em',
    wider:  '0.08em',
    label:  '0.1em',
  },
  lineHeight: {
    none:     1,
    tight:    1.2,
    snug:     1.375,
    normal:   1.5,
    relaxed:  1.625,
    loose:    2,
  },
} as const;

// ── Spacing Tokens (8px grid) ─────────────────────────────────────────────
export const spacing = {
  0:    '0px',
  0.5:  '4px',
  1:    '8px',
  1.5:  '12px',
  2:    '16px',
  2.5:  '20px',
  3:    '24px',
  4:    '32px',
  5:    '40px',
  6:    '48px',
  7:    '56px',
  8:    '64px',
  10:   '80px',
  12:   '96px',
  16:   '128px',
  20:   '160px',
} as const;

// ── Border Radius ─────────────────────────────────────────────────────────
export const radius = {
  sm:   '4px',
  md:   '8px',
  lg:   '12px',
  xl:   '16px',
  '2xl':'20px',
  '3xl':'24px',
  full: '9999px',
  card: '16px',
  badge:'8px',
} as const;

// ── Motion Tokens ─────────────────────────────────────────────────────────
export const motion = {
  easing: {
    smooth:    'cubic-bezier(0.4, 0, 0.2, 1)',
    spring:    'cubic-bezier(0.34, 1.56, 0.64, 1)',
    decelerate:'cubic-bezier(0, 0, 0.2, 1)',
    accelerate:'cubic-bezier(0.4, 0, 1, 1)',
  },
  duration: {
    instant:     '75ms',
    fast:        '150ms',
    normal:      '250ms',
    slow:        '400ms',
    slower:      '600ms',
    xpBar:       '900ms',
    celebration: '800ms',
  },
  stagger: {
    xs:  75,
    sm:  100,
    md:  150,
    lg:  200,
  },
} as const;

// ── Shadow Tokens ─────────────────────────────────────────────────────────
export const shadows = {
  card:          '0 4px 20px rgba(0,0,0,0.5), 0 1px 4px rgba(0,0,0,0.4), inset 0 1px 0 rgba(230,237,247,0.05)',
  cardHover:     '0 8px 36px rgba(0,0,0,0.6), 0 2px 8px rgba(0,0,0,0.4), inset 0 1px 0 rgba(230,237,247,0.07)',
  glowViolet:    '0 0 20px rgba(124,92,252,0.5), 0 0 50px rgba(124,92,252,0.2)',
  glowCyan:      '0 0 20px rgba(0,212,255,0.4), 0 0 50px rgba(0,212,255,0.15)',
  glowAmber:     '0 0 20px rgba(255,184,77,0.5), 0 0 50px rgba(255,184,77,0.2)',
  glowEmerald:   '0 0 20px rgba(0,200,150,0.4), 0 0 50px rgba(0,200,150,0.15)',
  // Legacy
  glowAccent:    '0 0 20px rgba(124,92,252,0.5), 0 0 50px rgba(124,92,252,0.2)',
  glowGold:      '0 0 20px rgba(255,184,77,0.5), 0 0 50px rgba(255,184,77,0.2)',
  glowDiamond:   '0 0 20px rgba(185,242,255,0.5), 0 0 50px rgba(185,242,255,0.2)',
  btnPrimary:    '0 4px 14px rgba(124,92,252,0.45), inset 0 1px 0 rgba(255,255,255,0.18)',
} as const;

// ── Rank tier metadata ────────────────────────────────────────────────────
export const RANK_TIERS = [
  { id: 'bronze',   label: 'Bronze',       color: colors.rank.bronze,   minScore: 0,     cssClass: 'nx-rank-bronze'   },
  { id: 'silver',   label: 'Silver',       color: colors.rank.silver,   minScore: 1000,  cssClass: 'nx-rank-silver'   },
  { id: 'gold',     label: 'Gold',         color: colors.rank.gold,     minScore: 3000,  cssClass: 'nx-rank-gold'     },
  { id: 'platinum', label: 'Platinum',     color: colors.rank.platinum, minScore: 6000,  cssClass: 'nx-rank-platinum' },
  { id: 'diamond',  label: 'Diamond',      color: colors.rank.diamond,  minScore: 10000, cssClass: 'nx-rank-diamond'  },
  { id: 'nexora',   label: 'Nexora Elite', color: colors.rank.nexora,   minScore: 20000, cssClass: 'nx-rank-nexora'   },
] as const;

export type RankTierId = typeof RANK_TIERS[number]['id'];

// ── Category metadata ─────────────────────────────────────────────────────
export const CATEGORIES = [
  { id: 'science',     label: 'Science',       icon: '⚗️', color: '#00D4FF', unlockLevel: 1, desc: 'Physics, chemistry, biology, and the laws of nature.' },
  { id: 'history',     label: 'History',       icon: '🏛️', color: '#CD7F32', unlockLevel: 1, desc: 'Civilizations, conflicts, and the arc of human events.' },
  { id: 'technology',  label: 'Technology',    icon: '💻', color: '#00C896', unlockLevel: 1, desc: 'Computing, networks, software, and the digital frontier.' },
  { id: 'mathematics', label: 'Mathematics',   icon: '∑',  color: '#7C5CFC', unlockLevel: 1, desc: 'Algebra, calculus, logic, and abstract reasoning.' },
  { id: 'literature',  label: 'Literature',    icon: '📚', color: '#9BB0CC', unlockLevel: 3, desc: 'Great works, authors, and the craft of language.' },
  { id: 'geography',   label: 'Geography',     icon: '🌍', color: '#FFB84D', unlockLevel: 3, desc: 'Nations, landscapes, and the shape of the world.' },
  { id: 'logic',       label: 'Logic',         icon: '♟', color: '#8FCDDD', unlockLevel: 5, desc: 'Pure reasoning, puzzles, and formal deduction.' },
  { id: 'crypto_web3', label: 'Crypto & Web3', icon: '⟠', color: '#B9F2FF', unlockLevel: 5, desc: 'Blockchains, smart contracts, and decentralized systems.' },
] as const;

export type CategoryId = typeof CATEGORIES[number]['id'];

// ── Level thresholds ──────────────────────────────────────────────────────
export const LEVEL_THRESHOLDS = [
  0, 150, 400, 750, 1200, 1800, 2600, 3500, 4600, 6000,
] as const;

export const MAX_LEVEL = 50;

export function xpForLevel(level: number): number {
  if (level <= LEVEL_THRESHOLDS.length) return LEVEL_THRESHOLDS[level - 1];
  return Math.floor(1000 * Math.pow(level - 1, 1.6));
}

export function xpProgressPercent(currentXp: number, level: number): number {
  const currentThreshold = xpForLevel(level);
  const nextThreshold    = xpForLevel(level + 1);
  const range            = nextThreshold - currentThreshold;
  const progress         = currentXp - currentThreshold;
  return Math.min(100, Math.max(0, (progress / range) * 100));
}

// ── Logo Asset ────────────────────────────────────────────────────────────
export const LOGO_ASSET = {
  src:         '/ritual-sigil-DrwXRH6f.png',
  aspectRatio: 1,
  description: 'Nexora sigil mark',
} as const;

export const LOGO_SPECS = {
  header:    { markSize: 32, fontSize: 18, gap: 12, tint: 'default', glow: false, textVisible: true, placement: 'right' as const },
  sidebar:   { markSize: 28, fontSize: 16, gap: 10, tint: 'default', glow: false, textVisible: true, placement: 'right' as const },
  mobile:    { markSize: 24, tint: 'default', glow: false, textVisible: false },
  loading:   { markSize: 80, tint: 'violet', glow: true, animate: true, textVisible: true, placement: 'below' as const, fontSize: 28 },
  achievement:{ markSize: 40, tint: 'violet', glow: true, containerSize: 56, animate: true },
  reward:    { markSize: 48, tint: 'amber', glow: true, containerSize: 64, animate: true },
  premium:   { markSize: 36, tint: 'violet', glow: true, animate: true, pulseHalo: true },
  watermark: {
    markSize:    680,
    opacity:     0.055,
    blur:        1,
    tint:        'default',
    mixBlendMode:'screen' as const,
    pointerEvents:'none' as const,
    animated:    false,
    maxPerPage:  1,
    position:    'hero-center',
  },
} as const;

export type LogoContext = keyof typeof LOGO_SPECS;
