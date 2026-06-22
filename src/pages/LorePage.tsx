import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { BookMarked, Sparkles, Loader2, AlertTriangle, ChevronLeft, Crown, Scroll, Star, ChevronRight } from 'lucide-react';
import type { Player } from '../lib/supabase';
import { fetchLore, type LoreResult } from '../lib/ai';

interface Props {
  player: Player;
  onBack: () => void;
}

export default function LorePage({ player, onBack }: Props) {
  const [result, setResult] = useState<LoreResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      setLoading(true);
      setError(null);
      const data = await fetchLore(player.wallet_address);
      if (cancelled) return;
      if (data) {
        setResult(data);
      } else {
        setError('The Lorekeeper is weaving your tale. Please try again later.');
      }
      setLoading(false);
    }
    load();
    return () => { cancelled = true; };
  }, [player.wallet_address]);

  return (
    <div className="p-4 md:p-6 max-w-3xl mx-auto space-y-6 pb-10">
      <button onClick={onBack} className="nx-nav-item w-fit"><ChevronLeft size={16} /> Dashboard</button>

      <motion.div
        initial={{ opacity: 0, y: -12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="space-y-2"
      >
        <div
          className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-title font-semibold tracking-widest uppercase"
          style={{ background: 'rgba(185,242,255,0.1)', border: '1px solid rgba(185,242,255,0.25)', color: '#B9F2FF' }}
        >
          <BookMarked size={10} /> Lore & Story
        </div>
        <h1
          className="font-title font-extrabold text-3xl md:text-4xl"
          style={{ color: '#E6EDF7', letterSpacing: '-0.04em' }}
        >
          Your Saga
        </h1>
        <p className="text-sm" style={{ color: 'rgba(230,237,247,0.4)' }}>
          AI-generated narrative of your Nexora journey.
        </p>
      </motion.div>

      {loading && (
        <div className="flex flex-col items-center justify-center gap-4 py-20">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
            className="w-16 h-16 rounded-2xl flex items-center justify-center"
            style={{ background: 'rgba(185,242,255,0.15)', border: '1px solid rgba(185,242,255,0.3)', color: '#B9F2FF' }}
          >
            <Scroll size={28} />
          </motion.div>
          <div className="font-title font-bold text-lg" style={{ color: '#E6EDF7' }}>The Lorekeeper writes...</div>
          <div className="text-sm" style={{ color: 'rgba(230,237,247,0.4)' }}>Weaving your achievements into legend</div>
        </div>
      )}

      {error && !loading && (
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-2xl p-8 text-center"
          style={{ background: 'linear-gradient(145deg, rgba(28,38,64,0.9), rgba(20,27,45,0.95))', border: '1px solid rgba(255,90,90,0.2)' }}
        >
          <AlertTriangle size={32} style={{ color: '#FF7A50', margin: '0 auto 16px' }} />
          <div className="font-title font-bold text-lg mb-2" style={{ color: '#E6EDF7' }}>{error}</div>
          <button
            onClick={() => window.location.reload()}
            className="nx-btn nx-btn-primary gap-2 mt-4"
          >
            <Loader2 size={14} /> Try Again
          </button>
        </motion.div>
      )}

      {result && !loading && (
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="space-y-5"
        >
          {/* Chapter title */}
          <div
            className="rounded-2xl p-6 relative overflow-hidden"
            style={{
              background: 'linear-gradient(145deg, rgba(185,242,255,0.1), rgba(28,38,64,0.95) 60%, rgba(20,27,45,0.98))',
              border: '1px solid rgba(185,242,255,0.2)',
              boxShadow: '0 0 40px rgba(185,242,255,0.08)',
            }}
          >
            <div className="absolute inset-0 pointer-events-none" style={{ background: 'radial-gradient(ellipse at top, rgba(185,242,255,0.06), transparent 60%)' }} />
            <div className="relative z-10 flex items-start gap-4">
              <div
                className="w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0"
                style={{ background: 'rgba(185,242,255,0.15)', border: '1px solid rgba(185,242,255,0.35)', color: '#B9F2FF' }}
              >
                <BookMarked size={22} />
              </div>
              <div>
                <div className="text-xs font-title font-semibold uppercase tracking-wider mb-1" style={{ color: 'rgba(230,237,247,0.4)' }}>Chapter</div>
                <div className="font-title font-extrabold text-xl" style={{ color: '#B9F2FF' }}>{result.chapterTitle}</div>
              </div>
            </div>
          </div>

          {/* Lore rank badge */}
          <div className="flex items-center justify-center">
            <div
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl"
              style={{ background: 'rgba(185,242,255,0.1)', border: '1px solid rgba(185,242,255,0.25)' }}
            >
              <Crown size={14} style={{ color: '#B9F2FF' }} />
              <span className="font-title font-bold text-sm" style={{ color: '#B9F2FF' }}>{result.loreRank}</span>
            </div>
          </div>

          {/* Story */}
          <div
            className="rounded-2xl p-6 md:p-8 relative overflow-hidden"
            style={{
              background: 'linear-gradient(145deg, rgba(28,38,64,0.9), rgba(20,27,45,0.95))',
              border: '1px solid rgba(230,237,247,0.08)',
            }}
          >
            <div className="absolute top-0 left-0 w-1 h-full" style={{ background: 'linear-gradient(180deg, #B9F2FF, transparent)' }} />
            <div className="space-y-4">
              {result.story.split('\n\n').map((paragraph, i) => (
                <motion.p
                  key={i}
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.15 }}
                  className="text-sm md:text-base leading-relaxed"
                  style={{ color: 'rgba(230,237,247,0.7)', fontStyle: 'italic' }}
                >
                  {paragraph}
                </motion.p>
              ))}
            </div>
          </div>

          {/* Achievements framed */}
          {result.achievementsFramed.length > 0 && (
            <div
              className="rounded-2xl p-5 space-y-3"
              style={{ background: 'linear-gradient(145deg, rgba(28,38,64,0.9), rgba(20,27,45,0.95))', border: '1px solid rgba(230,237,247,0.07)' }}
            >
              <div className="flex items-center gap-2">
                <Star size={14} style={{ color: '#FFD080' }} />
                <span className="font-title font-bold text-sm" style={{ color: '#E6EDF7' }}>Legendary Feats</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {result.achievementsFramed.map((feat, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: i * 0.1 }}
                    className="p-3 rounded-xl"
                    style={{ background: 'rgba(11,16,32,0.5)', border: '1px solid rgba(230,237,247,0.06)' }}
                  >
                    <div className="font-title font-semibold text-sm" style={{ color: '#FFD080' }}>{feat.title}</div>
                    <div className="text-xs mt-0.5" style={{ color: 'rgba(230,237,247,0.45)' }}>{feat.description}</div>
                  </motion.div>
                ))}
              </div>
            </div>
          )}

          {/* Next chapter teaser */}
          <div
            className="rounded-2xl p-5 flex items-center gap-4"
            style={{ background: 'linear-gradient(145deg, rgba(124,92,252,0.08), rgba(28,38,64,0.9))', border: '1px solid rgba(124,92,252,0.2)' }}
          >
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
              style={{ background: 'rgba(124,92,252,0.15)', border: '1px solid rgba(124,92,252,0.3)', color: '#9B81FF' }}
            >
              <Sparkles size={18} />
            </div>
            <div className="flex-1">
              <div className="text-xs font-title font-semibold uppercase tracking-wider mb-0.5" style={{ color: 'rgba(230,237,247,0.35)' }}>Next Chapter</div>
              <div className="text-sm" style={{ color: 'rgba(230,237,247,0.6)' }}>{result.nextChapterTeaser}</div>
            </div>
            <ChevronRight size={16} style={{ color: 'rgba(230,237,247,0.3)' }} />
          </div>
        </motion.div>
      )}
    </div>
  );
}
