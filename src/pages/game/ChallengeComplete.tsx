import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Trophy, Zap, Target, CheckCircle2, XCircle, RotateCcw, LayoutDashboard, ChevronRight, Sword, Star, Flame } from 'lucide-react';
import { CATEGORIES } from '../../design-system/tokens';
import { Player } from '../../lib/supabase';
import { rankInfo } from '../../lib/constants';

interface Props {
  player: Player;
  categoryId: string;
  totalQ: number;
  sessionCorrect: number;
  sessionScore: number;
  isBoss: boolean;
  isDaily: boolean;
  prevRankTier: string;
  onPlayAgain: () => void;
  onDashboard: () => void;
}

// rankInfo imported from ../../lib/constants

export default function ChallengeComplete({ player, categoryId, totalQ, sessionCorrect, sessionScore, isBoss, isDaily, prevRankTier, onPlayAgain, onDashboard }: Props) {
  const [visible, setVisible] = useState(false);
  useEffect(() => { const t = setTimeout(() => setVisible(true), 80); return () => clearTimeout(t); }, []);

  const cat    = CATEGORIES.find(c => c.id === categoryId);
  const rank   = rankInfo(player.rank_tier);
  const acc    = totalQ > 0 ? Math.round((sessionCorrect / totalQ) * 100) : 0;
  const perfect = sessionCorrect === totalQ;
  const grade   = acc === 100
    ? { label: 'Perfect!',       color: '#FFD080' }
    : acc >= 80
    ? { label: 'Excellent',      color: '#33E8B8' }
    : acc >= 60
    ? { label: 'Good',           color: '#33DEFF' }
    : acc >= 40
    ? { label: 'Fair',           color: '#FFB84D' }
    : { label: 'Keep Practicing', color: '#FF7A50' };
  const rankChanged = prevRankTier !== player.rank_tier;

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1, delayChildren: 0.1 } },
  };
  const itemVariants = {
    hidden:   { opacity: 0, y: 24 },
    visible:  { opacity: 1, y: 0, transition: { type: 'spring' as const, stiffness: 300, damping: 25 } },
  };

  return (
    <div
      className="min-h-screen flex flex-col"
      style={{ background: 'linear-gradient(180deg, #0B1020 0%, #0D1223 60%, #0B1020 100%)' }}
    >
      {/* Ambient */}
      <div
        className="fixed inset-0 pointer-events-none"
        style={{ background: `radial-gradient(ellipse at 50% 30%, ${grade.color}08 0%, transparent 60%)` }}
      />

      <div className="flex-1 flex items-center justify-center px-4 py-12 relative z-10">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate={visible ? 'visible' : 'hidden'}
          className="w-full max-w-lg space-y-4"
        >
          {/* Main result card */}
          <motion.div
            variants={itemVariants}
            className="rounded-2xl p-7 flex flex-col items-center gap-5 text-center relative overflow-hidden"
            style={{
              background: 'linear-gradient(145deg, rgba(28,38,64,0.95), rgba(20,27,45,0.98))',
              border: `1px solid ${grade.color}35`,
              boxShadow: `0 0 60px ${grade.color}10`,
            }}
          >
            <div className="absolute inset-0 pointer-events-none" style={{ background: `radial-gradient(ellipse at top, ${grade.color}08, transparent 60%)` }} />

            <motion.div
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: 'spring', stiffness: 300, damping: 20, delay: 0.2 }}
              className="w-24 h-24 rounded-3xl flex items-center justify-center relative z-10"
              style={{
                background:  `${grade.color}15`,
                border:      `2px solid ${grade.color}35`,
                color:       grade.color,
                boxShadow:   `0 0 40px ${grade.color}25`,
              }}
            >
              {perfect ? <Trophy size={36} /> : isBoss ? <Sword size={36} /> : isDaily ? <Star size={36} /> : acc >= 60 ? <CheckCircle2 size={36} /> : <XCircle size={36} />}
            </motion.div>

            <div className="relative z-10 space-y-1">
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.35 }}
                className="font-title font-extrabold text-4xl"
                style={{ color: grade.color, letterSpacing: '-0.05em' }}
              >
                {grade.label}
              </motion.div>
              <div className="text-sm" style={{ color: 'rgba(230,237,247,0.45)' }}>
                {cat?.label ?? categoryId} · {isBoss ? 'Boss Challenge' : isDaily ? 'Daily Challenge' : 'Standard'}
              </div>
            </div>

            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: 'spring', stiffness: 250, damping: 20, delay: 0.4 }}
              className="relative z-10 flex items-center gap-2 px-5 py-2.5 rounded-2xl"
              style={{ background: 'rgba(124,92,252,0.15)', border: '1px solid rgba(124,92,252,0.3)' }}
            >
              <Zap size={18} style={{ color: '#9B81FF' }} />
              <span className="font-title font-extrabold text-xl" style={{ color: '#9B81FF' }}>+{sessionScore} XP</span>
              {isBoss  && <span className="text-xs ml-1" style={{ color: 'rgba(230,237,247,0.4)' }}>×3 Boss</span>}
              {isDaily && <span className="text-xs ml-1" style={{ color: 'rgba(230,237,247,0.4)' }}>Daily Bonus</span>}
            </motion.div>
          </motion.div>

          {/* Stats */}
          <motion.div variants={itemVariants} className="grid grid-cols-3 gap-3">
            {[
              { icon: <CheckCircle2 size={16} />, color: '#33E8B8', label: 'Correct',  value: `${sessionCorrect}/${totalQ}` },
              { icon: <Target size={16} />,       color: '#33DEFF', label: 'Accuracy', value: `${acc}%` },
              { icon: <Flame size={16} />,        color: '#FFB84D', label: 'Streak',   value: `${player.streak_days}d` },
            ].map(s => (
              <div
                key={s.label}
                className="rounded-2xl p-4 flex flex-col items-center gap-2 text-center"
                style={{ background: 'linear-gradient(145deg, rgba(28,38,64,0.9), rgba(20,27,45,0.95))', border: '1px solid rgba(230,237,247,0.07)' }}
              >
                <div style={{ color: s.color }}>{s.icon}</div>
                <div className="font-title font-extrabold text-xl leading-none" style={{ color: '#E6EDF7' }}>{s.value}</div>
                <div className="text-2xs" style={{ color: 'rgba(230,237,247,0.35)' }}>{s.label}</div>
              </div>
            ))}
          </motion.div>

          {/* Rank card */}
          <motion.div
            variants={itemVariants}
            className="rounded-2xl p-4 flex items-center gap-4"
            style={{ background: 'linear-gradient(145deg, rgba(28,38,64,0.9), rgba(20,27,45,0.95))', border: '1px solid rgba(230,237,247,0.07)' }}
          >
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
              style={{ background: `${rank.color}15`, border: `1px solid ${rank.color}28`, color: rank.color }}
            >
              <Trophy size={18} />
            </div>
            <div className="flex-1">
              <div className="font-title font-bold text-sm" style={{ color: '#E6EDF7' }}>{rank.label} Rank</div>
              <div className="text-xs" style={{ color: 'rgba(230,237,247,0.4)' }}>Score: {player.rank_score.toLocaleString()}</div>
            </div>
            <div className="text-right">
              <div className="font-title font-bold text-sm" style={{ color: '#9B81FF' }}>Lv {player.level}</div>
              <div className="text-xs" style={{ color: 'rgba(230,237,247,0.35)' }}>{player.total_xp.toLocaleString()} XP</div>
            </div>
          </motion.div>

          {/* Rank up */}
          <AnimatePresence>
            {rankChanged && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ type: 'spring', stiffness: 300, damping: 20, delay: 0.6 }}
                className="flex items-center justify-center gap-3 p-4 rounded-2xl relative overflow-hidden"
                style={{ background: `${rank.color}12`, border: `1px solid ${rank.color}30` }}
              >
                <Trophy size={18} style={{ color: rank.color }} />
                <div>
                  <div className="font-title font-extrabold text-sm" style={{ color: rank.color }}>Rank Up!</div>
                  <div className="text-xs" style={{ color: 'rgba(230,237,247,0.45)' }}>
                    {rankInfo(prevRankTier).label} <ChevronRight size={10} className="inline" /> {rank.label}
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Buttons */}
          <motion.div variants={itemVariants} className="flex gap-3">
            <button
              className="flex-1 h-12 rounded-xl flex items-center justify-center gap-2 font-title font-bold text-sm transition-all"
              style={{ background: 'rgba(28,38,64,0.8)', border: '1px solid rgba(230,237,247,0.1)', color: 'rgba(230,237,247,0.7)' }}
              onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = 'rgba(124,92,252,0.3)'; (e.currentTarget as HTMLElement).style.color = '#9B81FF'; }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = 'rgba(230,237,247,0.1)'; (e.currentTarget as HTMLElement).style.color = 'rgba(230,237,247,0.7)'; }}
              onClick={onDashboard}
            >
              <LayoutDashboard size={15} /> Dashboard
            </button>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.97 }}
              className="flex-1 h-12 rounded-xl flex items-center justify-center gap-2 font-title font-bold text-sm"
              style={{ background: 'linear-gradient(135deg, #7C5CFC, #5E3DE8)', color: '#fff', boxShadow: '0 0 24px rgba(124,92,252,0.4)' }}
              onClick={onPlayAgain}
            >
              <RotateCcw size={15} /> Play Again
            </motion.button>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}
