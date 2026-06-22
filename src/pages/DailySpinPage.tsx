import { motion } from 'framer-motion';
import { Sparkles, Gift, Zap, Crown, Shield, Star, RotateCcw } from 'lucide-react';
import { Player } from '../lib/supabase';

interface Props {
  player: Player;
}

const REWARDS = [
  { label: '50 RITUAL',   icon: <Zap size={20} />,     color: '#FFB84D', weight: 35 },
  { label: '100 RITUAL',  icon: <Zap size={20} />,     color: '#FFD080', weight: 20 },
  { label: 'XP Boost',    icon: <Star size={20} />,     color: '#9B81FF', weight: 15 },
  { label: 'Streak Shield', icon: <Shield size={20} />, color: '#33E8B8', weight: 15 },
  { label: 'Premium Crate', icon: <Gift size={20} />,   color: '#00D4FF', weight: 12 },
  { label: 'Nexora Crown',  icon: <Crown size={20} />,  color: '#B9F2FF', weight: 3 },
];

export default function DailySpinPage({ player }: Props) {
  const canSpin = !player.spin_last_date || player.spin_last_date !== new Date().toISOString().slice(0, 10);

  return (
    <div className="p-4 md:p-6 max-w-3xl mx-auto pb-10">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="text-center mb-8"
      >
        <div className="w-16 h-16 rounded-2xl mx-auto mb-4 flex items-center justify-center" style={{ background: 'rgba(255,184,77,0.12)', border: '1px solid rgba(255,184,77,0.25)' }}>
          <Sparkles size={28} style={{ color: '#FFD080' }} />
        </div>
        <h1 className="font-title font-bold text-2xl" style={{ color: '#E6EDF7' }}>Daily Spin</h1>
        <p className="text-sm mt-1" style={{ color: 'rgba(230,237,247,0.4)' }}>
          Spin the wheel once per day for rewards.
        </p>
      </motion.div>

      {/* Wheel placeholder */}
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.15, duration: 0.5 }}
        className="relative w-64 h-64 mx-auto mb-8 rounded-full flex items-center justify-center"
        style={{
          background: 'conic-gradient(from 0deg, rgba(124,92,252,0.3), rgba(0,212,255,0.3), rgba(0,200,150,0.3), rgba(255,184,77,0.3), rgba(124,92,252,0.3))',
          border: '2px solid rgba(124,92,252,0.3)',
        }}
      >
        <div
          className="w-20 h-20 rounded-full flex items-center justify-center"
          style={{ background: '#141B2D', border: '2px solid rgba(255,184,77,0.4)' }}
        >
          <RotateCcw size={28} style={{ color: '#FFD080' }} />
        </div>
      </motion.div>

      <div className="text-center mb-8">
        <button
          disabled={!canSpin}
          className="nx-btn nx-btn-amber gap-2 px-8 py-3"
          style={{
            opacity: canSpin ? 1 : 0.4,
            cursor: canSpin ? 'pointer' : 'not-allowed',
          }}
        >
          <Sparkles size={16} />
          {canSpin ? 'Spin the Wheel' : 'Come Back Tomorrow'}
        </button>
      </div>

      {/* Reward table */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {REWARDS.map((r, i) => (
          <motion.div
            key={r.label}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 + i * 0.05 }}
            className="rounded-xl p-3 flex items-center gap-3"
            style={{ background: 'rgba(28,38,64,0.5)', border: '1px solid rgba(230,237,247,0.06)' }}
          >
            <span style={{ color: r.color }}>{r.icon}</span>
            <div>
              <div className="text-xs font-medium" style={{ color: '#E6EDF7' }}>{r.label}</div>
              <div className="text-2xs" style={{ color: 'rgba(230,237,247,0.3)' }}>{r.weight}% chance</div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
