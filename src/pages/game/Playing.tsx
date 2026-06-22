import { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ChevronRight, Zap, CheckCircle2, XCircle, Lightbulb } from 'lucide-react';
import { CATEGORIES } from '../../design-system/tokens';
import { Question, AnswerState } from '../../store/useGameStore';
import { Player } from '../../lib/supabase';

const OPTION_LABELS = ['A', 'B', 'C', 'D'];

interface Props {
  player: Player;
  categoryId: string;
  questions: Question[];
  currentQ: number;
  totalQ: number;
  selectedOption: number | null;
  answerState: AnswerState;
  sessionCorrect: number;
  sessionScore: number;
  pendingXp: number;
  isBoss: boolean;
  isDaily: boolean;
  onSubmit: (idx: number) => void;
  onNext: () => void;
  onQuit: () => void;
}

function ProgressRing({ pct, size, color }: { pct: number; size: number; color: string }) {
  const r = (size - 6) / 2;
  const circ = 2 * Math.PI * r;
  return (
    <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="rgba(28,38,64,0.8)" strokeWidth={5} />
      <circle
        cx={size / 2} cy={size / 2} r={r} fill="none" stroke={color}
        strokeWidth={5} strokeLinecap="round"
        strokeDasharray={circ}
        strokeDashoffset={circ * (1 - pct / 100)}
        style={{ transition: 'stroke-dashoffset 0.4s ease' }}
      />
    </svg>
  );
}

export default function Playing({ player: _player, categoryId, questions, currentQ, totalQ, selectedOption, answerState, sessionCorrect, sessionScore, pendingXp, isBoss, isDaily, onSubmit, onNext, onQuit }: Props) {
  const cat      = CATEGORIES.find(c => c.id === categoryId);
  const question = questions[currentQ];
  const [showHint, setShowHint]   = useState(false);
  const [xpVisible, setXpVisible] = useState(false);
  const prevXp = useRef(0);

  useEffect(() => {
    if (answerState === 'correct' && pendingXp > 0 && pendingXp !== prevXp.current) {
      prevXp.current = pendingXp;
      setXpVisible(true);
      setTimeout(() => setXpVisible(false), 900);
    }
  }, [answerState, pendingXp]);

  useEffect(() => { setShowHint(false); }, [currentQ]);

  if (!question || !cat) return null;

  const isRevealed   = ['correct', 'wrong', 'revealing'].includes(answerState);
  const isCorrect    = answerState === 'correct';
  const isWrong      = answerState === 'wrong';
  const isProcessing = answerState === 'selected' || answerState === 'revealing';
  const canProceed   = isCorrect || isWrong;

  function getOptionStyle(idx: number): React.CSSProperties {
    const isSel  = selectedOption === idx;
    const isCorr = idx === question.correct;
    if (!isRevealed) return isSel
      ? { background: 'rgba(124,92,252,0.18)', border: '2px solid rgba(124,92,252,0.6)', color: '#E6EDF7' }
      : { background: 'rgba(20,27,45,0.6)', border: '1px solid rgba(230,237,247,0.1)', color: 'rgba(230,237,247,0.8)' };
    if (isCorr) return { background: 'rgba(0,200,150,0.12)', border: '2px solid rgba(0,200,150,0.5)', color: '#33E8B8' };
    if (isSel)  return { background: 'rgba(224,85,85,0.1)',   border: '2px solid rgba(224,85,85,0.45)', color: 'rgba(224,85,85,0.9)' };
    return { background: 'rgba(11,16,32,0.5)', border: '1px solid rgba(230,237,247,0.05)', color: 'rgba(230,237,247,0.3)' };
  }

  return (
    <div
      className="min-h-screen flex flex-col"
      style={{ background: 'linear-gradient(180deg, #0B1020 0%, #0D1223 60%, #0B1020 100%)' }}
    >
      {/* Top bar */}
      <div
        className="sticky top-0 z-30 px-4 md:px-6 py-3 flex items-center gap-4"
        style={{ background: 'rgba(11,16,32,0.95)', backdropFilter: 'blur(16px)', borderBottom: '1px solid rgba(230,237,247,0.07)' }}
      >
        <button
          className="w-8 h-8 rounded-lg flex items-center justify-center transition-colors"
          style={{ background: 'rgba(28,38,64,0.8)', border: '1px solid rgba(230,237,247,0.08)', color: 'rgba(230,237,247,0.45)' }}
          onClick={onQuit}
        >
          <X size={14} />
        </button>

        <div className="flex-1 space-y-1.5">
          <div className="flex items-center justify-between text-xs">
            <div className="flex items-center gap-2">
              <span className="font-title font-bold" style={{ color: '#E6EDF7' }}>Q{currentQ + 1}</span>
              <span style={{ color: 'rgba(230,237,247,0.35)' }}>of {totalQ}</span>
              {isBoss  && <span className="text-xs font-title font-bold px-2 py-0.5 rounded-full" style={{ background: 'rgba(185,242,255,0.1)', color: '#B9F2FF', border: '1px solid rgba(185,242,255,0.2)' }}>Boss</span>}
              {isDaily && <span className="text-xs font-title font-bold px-2 py-0.5 rounded-full" style={{ background: 'rgba(0,200,150,0.1)', color: '#33E8B8', border: '1px solid rgba(0,200,150,0.2)' }}>Daily</span>}
            </div>
            <div className="flex items-center gap-1">
              <CheckCircle2 size={11} style={{ color: '#33E8B8' }} />
              <span className="font-title font-semibold" style={{ color: 'rgba(230,237,247,0.5)' }}>{sessionCorrect}/{currentQ}</span>
            </div>
          </div>
          <div style={{ height: 4, background: 'rgba(28,38,64,0.8)', borderRadius: 2, overflow: 'hidden' }}>
            <motion.div
              animate={{ width: `${(currentQ / totalQ) * 100}%` }}
              transition={{ duration: 0.5, ease: 'easeOut' }}
              style={{ height: '100%', background: `linear-gradient(90deg, ${cat.color}80, ${cat.color})`, borderRadius: 2 }}
            />
          </div>
        </div>

        <div
          className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg"
          style={{ background: 'rgba(124,92,252,0.1)', border: '1px solid rgba(124,92,252,0.2)' }}
        >
          <Zap size={11} style={{ color: '#9B81FF' }} />
          <span className="font-title font-bold text-xs" style={{ color: '#9B81FF' }}>{sessionScore}</span>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 flex flex-col items-center px-4 py-8 gap-6 max-w-2xl mx-auto w-full">

        {/* Category + XP burst */}
        <div className="flex items-center gap-3 w-full">
          <ProgressRing pct={((currentQ + 1) / totalQ) * 100} size={44} color={cat.color} />
          <div>
            <div className="text-xs font-semibold" style={{ color: cat.color }}>{cat.label}</div>
            <div className="text-xs" style={{ color: 'rgba(230,237,247,0.35)' }}>
              {question.difficulty.replace('_', ' ')}
            </div>
          </div>
          <div className="ml-auto relative h-8 flex items-center">
            <AnimatePresence>
              {xpVisible && (
                <motion.span
                  initial={{ opacity: 0, y: 0 }}
                  animate={{ opacity: 1, y: -28 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.8, ease: 'easeOut' }}
                  className="absolute font-title font-extrabold text-lg pointer-events-none"
                  style={{ color: '#9B81FF', textShadow: '0 0 12px rgba(124,92,252,0.8)' }}
                >
                  +{pendingXp} XP
                </motion.span>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Question */}
        <AnimatePresence mode="wait">
          <motion.div
            key={currentQ}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.25 }}
            className="w-full rounded-2xl p-6 md:p-7 relative overflow-hidden"
            style={{
              background: isCorrect
                ? 'linear-gradient(145deg, rgba(0,200,150,0.07), rgba(28,38,64,0.95))'
                : isWrong
                ? 'linear-gradient(145deg, rgba(224,85,85,0.06), rgba(28,38,64,0.95))'
                : 'linear-gradient(145deg, rgba(28,38,64,0.95), rgba(20,27,45,0.98))',
              border: isCorrect
                ? '1px solid rgba(0,200,150,0.2)'
                : isWrong
                ? '1px solid rgba(224,85,85,0.2)'
                : `1px solid ${cat.color}25`,
              boxShadow: `0 0 40px ${cat.color}08`,
            }}
          >
            <p
              className="font-title font-semibold leading-relaxed"
              style={{ fontSize: 'clamp(1rem, 2.5vw, 1.2rem)', letterSpacing: '-0.01em', color: '#E6EDF7' }}
            >
              {question.text}
            </p>
          </motion.div>
        </AnimatePresence>

        {/* Options */}
        <div className="w-full space-y-3">
          {question.options.map((opt, idx) => {
            const isCorr = idx === question.correct;
            const isSel  = idx === selectedOption;
            return (
              <motion.button
                key={idx}
                whileHover={answerState === 'idle' ? { x: 4, transition: { duration: 0.15 } } : {}}
                whileTap={answerState === 'idle' ? { scale: 0.98 } : {}}
                disabled={answerState !== 'idle'}
                onClick={() => answerState === 'idle' && onSubmit(idx)}
                className="w-full flex items-center gap-4 p-4 rounded-2xl text-left"
                style={{
                  ...getOptionStyle(idx),
                  cursor: answerState !== 'idle' ? 'default' : 'pointer',
                  transition: 'background 0.2s, border-color 0.2s, color 0.2s',
                }}
              >
                <div
                  className="w-8 h-8 rounded-xl flex items-center justify-center font-title font-bold text-sm flex-shrink-0"
                  style={
                    isRevealed && isCorr
                      ? { background: 'rgba(0,200,150,0.2)', color: '#33E8B8' }
                      : isRevealed && isSel && !isCorr
                      ? { background: 'rgba(224,85,85,0.15)', color: 'rgba(224,85,85,0.9)' }
                      : { background: 'rgba(11,16,32,0.7)', color: 'rgba(230,237,247,0.45)' }
                  }
                >
                  {isRevealed && isCorr ? <CheckCircle2 size={16} /> : isRevealed && isSel && !isCorr ? <XCircle size={16} /> : OPTION_LABELS[idx]}
                </div>
                <span className="flex-1 text-sm md:text-base font-medium leading-snug">{opt}</span>
                {isProcessing && isSel && (
                  <div
                    className="w-4 h-4 rounded-full border-2 flex-shrink-0"
                    style={{ borderColor: 'rgba(230,237,247,0.2)', borderTopColor: '#9B81FF', animation: 'spin 0.6s linear infinite' }}
                  />
                )}
              </motion.button>
            );
          })}
        </div>

        {/* Explanation */}
        <AnimatePresence>
          {canProceed && (
            <motion.div
              initial={{ opacity: 0, y: 12, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ type: 'spring', stiffness: 300, damping: 25 }}
              className="w-full rounded-2xl p-5 space-y-2"
              style={{
                background: isCorrect ? 'rgba(0,200,150,0.08)' : 'rgba(224,85,85,0.07)',
                border: `1px solid ${isCorrect ? 'rgba(0,200,150,0.25)' : 'rgba(224,85,85,0.2)'}`,
              }}
            >
              <div className="flex items-center gap-2.5">
                {isCorrect
                  ? <CheckCircle2 size={16} style={{ color: '#33E8B8', flexShrink: 0 }} />
                  : <XCircle size={16}      style={{ color: 'rgba(224,85,85,0.9)', flexShrink: 0 }} />
                }
                <span className="font-title font-bold text-sm" style={{ color: isCorrect ? '#33E8B8' : 'rgba(224,85,85,0.9)' }}>
                  {isCorrect ? `Correct! +${pendingXp} XP` : 'Incorrect'}
                </span>
              </div>
              <p className="text-sm leading-relaxed" style={{ color: 'rgba(230,237,247,0.6)' }}>{question.explanation}</p>
              {isWrong && !showHint && (
                <button
                  className="flex items-center gap-1.5 text-xs transition-colors mt-1"
                  style={{ color: 'rgba(230,237,247,0.4)' }}
                  onMouseEnter={e => { (e.currentTarget as HTMLElement).style.color = '#33DEFF'; }}
                  onMouseLeave={e => { (e.currentTarget as HTMLElement).style.color = 'rgba(230,237,247,0.4)'; }}
                  onClick={() => setShowHint(true)}
                >
                  <Lightbulb size={12} /> Show correct answer
                </button>
              )}
              {showHint && isWrong && (
                <div className="flex items-center gap-2 text-xs mt-1" style={{ color: '#33E8B8' }}>
                  <CheckCircle2 size={12} /> Correct: <strong>{question.options[question.correct]}</strong>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Next button */}
        <AnimatePresence>
          {canProceed && (
            <motion.button
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ type: 'spring', stiffness: 300, damping: 25 }}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.97 }}
              className="w-full h-14 rounded-xl font-title font-bold text-base flex items-center justify-center gap-2"
              style={{ background: 'linear-gradient(135deg, #7C5CFC, #5E3DE8)', color: '#fff', boxShadow: '0 0 30px rgba(124,92,252,0.4)' }}
              onClick={onNext}
            >
              {currentQ + 1 >= totalQ ? 'See Results' : 'Next Question'} <ChevronRight size={18} />
            </motion.button>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
