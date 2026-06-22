import { motion } from 'framer-motion';
import type { ReactNode } from 'react';

type CardVariant = 'default' | 'violet' | 'cyan' | 'amber' | 'emerald' | 'surface';

interface CardProps {
  children: ReactNode;
  variant?: CardVariant;
  className?: string;
  hover?: boolean;
  glow?: boolean;
  index?: number;
  onClick?: () => void;
}

const variantStyles: Record<CardVariant, { bg: string; border: string; topLine: string; glow?: string }> = {
  default: {
    bg: 'linear-gradient(145deg, rgba(28,38,64,0.92) 0%, rgba(20,27,45,0.97) 100%)',
    border: '1px solid rgba(230,237,247,0.07)',
    topLine: 'linear-gradient(90deg, transparent, rgba(230,237,247,0.08), transparent)',
  },
  violet: {
    bg: 'linear-gradient(145deg, rgba(124,92,252,0.08) 0%, rgba(28,38,64,0.95) 55%, rgba(20,27,45,0.98) 100%)',
    border: '1px solid rgba(124,92,252,0.18)',
    topLine: 'linear-gradient(90deg, transparent, rgba(124,92,252,0.45), transparent)',
    glow: '0 0 40px rgba(124,92,252,0.1)',
  },
  cyan: {
    bg: 'linear-gradient(145deg, rgba(0,212,255,0.06) 0%, rgba(28,38,64,0.95) 55%, rgba(20,27,45,0.98) 100%)',
    border: '1px solid rgba(0,212,255,0.15)',
    topLine: 'linear-gradient(90deg, transparent, rgba(0,212,255,0.35), transparent)',
    glow: '0 0 40px rgba(0,212,255,0.08)',
  },
  amber: {
    bg: 'linear-gradient(145deg, rgba(255,184,77,0.06) 0%, rgba(28,38,64,0.95) 55%, rgba(20,27,45,0.98) 100%)',
    border: '1px solid rgba(255,184,77,0.15)',
    topLine: 'linear-gradient(90deg, transparent, rgba(255,184,77,0.35), transparent)',
    glow: '0 0 40px rgba(255,184,77,0.08)',
  },
  emerald: {
    bg: 'linear-gradient(145deg, rgba(0,200,150,0.06) 0%, rgba(28,38,64,0.95) 55%, rgba(20,27,45,0.98) 100%)',
    border: '1px solid rgba(0,200,150,0.15)',
    topLine: 'linear-gradient(90deg, transparent, rgba(0,200,150,0.35), transparent)',
    glow: '0 0 40px rgba(0,200,150,0.08)',
  },
  surface: {
    bg: 'rgba(28,38,64,0.6)',
    border: '1px solid rgba(230,237,247,0.06)',
    topLine: 'none',
  },
};

export default function Card({
  children,
  variant = 'default',
  className = '',
  hover = true,
  glow = false,
  index = 0,
  onClick,
}: CardProps) {
  const v = variantStyles[variant];

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.05, ease: [0.22, 1, 0.36, 1] as const }}
      className={`relative overflow-hidden rounded-2xl ${hover ? 'transition-all duration-300 hover:-translate-y-0.5' : ''} ${onClick ? 'cursor-pointer' : ''} ${className}`}
      style={{
        background: v.bg,
        border: v.border,
        boxShadow: glow && v.glow ? v.glow : '0 4px 20px rgba(0,0,0,0.4), 0 1px 4px rgba(0,0,0,0.3), inset 0 1px 0 rgba(230,237,247,0.04)',
      }}
      onClick={onClick}
      whileHover={hover ? { y: -2 } : undefined}
    >
      {v.topLine !== 'none' && (
        <div
          className="absolute top-0 left-0 right-0 h-px pointer-events-none"
          style={{ background: v.topLine }}
        />
      )}
      {children}
    </motion.div>
  );
}

export function Panel({ children, className = '', padding = 'p-5' }: { children: ReactNode; className?: string; padding?: string }) {
  return (
    <div
      className={`rounded-2xl ${padding} ${className}`}
      style={{
        background: 'linear-gradient(145deg, rgba(28,38,64,0.92) 0%, rgba(20,27,45,0.97) 100%)',
        border: '1px solid rgba(230,237,247,0.07)',
        boxShadow: '0 4px 20px rgba(0,0,0,0.4), 0 1px 4px rgba(0,0,0,0.3), inset 0 1px 0 rgba(230,237,247,0.04)',
      }}
    >
      {children}
    </div>
  );
}
