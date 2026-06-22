import type { ReactNode } from 'react';

type BadgeVariant = 'violet' | 'cyan' | 'amber' | 'emerald' | 'error' | 'ink';

interface BadgeProps {
  children: ReactNode;
  variant?: BadgeVariant;
  className?: string;
}

const styles: Record<BadgeVariant, string> = {
  violet:  'bg-[rgba(124,92,252,0.12)] text-[#9B81FF] border-[rgba(124,92,252,0.25)]',
  cyan:    'bg-[rgba(0,212,255,0.10)] text-[#33DEFF] border-[rgba(0,212,255,0.22)]',
  amber:   'bg-[rgba(255,184,77,0.10)] text-[#FFD080] border-[rgba(255,184,77,0.22)]',
  emerald: 'bg-[rgba(0,200,150,0.10)] text-[#33E8B8] border-[rgba(0,200,150,0.22)]',
  error:   'bg-[rgba(255,90,90,0.10)] text-[#FF8080] border-[rgba(255,90,90,0.22)]',
  ink:     'bg-[rgba(230,237,247,0.06)] text-[rgba(230,237,247,0.55)] border-[rgba(230,237,247,0.12)]',
};

export default function Badge({ children, variant = 'ink', className = '' }: BadgeProps) {
  return (
    <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md text-2xs font-title font-bold uppercase tracking-wider border ${styles[variant]} ${className}`}>
      {children}
    </span>
  );
}
