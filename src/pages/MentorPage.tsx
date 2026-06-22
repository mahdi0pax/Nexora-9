import { motion } from 'framer-motion';
import { BookOpen, CheckCircle2, Lock, Play, Clock } from 'lucide-react';
import { Card, IconBox } from '../design-system';

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
  { id: 'm1', title: 'Blockchain Fundamentals', category: 'Crypto & Web3', duration: '15 min', completed: true, locked: false, color: '#00D4FF' },
  { id: 'm2', title: 'Smart Contract Basics', category: 'Crypto & Web3', duration: '20 min', completed: false, locked: false, color: '#00D4FF' },
  { id: 'm3', title: 'DeFi Protocols', category: 'Crypto & Web3', duration: '25 min', completed: false, locked: true, color: '#00D4FF' },
  { id: 'm4', title: 'Quantum Mechanics Intro', category: 'Science', duration: '18 min', completed: false, locked: false, color: '#00D4FF' },
  { id: 'm5', title: 'World War II Timeline', category: 'History', duration: '22 min', completed: false, locked: false, color: '#00D4FF' },
  { id: 'm6', title: 'Machine Learning 101', category: 'Technology', duration: '30 min', completed: false, locked: true, color: '#00D4FF' },
];

export default function MentorPage() {
  return (
    <div className="nx-page">
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }} className="text-center mb-8">
        <IconBox variant="cyan" size="lg" className="mx-auto mb-4"><BookOpen size={28} /></IconBox>
        <h1 className="font-title font-bold text-2xl nx-text-primary">Nexora Mentor</h1>
        <p className="text-sm mt-1 nx-text-muted">
          Guided lessons across every knowledge domain. Learn, earn XP, and unlock advanced topics.
        </p>
      </motion.div>

      {/* Progress */}
      <Card variant="default" index={0} className="p-5 mb-6">
        <div className="flex items-center justify-between mb-3">
          <span className="text-sm font-medium nx-text-primary">Course Progress</span>
          <span className="text-xs font-title font-bold nx-text-violet">1 / 6</span>
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
      </Card>

      {/* Lessons */}
      <div className="space-y-3">
        {LESSONS.map((lesson, i) => (
          <Card
            key={lesson.id}
            variant={lesson.completed ? 'emerald' : 'default'}
            index={i}
            className="flex items-center gap-4 p-4 group"
            style={{ opacity: lesson.locked ? 0.5 : 1 }}
          >
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
              style={{
                background: lesson.completed ? 'rgba(0,200,150,0.1)' : lesson.locked ? 'rgba(11,16,32,0.5)' : `${lesson.color}12`,
                border: `1px solid ${lesson.completed ? 'rgba(0,200,150,0.2)' : lesson.locked ? 'rgba(230,237,247,0.06)' : `${lesson.color}25`}`,
              }}
            >
              {lesson.completed ? <CheckCircle2 size={18} className="nx-text-emerald" /> :
               lesson.locked ? <Lock size={16} className="nx-text-faint" /> :
               <Play size={16} style={{ color: lesson.color }} />}
            </div>
            <div className="flex-1 min-w-0">
              <div className="font-title font-semibold text-sm truncate nx-text-primary">{lesson.title}</div>
              <div className="flex items-center gap-2 mt-0.5">
                <span className="text-2xs" style={{ color: lesson.color }}>{lesson.category}</span>
                <span className="text-2xs nx-text-faint">·</span>
                <span className="flex items-center gap-1 text-2xs nx-text-faint">
                  <Clock size={10} /> {lesson.duration}
                </span>
              </div>
            </div>
            {!lesson.locked && !lesson.completed && (
              <button className="nx-btn nx-btn-primary text-xs px-3 py-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                Start
              </button>
            )}
          </Card>
        ))}
      </div>
    </div>
  );
}
