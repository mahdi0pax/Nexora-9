import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Gem, Crown, Star, Lock, CheckCircle2, Trophy, Zap, Shield, Sparkles } from 'lucide-react';
import { Player, ShopItem } from '../lib/supabase';
import { Card, IconBox, Button } from '../design-system';
import { type PremiumStatus, type RitualConfig } from '../lib/ritual';
import { rankInfo } from '../lib/constants';

interface Props {
  player: Player;
  premiumStatus: PremiumStatus | null;
  premiumLeaderboard: { wallet_address: string; username: string; rank_tier: string; rank_score: number; total_xp: number; level: number }[];
  ritualConfig: RitualConfig | null;
  shopItems: ShopItem[];
  pendingPayment: boolean;
  onPurchasePremium: (amount: number, durationDays: number) => Promise<boolean>;
}

const TIERS = [
  { id: 'bronze',   label: 'Bronze',   min: 0,     color: '#CD7F32' },
  { id: 'silver',   label: 'Silver',   min: 1000,  color: '#A0A9BA' },
  { id: 'gold',     label: 'Gold',     min: 3000,  color: '#FFB84D' },
  { id: 'platinum', label: 'Platinum', min: 6000,  color: '#8FCDDD' },
  { id: 'diamond',  label: 'Diamond',  min: 10000, color: '#00D4FF' },
  { id: 'nexora',   label: 'Nexora',   min: 20000, color: '#7C5CFC' },
];

type ModalStep = 'confirm' | 'processing' | 'success' | 'error';

export default function PremiumLeaguePage({ player, premiumStatus, premiumLeaderboard, ritualConfig, shopItems, pendingPayment, onPurchasePremium }: Props) {
  const [step, setStep] = useState<ModalStep | null>(null);
  const [error, setError] = useState<string | null>(null);
  const rankScore = player.rank_score ?? 0;
  const currentTier = TIERS.slice().reverse().find(t => rankScore >= t.min) ?? TIERS[0];
  const nextTier = TIERS.find(t => t.min > rankScore);
  const active = !!premiumStatus?.active;
  const premiumItem = shopItems.find(i => i.slug === 'premium_pass');
  const price = premiumItem?.price_ritual ?? 0.15;
  const walletMatches = player.wallet_address;

  async function handleActivate() {
    setStep('confirm');
  }

  async function confirmActivate() {
    setStep('processing');
    setError(null);
    const ok = await onPurchasePremium(price, 7);
    setStep(ok ? 'success' : 'error');
    if (!ok) setError('Ritual payment was rejected or failed in your wallet.');
  }

  return (
    <div className="nx-page">
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }} className="text-center mb-8">
        <div className="relative inline-block">
          <IconBox variant="violet" size="lg" className="mx-auto mb-4"><Gem size={28} /></IconBox>
          {active && (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', stiffness: 400, damping: 18 }}
              className="absolute -top-1 -right-1 w-5 h-5 rounded-full flex items-center justify-center"
              style={{ background: '#00C896', border: '2px solid #0B1020' }}
            >
              <CheckCircle2 size={11} style={{ color: '#0B1020' }} />
            </motion.div>
          )}
        </div>
        <div className="flex items-center justify-center gap-2">
          <h1 className="font-title font-bold text-2xl nx-text-primary">Premium League</h1>
          {active && (
            <span className="inline-flex items-center gap-1 text-2xs font-title font-bold px-2 py-1 rounded-full" style={{ background: 'rgba(124,92,252,0.18)', border: '1px solid rgba(124,92,252,0.4)', color: '#9B81FF' }}>
              <Crown size={11} /> PREMIUM
            </span>
          )}
        </div>
        <p className="text-sm mt-1 nx-text-muted">Exclusive challenges · +25% XP · separate leaderboard · premium badge.</p>
      </motion.div>

      <Card variant="violet" index={0} className="p-6 mb-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 rounded-full opacity-10" style={{ background: currentTier.color, filter: 'blur(40px)' }} />
        <div className="relative z-10 flex flex-col sm:flex-row items-center gap-4">
          <div className="w-14 h-14 rounded-2xl flex items-center justify-center" style={{ background: `${currentTier.color}20`, border: `1px solid ${currentTier.color}40` }}>
            <Crown size={24} style={{ color: currentTier.color }} />
          </div>
          <div className="text-center sm:text-left flex-1">
            <div className="font-title font-bold text-lg" style={{ color: currentTier.color }}>{currentTier.label} Tier</div>
            <div className="text-sm mt-0.5 nx-text-muted">Rank Score: {rankScore.toLocaleString()}</div>
            {active && premiumStatus?.endsAt && (
              <div className="text-2xs mt-1 inline-flex items-center gap-1" style={{ color: '#33E8B8' }}>
                <Shield size={10} /> Premium active until {new Date(premiumStatus.endsAt).toLocaleDateString()}
              </div>
            )}
          </div>
          {nextTier && (
            <div className="text-center">
              <div className="text-2xs font-title font-semibold uppercase nx-text-faint">Next Tier</div>
              <div className="font-title font-bold text-sm mt-0.5" style={{ color: nextTier.color }}>{nextTier.label}</div>
              <div className="text-2xs nx-text-faint">{(nextTier.min - rankScore).toLocaleString()} pts needed</div>
            </div>
          )}
        </div>

        {!active && (
          <div className="relative z-10 mt-5 pt-5" style={{ borderTop: '1px solid rgba(124,92,252,0.15)' }}>
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <Zap size={14} style={{ color: '#9B81FF' }} />
                <span className="text-sm" style={{ color: 'rgba(230,237,247,0.55)' }}>
                  Activate with <strong style={{ color: '#FFD080' }}>{price} RITUAL</strong> for 7 days
                </span>
              </div>
              <Button variant="primary" onClick={handleActivate} disabled={pendingPayment}>
                <Sparkles size={15} /> Activate Premium
              </Button>
            </div>
            <div className="text-2xs mt-2" style={{ color: 'rgba(230,237,247,0.3)' }}>
              Payment routed on-chain to {ritualConfig?.fee_recipient?.slice(0, 10)}...{ritualConfig?.fee_recipient?.slice(-6)} on {ritualConfig?.network_name ?? 'Ritual Testnet'}.
            </div>
          </div>
        )}
      </Card>

      {/* Premium benefits */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-8">
        {[
          { icon: <Zap size={16} />, color: '#9B81FF', title: '+25% Bonus XP', desc: 'Every premium session earns extra XP.' },
          { icon: <Trophy size={16} />, color: '#FFD080', title: 'Premium Leaderboard', desc: 'Compete only with other premium players.' },
          { icon: <Crown size={16} />, color: '#33DEFF', title: 'Premium Badge', desc: 'Exclusive badge on profile and leaderboards.' },
        ].map((b, i) => (
          <Card key={b.title} variant="surface" index={i} className="p-4">
            <div className="flex items-center gap-2 mb-2" style={{ color: b.color }}>{b.icon}</div>
            <div className="font-title font-bold text-sm nx-text-primary">{b.title}</div>
            <div className="text-xs mt-1 nx-text-muted">{b.desc}</div>
          </Card>
        ))}
      </div>

      {/* Tier progression */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }} className="space-y-3 mb-8">
        {TIERS.map((tier, i) => {
          const unlocked = rankScore >= tier.min;
          return (
            <Card key={tier.id} variant={unlocked ? 'default' : 'surface'} index={i} className="flex items-center gap-4 p-4">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: unlocked ? `${tier.color}15` : 'rgba(11,16,32,0.5)', border: `1px solid ${unlocked ? tier.color + '30' : 'rgba(230,237,247,0.06)'}` }}>
                {unlocked ? <Star size={16} style={{ color: tier.color }} /> : <Lock size={14} className="nx-text-faint" />}
              </div>
              <div className="flex-1">
                <div className="font-title font-semibold text-sm" style={{ color: unlocked ? tier.color : 'rgba(230,237,247,0.3)' }}>{tier.label}</div>
                <div className="text-2xs nx-text-faint">Min {tier.min.toLocaleString()} pts</div>
              </div>
              {unlocked && <div className="text-2xs font-bold px-2 py-1 rounded-lg" style={{ background: `${tier.color}15`, color: tier.color }}>Unlocked</div>}
            </Card>
          );
        })}
      </motion.div>

      {/* Premium-only leaderboard */}
      <div className="space-y-3">
        <h3 className="font-title font-bold text-lg nx-text-primary">Premium Leaderboard</h3>
        <Card variant="default" index={0} className="overflow-hidden">
          <div className="flex items-center justify-between px-5 py-3" style={{ background: 'rgba(124,92,252,0.08)', borderBottom: '1px solid rgba(124,92,252,0.15)' }}>
            <div className="flex items-center gap-2">
              <Trophy size={14} style={{ color: '#9B81FF' }} />
              <span className="font-title font-semibold text-sm nx-text-primary">Active Premium Players</span>
            </div>
            <span className="text-2xs nx-text-faint">{premiumLeaderboard.length} active</span>
          </div>
          {premiumLeaderboard.length === 0 ? (
            <div className="py-10 text-center">
              <Crown size={28} className="mx-auto mb-2" style={{ color: 'rgba(230,237,247,0.15)' }} />
              <div className="text-sm nx-text-muted">No premium players yet. Be the first!</div>
            </div>
          ) : (
            <div>
              {premiumLeaderboard.map((entry, i) => {
                const ri = rankInfo(entry.rank_tier);
                const isMe = entry.wallet_address.toLowerCase() === walletMatches.toLowerCase();
                const posLabels: Record<number, string> = { 1: '🥇', 2: '🥈', 3: '🥉' };
                return (
                  <div key={entry.wallet_address} className="flex items-center gap-4 px-5 py-3" style={{ background: isMe ? 'rgba(124,92,252,0.08)' : 'transparent', borderBottom: i < premiumLeaderboard.length - 1 ? '1px solid rgba(230,237,247,0.04)' : 'none' }}>
                    <div className="w-7 text-center text-sm font-title font-bold" style={{ color: 'rgba(230,237,247,0.3)' }}>{posLabels[i + 1] ?? i + 1}</div>
                    <div className="w-8 h-8 rounded-xl flex items-center justify-center text-xs font-title font-bold flex-shrink-0" style={{ background: ri.color + '22', color: ri.color }}>
                      {entry.username.slice(0, 2).toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-title font-semibold text-sm truncate" style={{ color: isMe ? '#9B81FF' : '#E6EDF7' }}>
                        {entry.username}{isMe && <span className="text-xs ml-1" style={{ color: '#9B81FF' }}>(you)</span>}
                      </div>
                      <div className="text-2xs" style={{ color: ri.color }}>{ri.label} ·Lv {entry.level}</div>
                    </div>
                    <div className="text-right">
                      <div className="font-title font-extrabold text-sm nx-text-primary">{entry.rank_score.toLocaleString()}</div>
                      <div className="text-2xs nx-text-faint">{entry.total_xp.toLocaleString()} XP</div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </Card>
      </div>

      {/* Activate modal */}
      <AnimatePresence>
        {step && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            style={{ background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(8px)' }}
            onClick={() => step === 'processing' ? null : setStep(null)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 12 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 12 }}
              transition={{ type: 'spring', stiffness: 300, damping: 25 }}
              className="rounded-2xl p-6 w-full max-w-sm"
              style={{ background: 'linear-gradient(145deg, rgba(28,38,64,0.98), rgba(20,27,45,0.99))', border: '1px solid rgba(124,92,252,0.25)', boxShadow: '0 24px 80px rgba(0,0,0,0.6)' }}
              onClick={e => e.stopPropagation()}
            >
              {step === 'confirm' && (
                <div className="space-y-5">
                  <div className="text-center space-y-3">
                    <div className="w-16 h-16 rounded-2xl mx-auto flex items-center justify-center" style={{ background: 'rgba(124,92,252,0.15)', border: '1px solid rgba(124,92,252,0.35)', color: '#9B81FF' }}>
                      <Gem size={28} />
                    </div>
                    <div>
                      <div className="font-title font-bold text-lg nx-text-primary">Activate Premium League</div>
                      <div className="text-sm nx-text-muted">7 days of premium access</div>
                    </div>
                    <div className="rounded-xl p-4 text-center" style={{ background: 'rgba(20,27,45,0.8)', border: '1px solid rgba(230,237,247,0.07)' }}>
                      <div className="font-title font-extrabold text-2xl nx-text-primary">
                        {price}<span className="text-sm ml-1" style={{ color: '#FFB84D' }}>RITUAL</span>
                      </div>
                      <div className="text-xs mt-1 nx-text-faint">On-chain Ritual testnet payment</div>
                      <div className="text-2xs mt-1 font-mono nx-text-faint">to {ritualConfig?.fee_recipient?.slice(0, 10)}...{ritualConfig?.fee_recipient?.slice(-6)}</div>
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <button className="flex-1 h-11 rounded-xl font-title font-semibold text-sm" style={{ background: 'rgba(28,38,64,0.8)', border: '1px solid rgba(230,237,247,0.1)', color: 'rgba(230,237,247,0.6)' }} onClick={() => setStep(null)}>Cancel</button>
                    <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }} className="flex-1 h-11 rounded-xl flex items-center justify-center gap-2 font-title font-bold text-sm" style={{ background: 'linear-gradient(135deg, #7C5CFC, #5E3DE8)', color: '#fff' }} onClick={confirmActivate}>
                      <Zap size={15} /> Pay {price} RITUAL
                    </motion.button>
                  </div>
                </div>
              )}
              {step === 'processing' && (
                <div className="text-center space-y-4 py-6">
                  <div className="w-12 h-12 rounded-full border-2 mx-auto animate-spin" style={{ borderColor: 'rgba(230,237,247,0.1)', borderTopColor: '#9B81FF' }} />
                  <div className="font-title font-semibold nx-text-primary">Sign in your wallet...</div>
                  <div className="text-sm nx-text-muted">Approve the Ritual testnet transfer</div>
                </div>
              )}
              {step === 'success' && (
                <div className="text-center space-y-4 py-4">
                  <motion.div initial={{ scale: 0.5, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ type: 'spring', stiffness: 300, damping: 20 }} className="w-16 h-16 rounded-full mx-auto flex items-center justify-center" style={{ background: 'rgba(0,200,150,0.15)', border: '2px solid rgba(0,200,150,0.4)' }}>
                    <CheckCircle2 size={32} style={{ color: '#33E8B8' }} />
                  </motion.div>
                  <div>
                    <div className="font-title font-bold text-lg nx-text-primary">Premium Activated!</div>
                    <div className="text-sm nx-text-muted">Enjoy +25% XP and exclusive challenges for 7 days.</div>
                  </div>
                  <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }} className="w-full h-11 rounded-xl font-title font-bold text-sm" style={{ background: 'linear-gradient(135deg, #7C5CFC, #5E3DE8)', color: '#fff' }} onClick={() => setStep(null)}>Done</motion.button>
                </div>
              )}
              {step === 'error' && (
                <div className="text-center space-y-4 py-4">
                  <div className="w-16 h-16 rounded-full mx-auto flex items-center justify-center" style={{ background: 'rgba(224,85,85,0.12)', border: '2px solid rgba(224,85,85,0.3)' }}>
                    <Lock size={28} style={{ color: '#FF6B6B' }} />
                  </div>
                  <div>
                    <div className="font-title font-bold text-lg nx-text-primary">Activation Failed</div>
                    <div className="text-sm nx-text-muted">{error ?? 'Payment was rejected.'}</div>
                  </div>
                  <div className="flex gap-3">
                    <button className="flex-1 h-11 rounded-xl font-title font-semibold text-sm" style={{ background: 'rgba(28,38,64,0.8)', border: '1px solid rgba(230,237,247,0.1)', color: 'rgba(230,237,247,0.6)' }} onClick={() => setStep(null)}>Close</button>
                    <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }} className="flex-1 h-11 rounded-xl font-title font-bold text-sm" style={{ background: 'linear-gradient(135deg, #7C5CFC, #5E3DE8)', color: '#fff' }} onClick={confirmActivate}>Retry</motion.button>
                  </div>
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
