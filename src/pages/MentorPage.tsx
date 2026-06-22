import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { BrainCircuit, Sparkles, Loader2, AlertTriangle, ChevronLeft, TrendingUp, Target, BookOpen, Lightbulb, Award } from 'lucide-react';
import type { Player } from '../lib/supabase';
import { fetchMentor, type MentorResult } from '../lib/ai';

interface Props {
  player: Player;
  onBack: () => void;
}

export default function MentorPage({ player, onBack }: Props) {
  const [result, setResult] = useState<MentorResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      setLoading(true);
      setError(null);
      const data = await fetchMentor(player.wallet_address);
      if (cancelled) return;
      if (data) {
        setResult(data);
      } else {
        setError('The Mentor is preparing your analysis. Please try again later.');
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
          style={{ background: 'rgba(0,200,150,0.1)', border: '1px solid rgba(0,200,150,0.25)', color: '#33E8B8' }}
        >
          <BrainCircuit size={10} /> AI Mentor
        </div>
        <h1
          className="font-title font-extrabold text-3xl md:text-4xl"
          style={{ color: '#E6EDF7', letterSpacing: '-0.04em' }}
        >
          AI Mentor
        </h1>
        <p className="text-sm" style={{ color: 'rgba(230,237,247,0.4)' }}>
          Personalized analysis of your strengths and weaknesses.
        </p>
      </motion.div>

      {loading && (
        <div className="flex flex-col items-center justify-center gap-4 py-20">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
            className="w-16 h-16 rounded-2xl flex items-center justify-center"
            style={{ background: 'rgba(0,200,150,0.15)', border: '1px solid rgba(0,200,150,0.3)', color: '#33E8B8' }}
          >
            <Sparkles size={28} />
          </motion.div>
          <div className="font-title font-bold text-lg" style={{ color: '#E6EDF7' }}>Analyzing your journey...</div>
          <div className="text-sm" style={{ color: 'rgba(230,237,247,0.4)' }}>Building your personalized learning profile</div>
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
          {/* Assessment */}
          <div
            className="rounded-2xl p-6 relative overflow-hidden"
            style={{
              background: 'linear-gradient(145deg, rgba(0,200,150,0.1), rgba(28,38,64,0.95) 60%, rgba(20,27,45,0.98))',
              border: '1px solid rgba(0,200,150,0.2)',
              boxShadow: '0 0 40px rgba(0,200,150,0.08)',
            }}
          >
            <div className="absolute inset-0 pointer-events-none" style={{ background: 'radial-gradient(ellipse at top, rgba(0,200,150,0.06), transparent 60%)' }} />
            <div className="relative z-10 flex items-start gap-4">
              <div
                className="w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0"
                style={{ background: 'rgba(0,200,150,0.18)', border: '1px solid rgba(0,200,150,0.35)', color: '#33E8B8' }}
              >
                <BrainCircuit size={22} />
              </div>
              <div>
                <div className="font-title font-bold text-lg mb-2" style={{ color: '#E6EDF7' }}>Overall Assessment</div>
                <p className="text-sm leading-relaxed" style={{ color: 'rgba(230,237,247,0.65)' }}>{result.overallAssessment}</p>
              </div>
            </div>
          </div>

          {/* Strengths */}
          {result.strengths.length > 0 && (
            <div
              className="rounded-2xl p-5 space-y-3"
              style={{ background: 'linear-gradient(145deg, rgba(28,38,64,0.9), rgba(20,27,45,0.95))', border: '1px solid rgba(0,200,150,0.15)' }}
            >
              <div className="flex items-center gap-2">
                <TrendingUp size={14} style={{ color: '#33E8B8' }} />
                <span className="font-title font-bold text-sm" style={{ color: '#E6EDF7' }}>Strengths</span>
              </div>
              <div className="space-y-2.5">
                {result.strengths.map((s, i) => (
                  <div key={i} className="flex items-start gap-3">
                    <div
                      className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0"
                      style={{ background: 'rgba(0,200,150,0.12)', border: '1px solid rgba(0,200,150,0.25)', color: '#33E8B8' }}
                    >
                      <Award size={14} />
                    </div>
                    <div className="flex-1">
                      <div className="font-title font-semibold text-sm" style={{ color: '#33E8B8' }}>{s.category}</div>
                      <div className="text-xs" style={{ color: 'rgba(230,237,247,0.5)' }}>{s.description}</div>
                      <div className="mt-1 rounded-full overflow-hidden" style={{ height: 4, background: 'rgba(11,16,32,0.8)' }}>
                        <div className="h-full rounded-full" style={{ width: `${s.score}%`, background: 'linear-gradient(90deg, #00C896, #33E8B8)' }} />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Weaknesses */}
          {result.weaknesses.length > 0 && (
            <div
              className="rounded-2xl p-5 space-y-3"
              style={{ background: 'linear-gradient(145deg, rgba(28,38,64,0.9), rgba(20,27,45,0.95))', border: '1px solid rgba(255,184,77,0.15)' }}
            >
              <div className="flex items-center gap-2">
                <Target size={14} style={{ color: '#FFB84D' }} />
                <span className="font-title font-bold text-sm" style={{ color: '#E6EDF7' }}>Areas to Improve</span>
              </div>
              <div className="space-y-2.5">
                {result.weaknesses.map((w, i) => (
                  <div key={i} className="flex items-start gap-3">
                    <div
                      className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0"
                      style={{ background: 'rgba(255,184,77,0.12)', border: '1px solid rgba(255,184,77,0.25)', color: '#FFB84D' }}
                    >
                      <BookOpen size={14} />
                    </div>
                    <div className="flex-1">
                      <div className="font-title font-semibold text-sm" style={{ color: '#FFB84D' }}>{w.category}</div>
                      <div className="text-xs" style={{ color: 'rgba(230,237,247,0.5)' }}>{w.description}</div>
                      <div className="mt-1 rounded-full overflow-hidden" style={{ height: 4, background: 'rgba(11,16,32,0.8)' }}>
                        <div className="h-full rounded-full" style={{ width: `${w.score}%`, background: 'linear-gradient(90deg, #E8960A, #FFB84D)' }} />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Learning Path */}
          {result.learningPath.length > 0 && (
            <div
              className="rounded-2xl p-5 space-y-3"
              style={{ background: 'linear-gradient(145deg, rgba(28,38,64,0.9), rgba(20,27,45,0.95))', border: '1px solid rgba(0,212,255,0.15)' }}
            >
              <div className="flex items-center gap-2">
                <Lightbulb size={14} style={{ color: '#33DEFF' }} />
                <span className="font-title font-bold text-sm" style={{ color: '#E6EDF7' }}>Your Learning Path</span>
              </div>
              <div className="space-y-2.5">
                {result.learningPath.map((step, i) => (
                  <div key={i} className="flex items-start gap-3">
                    <div
                      className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 font-title font-bold text-xs"
                      style={{ background: 'rgba(0,212,255,0.15)', border: '1px solid rgba(0,212,255,0.3)', color: '#33DEFF' }}
                    >
                      {step.step}
                    </div>
                    <div>
                      <div className="font-title font-semibold text-sm" style={{ color: '#E6EDF7' }}>{step.action}</div>
                      <div className="text-xs" style={{ color: 'rgba(230,237,247,0.45)' }}>{step.reason}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Practice Tips */}
          {result.practiceTips.length > 0 && (
            <div
              className="rounded-2xl p-5 space-y-3"
              style={{ background: 'linear-gradient(145deg, rgba(28,38,64,0.9), rgba(20,27,45,0.95))', border: '1px solid rgba(230,237,247,0.07)' }}
            >
              <div className="flex items-center gap-2">
                <Sparkles size={14} style={{ color: '#9B81FF' }} />
                <span className="font-title font-bold text-sm" style={{ color: '#E6EDF7' }}>Practice Tips</span>
              </div>
              <div className="grid grid-cols-1 gap-2">
                {result.practiceTips.map((tip, i) => (
                  <div key={i} className="flex items-start gap-2.5 p-3 rounded-xl" style={{ background: 'rgba(11,16,32,0.5)', border: '1px solid rgba(230,237,247,0.05)' }}>
                    <span className="text-xs font-title font-bold mt-0.5" style={{ color: '#9B81FF' }}>{i + 1}.</span>
                    <span className="text-sm" style={{ color: 'rgba(230,237,247,0.6)' }}>{tip}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Motivation */}
          <div
            className="rounded-2xl p-5 text-center"
            style={{ background: 'linear-gradient(145deg, rgba(124,92,252,0.1), rgba(28,38,64,0.9))', border: '1px solid rgba(124,92,252,0.2)' }}
          >
            <p className="text-sm font-title font-semibold italic" style={{ color: '#9B81FF' }}>"{result.motivation}"</p>
          </div>
        </motion.div>
      )}
    </div>
  );
}
