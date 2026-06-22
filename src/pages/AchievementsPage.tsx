import { motion } from 'framer-motion';
import { CheckCircle2, Lock, Trophy } from 'lucide-react';
import { Achievement } from '../lib/supabase';
import { ACHIEVEMENT_META, ACHIEVEMENT_CATEGORIES } from '../lib/constants';

interface Props {
  achievements: Achievement[];
}

export default function AchievementsPage({ achievements }: Props) {
  const unlocked     = new Set(achievements.map(a => a.achievement_id));
  const unlockedAt   = Object.fromEntries(achievements.map(a => [a.achievement_id, a.unlocked_at]));
  const totalCount   = Object.keys(ACHIEVEMENT_META).length;
  const unlockedCount = achievements.length;
  const pct          = Math.round((unlockedCount / totalCount) * 100);

  return (
    <div className="p-4 md:p-6 max-w-4xl mx-auto space-y-7 pb-10">

      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="space-y-2"
      >
        <div
          className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-title font-semibold tracking-widest uppercase"
          style={{ background: 'rgba(255,208,128,0.1)', border: '1px solid rgba(255,208,128,0.2)', color: '#FFD080' }}
        >
          <Trophy size={10} /> Achievements
        </div>
        <h1
          className="font-title font-extrabold text-3xl md:text-4xl"
          style={{ color: '#E6EDF7', letterSpacing: '-0.04em' }}
        >
          Your Collection
        </h1>
        <p className="text-sm" style={{ color: 'rgba(230,237,247,0.4)' }}>
          Complete challenges and reach milestones to unlock achievements.
        </p>
      </motion.div>

      {/* Progress bar */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="rounded-2xl p-5 space-y-3"
        style={{ background: 'linear-gradient(145deg, rgba(28,38,64,0.9), rgba(20,27,45,0.95))', border: '1px solid rgba(230,237,247,0.07)' }}
      >
        <div className="flex items-center justify-between">
          <span className="font-title font-semibold text-sm" style={{ color: '#E6EDF7' }}>Overall Progress</span>
          <span className="font-title font-extrabold text-sm" style={{ color: '#9B81FF' }}>{pct}% complete</span>
        </div>
        <div className="rounded-full overflow-hidden" style={{ height: 8, background: 'rgba(20,27,45,0.8)' }}>
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${pct}%` }}
            transition={{ duration: 1.2, ease: [0.34, 1.56, 0.64, 1] }}
            className="h-full rounded-full"
            style={{ background: 'linear-gradient(90deg, #7C5CFC, #9B81FF)' }}
          />
        </div>
        <div className="text-xs" style={{ color: 'rgba(230,237,247,0.35)' }}>
          {unlockedCount} unlocked · {totalCount - unlockedCount} remaining
        </div>
      </motion.div>

      {/* Achievements by category */}
      {ACHIEVEMENT_CATEGORIES.map((cat, catIdx) => {
        const catItems    = Object.entries(ACHIEVEMENT_META).filter(([, meta]) => meta.category === cat);
        const catUnlocked = catItems.filter(([id]) => unlocked.has(id)).length;

        return (
          <motion.div
            key={cat}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 + catIdx * 0.07 }}
            className="space-y-3"
          >
            <div className="flex items-center justify-between">
              <h3 className="font-title font-bold text-base" style={{ color: '#E6EDF7' }}>{cat}</h3>
              <span className="text-xs" style={{ color: 'rgba(230,237,247,0.35)' }}>{catUnlocked}/{catItems.length}</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {catItems.map(([id, meta], itemIdx) => {
                const done    = unlocked.has(id);
                const dateStr = done && unlockedAt[id]
                  ? new Date(unlockedAt[id]).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
                  : null;

                return (
                  <motion.div
                    key={id}
                    initial={{ opacity: 0, x: -8 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.2 + catIdx * 0.07 + itemIdx * 0.04 }}
                    className="rounded-2xl p-4 flex items-center gap-4 relative overflow-hidden"
                    style={{
                      background: 'linear-gradient(145deg, rgba(28,38,64,0.9), rgba(20,27,45,0.95))',
                      border: done ? `1px solid ${meta.color}25` : '1px solid rgba(230,237,247,0.07)',
                      opacity: done ? 1 : 0.55,
                    }}
                  >
                    {done && (
                      <div
                        className="absolute inset-0 pointer-events-none"
                        style={{ background: `radial-gradient(ellipse at left, ${meta.color}05, transparent 60%)` }}
                      />
                    )}

                    <div
                      className="w-14 h-14 rounded-2xl flex items-center justify-center flex-shrink-0 relative z-10"
                      style={done
                        ? { background: `${meta.color}18`, border: `1px solid ${meta.color}35`, color: meta.color, boxShadow: `0 0 16px ${meta.color}25` }
                        : { background: 'rgba(20,27,45,0.8)', border: '1px solid rgba(230,237,247,0.07)', color: 'rgba(230,237,247,0.2)' }
                      }
                    >
                      {meta.icon}
                      {done && (
                        <div
                          className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full flex items-center justify-center"
                          style={{ background: '#00C896', border: '2px solid #0B1020' }}
                        >
                          <CheckCircle2 size={10} style={{ color: '#0B1020' }} />
                        </div>
                      )}
                    </div>

                    <div className="flex-1 min-w-0 relative z-10">
                      <div
                        className="font-title font-bold text-sm"
                        style={{ color: done ? meta.color : 'rgba(230,237,247,0.4)' }}
                      >
                        {meta.label}
                      </div>
                      <div className="text-xs leading-snug mt-0.5" style={{ color: 'rgba(230,237,247,0.5)' }}>{meta.desc}</div>
                      {done && dateStr && (
                        <div className="text-2xs mt-1" style={{ color: 'rgba(230,237,247,0.25)' }}>Unlocked {dateStr}</div>
                      )}
                    </div>

                    {!done && (
                      <div className="flex-shrink-0 relative z-10">
                        <Lock size={16} style={{ color: 'rgba(230,237,247,0.2)' }} />
                      </div>
                    )}
                  </motion.div>
                );
              })}
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}
