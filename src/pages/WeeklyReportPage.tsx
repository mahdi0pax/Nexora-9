import { motion } from 'framer-motion';
import { ScrollText, TrendingUp, Target, Zap, Flame, Award } from 'lucide-react';
import { Player } from '../lib/supabase';
import { Card, IconBox } from '../design-system';

interface Props {
  player: Player;
}

export default function WeeklyReportPage({ player }: Props) {
  const accuracy = player.accuracy_rate ?? 0;
  const streak = player.streak_days ?? 0;
  const totalCorrect = player.total_correct ?? 0;
  const totalAnswered = player.total_answered ?? 0;

  const stats = [
    { label: 'Questions', value: totalAnswered, icon: <Target size={14} />, color: '#00D4FF' as const, variant: 'cyan' as const },
    { label: 'Correct', value: totalCorrect, icon: <Award size={14} />, color: '#00C896' as const, variant: 'emerald' as const },
    { label: 'Accuracy', value: `${accuracy.toFixed(1)}%`, icon: <TrendingUp size={14} />, color: '#7C5CFC' as const, variant: 'violet' as const },
    { label: 'Streak', value: streak, icon: <Flame size={14} />, color: '#FFB84D' as const, variant: 'amber' as const },
  ];

  return (
    <div className="nx-page">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }} className="text-center mb-8">
        <IconBox variant="emerald" size="lg" className="mx-auto mb-4"><ScrollText size={28} /></IconBox>
        <h1 className="font-title font-bold text-2xl nx-text-primary">Weekly Report</h1>
        <p className="text-sm mt-1 nx-text-muted">Your learning recap for the past 7 days.</p>
      </motion.div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8">
        {stats.map((s, i) => (
          <Card key={s.label} variant={s.variant} index={i} className="p-4 text-center">
            <div className="flex items-center justify-center mb-2" style={{ color: s.color }}>
              {s.icon}
            </div>
            <div className="font-title font-bold text-xl nx-text-primary">{s.value}</div>
            <div className="text-2xs mt-1 font-title font-semibold uppercase nx-text-faint">{s.label}</div>
          </Card>
        ))}
      </div>

      {/* Activity heatmap */}
      <Card variant="default" index={4} className="p-5">
        <div className="flex items-center gap-2 mb-4">
          <Zap size={16} className="nx-text-violet" />
          <span className="font-title font-semibold text-sm nx-text-primary">Activity Heatmap</span>
        </div>
        <div className="grid grid-cols-7 gap-2">
          {Array.from({ length: 28 }).map((_, i) => {
            const intensity = [0, 0.1, 0.2, 0.4, 0.7][Math.floor(Math.random() * 5)];
            return (
              <div
                key={i}
                className="aspect-square rounded-md"
                style={{
                  background: `rgba(124,92,252,${intensity})`,
                  border: `1px solid rgba(124,92,252,${intensity * 0.5})`,
                }}
              />
            );
          })}
        </div>
        <div className="flex items-center justify-end gap-2 mt-3">
          <span className="text-2xs nx-text-faint">Less</span>
          {[0.1, 0.2, 0.4, 0.7, 1].map(a => (
            <div key={a} className="w-3 h-3 rounded-sm" style={{ background: `rgba(124,92,252,${a})` }} />
          ))}
          <span className="text-2xs nx-text-faint">More</span>
        </div>
      </Card>
    </div>
  );
}
