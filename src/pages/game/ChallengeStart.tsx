import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Zap, Clock, Star, Target, Sword } from 'lucide-react';
import { CATEGORIES } from '../../design-system/tokens';
import { Player } from '../../lib/supabase';
import { CategoryIcon, levelToDifficulty } from '../../lib/constants';

interface Props {
  player: Player;
  categoryId: string;
  isBoss: boolean;
  isDaily: boolean;
  totalQ: number;
  onBegin: () => void;
  onBack: () => void;
}

export default function ChallengeStart({ player, categoryId, isBoss, isDaily, totalQ, onBegin, onBack }: Props) {
  const [countdown, setCountdown] = useState<number | null>(null);
  const cat = CATEGORIES.find(c => c.id === categoryId);
  const difficulty = levelToDifficulty(player.level);

  useEffect(() => {
    if (countdown === null) return;
    if (countdown === 0) { onBegin(); return; }
    const t = setTimeout(() => setCountdown(c => (c ?? 1) - 1), 900);
    return () => clearTimeout(t);
  }, [countdown, onBegin]);

  if (!cat) return null;

  const xpMap: Record<string, number> = { easy: 50, medium: 100, hard: 175, expert: 275 };
  const xpPerCorrect = xpMap[difficulty.toLowerCase()] ?? 100;

  const rules = [
    { icon: <Target size={14} />,  label: 'Questions', value: `${totalQ} questions`,     color: '#33DEFF' },
    { icon: <Star size={14} />,    label: 'Difficulty', value: difficulty,                color: '#9B81FF' },
    { icon: <Zap size={14} />,     label: 'Max XP',     value: `${xpPerCorrect * totalQ} XP`, color: '#FFB84D' },
    { icon: <Clock size={14} />,   label: 'Timed',      value: 'No time limit',           color: '#33E8B8' },
  ];

  return (
    <div
      className="min-h-screen flex flex-col"
      style={{ background: 'linear-gradient(180deg, #0B1020 0%, #0D1223 60%, #0B1020 100%)' }}
    >
      {/* Ambient glow */}
      <div
        className="fixed inset-0 pointer-events-none"
        style={{ background: `radial-gradient(ellipse at 50% 30%, ${cat.color}08 0%, transparent 60%)` }}
      />

      <div className="flex-1 flex items-center justify-center px-4 py-12 relative z-10">
        <div className="w-full max-w-lg space-y-5">

          {/* Back */}
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 }}>
            <button
              onClick={onBack}
              className="flex items-center gap-1.5 text-sm font-title transition-colors"
              style={{ color: 'rgba(230,237,247,0.4)' }}
              onMouseEnter={e => { (e.currentTarget as HTMLElement).style.color = '#9B81FF'; }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.color = 'rgba(230,237,247,0.4)'; }}
            >
              ← Back
            </button>
          </motion.div>

          {/* Main card */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
            className="rounded-2xl p-8 flex flex-col items-center gap-5 text-center relative overflow-hidden"
            style={{
              background: 'linear-gradient(145deg, rgba(28,38,64,0.95), rgba(20,27,45,0.98))',
              border: `1px solid ${cat.color}35`,
              boxShadow: `0 0 60px ${cat.color}10`,
            }}
          >
            <div className="absolute inset-0 pointer-events-none" style={{ background: `radial-gradient(ellipse at top, ${cat.color}10, transparent 60%)` }} />

            {(isDaily || isBoss) && (
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
                className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-title font-semibold tracking-wider uppercase"
                style={isBoss
                  ? { background: 'rgba(185,242,255,0.1)', border: '1px solid rgba(185,242,255,0.25)', color: '#B9F2FF' }
                  : { background: 'rgba(0,200,150,0.1)',   border: '1px solid rgba(0,200,150,0.25)',   color: '#33E8B8' }
                }
              >
                {isBoss ? <><Sword size={10} /> Weekly Boss</> : <><Star size={10} /> Daily Challenge</>}
              </motion.div>
            )}

            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.15, type: 'spring', stiffness: 200 }}
              className="w-24 h-24 rounded-3xl flex items-center justify-center relative z-10"
              style={{
                background:  `${cat.color}18`,
                border:      `2px solid ${cat.color}40`,
                color:       isBoss ? '#B9F2FF' : cat.color,
                boxShadow:   `0 0 40px ${cat.color}25`,
              }}
            >
              {isBoss ? <Sword size={36} style={{ color: '#B9F2FF' }} /> : <CategoryIcon id={categoryId} size={36} />}
            </motion.div>

            <div className="relative z-10 space-y-2">
              <h2
                className="font-title font-extrabold text-3xl"
                style={{ color: '#E6EDF7', letterSpacing: '-0.04em' }}
              >
                {isBoss ? `${cat.label} Boss` : cat.label}
              </h2>
              <p className="text-sm max-w-sm mx-auto" style={{ color: 'rgba(230,237,247,0.5)' }}>
                {isBoss
                  ? `Face the ultimate ${cat.label.toLowerCase()} gauntlet. ${totalQ} expert questions.`
                  : isDaily
                  ? `Today's Daily Challenge. Answer all ${totalQ} questions for bonus XP.`
                  : `${totalQ} ${difficulty.toLowerCase()}-tier ${cat.label.toLowerCase()} questions await.`}
              </p>
            </div>
          </motion.div>

          {/* Rules */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.2 }}
            className="grid grid-cols-2 gap-3"
          >
            {rules.map(r => (
              <div
                key={r.label}
                className="rounded-2xl p-4 flex items-center gap-3"
                style={{ background: 'linear-gradient(145deg, rgba(28,38,64,0.9), rgba(20,27,45,0.95))', border: '1px solid rgba(230,237,247,0.07)' }}
              >
                <div
                  className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                  style={{ background: `${r.color}15`, border: `1px solid ${r.color}28`, color: r.color }}
                >
                  {r.icon}
                </div>
                <div>
                  <div className="text-2xs uppercase tracking-wider" style={{ color: 'rgba(230,237,247,0.3)' }}>{r.label}</div>
                  <div className="font-title font-bold text-sm" style={{ color: '#E6EDF7' }}>{r.value}</div>
                </div>
              </div>
            ))}
          </motion.div>

          {/* CTA / countdown */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.3 }}
          >
            <AnimatePresence mode="wait">
              {countdown !== null ? (
                <motion.div
                  key="countdown"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="flex flex-col items-center gap-2 py-6"
                >
                  <AnimatePresence mode="wait">
                    <motion.div
                      key={countdown}
                      initial={{ scale: 0.6, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      exit={{ scale: 1.4, opacity: 0 }}
                      transition={{ type: 'spring', stiffness: 400, damping: 20 }}
                      className="font-title font-extrabold text-7xl leading-none"
                      style={{ color: cat.color, textShadow: `0 0 40px ${cat.color}60` }}
                    >
                      {countdown === 0 ? 'GO!' : countdown}
                    </motion.div>
                  </AnimatePresence>
                  <div className="text-sm" style={{ color: 'rgba(230,237,247,0.35)' }}>Get ready...</div>
                </motion.div>
              ) : (
                <motion.button
                  key="start-btn"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.97 }}
                  className="w-full h-14 rounded-xl font-title font-bold text-base flex items-center justify-center gap-3 transition-shadow"
                  style={{
                    background: isBoss
                      ? 'linear-gradient(135deg, rgba(185,242,255,0.15), rgba(0,212,255,0.2))'
                      : 'linear-gradient(135deg, #7C5CFC, #5E3DE8)',
                    border:     isBoss ? '1px solid rgba(185,242,255,0.35)' : 'none',
                    color:      isBoss ? '#B9F2FF' : '#fff',
                    boxShadow:  isBoss ? 'none' : '0 0 30px rgba(124,92,252,0.4)',
                  }}
                  onClick={() => setCountdown(3)}
                >
                  <Zap size={18} />
                  {isDaily ? 'Start Daily Challenge' : isBoss ? 'Enter Boss Chamber' : 'Begin Challenge'}
                </motion.button>
              )}
            </AnimatePresence>
          </motion.div>

          <div className="text-center text-xs" style={{ color: 'rgba(230,237,247,0.2)' }}>
            Answers are final · no penalty for wrong guesses
          </div>
        </div>
      </div>
    </div>
  );
}
