import { motion } from 'framer-motion';
import { Sparkles, Gift, Zap, Crown, Shield, Star, RotateCcw } from 'lucide-react';
import { Player } from '../lib/supabase';
import { Card, IconBox, Button } from '../design-system';

interface Props {
  player: Player;
}

const REWARDS = [
  { label: '50 RITUAL',   icon: <Zap size={20} />,     color: '#FFB84D', weight: 35 },
  { label: '100 RITUAL',  icon: <Zap size={20} />,     color: '#FFB84D', weight: 20 },
  { label: 'XP Boost',    icon: <Star size={20} />,     color: '#7C5CFC', weight: 15 },
  { label: 'Streak Shield', icon: <Shield size={20} />, color: '#00C896', weight: 15 },
  { label: 'Premium Crate', icon: <Gift size={20} />,   color: '#00D4FF', weight: 12 },
  { label: 'Nexora Crown',  icon: <Crown size={20} />,  color: '#00D4FF', weight: 3 },
];

export default function DailySpinPage({ player }: Props) {
  const canSpin = !player.spin_last_date || player.spin_last_date !== new Date().toISOString().slice(0, 10);

  return (
    <div className="nx-page">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="text-center mb-8"
      >
        <IconBox variant="amber" size="lg" className="mx-auto mb-4"><Sparkles size={28} /></IconBox>
        <h1 className="font-title font-bold text-2xl nx-text-primary">Daily Spin</h1>
        <p className="text-sm mt-1 nx-text-muted">Spin the wheel once per day for rewards.</p>
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
          <RotateCcw size={28} className="nx-text-amber" />
        </div>
      </motion.div>

      <div className="text-center mb-8">
        <Button variant="amber" disabled={!canSpin}>
          <Sparkles size={16} />
          {canSpin ? 'Spin the Wheel' : 'Come Back Tomorrow'}
        </Button>
      </div>

      {/* Reward table */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {REWARDS.map((r, i) => (
          <Card key={r.label} variant="surface" index={i} className="p-3 flex items-center gap-3">
            <span style={{ color: r.color }}>{r.icon}</span>
            <div>
              <div className="text-xs font-medium nx-text-primary">{r.label}</div>
              <div className="text-2xs nx-text-faint">{r.weight}% chance</div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
