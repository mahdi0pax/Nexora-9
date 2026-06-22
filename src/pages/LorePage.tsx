import { motion } from 'framer-motion';
import { ScrollText, Lock, CheckCircle2, Sparkles } from 'lucide-react';

interface Chapter {
  id: string;
  title: string;
  subtitle: string;
  completed: boolean;
  locked: boolean;
  color: string;
}

const CHAPTERS: Chapter[] = [
  {
    id: 'c1',
    title: 'The Awakening',
    subtitle: 'You connected your wallet and entered the Nexora realm.',
    completed: true,
    locked: false,
    color: '#00D4FF',
  },
  {
    id: 'c2',
    title: 'First Knowledge',
    subtitle: 'You answered your first question correctly.',
    completed: true,
    locked: false,
    color: '#33E8B8',
  },
  {
    id: 'c3',
    title: 'The Rising Flame',
    subtitle: 'You maintained a 3-day streak. The fire within grows.',
    completed: false,
    locked: false,
    color: '#FFB84D',
  },
  {
    id: 'c4',
    title: 'Rank Ascension',
    subtitle: 'Reach Silver tier to unlock this chapter.',
    completed: false,
    locked: true,
    color: '#A0A9BA',
  },
  {
    id: 'c5',
    title: 'Boss Slayer',
    subtitle: 'Win your first Boss Challenge.',
    completed: false,
    locked: true,
    color: '#B9F2FF',
  },
  {
    id: 'c6',
    title: 'Nexora Elite',
    subtitle: 'Reach the pinnacle. Only the worthy may enter.',
    completed: false,
    locked: true,
    color: '#9B81FF',
  },
];

export default function LorePage() {
  return (
    <div className="p-4 md:p-6 max-w-3xl mx-auto pb-10">
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }} className="text-center mb-8">
        <div className="w-16 h-16 rounded-2xl mx-auto mb-4 flex items-center justify-center" style={{ background: 'rgba(185,242,255,0.1)', border: '1px solid rgba(185,242,255,0.2)' }}>
          <ScrollText size={28} style={{ color: '#B9F2FF' }} />
        </div>
        <h1 className="font-title font-bold text-2xl" style={{ color: '#E6EDF7' }}>Your Journey</h1>
        <p className="text-sm mt-1" style={{ color: 'rgba(230,237,247,0.4)' }}>
          Every milestone writes a new chapter in your Nexora story.
        </p>
      </motion.div>

      {/* Timeline */}
      <div className="relative">
        <div className="absolute left-5 top-0 bottom-0 w-px" style={{ background: 'linear-gradient(180deg, rgba(124,92,252,0.3), rgba(124,92,252,0.05))' }} />

        <div className="space-y-6">
          {CHAPTERS.map((chapter, i) => (
            <motion.div
              key={chapter.id}
              initial={{ opacity: 0, x: -12 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.15 + i * 0.08 }}
              className="relative flex items-start gap-4"
            >
              {/* Dot */}
              <div className="relative z-10 flex-shrink-0">
                <div
                  className="w-10 h-10 rounded-full flex items-center justify-center"
                  style={{
                    background: chapter.completed ? `${chapter.color}15` : chapter.locked ? 'rgba(11,16,32,0.8)' : `${chapter.color}10`,
                    border: `2px solid ${chapter.completed ? chapter.color : chapter.locked ? 'rgba(230,237,247,0.08)' : `${chapter.color}30`}`,
                  }}
                >
                  {chapter.completed ? <CheckCircle2 size={16} style={{ color: chapter.color }} /> :
                   chapter.locked ? <Lock size={14} style={{ color: 'rgba(230,237,247,0.2)' }} /> :
                   <Sparkles size={14} style={{ color: chapter.color }} />}
                </div>
              </div>

              {/* Card */}
              <div
                className="flex-1 rounded-xl p-4"
                style={{
                  background: chapter.completed ? 'rgba(28,38,64,0.6)' : 'rgba(28,38,64,0.3)',
                  border: `1px solid ${chapter.completed ? `${chapter.color}20` : 'rgba(230,237,247,0.06)'}`,
                  opacity: chapter.locked ? 0.5 : 1,
                }}
              >
                <div className="font-title font-semibold text-sm" style={{ color: chapter.completed ? chapter.color : '#E6EDF7' }}>
                  {chapter.title}
                </div>
                <div className="text-xs mt-1" style={{ color: 'rgba(230,237,247,0.4)' }}>
                  {chapter.subtitle}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
