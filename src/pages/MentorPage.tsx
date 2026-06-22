import { motion } from 'framer-motion';
import { BookOpen, CheckCircle2, Lock, Play, Clock } from 'lucide-react';

interface Lesson {
  id: string;
  title: string;
  category: string;
  duration: string;
  completed: boolean;
  locked: boolean;
  color: string;
}

const LESSONS: Lesson[] = [
  { id: 'm1', title: 'Blockchain Fundamentals', category: 'Crypto & Web3', duration: '15 min', completed: true, locked: false, color: '#B9F2FF' },
  { id: 'm2', title: 'Smart Contract Basics', category: 'Crypto & Web3', duration: '20 min', completed: false, locked: false, color: '#B9F2FF' },
  { id: 'm3', title: 'DeFi Protocols', category: 'Crypto & Web3', duration: '25 min', completed: false, locked: true, color: '#B9F2FF' },
  { id: 'm4', title: 'Quantum Mechanics Intro', category: 'Science', duration: '18 min', completed: false, locked: false, color: '#00D4FF' },
  { id: 'm5', title: 'World War II Timeline', category: 'History', duration: '22 min', completed: false, locked: false, color: '#CD7F32' },
  { id: 'm6', title: 'Machine Learning 101', category: 'Technology', duration: '30 min', completed: false, locked: true, color: '#00C896' },
];

export default function MentorPage() {
  return (
    <div className="p-4 md:p-6 max-w-3xl mx-auto pb-10">
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }} className="text-center mb-8">
        <div className="w-16 h-16 rounded-2xl mx-auto mb-4 flex items-center justify-center" style={{ background: 'rgba(0,212,255,0.1)', border: '1px solid rgba(0,212,255,0.2)' }}>
          <BookOpen size={28} style={{ color: '#00D4FF' }} />
        </div>
        <h1 className="font-title font-bold text-2xl" style={{ color: '#E6EDF7' }}>Nexora Mentor</h1>
        <p className="text-sm mt-1" style={{ color: 'rgba(230,237,247,0.4)' }}>
          Guided lessons across every knowledge domain. Learn, earn XP, and unlock advanced topics.
        </p>
      </motion.div>

      {/* Progress */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="rounded-2xl p-5 mb-6"
        style={{ background: 'rgba(28,38,64,0.5)', border: '1px solid rgba(230,237,247,0.06)' }}
      >
        <div className="flex items-center justify-between mb-3">
          <span className="text-sm font-medium" style={{ color: '#E6EDF7' }}>Course Progress</span>
          <span className="text-xs font-title font-bold" style={{ color: '#9B81FF' }}>1 / 6</span>
        </div>
        <div className="rounded-full overflow-hidden" style={{ height: '6px', background: 'rgba(11,16,32,0.8)' }}>
          <motion.div
            className="h-full rounded-full"
            initial={{ width: 0 }}
            animate={{ width: `${(1 / 6) * 100}%` }}
            transition={{ duration: 1, ease: 'easeOut', delay: 0.3 }}
            style={{ background: 'linear-gradient(90deg, #7C5CFC, #00D4FF)' }}
          />
        </div>
      </motion.div>

      {/* Lessons */}
      <div className="space-y-3">
        {LESSONS.map((lesson, i) => (
          <motion.div
            key={lesson.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 + i * 0.06 }}
            className="flex items-center gap-4 rounded-xl p-4 group"
            style={{
              background: lesson.completed ? 'rgba(0,200,150,0.06)' : 'rgba(28,38,64,0.5)',
              border: `1px solid ${lesson.completed ? 'rgba(0,200,150,0.15)' : 'rgba(230,237,247,0.06)'}`,
              opacity: lesson.locked ? 0.5 : 1,
            }}
          >
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
              style={{
                background: lesson.completed ? 'rgba(0,200,150,0.1)' : lesson.locked ? 'rgba(11,16,32,0.5)' : `${lesson.color}12`,
                border: `1px solid ${lesson.completed ? 'rgba(0,200,150,0.2)' : lesson.locked ? 'rgba(230,237,247,0.06)' : `${lesson.color}25`}`,
              }}
            >
              {lesson.completed ? <CheckCircle2 size={18} style={{ color: '#33E8B8' }} /> :
               lesson.locked ? <Lock size={16} style={{ color: 'rgba(230,237,247,0.2)' }} /> :
               <Play size={16} style={{ color: lesson.color }} />}
            </div>
            <div className="flex-1 min-w-0">
              <div className="font-title font-semibold text-sm truncate" style={{ color: '#E6EDF7' }}>{lesson.title}</div>
              <div className="flex items-center gap-2 mt-0.5">
                <span className="text-2xs" style={{ color: lesson.color }}>{lesson.category}</span>
                <span className="text-2xs" style={{ color: 'rgba(230,237,247,0.3)' }}>·</span>
                <span className="flex items-center gap-1 text-2xs" style={{ color: 'rgba(230,237,247,0.3)' }}>
                  <Clock size={10} /> {lesson.duration}
                </span>
              </div>
            </div>
            {!lesson.locked && !lesson.completed && (
              <button className="nx-btn nx-btn-primary text-xs px-3 py-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                Start
              </button>
            )}
          </motion.div>
        ))}
      </div>
    </div>
  );
}
