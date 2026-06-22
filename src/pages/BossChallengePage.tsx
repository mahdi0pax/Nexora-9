import { motion } from 'framer-motion';
import { Swords, Shield, Zap, Clock, Trophy, ChevronRight } from 'lucide-react';
import { Player } from '../lib/supabase';
import { Card, IconBox } from '../design-system';

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
    color: '#00D4FF',
    icon: <Swords size={28} />,
  },
];

export default function BossChallengePage({ player, onStartBoss }: Props) {
  return (
    <div className="nx-page">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="text-center mb-8"
      >
        <IconBox variant="cyan" size="lg" className="mx-auto mb-4"><Swords size={28} /></IconBox>
        <h1 className="font-title font-bold text-2xl nx-text-primary">Boss Challenge</h1>
        <p className="text-sm mt-1 nx-text-muted">
          Face elite opponents for massive rewards. Win streaks unlock legendary loot.
        </p>
      </motion.div>

      {/* Stats bar */}
      <div className="grid grid-cols-3 gap-3 mb-8">
        {[
          { label: 'Boss Wins', value: player.boss_wins ?? 0, icon: <Trophy size={14} />, color: '#FFB84D' },
          { label: 'Best Streak', value: 0, icon: <Zap size={14} />, color: '#7C5CFC' },
          { label: 'Next In', value: '12h', icon: <Clock size={14} />, color: '#00C896' },
        ].map((s, i) => (
          <Card key={s.label} variant="surface" index={i} className="p-3 text-center">
            <div className="flex items-center justify-center gap-1.5 mb-1" style={{ color: s.color }}>
              {s.icon}
            </div>
            <div className="font-title font-bold text-lg nx-text-primary">{s.value}</div>
            <div className="text-2xs font-title font-semibold uppercase nx-text-faint">{s.label}</div>
          </Card>
        ))}
      </div>

      {/* Boss cards */}
      <div className="space-y-4">
        {BOSSES.map((boss, i) => (
          <Card
            key={boss.id}
            variant="default"
            index={i}
            className="p-5 relative overflow-hidden group cursor-pointer"
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
                  <span className="font-title font-bold text-base nx-text-primary">{boss.name}</span>
                  <span
                    className="text-2xs font-bold px-2 py-0.5 rounded-md"
                    style={{ background: `${boss.color}15`, color: boss.color }}
                  >
                    {boss.difficulty}
                  </span>
                </div>
                <div className="text-xs mt-1 nx-text-muted">{boss.reward}</div>
              </div>
              <ChevronRight size={18} className="nx-text-faint group-hover:translate-x-0.5 transition-transform" />
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
