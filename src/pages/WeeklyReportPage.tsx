import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { BarChart3, Sparkles, Loader2, AlertTriangle, ChevronLeft, TrendingUp, TrendingDown, Minus, Target, Zap, Share2, Trophy } from 'lucide-react';
import type { Player } from '../lib/supabase';
import { fetchWeeklyReport, type WeeklyReportResult } from '../lib/ai';

interface Props {
  player: Player;
  onBack: () => void;
}

export default function WeeklyReportPage({ player, onBack }: Props) {
  const [result, setResult] = useState<WeeklyReportResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      setLoading(true);
      setError(null);
      const data = await fetchWeeklyReport(player.wallet_address);
      if (cancelled) return;
      if (data) {
        setResult(data);
      } else {
        setError('The Weekly Report is being compiled. Please try again later.');
      }
      setLoading(false);
    }
    load();
    return () => { cancelled = true; };
  }, [player.wallet_address]);

  function handleShare() {
    if (!result?.shareableText) return;
    navigator.clipboard.writeText(result.shareableText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  const TrendIcon = ({ direction }: { direction: string }) => {
    if (direction === 'improving') return <TrendingUp size={14} style={{ color: '#33E8B8' }} />;
    if (direction === 'declining') return <TrendingDown size={14} style={{ color: '#FF7A50' }} />;
    return <Minus size={14} style={{ color: 'rgba(230,237,247,0.3)' }} />;
  };

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
          style={{ background: 'rgba(0,212,255,0.1)', border: '1px solid rgba(0,212,255,0.25)', color: '#33DEFF' }}
        >
          <BarChart3 size={10} /> Weekly AI Report
        </div>
        <h1
          className="font-title font-extrabold text-3xl md:text-4xl"
          style={{ color: '#E6EDF7', letterSpacing: '-0.04em' }}
        >
          Weekly Report
        </h1>
        <p className="text-sm" style={{ color: 'rgba(230,237,247,0.4)' }}>
          AI-generated summary of your week.
        </p>
      </motion.div>

      {loading && (
        <div className="flex flex-col items-center justify-center gap-4 py-20">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
            className="w-16 h-16 rounded-2xl flex items-center justify-center"
            style={{ background: 'rgba(0,212,255,0.15)', border: '1px solid rgba(0,212,255,0.3)', color: '#33DEFF' }}
          >
            <Sparkles size={28} />
          </motion.div>
          <div className="font-title font-bold text-lg" style={{ color: '#E6EDF7' }}>Compiling your report...</div>
          <div className="text-sm" style={{ color: 'rgba(230,237,247,0.4)' }}>Analyzing trends and performance metrics</div>
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
          {/* Headline */}
          <div
            className="rounded-2xl p-6 relative overflow-hidden"
            style={{
              background: 'linear-gradient(145deg, rgba(0,212,255,0.1), rgba(28,38,64,0.95) 60%, rgba(20,27,45,0.98))',
              border: '1px solid rgba(0,212,255,0.2)',
              boxShadow: '0 0 40px rgba(0,212,255,0.08)',
            }}
          >
            <div className="absolute inset-0 pointer-events-none" style={{ background: 'radial-gradient(ellipse at top, rgba(0,212,255,0.06), transparent 60%)' }} />
            <div className="relative z-10">
              <div className="font-title font-extrabold text-xl md:text-2xl mb-2" style={{ color: '#33DEFF' }}>{result.headline}</div>
              <p className="text-sm leading-relaxed" style={{ color: 'rgba(230,237,247,0.6)' }}>{result.summary}</p>
            </div>
          </div>

          {/* Highlights */}
          {result.highlights.length > 0 && (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {result.highlights.map((h, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.08 }}
                  className="rounded-2xl p-4 flex flex-col gap-1"
                  style={{ background: 'linear-gradient(145deg, rgba(28,38,64,0.9), rgba(20,27,45,0.95))', border: '1px solid rgba(230,237,247,0.07)' }}
                >
                  <div className="text-2xs font-title font-semibold uppercase tracking-wider" style={{ color: 'rgba(230,237,247,0.35)' }}>{h.label}</div>
                  <div className="font-title font-extrabold text-lg" style={{ color: '#E6EDF7' }}>{h.value}</div>
                  <div className="text-2xs" style={{ color: 'rgba(230,237,247,0.4)' }}>{h.context}</div>
                </motion.div>
              ))}
            </div>
          )}

          {/* Trends */}
          <div
            className="rounded-2xl p-5 flex items-center gap-4"
            style={{ background: 'linear-gradient(145deg, rgba(28,38,64,0.9), rgba(20,27,45,0.95))', border: '1px solid rgba(230,237,247,0.07)' }}
          >
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
              style={{
                background: result.trends.direction === 'improving' ? 'rgba(0,200,150,0.12)' : result.trends.direction === 'declining' ? 'rgba(255,90,90,0.12)' : 'rgba(230,237,247,0.06)',
                border: result.trends.direction === 'improving' ? '1px solid rgba(0,200,150,0.25)' : result.trends.direction === 'declining' ? '1px solid rgba(255,90,90,0.25)' : '1px solid rgba(230,237,247,0.1)',
                color: result.trends.direction === 'improving' ? '#33E8B8' : result.trends.direction === 'declining' ? '#FF7A50' : 'rgba(230,237,247,0.4)',
              }}
            >
              <TrendIcon direction={result.trends.direction} />
            </div>
            <div>
              <div className="text-xs font-title font-semibold uppercase tracking-wider mb-0.5" style={{ color: 'rgba(230,237,247,0.35)' }}>Weekly Trend</div>
              <div className="text-sm" style={{ color: 'rgba(230,237,247,0.7)' }}>{result.trends.description}</div>
            </div>
          </div>

          {/* Category Breakdown */}
          {result.categoryBreakdown.length > 0 && (
            <div
              className="rounded-2xl p-5 space-y-3"
              style={{ background: 'linear-gradient(145deg, rgba(28,38,64,0.9), rgba(20,27,45,0.95))', border: '1px solid rgba(230,237,247,0.07)' }}
            >
              <div className="flex items-center gap-2">
                <Target size={14} style={{ color: '#9B81FF' }} />
                <span className="font-title font-bold text-sm" style={{ color: '#E6EDF7' }}>Category Breakdown</span>
              </div>
              <div className="space-y-2">
                {result.categoryBreakdown.map((cat, i) => (
                  <div key={i} className="flex items-center justify-between p-3 rounded-xl" style={{ background: 'rgba(11,16,32,0.5)', border: '1px solid rgba(230,237,247,0.05)' }}>
                    <div className="flex items-center gap-3">
                      <span className="font-title font-semibold text-sm" style={{ color: '#E6EDF7' }}>{cat.category}</span>
                      <span className="text-2xs" style={{ color: 'rgba(230,237,247,0.35)' }}>{cat.played} sessions</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-title font-bold" style={{ color: '#E6EDF7' }}>{cat.accuracy}%</span>
                      {cat.trend === 'up' && <TrendingUp size={12} style={{ color: '#33E8B8' }} />}
                      {cat.trend === 'down' && <TrendingDown size={12} style={{ color: '#FF7A50' }} />}
                      {cat.trend === 'flat' && <Minus size={12} style={{ color: 'rgba(230,237,247,0.3)' }} />}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Goals */}
          {result.goalsForNextWeek.length > 0 && (
            <div
              className="rounded-2xl p-5 space-y-3"
              style={{ background: 'linear-gradient(145deg, rgba(255,184,77,0.08), rgba(28,38,64,0.95) 60%, rgba(20,27,45,0.98))', border: '1px solid rgba(255,184,77,0.18)' }}
            >
              <div className="flex items-center gap-2">
                <Zap size={14} style={{ color: '#FFB84D' }} />
                <span className="font-title font-bold text-sm" style={{ color: '#E6EDF7' }}>Goals for Next Week</span>
              </div>
              <div className="space-y-2">
                {result.goalsForNextWeek.map((g, i) => (
                  <div key={i} className="flex items-start gap-2.5">
                    <span
                      className="w-5 h-5 rounded-md flex items-center justify-center flex-shrink-0 text-xs font-title font-bold mt-0.5"
                      style={{ background: 'rgba(255,184,77,0.15)', color: '#FFB84D' }}
                    >
                      {i + 1}
                    </span>
                    <div>
                      <div className="text-sm font-medium" style={{ color: '#E6EDF7' }}>{g.goal}</div>
                      <div className="text-xs" style={{ color: 'rgba(230,237,247,0.45)' }}>{g.reason}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Share */}
          <div
            className="rounded-2xl p-5 flex flex-col sm:flex-row items-center justify-between gap-4"
            style={{ background: 'linear-gradient(145deg, rgba(28,38,64,0.9), rgba(20,27,45,0.95))', border: '1px solid rgba(230,237,247,0.07)' }}
          >
            <div className="flex items-center gap-3">
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center"
                style={{ background: 'rgba(124,92,252,0.12)', border: '1px solid rgba(124,92,252,0.25)', color: '#9B81FF' }}
              >
                <Trophy size={18} />
              </div>
              <div>
                <div className="font-title font-bold text-sm" style={{ color: '#E6EDF7' }}>Share Your Progress</div>
                <div className="text-xs" style={{ color: 'rgba(230,237,247,0.4)' }}>Copy a summary to share</div>
              </div>
            </div>
            <button
              onClick={handleShare}
              className="nx-btn gap-2 flex-shrink-0"
              style={{ background: 'linear-gradient(135deg, #7C5CFC, #5E3DE8)', color: '#fff' }}
            >
              <Share2 size={14} />
              {copied ? 'Copied!' : 'Copy Summary'}
            </button>
          </div>
        </motion.div>
      )}
    </div>
  );
}
