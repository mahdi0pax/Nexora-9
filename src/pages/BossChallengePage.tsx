import { motion } from 'framer-motion';
import { Swords, Shield, Zap, Clock, Trophy, ChevronRight } from 'lucide-react';
import { Player } from '../lib/supabase';

interface Props {
  player: Player;
  onStartBoss: (categoryId: string) => void;
}

const BOSSES = [
  {
    id: 'science_boss',
    name: 'The Alchemist',
    category: 'science',
    difficulty: 'Expert',
    reward: '500 RITUAL + Epic Badge',
    color: '#00D4FF',
    icon: <Shield size={28} />,
  },
  {
    id: 'history_boss',
    name: 'The Chronicler',
    category: 'history',
    difficulty: 'Expert',
    reward: '500 RITUAL + Epic Badge',
    color: '#CD7F32',
    icon: <Shield size={28} />,
  },
  {
    id: 'crypto_boss',
    name: 'The Oracle',
    category: 'crypto_web3',
    difficulty: 'Elite',
    reward: '1000 RITUAL + Legendary Badge',
    color: '#B9F2FF',
    icon: <Swords size={28} />,
  },
];

export default function BossChallengePage({ player, onStartBoss }: Props) {
  return (
    <div className="p-4 md:p-6 max-w-4xl mx-auto pb-10">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="text-center mb-8"
      >
        <div
          className="w-16 h-16 rounded-2xl mx-auto mb-4 flex items-center justify-center"
          style={{ background: 'rgba(185,242,255,0.1)', border: '1px solid rgba(185,242,255,0.25)' }}
        >
          <Swords size={28} style={{ color: '#B9F2FF' }} />
        </div>
        <h1 className="font-title font-bold text-2xl" style={{ color: '#E6EDF7' }}>Boss Challenge</h1>
        <p className="text-sm mt-1" style={{ color: 'rgba(230,237,247,0.4)' }}>
          Face elite opponents for massive rewards. Win streaks unlock legendary loot.
        </p>
      </motion.div>

      {/* Stats bar */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="grid grid-cols-3 gap-3 mb-8"
      >
        {[
          { label: 'Boss Wins', value: player.boss_wins ?? 0, icon: <Trophy size={14} />, color: '#FFD080' },
          { label: 'Best Streak', value: 0, icon: <Zap size={14} />, color: '#9B81FF' },
          { label: 'Next In', value: '12h', icon: <Clock size={14} />, color: '#33E8B8' },
        ].map((s) => (
          <div
            key={s.label}
            className="rounded-xl p-3 text-center"
            style={{ background: 'rgba(28,38,64,0.5)', border: '1px solid rgba(230,237,247,0.06)' }}
          >
            <div className="flex items-center justify-center gap-1.5 mb-1" style={{ color: s.color }}>
              {s.icon}
              <span className="text-2xs font-title font-semibold uppercase" style={{ color: 'rgba(230,237,247,0.3)' }}>{s.label}</span>
            </div>
            <div className="font-title font-bold text-lg" style={{ color: '#E6EDF7' }}>{s.value}</div>
          </div>
        ))}
      </motion.div>

      {/* Boss cards */}
      <div className="space-y-4">
        {BOSSES.map((boss, i) => (
          <motion.div
            key={boss.id}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 + i * 0.08 }}
            className="rounded-2xl p-5 relative overflow-hidden group cursor-pointer"
            style={{
              background: 'linear-gradient(135deg, rgba(28,38,64,0.95) 0%, rgba(20,27,45,0.98) 100%)',
              border: `1px solid ${boss.color}25`,
            }}
            onClick={() => onStartBoss(boss.category)}
          >
            <div
              className="absolute top-0 right-0 w-40 h-40 rounded-full opacity-10 group-hover:opacity-15 transition-opacity"
              style={{ background: boss.color, filter: 'blur(50px)' }}
            />
            <div className="relative z-10 flex items-center gap-4">
              <div
                className="w-14 h-14 rounded-2xl flex items-center justify-center flex-shrink-0"
                style={{ background: `${boss.color}15`, border: `1px solid ${boss.color}30` }}
              >
                <span style={{ color: boss.color }}>{boss.icon}</span>
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="font-title font-bold text-base" style={{ color: '#E6EDF7' }}>{boss.name}</span>
                  <span
                    className="text-2xs font-bold px-2 py-0.5 rounded-md"
                    style={{ background: `${boss.color}15`, color: boss.color }}
                  >
                    {boss.difficulty}
                  </span>
                </div>
                <div className="text-xs mt-1" style={{ color: 'rgba(230,237,247,0.4)' }}>{boss.reward}</div>
              </div>
              <ChevronRight size={18} style={{ color: 'rgba(230,237,247,0.25)' }} className="group-hover:translate-x-0.5 transition-transform" />
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
