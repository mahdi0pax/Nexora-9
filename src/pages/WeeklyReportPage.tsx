import { motion } from 'framer-motion';
import { ScrollText, TrendingUp, Target, Zap, Flame, Award } from 'lucide-react';
import { Player } from '../lib/supabase';

interface Props {
  player: Player;
}

export default function WeeklyReportPage({ player }: Props) {
  const accuracy = player.accuracy_rate ?? 0;
  const streak = player.streak_days ?? 0;
  const totalCorrect = player.total_correct ?? 0;
  const totalAnswered = player.total_answered ?? 0;

  const stats = [
    { label: 'Questions', value: totalAnswered, icon: <Target size={14} />, color: '#00D4FF' },
    { label: 'Correct', value: totalCorrect, icon: <Award size={14} />, color: '#33E8B8' },
    { label: 'Accuracy', value: `${accuracy.toFixed(1)}%`, icon: <TrendingUp size={14} />, color: '#9B81FF' },
    { label: 'Streak', value: streak, icon: <Flame size={14} />, color: '#FFB84D' },
  ];

  return (
    <div className="p-4 md:p-6 max-w-3xl mx-auto pb-10">
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }} className="text-center mb-8">
        <div className="w-16 h-16 rounded-2xl mx-auto mb-4 flex items-center justify-center" style={{ background: 'rgba(0,200,150,0.1)', border: '1px solid rgba(0,200,150,0.2)' }}>
          <ScrollText size={28} style={{ color: '#33E8B8' }} />
        </div>
        <h1 className="font-title font-bold text-2xl" style={{ color: '#E6EDF7' }}>Weekly Report</h1>
        <p className="text-sm mt-1" style={{ color: 'rgba(230,237,247,0.4)' }}>
          Your learning recap for the past 7 days.
        </p>
      </motion.div>

      {/* Stats grid */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8"
      >
        {stats.map((s, i) => (
          <motion.div
            key={s.label}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.15 + i * 0.05 }}
            className="rounded-xl p-4 text-center"
            style={{ background: 'rgba(28,38,64,0.5)', border: '1px solid rgba(230,237,247,0.06)' }}
          >
            <div className="flex items-center justify-center gap-1.5 mb-2" style={{ color: s.color }}>
              {s.icon}
            </div>
            <div className="font-title font-bold text-xl" style={{ color: '#E6EDF7' }}>{s.value}</div>
            <div className="text-2xs mt-1 font-title font-semibold uppercase" style={{ color: 'rgba(230,237,247,0.3)' }}>{s.label}</div>
          </motion.div>
        ))}
      </motion.div>

      {/* Activity heatmap placeholder */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="rounded-2xl p-5"
        style={{ background: 'rgba(28,38,64,0.5)', border: '1px solid rgba(230,237,247,0.06)' }}
      >
        <div className="flex items-center gap-2 mb-4">
          <Zap size={16} style={{ color: '#9B81FF' }} />
          <span className="font-title font-semibold text-sm" style={{ color: '#E6EDF7' }}>Activity Heatmap</span>
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
          <span className="text-2xs" style={{ color: 'rgba(230,237,247,0.3)' }}>Less</span>
          {[0.1, 0.2, 0.4, 0.7, 1].map(a => (
            <div key={a} className="w-3 h-3 rounded-sm" style={{ background: `rgba(124,92,252,${a})` }} />
          ))}
          <span className="text-2xs" style={{ color: 'rgba(230,237,247,0.3)' }}>More</span>
        </div>
      </motion.div>
    </div>
  );
}
