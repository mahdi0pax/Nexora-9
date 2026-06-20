import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import {
  Trophy, TrendingUp, TrendingDown, Minus, Crown,
  Sword, Sparkles, ChevronRight, Users, ChevronLeft,
} from 'lucide-react';
import { RANK_TIERS } from '../design-system/tokens';
import { Player, getWeeklyLeaderboard, getBossLeaderboard } from '../lib/supabase';

type Tab = 'alltime' | 'weekly' | 'boss' | 'premium';

const TABS: { id: Tab; label: string; icon: React.ReactNode }[] = [
  { id: 'alltime', label: 'All-Time',  icon: <Trophy size={14} /> },
  { id: 'weekly',  label: 'This Week', icon: <TrendingUp size={14} /> },
  { id: 'boss',    label: 'Boss Kills', icon: <Sword size={14} /> },
  { id: 'premium', label: 'Premium',   icon: <Sparkles size={14} /> },
];

interface WeeklyEntry {
  wallet_address: string;
  username: string;
  rank_tier: string;
  weekly_xp: number;
  weekly_correct: number;
}

function rankInfo(tier: string) { return RANK_TIERS.find(r => r.id === tier) ?? RANK_TIERS[0]; }

const MOVEMENT: Record<string, React.ReactNode> = {
  up:   <TrendingUp size={12} style={{ color: '#33E8B8' }} />,
  down: <TrendingDown size={12} style={{ color: '#FF6B6B' }} />,
  same: <Minus size={12} style={{ color: 'rgba(230,237,247,0.2)' }} />,
};

interface Props {
  walletAddress: string;
  allTimeLb: Player[];
  onBack: () => void;
}

export default function LeaderboardPage({ walletAddress, allTimeLb, onBack }: Props) {
  const [tab, setTab]       = useState<Tab>('alltime');
  const [weekly, setWeekly] = useState<WeeklyEntry[]>([]);
  const [bossLb, setBossLb] = useState<Player[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (tab === 'weekly' && weekly.length === 0) {
      setLoading(true);
      getWeeklyLeaderboard(25).then(d => { setWeekly(d); setLoading(false); });
    }
    if (tab === 'boss' && bossLb.length === 0) {
      setLoading(true);
      getBossLeaderboard(25).then(d => { setBossLb(d); setLoading(false); });
    }
  }, [tab]);

  const rows = tab === 'alltime' ? allTimeLb.map(p => ({ wallet: p.wallet_address, name: p.username, tier: p.rank_tier, primary: p.rank_score, secondary: `${p.total_xp.toLocaleString()} XP`, tertiary: `${Math.round(p.accuracy_rate * 100)}% acc` }))
    : tab === 'weekly'  ? weekly.map(p => ({ wallet: p.wallet_address, name: p.username, tier: p.rank_tier, primary: p.weekly_xp, secondary: `${p.weekly_correct} correct`, tertiary: '' }))
    : tab === 'boss'    ? bossLb.map(p => ({ wallet: p.wallet_address, name: p.username, tier: p.rank_tier, primary: p.boss_wins, secondary: `${p.rank_score.toLocaleString()} pts`, tertiary: `Lv ${p.level}` }))
    : allTimeLb.filter(p => p.premium_until && new Date(p.premium_until) > new Date()).map(p => ({ wallet: p.wallet_address, name: p.username, tier: p.rank_tier, primary: p.rank_score, secondary: `${p.total_xp.toLocaleString()} XP`, tertiary: 'Premium' }));

  const myPosition = rows.findIndex(r => r.wallet === walletAddress.toLowerCase()) + 1;

  return (
    <div className="p-4 md:p-6 max-w-3xl mx-auto space-y-6 pb-10">

      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="flex items-center justify-between"
      >
        <div className="flex items-start gap-3">
          <button onClick={onBack} className="nx-nav-item mt-1"><ChevronLeft size={16} /></button>
          <div>
            <div
              className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-title font-semibold tracking-widest uppercase mb-2"
              style={{ background: 'rgba(255,208,128,0.1)', border: '1px solid rgba(255,208,128,0.2)', color: '#FFD080' }}
            >
              <Trophy size={10} /> Global Rankings
            </div>
            <h1
              className="font-title font-extrabold text-3xl md:text-4xl"
              style={{ color: '#E6EDF7', letterSpacing: '-0.04em' }}
            >
              Leaderboard
            </h1>
            <p className="text-sm mt-1" style={{ color: 'rgba(230,237,247,0.4)' }}>
              Compete with players worldwide.
            </p>
          </div>
        </div>
        {myPosition > 0 && (
          <div
            className="flex items-center gap-2 px-4 py-2 rounded-xl"
            style={{ background: 'rgba(124,92,252,0.12)', border: '1px solid rgba(124,92,252,0.25)' }}
          >
            <Crown size={13} style={{ color: '#9B81FF' }} />
            <span className="font-title font-bold text-sm" style={{ color: '#9B81FF' }}>#{myPosition}</span>
          </div>
        )}
      </motion.div>

      {/* Tabs */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.1 }}
        className="flex gap-1 p-1 rounded-2xl"
        style={{ background: 'rgba(20,27,45,0.8)', border: '1px solid rgba(230,237,247,0.07)' }}
      >
        {TABS.map(t => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl text-xs font-title font-semibold transition-all"
            style={tab === t.id
              ? { background: 'rgba(124,92,252,0.18)', border: '1px solid rgba(124,92,252,0.3)', color: '#9B81FF' }
              : { color: 'rgba(230,237,247,0.4)', border: '1px solid transparent' }
            }
          >
            {t.icon}
            <span className="hidden sm:inline">{t.label}</span>
          </button>
        ))}
      </motion.div>

      {/* Top 3 podium */}
      {rows.length >= 3 && (
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15, duration: 0.4 }}
          className="grid grid-cols-3 gap-3"
        >
          {[1, 0, 2].map((pos, i) => {
            const entry = rows[pos];
            if (!entry) return null;
            const ri = rankInfo(entry.tier);
            const medals = ['#FFD080', '#9B81FF', '#CD7F32'];
            const isMe = entry.wallet === walletAddress.toLowerCase();
            return (
              <div
                key={pos}
                className="rounded-2xl flex flex-col items-center gap-2 p-4 relative overflow-hidden"
                style={{
                  background: pos === 0 ? 'linear-gradient(145deg, rgba(255,208,128,0.08), rgba(28,38,64,0.95))' : 'linear-gradient(145deg, rgba(28,38,64,0.9), rgba(20,27,45,0.95))',
                  border:     pos === 0 ? '1px solid rgba(255,208,128,0.25)' : '1px solid rgba(230,237,247,0.07)',
                }}
              >
                {pos === 0 && <div className="absolute inset-0 pointer-events-none" style={{ background: 'radial-gradient(ellipse at top, rgba(255,208,128,0.06), transparent 60%)' }} />}
                <div className="text-2xl relative z-10">{pos === 0 ? '🥇' : pos === 1 ? '🥈' : '🥉'}</div>
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center font-title font-bold text-sm relative z-10"
                  style={{ background: ri.color + '25', color: ri.color, border: `1px solid ${ri.color}30` }}
                >
                  {entry.name.slice(0, 2).toUpperCase()}
                </div>
                <div className="text-center relative z-10">
                  <div className="font-title font-bold text-xs truncate max-w-[80px]" style={{ color: isMe ? '#9B81FF' : '#E6EDF7' }}>{entry.name}</div>
                  <div className="font-title font-extrabold text-sm" style={{ color: medals[i] }}>{entry.primary.toLocaleString()}</div>
                  <div className="text-2xs" style={{ color: 'rgba(230,237,247,0.35)' }}>{entry.secondary}</div>
                </div>
              </div>
            );
          })}
        </motion.div>
      )}

      {/* Full list */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="rounded-2xl overflow-hidden"
        style={{ background: 'linear-gradient(145deg, rgba(28,38,64,0.9), rgba(20,27,45,0.95))', border: '1px solid rgba(230,237,247,0.07)' }}
      >
        <div
          className="flex items-center justify-between px-5 py-3"
          style={{ background: 'rgba(11,16,32,0.5)', borderBottom: '1px solid rgba(230,237,247,0.06)' }}
        >
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full animate-pulse" style={{ background: '#33E8B8' }} />
            <span className="text-xs" style={{ color: 'rgba(230,237,247,0.4)' }}>Live rankings · {rows.length} players</span>
          </div>
          <div className="flex items-center gap-1 text-xs" style={{ color: 'rgba(230,237,247,0.3)' }}>
            <Users size={11} /> {rows.length}
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-16">
            <div className="w-8 h-8 rounded-full border-2 animate-spin" style={{ borderColor: 'rgba(230,237,247,0.1)', borderTopColor: '#9B81FF' }} />
          </div>
        ) : rows.length === 0 ? (
          <div className="py-16 text-center">
            <Trophy size={36} className="mx-auto mb-3" style={{ color: 'rgba(230,237,247,0.15)' }} />
            <div className="text-sm" style={{ color: 'rgba(230,237,247,0.35)' }}>No entries yet for this timeframe.</div>
          </div>
        ) : (
          <div>
            {rows.map((entry, i) => {
              const isMe = entry.wallet === walletAddress.toLowerCase();
              const ri   = rankInfo(entry.tier);
              const posLabels: Record<number, string> = { 1: '🥇', 2: '🥈', 3: '🥉' };
              const movement = i < 3 ? 'up' : Math.random() > 0.6 ? 'up' : Math.random() > 0.5 ? 'down' : 'same';

              return (
                <motion.div
                  key={entry.wallet}
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.03 }}
                  className="flex items-center gap-4 px-5 py-3.5"
                  style={{
                    background:   isMe ? 'rgba(124,92,252,0.08)' : 'transparent',
                    borderBottom: i < rows.length - 1 ? '1px solid rgba(230,237,247,0.04)' : 'none',
                  }}
                >
                  <div className="w-7 text-center flex-shrink-0">
                    {posLabels[i + 1] ? (
                      <span className="text-base">{posLabels[i + 1]}</span>
                    ) : (
                      <span className="font-title font-bold text-sm" style={{ color: 'rgba(230,237,247,0.3)' }}>{i + 1}</span>
                    )}
                  </div>
                  <div
                    className="w-8 h-8 rounded-xl flex items-center justify-center text-xs font-title font-bold flex-shrink-0"
                    style={{ background: ri.color + '22', color: ri.color }}
                  >
                    {entry.name.slice(0, 2).toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-title font-semibold text-sm truncate" style={{ color: isMe ? '#9B81FF' : '#E6EDF7' }}>
                      {entry.name}{isMe && <span className="text-xs ml-1" style={{ color: '#9B81FF' }}>(you)</span>}
                    </div>
                    <div className="flex items-center gap-2 text-2xs">
                      <span style={{ color: ri.color }}>{ri.label}</span>
                      {entry.tertiary && <><span style={{ color: 'rgba(230,237,247,0.2)' }}>·</span><span style={{ color: 'rgba(230,237,247,0.35)' }}>{entry.tertiary}</span></>}
                    </div>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    {MOVEMENT[movement]}
                    <div className="text-right">
                      <div className="font-title font-extrabold text-sm" style={{ color: '#E6EDF7' }}>{entry.primary.toLocaleString()}</div>
                      <div className="text-2xs" style={{ color: 'rgba(230,237,247,0.35)' }}>{entry.secondary}</div>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}

        {!loading && myPosition === 0 && (
          <div className="px-5 py-4" style={{ background: 'rgba(124,92,252,0.05)', borderTop: '1px solid rgba(124,92,252,0.1)' }}>
            <div className="flex items-center gap-3 text-sm" style={{ color: 'rgba(230,237,247,0.5)' }}>
              <ChevronRight size={14} />
              <span>You are not yet ranked. Play more challenges to appear!</span>
            </div>
          </div>
        )}
      </motion.div>
    </div>
  );
}
