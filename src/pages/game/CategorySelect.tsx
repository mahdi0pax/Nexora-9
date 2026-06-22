import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Lock, ChevronRight, Zap, TrendingUp,
} from 'lucide-react';
import { Player, CategoryMastery } from '../../lib/supabase';
import { CATEGORIES } from '../../design-system/tokens';
import { CategoryIcon, DIFFICULTY_LABELS } from '../../lib/constants';

interface CategorySelectProps {
  player: Player;
  mastery: CategoryMastery[];
  onSelect: (id: string) => void;
  onBack: () => void;
}

export default function CategorySelect({ player, mastery, onSelect, onBack }: CategorySelectProps) {
  const [hovered, setHovered] = useState<string | null>(null);
  const diffLabel = DIFFICULTY_LABELS[Math.min(player.level, 10)] ?? 'Elite';

  return (
    <div
      className="min-h-screen"
      style={{ background: 'linear-gradient(180deg, #0B1020 0%, #0D1223 50%, #0B1020 100%)' }}
    >
      <div
        className="fixed top-0 left-1/2 -translate-x-1/2 w-[700px] h-[300px] pointer-events-none"
        style={{ background: 'radial-gradient(ellipse, rgba(124,92,252,0.06) 0%, transparent 70%)', filter: 'blur(60px)' }}
      />

      <div className="relative z-10 max-w-5xl mx-auto px-4 md:px-6 py-8 md:py-12">
        <motion.div
          initial={{ opacity: 0, y: -12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="mb-10"
        >
          <button
            onClick={onBack}
            className="flex items-center gap-1.5 text-sm font-title mb-6 transition-colors"
            style={{ color: 'rgba(230,237,247,0.4)' }}
            onMouseEnter={e => { (e.currentTarget as HTMLElement).style.color = '#9B81FF'; }}
            onMouseLeave={e => { (e.currentTarget as HTMLElement).style.color = 'rgba(230,237,247,0.4)'; }}
          >
            ← Back to Dashboard
          </button>
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            <div>
              <h1
                className="font-title font-extrabold mb-2"
                style={{ fontSize: 'clamp(1.8rem, 4vw, 2.8rem)', letterSpacing: '-0.03em', color: '#E6EDF7' }}
              >
                Choose Your Domain
              </h1>
              <p style={{ color: 'rgba(230,237,247,0.5)' }}>Select a knowledge category. Questions adapt to your level.</p>
            </div>
            <div
              className="flex items-center gap-2 px-4 py-2 rounded-xl flex-shrink-0"
              style={{ background: 'rgba(124,92,252,0.1)', border: '1px solid rgba(124,92,252,0.2)' }}
            >
              <TrendingUp size={14} style={{ color: '#9B81FF' }} />
              <span className="font-title font-semibold text-sm" style={{ color: '#9B81FF' }}>
                Level {player.level} · {diffLabel}
              </span>
            </div>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {CATEGORIES.map((cat, i) => {
            const m       = mastery.find(x => x.category_id === cat.id);
            const locked  = cat.unlockLevel > player.level;
            const mastLvl = m?.mastery_level ?? 0;
            const mastXp  = m?.mastery_xp ?? 0;
            const mastPct = Math.min(100, Math.round(((mastXp % 500) / 500) * 100));
            const acc     = m && m.total_answered > 0 ? Math.round((m.total_correct / m.total_answered) * 100) : null;
            const isHov   = hovered === cat.id;

            return (
              <motion.div
                key={cat.id}
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: i * 0.06, ease: [0.22, 1, 0.36, 1] }}
                whileHover={!locked ? { y: -4, transition: { duration: 0.2 } } : {}}
                className="rounded-2xl p-5 flex flex-col gap-4 cursor-pointer select-none"
                style={{
                  background: 'linear-gradient(145deg, rgba(28,38,64,0.9), rgba(20,27,45,0.95))',
                  border:     isHov && !locked ? `1px solid ${cat.color}45` : '1px solid rgba(230,237,247,0.07)',
                  boxShadow:  isHov && !locked ? `0 8px 32px rgba(0,0,0,0.5), 0 0 20px ${cat.color}15` : '0 4px 20px rgba(0,0,0,0.4)',
                  opacity:    locked ? 0.5 : 1,
                  filter:     locked ? 'grayscale(0.5)' : 'none',
                  transition: 'border-color 0.2s, box-shadow 0.2s',
                }}
                onMouseEnter={() => !locked && setHovered(cat.id)}
                onMouseLeave={() => setHovered(null)}
                onClick={() => !locked && onSelect(cat.id)}
              >
                <div className="flex items-start justify-between">
                  <motion.div
                    animate={isHov && !locked ? { scale: 1.1 } : { scale: 1 }}
                    transition={{ duration: 0.2 }}
                    className="w-14 h-14 rounded-2xl flex items-center justify-center"
                    style={{ background: `${cat.color}15`, border: `1px solid ${cat.color}28`, color: locked ? 'rgba(230,237,247,0.25)' : cat.color }}
                  >
                    {locked ? <Lock size={22} /> : <CategoryIcon id={cat.id} size={26} />}
                  </motion.div>
                  {locked ? (
                    <span className="text-xs font-title font-bold px-2.5 py-1 rounded-full" style={{ background: 'rgba(230,237,247,0.06)', color: 'rgba(230,237,247,0.3)', border: '1px solid rgba(230,237,247,0.1)' }}>
                      Lv {cat.unlockLevel}
                    </span>
                  ) : mastLvl > 0 ? (
                    <span className="text-xs font-title font-bold" style={{ color: cat.color }}>Mastery {mastLvl}</span>
                  ) : (
                    <span className="text-xs px-2.5 py-1 rounded-full" style={{ background: 'rgba(0,200,150,0.08)', border: '1px solid rgba(0,200,150,0.18)', color: '#33E8B8' }}>New</span>
                  )}
                </div>

                <div>
                  <h3 className="font-title font-bold text-base mb-1" style={{ color: locked ? 'rgba(230,237,247,0.3)' : '#E6EDF7' }}>
                    {cat.label}
                  </h3>
                  <p className="text-xs leading-relaxed" style={{ color: locked ? 'rgba(230,237,247,0.2)' : 'rgba(230,237,247,0.45)' }}>
                    {locked ? `Unlocks at Level ${cat.unlockLevel}` : `${cat.label} questions`}
                  </p>
                </div>

                {!locked && (
                  <div className="space-y-1.5 mt-auto">
                    {acc !== null && (
                      <div className="flex items-center justify-between text-2xs">
                        <span style={{ color: 'rgba(230,237,247,0.35)' }}>Accuracy</span>
                        <span style={{ color: cat.color }}>{acc}%</span>
                      </div>
                    )}
                    <div className="rounded-full overflow-hidden" style={{ height: '4px', background: 'rgba(11,16,32,0.8)' }}>
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${mastPct}%` }}
                        transition={{ duration: 0.8, delay: i * 0.06 + 0.3 }}
                        className="h-full rounded-full"
                        style={{ background: `linear-gradient(90deg, ${cat.color}80, ${cat.color})` }}
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-2xs" style={{ color: 'rgba(230,237,247,0.25)' }}>
                        {mastLvl > 0 ? `Mastery ${mastLvl}/10` : 'Unplayed'}
                      </span>
                      <span className="flex items-center gap-1 text-2xs font-title font-bold" style={{ color: cat.color }}>
                        Play <ChevronRight size={10} />
                      </span>
                    </div>
                  </div>
                )}
              </motion.div>
            );
          })}
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="mt-8 flex flex-wrap items-center justify-center gap-4 text-xs font-title"
          style={{ color: 'rgba(230,237,247,0.3)' }}
        >
          {[
            { label: 'Easy: +50 XP',   color: '#9B81FF' },
            { label: 'Medium: +100 XP', color: '#33DEFF' },
            { label: 'Hard: +175 XP',  color: '#FFB84D' },
            { label: 'Expert: +275 XP', color: '#FF6B6B' },
          ].map((item, i) => (
            <span key={i} className="flex items-center gap-1.5">
              {i > 0 && <span className="w-1 h-1 rounded-full inline-block mr-2.5" style={{ background: 'rgba(230,237,247,0.15)' }} />}
              <Zap size={11} style={{ color: item.color }} />
              {item.label}
            </span>
          ))}
        </motion.div>
      </div>
    </div>
  );
}
