import { motion } from 'framer-motion';
import { Gem, Lock, Crown, Star } from 'lucide-react';
import { Player } from '../lib/supabase';

interface Props {
  player: Player;
}

const TIERS = [
  { id: 'bronze',   label: 'Bronze',   min: 0,     color: '#CD7F32' },
  { id: 'silver',   label: 'Silver',   min: 1000,  color: '#A0A9BA' },
  { id: 'gold',     label: 'Gold',     min: 3000,  color: '#FFB84D' },
  { id: 'platinum', label: 'Platinum', min: 6000,  color: '#8FCDDD' },
  { id: 'diamond',  label: 'Diamond',  min: 10000, color: '#B9F2FF' },
  { id: 'nexora',   label: 'Nexora',   min: 20000, color: '#9B81FF' },
];

export default function PremiumLeaguePage({ player }: Props) {
  const rankScore = player.rank_score ?? 0;
  const currentTier = TIERS.slice().reverse().find(t => rankScore >= t.min) ?? TIERS[0];
  const nextTier = TIERS.find(t => t.min > rankScore);

  return (
    <div className="p-4 md:p-6 max-w-4xl mx-auto pb-10">
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }} className="text-center mb-8">
        <div className="w-16 h-16 rounded-2xl mx-auto mb-4 flex items-center justify-center" style={{ background: 'rgba(124,92,252,0.12)', border: '1px solid rgba(124,92,252,0.25)' }}>
          <Gem size={28} style={{ color: '#9B81FF' }} />
        </div>
        <h1 className="font-title font-bold text-2xl" style={{ color: '#E6EDF7' }}>Premium League</h1>
        <p className="text-sm mt-1" style={{ color: 'rgba(230,237,247,0.4)' }}>
          Compete at the highest level for exclusive rewards.
        </p>
      </motion.div>

      {/* Current tier card */}
      <motion.div
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.1, duration: 0.4 }}
        className="rounded-2xl p-6 mb-6 relative overflow-hidden"
        style={{
          background: 'linear-gradient(135deg, rgba(28,38,64,0.95) 0%, rgba(20,27,45,0.98) 100%)',
          border: `1px solid ${currentTier.color}40`,
        }}
      >
        <div className="absolute top-0 right-0 w-32 h-32 rounded-full opacity-10" style={{ background: currentTier.color, filter: 'blur(40px)' }} />
        <div className="relative z-10 flex flex-col sm:flex-row items-center gap-4">
          <div className="w-14 h-14 rounded-2xl flex items-center justify-center" style={{ background: `${currentTier.color}20`, border: `1px solid ${currentTier.color}40` }}>
            <Crown size={24} style={{ color: currentTier.color }} />
          </div>
          <div className="text-center sm:text-left flex-1">
            <div className="font-title font-bold text-lg" style={{ color: currentTier.color }}>{currentTier.label} Tier</div>
            <div className="text-sm mt-0.5" style={{ color: 'rgba(230,237,247,0.5)' }}>
              Rank Score: {rankScore.toLocaleString()}
            </div>
          </div>
          {nextTier && (
            <div className="text-center">
              <div className="text-2xs font-title font-semibold uppercase" style={{ color: 'rgba(230,237,247,0.3)' }}>Next Tier</div>
              <div className="font-title font-bold text-sm mt-0.5" style={{ color: nextTier.color }}>{nextTier.label}</div>
              <div className="text-2xs" style={{ color: 'rgba(230,237,247,0.3)' }}>{(nextTier.min - rankScore).toLocaleString()} pts needed</div>
            </div>
          )}
        </div>
      </motion.div>

      {/* Tier progression */}
      <div className="space-y-3">
        {TIERS.map((tier, i) => {
          const unlocked = rankScore >= tier.min;
          return (
            <motion.div
              key={tier.id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 + i * 0.06 }}
              className="flex items-center gap-4 rounded-xl p-4"
              style={{
                background: unlocked ? 'rgba(28,38,64,0.6)' : 'rgba(28,38,64,0.25)',
                border: `1px solid ${unlocked ? tier.color + '30' : 'rgba(230,237,247,0.06)'}`,
                opacity: unlocked ? 1 : 0.6,
              }}
            >
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                style={{ background: unlocked ? `${tier.color}15` : 'rgba(11,16,32,0.5)', border: `1px solid ${unlocked ? tier.color + '30' : 'rgba(230,237,247,0.06)'}` }}
              >
                {unlocked ? <Star size={16} style={{ color: tier.color }} /> : <Lock size={14} style={{ color: 'rgba(230,237,247,0.2)' }} />}
              </div>
              <div className="flex-1">
                <div className="font-title font-semibold text-sm" style={{ color: unlocked ? tier.color : 'rgba(230,237,247,0.3)' }}>{tier.label}</div>
                <div className="text-2xs" style={{ color: 'rgba(230,237,247,0.3)' }}>Min {tier.min.toLocaleString()} pts</div>
              </div>
              {unlocked && (
                <div className="text-2xs font-bold px-2 py-1 rounded-lg" style={{ background: `${tier.color}15`, color: tier.color }}>
                  Unlocked
                </div>
              )}
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
