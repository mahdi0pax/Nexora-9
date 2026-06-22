import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Zap, Flame, Trophy, Crown, Target, BarChart3,
  CheckCircle2, Sword, ChevronRight, Package,
} from 'lucide-react';
import { CATEGORIES } from '../design-system/tokens';
import { Player, CategoryMastery, ChallengeSession, Achievement, InventoryItem } from '../lib/supabase';
import { CategoryIcon, ACHIEVEMENT_META, rankInfo } from '../lib/constants';

type ProfileTab = 'overview' | 'history' | 'inventory';

interface Props {
  player:    Player;
  mastery:   CategoryMastery[];
  sessions:  ChallengeSession[];
  achievements: Achievement[];
  inventory: InventoryItem[];
  walletAddress: string;
  onGoToAchievements: () => void;
}

const cardVariants = {
  hidden:  { opacity: 0, y: 16 },
  visible: (i: number) => ({ opacity: 1, y: 0, transition: { duration: 0.4, delay: i * 0.05 } }),
};

export default function ProfilePage({ player, mastery, sessions, achievements, inventory, walletAddress, onGoToAchievements }: Props) {
  const [tab, setTab] = useState<ProfileTab>('overview');
  const rank          = rankInfo(player.rank_tier);
  const thresholds    = [0,150,400,750,1200,1800,2600,3500,4600,6000];
  const lv            = player.level;
  const start         = lv <= thresholds.length ? thresholds[lv-1] ?? 0 : Math.floor(1000*Math.pow(lv-1,1.6));
  const end           = (lv+1) <= thresholds.length ? thresholds[lv] ?? 0 : Math.floor(1000*Math.pow(lv,1.6));
  const xpPct         = Math.min(100, Math.round((player.current_xp/(end-start))*100));
  const unlockedSet   = new Set(achievements.map(a => a.achievement_id));

  return (
    <div className="p-4 md:p-6 max-w-4xl mx-auto space-y-6 pb-10">

      {/* Profile hero */}
      <motion.div
        initial={{ opacity: 0, y: -12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="rounded-2xl p-6 relative overflow-hidden"
        style={{
          background: 'linear-gradient(145deg, rgba(28,38,64,0.95), rgba(20,27,45,0.98))',
          border: `1px solid ${rank.color}25`,
          boxShadow: `0 0 60px ${rank.color}08`,
        }}
      >
        <div
          className="absolute top-0 right-0 w-80 h-80 rounded-full pointer-events-none"
          style={{ background: `radial-gradient(circle, ${rank.color}10, transparent 70%)`, transform: 'translate(30%,-30%)' }}
        />
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6 relative z-10">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: 'spring', stiffness: 300, damping: 20, delay: 0.1 }}
            className="w-20 h-20 rounded-3xl flex items-center justify-center font-title font-extrabold text-3xl flex-shrink-0"
            style={{
              background:  `linear-gradient(135deg, ${rank.color}28, rgba(28,38,64,0.9))`,
              border:      `2px solid ${rank.color}50`,
              color:       rank.color,
              boxShadow:   `0 0 30px ${rank.color}25`,
            }}
          >
            {player.username.slice(0,2).toUpperCase()}
          </motion.div>

          <div className="flex-1 space-y-3">
            <div className="flex flex-wrap items-center gap-3">
              <h1
                className="font-title font-extrabold text-2xl"
                style={{ color: '#E6EDF7', letterSpacing: '-0.03em' }}
              >
                {player.username}
              </h1>
              <div
                className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-title font-semibold"
                style={{ background: `${rank.color}18`, border: `1px solid ${rank.color}35`, color: rank.color }}
              >
                <Crown size={11} /> {rank.label}
              </div>
            </div>
            <div className="font-mono text-xs" style={{ color: 'rgba(230,237,247,0.25)' }}>
              {walletAddress.slice(0,14)}...{walletAddress.slice(-8)}
            </div>
            <div className="space-y-1.5">
              <div className="flex justify-between items-center text-xs">
                <span style={{ color: 'rgba(230,237,247,0.4)' }}>Level {player.level} → {player.level+1}</span>
                <span className="font-title font-semibold" style={{ color: '#9B81FF' }}>{player.current_xp} / {end-start} XP</span>
              </div>
              <div className="rounded-full overflow-hidden" style={{ height: 6, background: 'rgba(20,27,45,0.8)' }}>
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${xpPct}%` }}
                  transition={{ duration: 1.2, ease: [0.34, 1.56, 0.64, 1] }}
                  className="h-full rounded-full"
                  style={{ background: `linear-gradient(90deg, #7C5CFC, #9B81FF)` }}
                />
              </div>
            </div>
          </div>

          <div className="text-right flex-shrink-0">
            <div className="font-title font-extrabold text-3xl leading-none" style={{ color: rank.color }}>{player.rank_score.toLocaleString()}</div>
            <div className="text-xs mt-1" style={{ color: 'rgba(230,237,247,0.35)' }}>Rank Score</div>
            <div className="text-xs mt-0.5" style={{ color: 'rgba(230,237,247,0.25)' }}>
              Joined {new Date(player.created_at).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
            </div>
          </div>
        </div>
      </motion.div>

      {/* Tabs */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.15 }}
        className="flex gap-1 p-1 rounded-2xl"
        style={{ background: 'rgba(20,27,45,0.8)', border: '1px solid rgba(230,237,247,0.07)' }}
      >
        {(['overview','history','inventory'] as ProfileTab[]).map(t => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className="flex-1 py-2 rounded-xl text-xs font-title font-semibold capitalize transition-all"
            style={tab === t
              ? { background: 'rgba(124,92,252,0.18)', border: '1px solid rgba(124,92,252,0.3)', color: '#9B81FF' }
              : { color: 'rgba(230,237,247,0.4)', border: '1px solid transparent' }
            }
          >
            {t}
          </button>
        ))}
      </motion.div>

      {/* Tab content */}
      <AnimatePresence mode="wait">

        {/* Overview */}
        {tab === 'overview' && (
          <motion.div
            key="overview"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.25 }}
            className="space-y-5"
          >
            {/* Stats grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {[
                { label: 'Total XP',     value: player.total_xp.toLocaleString(),           color: '#9B81FF', icon: <Zap size={15} /> },
                { label: 'Accuracy',     value: `${Math.round(player.accuracy_rate*100)}%`,  color: '#33E8B8', icon: <Target size={15} /> },
                { label: 'Correct',      value: player.total_correct.toLocaleString(),       color: '#33DEFF', icon: <CheckCircle2 size={15} /> },
                { label: 'Streak',       value: `${player.streak_days}d`,                    color: '#FFB84D', icon: <Flame size={15} /> },
                { label: 'Total Played', value: player.total_answered.toLocaleString(),      color: '#FFD080', icon: <BarChart3 size={15} /> },
                { label: 'Boss Wins',    value: player.boss_wins.toString(),                 color: '#B9F2FF', icon: <Sword size={15} /> },
                { label: 'Achievements', value: `${achievements.length}/17`,                 color: '#FFD080', icon: <Trophy size={15} /> },
                { label: 'Items Owned',  value: inventory.length.toString(),                 color: '#E6EDF7', icon: <Package size={15} /> },
              ].map((s, i) => (
                <motion.div
                  key={i}
                  custom={i}
                  variants={cardVariants}
                  initial="hidden"
                  animate="visible"
                  className="rounded-2xl p-4 flex flex-col gap-2"
                  style={{
                    background: 'linear-gradient(145deg, rgba(28,38,64,0.9), rgba(20,27,45,0.95))',
                    border: '1px solid rgba(230,237,247,0.07)',
                  }}
                >
                  <div style={{ color: s.color }}>{s.icon}</div>
                  <div className="font-title font-extrabold text-xl leading-none" style={{ color: '#E6EDF7', letterSpacing: '-0.03em' }}>{s.value}</div>
                  <div className="text-2xs" style={{ color: 'rgba(230,237,247,0.4)' }}>{s.label}</div>
                </motion.div>
              ))}
            </div>

            {/* Category mastery */}
            <div className="space-y-3">
              <h3 className="font-title font-bold text-base" style={{ color: '#E6EDF7' }}>Category Mastery</h3>
              <div className="rounded-2xl overflow-hidden" style={{ background: 'linear-gradient(145deg, rgba(28,38,64,0.9), rgba(20,27,45,0.95))', border: '1px solid rgba(230,237,247,0.07)' }}>
                {CATEGORIES.map((cat, i) => {
                  const m       = mastery.find(x => x.category_id === cat.id);
                  const locked  = cat.unlockLevel > player.level;
                  const mastLvl = m?.mastery_level ?? 0;
                  const acc     = m && m.total_answered > 0 ? Math.round((m.total_correct/m.total_answered)*100) : 0;
                  const mastPct = m ? Math.min(100, Math.round((((m.mastery_xp ?? 0) % 500) / 500) * 100)) : 0;
                  return (
                    <div
                      key={cat.id}
                      className="flex items-center gap-4 px-5 py-3.5"
                      style={{
                        opacity: locked ? 0.4 : 1,
                        borderBottom: i < CATEGORIES.length - 1 ? '1px solid rgba(230,237,247,0.04)' : 'none',
                      }}
                    >
                      <div
                        className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
                        style={{ background: `${cat.color}18`, border: `1px solid ${cat.color}28`, color: cat.color }}
                      >
                        <CategoryIcon id={cat.id} size={16} />
                      </div>
                      <div className="flex-1 min-w-0 space-y-1">
                        <div className="flex items-center justify-between">
                          <span className="font-title font-semibold text-sm" style={{ color: '#E6EDF7' }}>{cat.label}</span>
                          <span className="text-xs font-title font-bold" style={{ color: locked ? 'rgba(230,237,247,0.3)' : cat.color }}>
                            {locked ? `Lv ${cat.unlockLevel}` : mastLvl > 0 ? `Mastery ${mastLvl}` : 'Unplayed'}
                          </span>
                        </div>
                        {!locked && (
                          <div className="rounded-full overflow-hidden" style={{ height: 3, background: 'rgba(11,16,32,0.8)' }}>
                            <motion.div
                              initial={{ width: 0 }}
                              animate={{ width: `${mastPct}%` }}
                              transition={{ duration: 0.8, delay: i * 0.04 + 0.3 }}
                              className="h-full rounded-full"
                              style={{ background: `linear-gradient(90deg, ${cat.color}70, ${cat.color})` }}
                            />
                          </div>
                        )}
                      </div>
                      {!locked && m && (
                        <div className="text-right flex-shrink-0">
                          <div className="text-xs font-title font-bold" style={{ color: '#E6EDF7' }}>{acc}%</div>
                          <div className="text-2xs" style={{ color: 'rgba(230,237,247,0.35)' }}>{m.total_answered} played</div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Achievements preview */}
            <div
              className="rounded-2xl p-5 space-y-4"
              style={{ background: 'linear-gradient(145deg, rgba(28,38,64,0.9), rgba(20,27,45,0.95))', border: '1px solid rgba(230,237,247,0.07)' }}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Trophy size={15} style={{ color: '#FFD080' }} />
                  <span className="font-title font-bold text-sm" style={{ color: '#E6EDF7' }}>Achievements</span>
                </div>
                <button
                  className="flex items-center gap-1 text-xs font-title font-semibold transition-colors"
                  style={{ color: 'rgba(230,237,247,0.4)' }}
                  onMouseEnter={e => { (e.currentTarget as HTMLElement).style.color = '#9B81FF'; }}
                  onMouseLeave={e => { (e.currentTarget as HTMLElement).style.color = 'rgba(230,237,247,0.4)'; }}
                  onClick={onGoToAchievements}
                >
                  View All <ChevronRight size={11} />
                </button>
              </div>
              <div className="grid grid-cols-4 md:grid-cols-6 gap-3">
                {Object.keys(ACHIEVEMENT_META).map(id => {
                  const meta = ACHIEVEMENT_META[id]!;
                  const done = unlockedSet.has(id);
                  return (
                    <div key={id} className="flex flex-col items-center gap-1.5" title={`${meta.label}: ${meta.desc}`}>
                      <div
                        className="w-11 h-11 rounded-xl flex items-center justify-center relative"
                        style={done
                          ? { background: `${meta.color}18`, border: `1px solid ${meta.color}35`, color: meta.color }
                          : { background: 'rgba(20,27,45,0.8)', border: '1px solid rgba(230,237,247,0.07)', color: 'rgba(230,237,247,0.15)' }
                        }
                      >
                        {meta.icon}
                        {done && (
                          <div
                            className="absolute -top-1 -right-1 w-4 h-4 rounded-full flex items-center justify-center"
                            style={{ background: '#00C896', border: '2px solid #0B1020' }}
                          >
                            <CheckCircle2 size={7} style={{ color: '#0B1020' }} />
                          </div>
                        )}
                      </div>
                      <div className="text-2xs text-center leading-tight" style={{ color: 'rgba(230,237,247,0.35)' }}>{meta.label}</div>
                    </div>
                  );
                })}
              </div>
              <div className="text-xs text-center" style={{ color: 'rgba(230,237,247,0.3)' }}>
                {achievements.length} / {Object.keys(ACHIEVEMENT_META).length} achievements unlocked
              </div>
            </div>
          </motion.div>
        )}

        {/* History */}
        {tab === 'history' && (
          <motion.div
            key="history"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.25 }}
            className="space-y-3"
          >
            {sessions.length === 0 ? (
              <div
                className="rounded-2xl p-16 text-center"
                style={{ background: 'linear-gradient(145deg, rgba(28,38,64,0.9), rgba(20,27,45,0.95))', border: '1px solid rgba(230,237,247,0.07)' }}
              >
                <Zap size={36} className="mx-auto mb-4" style={{ color: 'rgba(230,237,247,0.15)' }} />
                <div className="text-sm" style={{ color: 'rgba(230,237,247,0.4)' }}>No sessions yet. Start your first challenge!</div>
              </div>
            ) : sessions.map((s, i) => {
              const cat = CATEGORIES.find(c => c.id === s.category_id);
              const acc = s.total_questions > 0 ? Math.round((s.correct_count/s.total_questions)*100) : 0;
              return (
                <motion.div
                  key={s.id}
                  custom={i}
                  variants={cardVariants}
                  initial="hidden"
                  animate="visible"
                  className="rounded-2xl p-4 flex items-center gap-4"
                  style={{ background: 'linear-gradient(145deg, rgba(28,38,64,0.9), rgba(20,27,45,0.95))', border: '1px solid rgba(230,237,247,0.07)' }}
                >
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                    style={{ background: `${cat?.color ?? '#9B81FF'}18`, color: cat?.color ?? '#9B81FF' }}
                  >
                    <CategoryIcon id={s.category_id} size={16} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-title font-semibold text-sm" style={{ color: '#E6EDF7' }}>{cat?.label ?? s.category_id}</span>
                      {s.is_daily && (
                        <span className="text-2xs px-1.5 py-0.5 rounded-full font-title font-semibold" style={{ background: 'rgba(0,200,150,0.1)', border: '1px solid rgba(0,200,150,0.2)', color: '#33E8B8' }}>Daily</span>
                      )}
                      {s.is_boss && (
                        <span className="text-2xs px-1.5 py-0.5 rounded-full font-title font-semibold" style={{ background: 'rgba(185,242,255,0.1)', border: '1px solid rgba(185,242,255,0.2)', color: '#B9F2FF' }}>Boss</span>
                      )}
                    </div>
                    <div className="text-xs mt-0.5" style={{ color: 'rgba(230,237,247,0.4)' }}>
                      {s.correct_count}/{s.total_questions} correct · {acc}% accuracy · {s.difficulty}
                    </div>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <div className="font-title font-bold text-sm" style={{ color: '#9B81FF' }}>+{s.score} XP</div>
                    <div className="text-2xs" style={{ color: 'rgba(230,237,247,0.3)' }}>{new Date(s.completed_at).toLocaleDateString()}</div>
                  </div>
                </motion.div>
              );
            })}
          </motion.div>
        )}

        {/* Inventory */}
        {tab === 'inventory' && (
          <motion.div
            key="inventory"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.25 }}
            className="space-y-3"
          >
            {inventory.length === 0 ? (
              <div
                className="rounded-2xl p-16 text-center"
                style={{ background: 'linear-gradient(145deg, rgba(28,38,64,0.9), rgba(20,27,45,0.95))', border: '1px solid rgba(230,237,247,0.07)' }}
              >
                <Package size={36} className="mx-auto mb-4" style={{ color: 'rgba(230,237,247,0.15)' }} />
                <div className="text-sm" style={{ color: 'rgba(230,237,247,0.4)' }}>Your inventory is empty. Visit the shop to purchase items!</div>
              </div>
            ) : inventory.map((inv, i) => {
              const expired = inv.expires_at && new Date(inv.expires_at) < new Date();
              return (
                <motion.div
                  key={inv.id}
                  custom={i}
                  variants={cardVariants}
                  initial="hidden"
                  animate="visible"
                  className="rounded-2xl p-4 flex items-center gap-4"
                  style={{
                    background: 'linear-gradient(145deg, rgba(28,38,64,0.9), rgba(20,27,45,0.95))',
                    border: '1px solid rgba(230,237,247,0.07)',
                    opacity: expired ? 0.5 : 1,
                  }}
                >
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                    style={{ background: 'rgba(28,38,64,0.8)', border: '1px solid rgba(230,237,247,0.1)', color: 'rgba(230,237,247,0.5)' }}
                  >
                    <Package size={18} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-title font-semibold text-sm" style={{ color: '#E6EDF7' }}>
                      {inv.item_slug.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())}
                    </div>
                    <div className="text-xs" style={{ color: 'rgba(230,237,247,0.35)' }}>
                      {inv.is_active && !expired
                        ? <span style={{ color: '#33E8B8' }}>Active</span>
                        : expired
                        ? <span style={{ color: '#FF6B6B' }}>Expired</span>
                        : 'Inactive'
                      }
                      {' · '}Purchased {new Date(inv.purchased_at).toLocaleDateString()}
                    </div>
                  </div>
                  {!inv.is_active && !expired && (
                    <button
                      className="px-3 py-1 rounded-lg text-xs font-title font-semibold"
                      style={{ background: 'rgba(124,92,252,0.12)', border: '1px solid rgba(124,92,252,0.25)', color: '#9B81FF' }}
                    >
                      Activate
                    </button>
                  )}
                </motion.div>
              );
            })}
          </motion.div>
        )}

      </AnimatePresence>
    </div>
  );
}
