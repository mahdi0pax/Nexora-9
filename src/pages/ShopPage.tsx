import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ShoppingBag, Zap, Shield, Sword, Star, Package,
  CheckCircle2, Clock, Gift, ChevronRight, Info, X, ChevronLeft,
} from 'lucide-react';
import { ShopItem, InventoryItem, getShopItems } from '../lib/supabase';
import { Player } from '../lib/supabase';

type ShopCategory = 'all' | 'boost' | 'protection' | 'utility' | 'access' | 'crate';

const CAT_TABS: { id: ShopCategory; label: string; icon: React.ReactNode }[] = [
  { id: 'all',        label: 'All Items',  icon: <ShoppingBag size={13} /> },
  { id: 'boost',      label: 'Boosts',     icon: <Zap size={13} /> },
  { id: 'protection', label: 'Protection', icon: <Shield size={13} /> },
  { id: 'utility',    label: 'Utility',    icon: <Star size={13} /> },
  { id: 'access',     label: 'Access',     icon: <Sword size={13} /> },
  { id: 'crate',      label: 'Crates',     icon: <Gift size={13} /> },
];

const RARITY_STYLES: Record<string, { color: string; label: string; bg: string; border: string }> = {
  common:    { color: '#B0C4DE', label: 'Common',    bg: 'rgba(176,196,222,0.07)', border: 'rgba(176,196,222,0.15)' },
  uncommon:  { color: '#33E8B8', label: 'Uncommon',  bg: 'rgba(0,200,150,0.08)',   border: 'rgba(0,200,150,0.25)' },
  rare:      { color: '#33DEFF', label: 'Rare',      bg: 'rgba(0,212,255,0.08)',   border: 'rgba(0,212,255,0.25)' },
  epic:      { color: '#9B81FF', label: 'Epic',      bg: 'rgba(124,92,252,0.1)',   border: 'rgba(124,92,252,0.3)' },
  legendary: { color: '#FFD080', label: 'Legendary', bg: 'rgba(255,208,128,0.08)', border: 'rgba(255,208,128,0.25)' },
};

const CAT_ICONS: Record<string, React.ReactNode> = {
  boost:      <Zap size={22} />,
  protection: <Shield size={22} />,
  utility:    <Star size={22} />,
  access:     <Sword size={22} />,
  crate:      <Gift size={22} />,
};

interface Props {
  player:    Player;
  inventory: InventoryItem[];
  onPurchase:(slug: string, price: number) => Promise<boolean>;
  onBack:    () => void;
}

interface PurchaseModal {
  item:     ShopItem;
  step:     'confirm' | 'processing' | 'success' | 'error';
  errorMsg?: string;
}

const itemVariants = {
  hidden:  { opacity: 0, y: 20 },
  visible: (i: number) => ({ opacity: 1, y: 0, transition: { duration: 0.4, delay: i * 0.05, ease: [0.22, 1, 0.36, 1] as const } }),
};

export default function ShopPage({ player, inventory, onPurchase, onBack }: Props) {
  const [items, setItems]       = useState<ShopItem[]>([]);
  const [loading, setLoading]   = useState(true);
  const [cat, setCat]           = useState<ShopCategory>('all');
  const [modal, setModal]       = useState<PurchaseModal | null>(null);
  const [selected, setSelected] = useState<ShopItem | null>(null);

  useEffect(() => {
    getShopItems().then(d => { setItems(d); setLoading(false); });
  }, []);

  const filtered = cat === 'all' ? items : items.filter(i => i.category === cat);
  const ownedMap = Object.fromEntries(inventory.map(i => [i.item_slug, i]));

  async function handlePurchase(item: ShopItem) {
    setModal({ item, step: 'confirm' });
  }

  async function confirmPurchase() {
    if (!modal) return;
    setModal(m => m ? { ...m, step: 'processing' } : null);
    const ok = await onPurchase(modal.item.slug, modal.item.price_ritual);
    setModal(m => m ? { ...m, step: ok ? 'success' : 'error', errorMsg: ok ? undefined : 'Transaction failed. Please try again.' } : null);
  }

  const rs = (item: ShopItem) => RARITY_STYLES[item.rarity] ?? RARITY_STYLES.common;

  return (
    <div className="p-4 md:p-6 max-w-5xl mx-auto space-y-7 pb-10">

      {/* Header */}
      <button onClick={onBack} className="nx-nav-item w-fit"><ChevronLeft size={16} /> Dashboard</button>
      <motion.div
        initial={{ opacity: 0, y: -12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="space-y-2"
      >
        <div
          className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-title font-semibold tracking-widest uppercase"
          style={{ background: 'rgba(255,184,77,0.1)', border: '1px solid rgba(255,184,77,0.2)', color: '#FFB84D' }}
        >
          <ShoppingBag size={10} /> RITUAL Shop
        </div>
        <h1
          className="font-title font-extrabold text-3xl md:text-4xl"
          style={{ color: '#E6EDF7', letterSpacing: '-0.04em' }}
        >
          Item Shop
        </h1>
        <div className="flex items-center gap-3 flex-wrap">
          <p className="text-sm" style={{ color: 'rgba(230,237,247,0.4)' }}>
            Enhance gameplay with RITUAL tokens.
          </p>
          <div
            className="flex items-center gap-2 px-3 py-1 rounded-xl text-xs"
            style={{ background: 'rgba(28,38,64,0.8)', border: '1px solid rgba(230,237,247,0.07)' }}
          >
            <Package size={12} style={{ color: '#FFB84D' }} />
            <span className="font-title font-bold" style={{ color: '#FFB84D' }}>{inventory.length}</span>
            <span style={{ color: 'rgba(230,237,247,0.35)' }}>owned</span>
            <span style={{ color: 'rgba(230,237,247,0.2)' }}>·</span>
            <span className="font-title font-bold" style={{ color: '#FFD080' }}>{player.ritual_balance?.toFixed(2) ?? '0.00'}</span>
            <span style={{ color: 'rgba(230,237,247,0.35)' }}>RITUAL</span>
          </div>
        </div>
      </motion.div>

      {/* Category tabs */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.1 }}
        className="flex gap-1.5 flex-wrap"
      >
        {CAT_TABS.map(t => (
          <button
            key={t.id}
            onClick={() => setCat(t.id)}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-title font-semibold transition-all"
            style={cat === t.id
              ? { background: 'rgba(124,92,252,0.18)', border: '1px solid rgba(124,92,252,0.3)', color: '#9B81FF' }
              : { background: 'rgba(20,27,45,0.6)', border: '1px solid rgba(230,237,247,0.07)', color: 'rgba(230,237,247,0.45)' }
            }
          >
            {t.icon}
            <span className="hidden sm:inline">{t.label}</span>
          </button>
        ))}
      </motion.div>

      {/* Items grid */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="w-8 h-8 rounded-full border-2 animate-spin" style={{ borderColor: 'rgba(230,237,247,0.1)', borderTopColor: '#9B81FF' }} />
        </div>
      ) : filtered.length === 0 ? (
        <div className="py-20 text-center">
          <ShoppingBag size={36} className="mx-auto mb-3" style={{ color: 'rgba(230,237,247,0.15)' }} />
          <div className="text-sm" style={{ color: 'rgba(230,237,247,0.35)' }}>No items in this category.</div>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((item, i) => {
            const r     = rs(item);
            const owned = ownedMap[item.slug];
            const isSpecial = item.rarity === 'legendary' || item.rarity === 'epic';

            return (
              <motion.div
                key={item.id}
                custom={i}
                variants={itemVariants}
                initial="hidden"
                animate="visible"
                whileHover={{ y: -3, transition: { duration: 0.2 } }}
                className="rounded-2xl flex flex-col gap-4 p-5 relative overflow-hidden cursor-pointer"
                style={{
                  background: 'linear-gradient(145deg, rgba(28,38,64,0.9), rgba(20,27,45,0.95))',
                  border: `1px solid ${isSpecial ? r.border : 'rgba(230,237,247,0.07)'}`,
                  boxShadow: isSpecial ? `0 4px 24px ${r.color}10` : '0 4px 20px rgba(0,0,0,0.4)',
                }}
                onClick={() => setSelected(item)}
              >
                {isSpecial && (
                  <div className="absolute inset-0 pointer-events-none" style={{ background: `radial-gradient(ellipse at top, ${r.color}06, transparent 60%)` }} />
                )}

                <div className="flex items-start justify-between relative z-10">
                  <div
                    className="w-12 h-12 rounded-2xl flex items-center justify-center"
                    style={{ background: r.bg, border: `1px solid ${r.border}`, color: r.color }}
                  >
                    {CAT_ICONS[item.category] ?? <ShoppingBag size={20} />}
                  </div>
                  <span
                    className="text-2xs font-title font-semibold px-2 py-0.5 rounded-full"
                    style={{ background: r.bg, color: r.color, border: `1px solid ${r.border}` }}
                  >
                    {r.label}
                  </span>
                </div>

                <div className="flex-1 space-y-1 relative z-10">
                  <div className="font-title font-bold text-sm" style={{ color: '#E6EDF7' }}>{item.name}</div>
                  <div className="text-xs leading-relaxed" style={{ color: 'rgba(230,237,247,0.5)' }}>{item.description}</div>
                  {item.duration_hours && (
                    <div className="flex items-center gap-1.5 text-xs mt-1" style={{ color: 'rgba(230,237,247,0.3)' }}>
                      <Clock size={11} />
                      {item.duration_hours >= 24 ? `${item.duration_hours / 24}d duration` : `${item.duration_hours}h duration`}
                    </div>
                  )}
                </div>

                <div className="flex items-center justify-between relative z-10">
                  <div>
                    <div className="font-title font-extrabold text-base" style={{ color: '#E6EDF7' }}>
                      {item.price_ritual}
                      <span className="text-xs ml-1 font-semibold" style={{ color: '#FFB84D' }}>RITUAL</span>
                    </div>
                  </div>
                  {owned ? (
                    <span className="flex items-center gap-1 text-xs font-title font-semibold" style={{ color: '#33E8B8' }}>
                      <CheckCircle2 size={13} /> Owned
                    </span>
                  ) : (
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-title font-bold"
                      style={{ background: 'linear-gradient(135deg, #7C5CFC, #5E3DE8)', color: '#fff' }}
                      onClick={e => { e.stopPropagation(); handlePurchase(item); }}
                    >
                      Buy <ChevronRight size={11} />
                    </motion.button>
                  )}
                </div>
              </motion.div>
            );
          })}
        </div>
      )}

      {/* Inventory section */}
      {inventory.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="space-y-4"
        >
          <h3 className="font-title font-bold text-lg" style={{ color: '#E6EDF7' }}>Your Inventory</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {inventory.map(inv => {
              const item    = items.find(i => i.slug === inv.item_slug);
              const expired = inv.expires_at && new Date(inv.expires_at) < new Date();
              return (
                <div
                  key={inv.id}
                  className="rounded-2xl p-4 flex items-center gap-3"
                  style={{
                    background: 'linear-gradient(145deg, rgba(28,38,64,0.9), rgba(20,27,45,0.95))',
                    border: '1px solid rgba(230,237,247,0.07)',
                    opacity: expired ? 0.5 : 1,
                  }}
                >
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                    style={{ background: 'rgba(28,38,64,0.8)', border: '1px solid rgba(230,237,247,0.1)', color: 'rgba(230,237,247,0.5)' }}
                  >
                    {item ? (CAT_ICONS[item.category] ?? <Package size={18} />) : <Package size={18} />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-title font-semibold text-sm truncate" style={{ color: '#E6EDF7' }}>
                      {item?.name ?? inv.item_slug}
                    </div>
                    <div className="text-2xs" style={{ color: 'rgba(230,237,247,0.35)' }}>
                      {inv.is_active && !expired
                        ? <span style={{ color: '#33E8B8' }}>Active</span>
                        : expired
                        ? <span style={{ color: '#FF6B6B' }}>Expired</span>
                        : 'Inactive'
                      }
                      {inv.expires_at && !expired && ` · expires ${new Date(inv.expires_at).toLocaleDateString()}`}
                    </div>
                  </div>
                  {!inv.is_active && !expired && (
                    <button
                      className="px-3 py-1 rounded-lg text-xs font-title font-semibold transition-colors"
                      style={{ background: 'rgba(124,92,252,0.12)', border: '1px solid rgba(124,92,252,0.25)', color: '#9B81FF' }}
                    >
                      Use
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        </motion.div>
      )}

      {/* Testnet notice */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="flex items-center gap-3 p-4 rounded-2xl"
        style={{ background: 'rgba(0,212,255,0.05)', border: '1px solid rgba(0,212,255,0.12)' }}
      >
        <Info size={14} style={{ color: '#33DEFF', flexShrink: 0 }} />
        <span className="text-xs" style={{ color: 'rgba(230,237,247,0.45)' }}>
          Testnet mode — RITUAL tokens are simulated. Transactions are instant and free on this network.
        </span>
      </motion.div>

      {/* Item detail modal */}
      <AnimatePresence>
        {selected && !modal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            style={{ background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(8px)' }}
            onClick={() => setSelected(null)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 12 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 12 }}
              transition={{ type: 'spring', stiffness: 300, damping: 25 }}
              className="rounded-2xl p-6 w-full max-w-md relative overflow-hidden"
              style={{
                background: 'linear-gradient(145deg, rgba(28,38,64,0.98), rgba(20,27,45,0.99))',
                border: `1px solid ${rs(selected).border}`,
                boxShadow: '0 24px 80px rgba(0,0,0,0.6)',
              }}
              onClick={e => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-5">
                <h3 className="font-title font-bold text-lg" style={{ color: '#E6EDF7' }}>{selected.name}</h3>
                <button
                  className="w-8 h-8 rounded-lg flex items-center justify-center transition-colors"
                  style={{ background: 'rgba(230,237,247,0.06)', color: 'rgba(230,237,247,0.45)' }}
                  onClick={() => setSelected(null)}
                >
                  <X size={14} />
                </button>
              </div>
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div
                    className="w-14 h-14 rounded-2xl flex items-center justify-center"
                    style={{ background: rs(selected).bg, border: `1px solid ${rs(selected).border}`, color: rs(selected).color }}
                  >
                    {CAT_ICONS[selected.category] ?? <ShoppingBag size={24} />}
                  </div>
                  <div>
                    <span
                      className="text-xs font-title font-semibold px-2 py-0.5 rounded-full"
                      style={{ background: rs(selected).bg, color: rs(selected).color, border: `1px solid ${rs(selected).border}` }}
                    >
                      {rs(selected).label}
                    </span>
                    <div className="font-title font-extrabold text-2xl mt-1" style={{ color: '#E6EDF7' }}>
                      {selected.price_ritual}
                      <span className="text-sm ml-1" style={{ color: '#FFB84D' }}>RITUAL</span>
                    </div>
                  </div>
                </div>
                <p className="text-sm leading-relaxed" style={{ color: 'rgba(230,237,247,0.6)' }}>{selected.description}</p>
                <div className="grid grid-cols-2 gap-3">
                  {selected.duration_hours && (
                    <div
                      className="rounded-xl p-3"
                      style={{ background: 'rgba(20,27,45,0.8)', border: '1px solid rgba(230,237,247,0.07)' }}
                    >
                      <div className="text-2xs uppercase tracking-wider mb-1" style={{ color: 'rgba(230,237,247,0.3)' }}>Duration</div>
                      <div className="font-title font-semibold text-sm" style={{ color: '#E6EDF7' }}>
                        {selected.duration_hours >= 24 ? `${selected.duration_hours / 24} day(s)` : `${selected.duration_hours}h`}
                      </div>
                    </div>
                  )}
                  <div
                    className="rounded-xl p-3"
                    style={{ background: 'rgba(20,27,45,0.8)', border: '1px solid rgba(230,237,247,0.07)' }}
                  >
                    <div className="text-2xs uppercase tracking-wider mb-1" style={{ color: 'rgba(230,237,247,0.3)' }}>Type</div>
                    <div className="font-title font-semibold text-sm capitalize" style={{ color: '#E6EDF7' }}>{selected.category}</div>
                  </div>
                </div>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.97 }}
                  className="w-full h-12 rounded-xl flex items-center justify-center gap-2 font-title font-bold text-sm"
                  style={{ background: 'linear-gradient(135deg, #7C5CFC, #5E3DE8)', color: '#fff', boxShadow: '0 0 24px rgba(124,92,252,0.4)' }}
                  onClick={() => { setSelected(null); handlePurchase(selected); }}
                >
                  <ShoppingBag size={16} /> Purchase for {selected.price_ritual} RITUAL
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Purchase flow modal */}
      <AnimatePresence>
        {modal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            style={{ background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(8px)' }}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 12 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 12 }}
              transition={{ type: 'spring', stiffness: 300, damping: 25 }}
              className="rounded-2xl p-6 w-full max-w-sm"
              style={{
                background: 'linear-gradient(145deg, rgba(28,38,64,0.98), rgba(20,27,45,0.99))',
                border: '1px solid rgba(230,237,247,0.1)',
                boxShadow: '0 24px 80px rgba(0,0,0,0.6)',
              }}
              onClick={e => e.stopPropagation()}
            >
              {modal.step === 'confirm' && (
                <div className="space-y-5">
                  <div className="text-center space-y-3">
                    <div
                      className="w-16 h-16 rounded-2xl mx-auto flex items-center justify-center"
                      style={{ background: rs(modal.item).bg, border: `1px solid ${rs(modal.item).border}`, color: rs(modal.item).color }}
                    >
                      {CAT_ICONS[modal.item.category] ?? <ShoppingBag size={28} />}
                    </div>
                    <div>
                      <div className="font-title font-bold text-lg" style={{ color: '#E6EDF7' }}>{modal.item.name}</div>
                      <div className="text-sm" style={{ color: 'rgba(230,237,247,0.4)' }}>Confirm your purchase</div>
                    </div>
                    <div
                      className="rounded-xl p-4 text-center"
                      style={{ background: 'rgba(20,27,45,0.8)', border: '1px solid rgba(230,237,247,0.07)' }}
                    >
                      <div className="font-title font-extrabold text-2xl" style={{ color: '#E6EDF7' }}>
                        {modal.item.price_ritual}
                        <span className="text-sm ml-1" style={{ color: '#FFB84D' }}>RITUAL</span>
                      </div>
                      <div className="text-xs mt-1" style={{ color: 'rgba(230,237,247,0.3)' }}>Testnet transaction</div>
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <button
                      className="flex-1 h-11 rounded-xl font-title font-semibold text-sm transition-colors"
                      style={{ background: 'rgba(28,38,64,0.8)', border: '1px solid rgba(230,237,247,0.1)', color: 'rgba(230,237,247,0.6)' }}
                      onClick={() => setModal(null)}
                    >
                      Cancel
                    </button>
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.97 }}
                      className="flex-1 h-11 rounded-xl flex items-center justify-center gap-2 font-title font-bold text-sm"
                      style={{ background: 'linear-gradient(135deg, #7C5CFC, #5E3DE8)', color: '#fff' }}
                      onClick={confirmPurchase}
                    >
                      <Zap size={15} /> Confirm
                    </motion.button>
                  </div>
                </div>
              )}

              {modal.step === 'processing' && (
                <div className="text-center space-y-4 py-6">
                  <div
                    className="w-12 h-12 rounded-full border-2 mx-auto animate-spin"
                    style={{ borderColor: 'rgba(230,237,247,0.1)', borderTopColor: '#9B81FF' }}
                  />
                  <div className="font-title font-semibold" style={{ color: '#E6EDF7' }}>Processing...</div>
                  <div className="text-sm" style={{ color: 'rgba(230,237,247,0.4)' }}>Signing testnet transaction</div>
                </div>
              )}

              {modal.step === 'success' && (
                <div className="text-center space-y-4 py-4">
                  <motion.div
                    initial={{ scale: 0.5, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                    className="w-16 h-16 rounded-full mx-auto flex items-center justify-center"
                    style={{ background: 'rgba(0,200,150,0.15)', border: '2px solid rgba(0,200,150,0.4)' }}
                  >
                    <CheckCircle2 size={32} style={{ color: '#33E8B8' }} />
                  </motion.div>
                  <div>
                    <div className="font-title font-bold text-lg" style={{ color: '#E6EDF7' }}>Purchase Complete!</div>
                    <div className="text-sm" style={{ color: 'rgba(230,237,247,0.4)' }}>{modal.item.name} added to your inventory.</div>
                  </div>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.97 }}
                    className="w-full h-11 rounded-xl font-title font-bold text-sm"
                    style={{ background: 'linear-gradient(135deg, #7C5CFC, #5E3DE8)', color: '#fff' }}
                    onClick={() => setModal(null)}
                  >
                    Done
                  </motion.button>
                </div>
              )}

              {modal.step === 'error' && (
                <div className="text-center space-y-4 py-4">
                  <div
                    className="w-16 h-16 rounded-full mx-auto flex items-center justify-center"
                    style={{ background: 'rgba(224,85,85,0.12)', border: '2px solid rgba(224,85,85,0.3)' }}
                  >
                    <X size={28} style={{ color: '#FF6B6B' }} />
                  </div>
                  <div>
                    <div className="font-title font-bold text-lg" style={{ color: '#E6EDF7' }}>Purchase Failed</div>
                    <div className="text-sm" style={{ color: 'rgba(230,237,247,0.4)' }}>{modal.errorMsg}</div>
                  </div>
                  <div className="flex gap-3">
                    <button
                      className="flex-1 h-11 rounded-xl font-title font-semibold text-sm"
                      style={{ background: 'rgba(28,38,64,0.8)', border: '1px solid rgba(230,237,247,0.1)', color: 'rgba(230,237,247,0.6)' }}
                      onClick={() => setModal(null)}
                    >
                      Close
                    </button>
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.97 }}
                      className="flex-1 h-11 rounded-xl font-title font-bold text-sm"
                      style={{ background: 'linear-gradient(135deg, #7C5CFC, #5E3DE8)', color: '#fff' }}
                      onClick={confirmPurchase}
                    >
                      Retry
                    </motion.button>
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
