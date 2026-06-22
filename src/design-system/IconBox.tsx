import type { ReactNode } from 'react';

type IconBoxVariant = 'violet' | 'cyan' | 'amber' | 'emerald' | 'frost' | 'surface';

interface IconBoxProps {
  children: ReactNode;
  variant?: IconBoxVariant;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const sizeMap = {
  sm: { box: 'w-8 h-8 rounded-lg', icon: 14 },
  md: { box: 'w-10 h-10 rounded-xl', icon: 18 },
  lg: { box: 'w-14 h-14 rounded-2xl', icon: 24 },
};

const styles: Record<IconBoxVariant, { bg: string; border: string; color: string }> = {
  violet:  { bg: 'rgba(124,92,252,0.10)', border: 'rgba(124,92,252,0.22)', color: '#9B81FF' },
  cyan:    { bg: 'rgba(0,212,255,0.10)',  border: 'rgba(0,212,255,0.20)',  color: '#33DEFF' },
  amber:   { bg: 'rgba(255,184,77,0.10)', border: 'rgba(255,184,77,0.20)', color: '#FFD080' },
  emerald: { bg: 'rgba(0,200,150,0.10)',  border: 'rgba(0,200,150,0.20)',  color: '#33E8B8' },
  frost:   { bg: 'rgba(230,237,247,0.06)', border: 'rgba(230,237,247,0.12)', color: 'rgba(230,237,247,0.5)' },
  surface: { bg: 'rgba(28,38,64,0.8)',    border: 'rgba(230,237,247,0.08)', color: 'rgba(230,237,247,0.4)' },
};

export default function IconBox({ children, variant = 'violet', size = 'md', className = '' }: IconBoxProps) {
  const s = sizeMap[size];
  const v = styles[variant];
  return (
    <div
      className={`flex items-center justify-center flex-shrink-0 ${s.box} ${className}`}
      style={{ background: v.bg, border: `1px solid ${v.border}`, color: v.color }}
    >
      {children}
    </div>
  );
}
