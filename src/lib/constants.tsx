import {
  User, Zap, Flame, Crown, Target, Globe, Package, Shield, Sword,
  BarChart3, CheckCircle2, Star, Trophy,
  FlaskConical, Clock, Cpu, Calculator, BookOpen, Lightbulb, Bitcoin,
  Gift,
} from 'lucide-react';
import { RANK_TIERS } from '../design-system/tokens';

// ── Category Icons (size-agnostic mapping — pages set their own size) ─────
export function CategoryIcon({ id, size = 20 }: { id: string; size?: number }) {
  const icons: Record<string, React.ReactNode> = {
    science:     <FlaskConical size={size} />,
    history:     <Clock size={size} />,
    technology:  <Cpu size={size} />,
    mathematics: <Calculator size={size} />,
    literature:  <BookOpen size={size} />,
    geography:   <Globe size={size} />,
    logic:       <Lightbulb size={size} />,
    crypto_web3: <Bitcoin size={size} />,
  };
  return <>{icons[id] ?? null}</>;
}

// ── Shop Category Icons ───────────────────────────────────────────────────
export function ShopCatIcon({ id, size = 22 }: { id: string; size?: number }) {
  const icons: Record<string, React.ReactNode> = {
    boost:      <Zap size={size} />,
    protection: <Shield size={size} />,
    utility:    <Star size={size} />,
    access:     <Sword size={size} />,
    crate:      <Gift size={size} />,
  };
  return <>{icons[id] ?? null}</>;
}

// ── Achievement Metadata (single source of truth) ─────────────────────────
export interface AchievementMeta {
  label: string;
  icon: React.ReactNode;
  color: string;
  desc: string;
  category: string;
}

export const ACHIEVEMENT_META: Record<string, AchievementMeta> = {
  first_login:        { label: 'First Login',      icon: <User size={22} />,         color: '#33DEFF', desc: 'Connected your wallet for the first time.',            category: 'Milestone' },
  first_correct:      { label: 'First Answer',     icon: <CheckCircle2 size={22} />, color: '#33E8B8', desc: 'Got your first correct answer.',                      category: 'Milestone' },
  first_spin:         { label: 'First Spin',       icon: <Crown size={22} />,        color: '#FFD080', desc: 'Tried the Daily Spin for the first time.',             category: 'Milestone' },
  streak_3:           { label: '3-Day Streak',     icon: <Flame size={22} />,        color: '#FFB84D', desc: 'Maintained a 3-day activity streak.',                  category: 'Streak' },
  streak_7:           { label: '7-Day Streak',     icon: <Flame size={22} />,        color: '#FF7A50', desc: 'Maintained a 7-day activity streak.',                  category: 'Streak' },
  level_5:            { label: 'Level 5',          icon: <Zap size={22} />,          color: '#9B81FF', desc: 'Reached Level 5 on Nexora.',                          category: 'Progress' },
  level_10:           { label: 'Level 10',         icon: <Zap size={22} />,          color: '#7C5CFC', desc: 'Reached Level 10 on Nexora.',                         category: 'Progress' },
  level_20:           { label: 'Level 20',         icon: <Crown size={22} />,        color: '#FFD080', desc: 'Reached Level 20 — true Nexora veteran.',             category: 'Progress' },
  correct_10:         { label: '10 Correct',       icon: <Target size={22} />,       color: '#33DEFF', desc: 'Answered 10 questions correctly in total.',           category: 'Knowledge' },
  correct_50:         { label: '50 Correct',       icon: <Target size={22} />,       color: '#00D4FF', desc: 'Answered 50 questions correctly in total.',           category: 'Knowledge' },
  categories_3:       { label: '3 Categories',     icon: <Globe size={22} />,        color: '#33E8B8', desc: 'Played challenges in 3 different knowledge domains.', category: 'Knowledge' },
  first_purchase:     { label: 'First Purchase',   icon: <Package size={22} />,      color: '#FFB84D', desc: 'Made your first item purchase from the shop.',        category: 'Economy' },
  xp_boost_used:      { label: 'XP Boosted',       icon: <Zap size={22} />,          color: '#9B81FF', desc: 'Activated an XP Boost item.',                         category: 'Economy' },
  streak_shield_used: { label: 'Shield Used',      icon: <Shield size={22} />,       color: '#33E8B8', desc: 'Used a Streak Shield to protect your streak.',        category: 'Economy' },
  boss_participated:  { label: 'Boss Fighter',     icon: <Sword size={22} />,        color: '#B9F2FF', desc: 'Participated in a Boss Challenge.',                   category: 'Combat' },
  rank_gold:          { label: 'Gold Rank',        icon: <Trophy size={22} />,       color: '#FFD080', desc: 'Reached Gold rank tier on the leaderboard.',          category: 'Rank' },
  top10_weekly:       { label: 'Top 10 Weekly',    icon: <BarChart3 size={22} />,    color: '#9B81FF', desc: 'Appeared in the Top 10 Weekly Leaderboard.',          category: 'Rank' },
};

export const ACHIEVEMENT_CATEGORIES = ['Milestone', 'Progress', 'Streak', 'Knowledge', 'Combat', 'Rank', 'Economy'] as const;

// ── Rank helper (single source of truth) ──────────────────────────────────
export function rankInfo(tier: string) {
  return RANK_TIERS.find(r => r.id === tier) ?? RANK_TIERS[0];
}

// ── Difficulty label from player level ────────────────────────────────────
export const DIFFICULTY_LABELS = ['Beginner','Beginner','Easy','Easy','Medium','Medium','Hard','Hard','Expert','Expert','Elite'];

export function levelToDifficulty(level: number) {
  if (level <= 3) return 'Easy';
  if (level <= 6) return 'Medium';
  if (level <= 8) return 'Hard';
  return 'Expert';
}

// ── XP mapping ────────────────────────────────────────────────────────────
export const XP_BY_DIFFICULTY: Record<string, number> = {
  easy:      50,
  medium:    100,
  hard:      175,
  expert:    275,
  very_hard: 275,
};

// ── Rarity styles for shop ────────────────────────────────────────────────
export const RARITY_STYLES: Record<string, { color: string; label: string; bg: string; border: string }> = {
  common:    { color: '#B0C4DE', label: 'Common',    bg: 'rgba(176,196,222,0.07)', border: 'rgba(176,196,222,0.15)' },
  uncommon:  { color: '#33E8B8', label: 'Uncommon',  bg: 'rgba(0,200,150,0.08)',   border: 'rgba(0,200,150,0.25)' },
  rare:      { color: '#33DEFF', label: 'Rare',      bg: 'rgba(0,212,255,0.08)',   border: 'rgba(0,212,255,0.25)' },
  epic:      { color: '#9B81FF', label: 'Epic',      bg: 'rgba(124,92,252,0.1)',   border: 'rgba(124,92,252,0.3)' },
  legendary: { color: '#FFD080', label: 'Legendary', bg: 'rgba(255,208,128,0.08)', border: 'rgba(255,208,128,0.25)' },
};

export function getRarityStyle(rarity: string) {
  return RARITY_STYLES[rarity] ?? RARITY_STYLES.common;
}
