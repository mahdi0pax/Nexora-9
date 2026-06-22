import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard, Trophy, ShoppingBag, User, Award, Settings,
  ChevronRight, Menu, X, Zap, Flame, Crown, LogOut,
  Sparkles, Swords, Gem, Compass, Brain, ScrollText, BookOpen,
} from 'lucide-react';
import { NexoraMark, NexoraWordmark } from '../design-system/Logo';
import { Player } from '../lib/supabase';
import { rankInfo } from '../lib/constants';

export type AppScreen =
  | 'dashboard' | 'category_select' | 'challenge_start' | 'playing' | 'complete'
  | 'leaderboard' | 'shop' | 'profile' | 'achievements' | 'settings'
  | 'daily_spin' | 'premium_league' | 'boss_challenge'
  | 'oracle' | 'mentor' | 'weekly_report' | 'lore';

interface AppShellProps {
  player: Player | null;
  walletAddress: string | null;
  currentScreen: AppScreen;
  children: React.ReactNode;
  onNavigate: (screen: AppScreen) => void;
  onDisconnect: () => void;
}

/* ── Navigation structure ─────────────────────────────────────────────── */

interface NavGroup {
  label?: string;
  items: { id: AppScreen; label: string; icon: React.ReactNode; badge?: string }[];
}

const NAV_GROUPS: NavGroup[] = [
  {
    items: [
      { id: 'dashboard',    label: 'Dashboard',    icon: <LayoutDashboard size={18} /> },
    ],
  },
  {
    label: 'Play',
    items: [
      { id: 'category_select', label: 'Categories',     icon: <Compass size={18} /> },
      { id: 'boss_challenge',  label: 'Boss Challenge', icon: <Swords size={18} /> },
      { id: 'daily_spin',      label: 'Daily Spin',     icon: <Sparkles size={18} /> },
    ],
  },
  {
    label: 'Compete',
    items: [
      { id: 'leaderboard',    label: 'Leaderboard',    icon: <Trophy size={18} /> },
      { id: 'premium_league', label: 'Premium League', icon: <Gem size={18} /> },
    ],
  },
  {
    label: 'Social',
    items: [
      { id: 'profile',      label: 'Profile',      icon: <User size={18} /> },
      { id: 'achievements', label: 'Achievements', icon: <Award size={18} /> },
    ],
  },
  {
    label: 'Learn',
    items: [
      { id: 'oracle',       label: 'Oracle',       icon: <Brain size={18} /> },
      { id: 'mentor',       label: 'Mentor',       icon: <BookOpen size={18} /> },
      { id: 'weekly_report',label: 'Weekly Report',icon: <ScrollText size={18} /> },
      { id: 'lore',         label: 'Lore',         icon: <ScrollText size={18} /> },
    ],
  },
  {
    label: 'Economy',
    items: [
      { id: 'shop',         label: 'Shop',         icon: <ShoppingBag size={18} /> },
    ],
  },
];



function abbrev(addr: string) {
  return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
}

const GAMEPLAY_SCREENS: AppScreen[] = ['category_select', 'challenge_start', 'playing', 'complete'];

export default function AppShell({ player, walletAddress, currentScreen, children, onNavigate, onDisconnect }: AppShellProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [collapsed,   setCollapsed]   = useState(false);
  const isGameplay = GAMEPLAY_SCREENS.includes(currentScreen);
  const rank = player ? rankInfo(player.rank_tier) : rankInfo('bronze');
  const xpPct = player ? Math.min(100, player.current_xp > 0 ? (player.current_xp / (player.level * 200 + 800)) * 100 : 0) : 0;

  useEffect(() => { setSidebarOpen(false); }, [currentScreen]);

  useEffect(() => {
    const fn = (e: KeyboardEvent) => { if (e.key === 'Escape') setSidebarOpen(false); };
    window.addEventListener('keydown', fn);
    return () => window.removeEventListener('keydown', fn);
  }, []);

  if (isGameplay || !player || !walletAddress) return <>{children}</>;

  return (
    <div className="min-h-screen flex" style={{ background: '#0B1020' }}>
      {/* Mobile overlay */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-40 lg:hidden"
            style={{ background: 'rgba(11,16,32,0.8)', backdropFilter: 'blur(4px)' }}
            onClick={() => setSidebarOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* Mobile sidebar drawer */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.aside
            initial={{ x: -280 }} animate={{ x: 0 }} exit={{ x: -280 }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            className="fixed left-0 top-0 bottom-0 z-50 w-72 lg:hidden flex flex-col"
            style={{ background: '#141B2D', borderRight: '1px solid rgba(124,92,252,0.15)' }}
          >
            <SidebarContent
              player={player}
              walletAddress={walletAddress}
              currentScreen={currentScreen}
              rank={rank}
              xpPct={xpPct}
              collapsed={false}
              onNavigate={onNavigate}
              onDisconnect={onDisconnect}
              onClose={() => setSidebarOpen(false)}
              showClose
            />
          </motion.aside>
        )}
      </AnimatePresence>

      {/* Desktop sidebar */}
      <motion.aside
        animate={{ width: collapsed ? 72 : 256 }}
        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
        className="hidden lg:flex flex-col flex-shrink-0 sticky top-0 h-screen overflow-hidden"
        style={{ background: '#141B2D', borderRight: '1px solid rgba(124,92,252,0.12)' }}
      >
        <SidebarContent
          player={player}
          walletAddress={walletAddress}
          currentScreen={currentScreen}
          rank={rank}
          xpPct={xpPct}
          collapsed={collapsed}
          onNavigate={onNavigate}
          onDisconnect={onDisconnect}
          onToggleCollapse={() => setCollapsed(c => !c)}
        />
      </motion.aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top bar */}
        <header
          className="sticky top-0 z-30 flex items-center justify-between px-4 md:px-6 h-16 flex-shrink-0"
          style={{ background: 'rgba(20,27,45,0.92)', backdropFilter: 'blur(12px)', borderBottom: '1px solid rgba(124,92,252,0.1)' }}
        >
          {/* Mobile: hamburger + logo */}
          <div className="flex items-center gap-3 lg:hidden">
            <button
              onClick={() => setSidebarOpen(true)}
              className="w-9 h-9 rounded-xl flex items-center justify-center transition-colors"
              style={{ background: 'rgba(28,38,64,0.8)', border: '1px solid rgba(230,237,247,0.08)', color: 'rgba(230,237,247,0.6)' }}
            >
              <Menu size={18} />
            </button>
            <NexoraWordmark size={24} tint="default" showText textPlacement="right" />
          </div>

          {/* Desktop: page title */}
          <div className="hidden lg:flex items-center gap-2">
            <span className="font-title font-semibold text-sm" style={{ color: 'rgba(230,237,247,0.4)' }}>
              {pageTitle(currentScreen)}
            </span>
          </div>

          {/* Right side: wallet + streak + level */}
          <div className="flex items-center gap-2 md:gap-3">
            {player.streak_days > 0 && (
              <div
                className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-title font-bold"
                style={{ background: 'rgba(0,200,150,0.1)', border: '1px solid rgba(0,200,150,0.2)', color: '#00C896' }}
              >
                <Flame size={12} />
                {player.streak_days}
              </div>
            )}
            <div
              className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-title font-bold"
              style={{ background: 'rgba(124,92,252,0.1)', border: '1px solid rgba(124,92,252,0.2)', color: '#7C5CFC' }}
            >
              <Zap size={12} />
              Lv {player.level}
            </div>
            <div
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-mono"
              style={{ background: 'rgba(28,38,64,0.8)', border: '1px solid rgba(230,237,247,0.08)', color: 'rgba(230,237,247,0.5)' }}
            >
              {abbrev(walletAddress)}
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentScreen}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2, ease: 'easeOut' }}
            >
              {children}
            </motion.div>
          </AnimatePresence>
        </main>
      </div>
    </div>
  );
}

/* ── Helpers ──────────────────────────────────────────────────────────── */

function pageTitle(screen: AppScreen): string {
  for (const g of NAV_GROUPS) {
    const item = g.items.find(i => i.id === screen);
    if (item) return item.label;
  }
  return 'Nexora';
}

/* ── Sidebar content ──────────────────────────────────────────────────── */

interface SidebarContentProps {
  player: Player;
  walletAddress: string;
  currentScreen: AppScreen;
  rank: ReturnType<typeof rankInfo>;
  xpPct: number;
  collapsed: boolean;
  onNavigate: (screen: AppScreen) => void;
  onDisconnect: () => void;
  onClose?: () => void;
  onToggleCollapse?: () => void;
  showClose?: boolean;
}

function SidebarContent({
  player, walletAddress, currentScreen, rank, xpPct, collapsed,
  onNavigate, onDisconnect, onClose, onToggleCollapse, showClose,
}: SidebarContentProps) {
  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* Logo row */}
      <div
        className="flex items-center justify-between px-4 h-16 flex-shrink-0"
        style={{ borderBottom: '1px solid rgba(124,92,252,0.1)' }}
      >
        <div className="overflow-hidden">
          {collapsed ? (
            <NexoraMark size={28} tint="default" />
          ) : (
            <NexoraWordmark size={28} tint="default" showText textPlacement="right" />
          )}
        </div>
        {showClose && (
          <button onClick={onClose} className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ color: 'rgba(230,237,247,0.4)' }}>
            <X size={16} />
          </button>
        )}
        {onToggleCollapse && (
          <button
            onClick={onToggleCollapse}
            className="w-7 h-7 rounded-lg flex items-center justify-center transition-colors hover:bg-white/5"
            style={{ color: 'rgba(230,237,247,0.3)' }}
          >
            <motion.div animate={{ rotate: collapsed ? 0 : 180 }} transition={{ duration: 0.3 }}>
              <ChevronRight size={15} />
            </motion.div>
          </button>
        )}
      </div>

      {/* Player card */}
      <AnimatePresence>
        {!collapsed && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="mx-3 mt-4 mb-3 p-3 rounded-2xl flex-shrink-0"
            style={{ background: 'rgba(28,38,64,0.7)', border: '1px solid rgba(124,92,252,0.15)' }}
          >
            <div className="flex items-center gap-3 mb-3">
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center text-sm font-title font-extrabold flex-shrink-0"
                style={{ background: 'linear-gradient(135deg, rgba(124,92,252,0.4), rgba(0,212,255,0.2))', border: '1px solid rgba(124,92,252,0.4)', color: '#E6EDF7' }}
              >
                {walletAddress.slice(2, 4).toUpperCase()}
              </div>
              <div className="min-w-0">
                <div className="font-mono text-xs truncate" style={{ color: 'rgba(230,237,247,0.5)' }}>
                  {walletAddress.slice(0, 6)}...{walletAddress.slice(-4)}
                </div>
                <div className={`nx-rank ${rank.cssClass} mt-0.5`} style={{ fontSize: '0.65rem', padding: '2px 7px' }}>
                  <Crown size={8} /> {rank.label}
                </div>
              </div>
            </div>
            <div className="space-y-1">
              <div className="flex items-center justify-between text-2xs">
                <span className="font-title font-semibold" style={{ color: '#9B81FF' }}>Level {player.level}</span>
                <span style={{ color: 'rgba(230,237,247,0.35)' }}>{player.current_xp.toLocaleString()} XP</span>
              </div>
              <div className="rounded-full overflow-hidden" style={{ height: '4px', background: 'rgba(11,16,32,0.8)' }}>
                <motion.div
                  className="h-full rounded-full"
                  initial={{ width: 0 }}
                  animate={{ width: `${xpPct}%` }}
                  transition={{ duration: 1, ease: 'easeOut', delay: 0.3 }}
                  style={{ background: 'linear-gradient(90deg, #7C5CFC, #00D4FF)' }}
                />
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Collapsed avatar */}
      {collapsed && (
        <div className="flex justify-center mt-4 mb-3 flex-shrink-0">
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center text-sm font-title font-extrabold"
            style={{ background: 'linear-gradient(135deg, rgba(124,92,252,0.4), rgba(0,212,255,0.2))', border: '1px solid rgba(124,92,252,0.4)', color: '#E6EDF7' }}
          >
            {walletAddress.slice(2, 4).toUpperCase()}
          </div>
        </div>
      )}

      {/* Navigation groups */}
      <nav className="flex-1 overflow-y-auto px-3 py-2 space-y-4">
        {NAV_GROUPS.map((group, gIdx) => (
          <div key={gIdx}>
            {!collapsed && group.label && (
              <div className="px-3 mb-1.5 text-2xs font-title font-semibold uppercase tracking-wider" style={{ color: 'rgba(230,237,247,0.2)' }}>
                {group.label}
              </div>
            )}
            <div className="space-y-0.5">
              {group.items.map(item => {
                const active = currentScreen === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => onNavigate(item.id)}
                    className="w-full flex items-center gap-3 rounded-xl transition-all duration-200 group relative overflow-hidden"
                    style={{
                      padding: collapsed ? '10px' : '10px 12px',
                      justifyContent: collapsed ? 'center' : 'flex-start',
                      background: active ? 'rgba(124,92,252,0.15)' : 'transparent',
                      border: active ? '1px solid rgba(124,92,252,0.25)' : '1px solid transparent',
                      color: active ? '#9B81FF' : 'rgba(230,237,247,0.45)',
                    }}
                    onMouseEnter={e => {
                      if (!active) {
                        (e.currentTarget as HTMLElement).style.background = 'rgba(28,38,64,0.7)';
                        (e.currentTarget as HTMLElement).style.color = 'rgba(230,237,247,0.8)';
                      }
                    }}
                    onMouseLeave={e => {
                      if (!active) {
                        (e.currentTarget as HTMLElement).style.background = 'transparent';
                        (e.currentTarget as HTMLElement).style.color = 'rgba(230,237,247,0.45)';
                      }
                    }}
                  >
                    {active && (
                      <motion.div
                        layoutId="nav-active"
                        className="absolute inset-0 rounded-xl"
                        style={{ background: 'rgba(124,92,252,0.08)' }}
                        transition={{ type: 'spring', stiffness: 400, damping: 35 }}
                      />
                    )}
                    <span className="relative z-10 flex-shrink-0">{item.icon}</span>
                    <AnimatePresence>
                      {!collapsed && (
                        <motion.span
                          initial={{ opacity: 0, width: 0 }}
                          animate={{ opacity: 1, width: 'auto' }}
                          exit={{ opacity: 0, width: 0 }}
                          transition={{ duration: 0.2 }}
                          className="relative z-10 font-title font-medium text-sm whitespace-nowrap overflow-hidden"
                        >
                          {item.label}
                        </motion.span>
                      )}
                    </AnimatePresence>
                    {!collapsed && item.badge && (
                      <span className="relative z-10 ml-auto text-2xs font-bold px-1.5 py-0.5 rounded-md" style={{ background: 'rgba(124,92,252,0.2)', color: '#9B81FF' }}>
                        {item.badge}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        ))}

        {/* Settings at bottom of nav */}
        <div className="pt-2" style={{ borderTop: '1px solid rgba(124,92,252,0.08)' }}>
          <button
            onClick={() => onNavigate('settings')}
            className="w-full flex items-center gap-3 rounded-xl transition-all duration-200"
            style={{
              padding: collapsed ? '10px' : '10px 12px',
              justifyContent: collapsed ? 'center' : 'flex-start',
              background: currentScreen === 'settings' ? 'rgba(124,92,252,0.15)' : 'transparent',
              border: currentScreen === 'settings' ? '1px solid rgba(124,92,252,0.25)' : '1px solid transparent',
              color: currentScreen === 'settings' ? '#9B81FF' : 'rgba(230,237,247,0.3)',
            }}
          >
            <Settings size={18} />
            {!collapsed && <span className="font-title font-medium text-sm">Settings</span>}
          </button>
        </div>
      </nav>

      {/* Bottom: RITUAL balance + disconnect */}
      <div className="px-3 pb-4 flex-shrink-0 space-y-2" style={{ borderTop: '1px solid rgba(124,92,252,0.1)', paddingTop: '12px' }}>
        <AnimatePresence>
          {!collapsed && (
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="flex items-center justify-between px-3 py-2.5 rounded-xl"
              style={{ background: 'rgba(255,184,77,0.07)', border: '1px solid rgba(255,184,77,0.15)' }}
            >
              <div className="flex items-center gap-2">
                <Zap size={13} style={{ color: '#FFB84D' }} />
                <span className="text-xs font-title font-semibold" style={{ color: 'rgba(230,237,247,0.5)' }}>RITUAL</span>
              </div>
              <span className="font-title font-bold text-sm" style={{ color: '#FFD080' }}>
                {(player.ritual_balance ?? 0).toFixed(3)}
              </span>
            </motion.div>
          )}
        </AnimatePresence>

        <button
          onClick={onDisconnect}
          className="w-full flex items-center gap-2.5 rounded-xl transition-all duration-200 group"
          style={{
            padding: collapsed ? '10px' : '10px 12px',
            justifyContent: collapsed ? 'center' : 'flex-start',
            color: 'rgba(230,237,247,0.25)',
          }}
          onMouseEnter={e => { (e.currentTarget as HTMLElement).style.color = '#FF6B6B'; }}
          onMouseLeave={e => { (e.currentTarget as HTMLElement).style.color = 'rgba(230,237,247,0.25)'; }}
        >
          <LogOut size={15} />
          {!collapsed && <span className="font-title font-medium text-sm">Disconnect</span>}
        </button>
      </div>
    </div>
  );
}
