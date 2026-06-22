import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Swords, Shield, Zap, Clock, Trophy, ChevronRight, Lock, CheckCircle2, Ticket } from 'lucide-react';
import { Player, ShopItem } from '../lib/supabase';
import { Card, IconBox } from '../design-system';
import { type BossAccessStatus, type RitualConfig, transactionExplorerUrl, bossWeekKey } from '../lib/ritual';

interface Props {
  player: Player;
  bossAccess: BossAccessStatus | null;
  ritualConfig: RitualConfig | null;
  shopItems: ShopItem[];
  pendingPayment: boolean;
  transactions: { transaction_hash: string; payment_kind: string }[];
  onBuyBossTicket: () => Promise<boolean>;
  onStartBoss: (categoryId: string) => void;
}

interface Boss {
  id: string;
  name: string;
  category: string;
  difficulty: string;
  reward: string;
  color: string;
  icon: React.ReactNode;
}

const BOSSES: Boss[] = [
  { id: 'science_boss',  name: 'The Alchemist',  category: 'science',     difficulty: 'Expert', reward: '1500 XP + Rare loot',   color: '#00D4FF', icon: <Shield size={28} /> },
  { id: 'history_boss',  name: 'The Chronicler', category: 'history',     difficulty: 'Expert', reward: '1500 XP + Rare loot',   color: '#CD7F32', icon: <Shield size={28} /> },
  { id: 'crypto_boss',   name: 'The Oracle',     category: 'crypto_web3', difficulty: 'Elite',  reward: '3000 XP + Legendary loot', color: '#B9F2FF', icon: <Swords size={28} /> },
];

type ModalStep = 'confirm' | 'processing' | 'success' | 'error';

export default function BossChallengePage({ player, bossAccess, ritualConfig, shopItems, pendingPayment, transactions, onBuyBossTicket, onStartBoss }: Props) {
  const [step, setStep] = useState<ModalStep | null>(null);
  const [error, setError] = useState<string | null>(null);
  const bossItem = shopItems.find(i => i.slug === 'boss_ticket');
  const ticketPrice = bossItem?.price_ritual ?? 0.2;
  const hasAccess = !!bossAccess?.hasAccess;
  const weekKey = bossAccess?.weekKey ?? bossWeekKey();
  const eligibleByRank = player.level >= 5;
  const latestTx = transactions.find(t => t.payment_kind === 'boss_ticket');

  async function handleBuyTicket() {
    setStep('confirm');
  }

  async function confirmBuy() {
    setStep('processing');
    setError(null);
    const ok = await onBuyBossTicket();
    setStep(ok ? 'success' : 'error');
    if (!ok) setError('Ritual payment was rejected or failed in your wallet.');
  }

  return (
    <div className="nx-page">
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }} className="text-center mb-8">
        <IconBox variant="cyan" size="lg" className="mx-auto mb-4"><Swords size={28} /></IconBox>
        <h1 className="font-title font-bold text-2xl nx-text-primary">Boss Challenge</h1>
        <p className="text-sm mt-1 nx-text-muted">Weekly elite opponents. Higher difficulty, bigger rewards.</p>
      </motion.div>

      {/* Access status + stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-8">
        <Card variant={hasAccess ? 'emerald' : 'surface'} index={0} className="p-4 text-center">
          <div className="flex items-center justify-center gap-1.5 mb-1" style={{ color: hasAccess ? '#33E8B8' : '#FFB84D' }}>
            {hasAccess ? <CheckCircle2 size={14} /> : <Lock size={14} />}
          </div>
          <div className="font-title font-bold text-sm nx-text-primary">{hasAccess ? 'Access Granted' : 'No Access'}</div>
          <div className="text-2xs font-title font-semibold uppercase nx-text-faint">{weekKey}{bossAccess?.accessKind ? ` · ${bossAccess.accessKind}` : ''}</div>
        </Card>
        <Card variant="surface" index={1} className="p-4 text-center">
          <div className="flex items-center justify-center gap-1.5 mb-1" style={{ color: '#FFB84D' }}><Trophy size={14} /></div>
          <div className="font-title font-bold text-lg nx-text-primary">{player.boss_wins ?? 0}</div>
          <div className="text-2xs font-title font-semibold uppercase nx-text-faint">Boss Wins</div>
        </Card>
        <Card variant="surface" index={2} className="p-4 text-center">
          <div className="flex items-center justify-center gap-1.5 mb-1" style={{ color: '#7C5CFC' }}><Zap size={14} /></div>
          <div className="font-title font-bold text-lg nx-text-primary">×3</div>
          <div className="text-2xs font-title font-semibold uppercase nx-text-faint">XP Multiplier</div>
        </Card>
      </div>

      {/* Access gate */}
      {!hasAccess && (
        <Card variant="default" index={3} className="p-5 mb-6">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: 'rgba(185,242,255,0.12)', border: '1px solid rgba(185,242,255,0.3)', color: '#B9F2FF' }}>
                <Ticket size={18} />
              </div>
              <div>
                <div className="font-title font-bold text-sm nx-text-primary">Unlock This Week's Boss</div>
                <div className="text-xs mt-0.5 nx-text-muted">
                  {eligibleByRank
                    ? <>Eligible by level. Pay <strong style={{ color: '#FFD080' }}>{ticketPrice} RITUAL</strong> for a Boss Ticket.</>
                    : <>Reach Level 5 to become eligible, or buy a Boss Ticket for direct access.</>}
                </div>
                <div className="text-2xs mt-1 font-mono nx-text-faint">to {ritualConfig?.fee_recipient?.slice(0, 10)}...{ritualConfig?.fee_recipient?.slice(-6)} on {ritualConfig?.network_name ?? 'Ritual Testnet'}</div>
              </div>
            </div>
            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              disabled={pendingPayment}
              onClick={handleBuyTicket}
              className="nx-btn nx-btn-cyan nx-btn-sm flex-shrink-0 gap-2"
            >
              <Ticket size={14} /> Buy Ticket · {ticketPrice} RITUAL
            </motion.button>
          </div>
        </Card>
      )}

      {/* Boss cards */}
      <div className="space-y-4">
        {BOSSES.map((boss, i) => {
          const locked = !hasAccess;
          return (
            <Card
              key={boss.id}
              variant="default"
              index={i}
              className="p-5 relative overflow-hidden group"
              hover={!locked}
              onClick={() => !locked && onStartBoss(boss.category)}
            >
              <div className="absolute top-0 right-0 w-40 h-40 rounded-full opacity-10 group-hover:opacity-15 transition-opacity" style={{ background: boss.color, filter: 'blur(50px)' }} />
              <div className="relative z-10 flex items-center gap-4">
                <div className="w-14 h-14 rounded-2xl flex items-center justify-center flex-shrink-0" style={{ background: `${boss.color}15`, border: `1px solid ${boss.color}30`, color: locked ? 'rgba(230,237,247,0.2)' : boss.color }}>
                  {locked ? <Lock size={24} style={{ color: 'rgba(230,237,247,0.2)' }} /> : boss.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-title font-bold text-base nx-text-primary">{boss.name}</span>
                    <span className="text-2xs font-bold px-2 py-0.5 rounded-md" style={{ background: `${boss.color}15`, color: boss.color }}>{boss.difficulty}</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs mt-1 nx-text-muted">
                    <Clock size={11} /> 10 questions
                    <span style={{ color: 'rgba(230,237,247,0.2)' }}>·</span>
                    <span style={{ color: '#FFD080' }}>{boss.reward}</span>
                  </div>
                </div>
                {locked ? (
                  <Lock size={18} className="nx-text-faint" />
                ) : (
                  <ChevronRight size={18} className="nx-text-faint group-hover:translate-x-0.5 transition-transform" />
                )}
              </div>
            </Card>
          );
        })}
      </div>

      {/* Buy ticket modal */}
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
              style={{ background: 'linear-gradient(145deg, rgba(28,38,64,0.98), rgba(20,27,45,0.99))', border: '1px solid rgba(185,242,255,0.25)', boxShadow: '0 24px 80px rgba(0,0,0,0.6)' }}
              onClick={e => e.stopPropagation()}
            >
              {step === 'confirm' && (
                <div className="space-y-5">
                  <div className="text-center space-y-3">
                    <div className="w-16 h-16 rounded-2xl mx-auto flex items-center justify-center" style={{ background: 'rgba(185,242,255,0.12)', border: '1px solid rgba(185,242,255,0.3)', color: '#B9F2FF' }}>
                      <Ticket size={28} />
                    </div>
                    <div>
                      <div className="font-title font-bold text-lg nx-text-primary">Buy Boss Ticket</div>
                      <div className="text-sm nx-text-muted">Weekly Boss Challenge access</div>
                    </div>
                    <div className="rounded-xl p-4 text-center" style={{ background: 'rgba(20,27,45,0.8)', border: '1px solid rgba(230,237,247,0.07)' }}>
                      <div className="font-title font-extrabold text-2xl nx-text-primary">{ticketPrice}<span className="text-sm ml-1" style={{ color: '#FFB84D' }}>RITUAL</span></div>
                      <div className="text-xs mt-1 nx-text-faint">On-chain Ritual testnet payment</div>
                      <div className="text-2xs mt-1 font-mono nx-text-faint">to {ritualConfig?.fee_recipient?.slice(0, 10)}...{ritualConfig?.fee_recipient?.slice(-6)}</div>
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <button className="flex-1 h-11 rounded-xl font-title font-semibold text-sm" style={{ background: 'rgba(28,38,64,0.8)', border: '1px solid rgba(230,237,247,0.1)', color: 'rgba(230,237,247,0.6)' }} onClick={() => setStep(null)}>Cancel</button>
                    <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }} className="flex-1 h-11 rounded-xl flex items-center justify-center gap-2 font-title font-bold text-sm" style={{ background: 'linear-gradient(135deg, #33DEFF, #00A8CC)', color: '#0B1020' }} onClick={confirmBuy}>
                      <Zap size={15} /> Pay {ticketPrice} RITUAL
                    </motion.button>
                  </div>
                </div>
              )}
              {step === 'processing' && (
                <div className="text-center space-y-4 py-6">
                  <div className="w-12 h-12 rounded-full border-2 mx-auto animate-spin" style={{ borderColor: 'rgba(230,237,247,0.1)', borderTopColor: '#B9F2FF' }} />
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
                    <div className="font-title font-bold text-lg nx-text-primary">Ticket Acquired!</div>
                    <div className="text-sm nx-text-muted">You now have access to this week's Boss Challenges.</div>
                  </div>
                  {latestTx && (
                    <div className="text-2xs px-3 py-2 rounded-lg" style={{ background: 'rgba(11,16,32,0.6)', border: '1px solid rgba(230,237,247,0.07)' }}>
                      <div style={{ color: 'rgba(230,237,247,0.35)' }}>Transaction hash</div>
                      <div className="font-mono truncate mt-0.5" style={{ color: '#33E8B8' }}>{latestTx.transaction_hash.slice(0, 22)}...{latestTx.transaction_hash.slice(-8)}</div>
                      {transactionExplorerUrl(ritualConfig, latestTx.transaction_hash) && (
                        <a href={transactionExplorerUrl(ritualConfig, latestTx.transaction_hash)!} target="_blank" rel="noopener noreferrer" className="text-xs mt-1 inline-block" style={{ color: '#9B81FF' }}>View on explorer →</a>
                      )}
                    </div>
                  )}
                  <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }} className="w-full h-11 rounded-xl font-title font-bold text-sm" style={{ background: 'linear-gradient(135deg, #33DEFF, #00A8CC)', color: '#0B1020' }} onClick={() => setStep(null)}>Done</motion.button>
                </div>
              )}
              {step === 'error' && (
                <div className="text-center space-y-4 py-4">
                  <div className="w-16 h-16 rounded-full mx-auto flex items-center justify-center" style={{ background: 'rgba(224,85,85,0.12)', border: '2px solid rgba(224,85,85,0.3)' }}>
                    <Lock size={28} style={{ color: '#FF6B6B' }} />
                  </div>
                  <div>
                    <div className="font-title font-bold text-lg nx-text-primary">Purchase Failed</div>
                    <div className="text-sm nx-text-muted">{error ?? 'Payment was rejected.'}</div>
                  </div>
                  <div className="flex gap-3">
                    <button className="flex-1 h-11 rounded-xl font-title font-semibold text-sm" style={{ background: 'rgba(28,38,64,0.8)', border: '1px solid rgba(230,237,247,0.1)', color: 'rgba(230,237,247,0.6)' }} onClick={() => setStep(null)}>Close</button>
                    <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }} className="flex-1 h-11 rounded-xl font-title font-bold text-sm" style={{ background: 'linear-gradient(135deg, #33DEFF, #00A8CC)', color: '#0B1020' }} onClick={confirmBuy}>Retry</motion.button>
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
