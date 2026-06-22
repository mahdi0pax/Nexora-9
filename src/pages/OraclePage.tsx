import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Eye, Sparkles, Target, TrendingUp, Zap, Loader2, AlertTriangle, ChevronLeft, Lightbulb, Compass } from 'lucide-react';
import type { Player } from '../lib/supabase';
import { fetchOracle, type OracleResult } from '../lib/ai';

interface Props {
  player: Player;
  onBack: () => void;
}

export default function OraclePage({ player, onBack }: Props) {
  const [result, setResult] = useState<OracleResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      setLoading(true);
      setError(null);
      const data = await fetchOracle(player.wallet_address);
      if (cancelled) return;
      if (data) {
        setResult(data);
      } else {
        setError('The Oracle is meditating. Please try again later.');
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
          style={{ background: 'rgba(124,92,252,0.1)', border: '1px solid rgba(124,92,252,0.25)', color: '#9B81FF' }}
        >
          <Eye size={10} /> Nexora Oracle
        </div>
        <h1
          className="font-title font-extrabold text-3xl md:text-4xl"
          style={{ color: '#E6EDF7', letterSpacing: '-0.04em' }}
        >
          Oracle
        </h1>
        <p className="text-sm" style={{ color: 'rgba(230,237,247,0.4)' }}>
          AI-driven guidance on what to practice next.
        </p>
      </motion.div>

      {loading && (
        <div className="flex flex-col items-center justify-center gap-4 py-20">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
            className="w-16 h-16 rounded-2xl flex items-center justify-center"
            style={{ background: 'rgba(124,92,252,0.15)', border: '1px solid rgba(124,92,252,0.3)', color: '#9B81FF' }}
          >
            <Sparkles size={28} />
          </motion.div>
          <div className="font-title font-bold text-lg" style={{ color: '#E6EDF7' }}>Consulting the Oracle...</div>
          <div className="text-sm" style={{ color: 'rgba(230,237,247,0.4)' }}>Analyzing your mastery and recent performance</div>
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
          {/* Main recommendation */}
          <div
            className="rounded-2xl p-6 relative overflow-hidden"
            style={{
              background: 'linear-gradient(145deg, rgba(124,92,252,0.12), rgba(28,38,64,0.95) 60%, rgba(20,27,45,0.98))',
              border: '1px solid rgba(124,92,252,0.25)',
              boxShadow: '0 0 40px rgba(124,92,252,0.1)',
            }}
          >
            <div className="absolute inset-0 pointer-events-none" style={{ background: 'radial-gradient(ellipse at top, rgba(124,92,252,0.08), transparent 60%)' }} />
            <div className="relative z-10 flex items-start gap-4">
              <div
                className="w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0"
                style={{ background: 'rgba(124,92,252,0.18)', border: '1px solid rgba(124,92,252,0.35)', color: '#9B81FF' }}
              >
                <Compass size={22} />
              </div>
              <div>
                <div className="font-title font-bold text-lg mb-2" style={{ color: '#E6EDF7' }}>The Oracle Speaks</div>
                <p className="text-sm leading-relaxed" style={{ color: 'rgba(230,237,247,0.65)' }}>{result.recommendation}</p>
              </div>
            </div>
          </div>

          {/* Priority category */}
          <div
            className="rounded-2xl p-5 flex items-center gap-4"
            style={{ background: 'linear-gradient(145deg, rgba(28,38,64,0.9), rgba(20,27,45,0.95))', border: '1px solid rgba(230,237,247,0.07)' }}
          >
            <div
              className="w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0"
              style={{ background: 'rgba(0,212,255,0.12)', border: '1px solid rgba(0,212,255,0.25)', color: '#33DEFF' }}
            >
              <Target size={22} />
            </div>
            <div className="flex-1">
              <div className="text-xs font-title font-semibold uppercase tracking-wider mb-1" style={{ color: 'rgba(230,237,247,0.35)' }}>Priority Focus</div>
              <div className="font-title font-bold text-base" style={{ color: '#E6EDF7' }}>{result.priorityCategory}</div>
              <div className="text-sm mt-0.5" style={{ color: 'rgba(230,237,247,0.5)' }}>{result.priorityReason}</div>
            </div>
          </div>

          {/* Expected impact + confidence */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div
              className="rounded-2xl p-5 flex items-center gap-4"
              style={{ background: 'linear-gradient(145deg, rgba(28,38,64,0.9), rgba(20,27,45,0.95))', border: '1px solid rgba(230,237,247,0.07)' }}
            >
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                style={{ background: 'rgba(0,200,150,0.12)', border: '1px solid rgba(0,200,150,0.25)', color: '#33E8B8' }}
              >
                <TrendingUp size={18} />
              </div>
              <div>
                <div className="text-xs font-title font-semibold uppercase tracking-wider mb-0.5" style={{ color: 'rgba(230,237,247,0.35)' }}>Expected Impact</div>
                <div className="text-sm" style={{ color: 'rgba(230,237,247,0.7)' }}>{result.expectedImpact}</div>
              </div>
            </div>

            <div
              className="rounded-2xl p-5 flex items-center gap-4"
              style={{ background: 'linear-gradient(145deg, rgba(28,38,64,0.9), rgba(20,27,45,0.95))', border: '1px solid rgba(230,237,247,0.07)' }}
            >
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                style={{ background: 'rgba(255,184,77,0.12)', border: '1px solid rgba(255,184,77,0.25)', color: '#FFB84D' }}
              >
                <Zap size={18} />
              </div>
              <div>
                <div className="text-xs font-title font-semibold uppercase tracking-wider mb-0.5" style={{ color: 'rgba(230,237,247,0.35)' }}>Confidence</div>
                <div className="text-sm font-title font-bold" style={{ color: '#FFD080' }}>{Math.round(result.confidence * 100)}%</div>
              </div>
            </div>
          </div>

          {/* Tips */}
          {result.tips.length > 0 && (
            <div
              className="rounded-2xl p-5 space-y-3"
              style={{ background: 'linear-gradient(145deg, rgba(28,38,64,0.9), rgba(20,27,45,0.95))', border: '1px solid rgba(230,237,247,0.07)' }}
            >
              <div className="flex items-center gap-2">
                <Lightbulb size={14} style={{ color: '#9B81FF' }} />
                <span className="font-title font-bold text-sm" style={{ color: '#E6EDF7' }}>Oracle Tips</span>
              </div>
              <div className="space-y-2">
                {result.tips.map((tip, i) => (
                  <div key={i} className="flex items-start gap-2.5">
                    <span
                      className="w-5 h-5 rounded-md flex items-center justify-center flex-shrink-0 text-xs font-title font-bold mt-0.5"
                      style={{ background: 'rgba(124,92,252,0.15)', color: '#9B81FF' }}
                    >
                      {i + 1}
                    </span>
                    <span className="text-sm" style={{ color: 'rgba(230,237,247,0.6)' }}>{tip}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </motion.div>
      )}
    </div>
  );
}
