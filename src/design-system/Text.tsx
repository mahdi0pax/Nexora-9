import type { ReactNode } from 'react';

interface TextProps {
  children: ReactNode;
  variant?: 'title' | 'subtitle' | 'body' | 'muted' | 'label' | 'caption';
  as?: 'h1' | 'h2' | 'h3' | 'h4' | 'p' | 'span' | 'div';
  className?: string;
}

const styles: Record<string, string> = {
  title:    'font-title font-bold text-2xl text-[#E6EDF7] tracking-tight',
  subtitle: 'font-title font-semibold text-lg text-[#E6EDF7]',
  body:     'font-sans text-sm text-[rgba(230,237,247,0.75)] leading-relaxed',
  muted:    'font-sans text-sm text-[rgba(230,237,247,0.4)]',
  label:    'font-title font-semibold text-2xs uppercase tracking-wider text-[rgba(230,237,247,0.35)]',
  caption:  'font-sans text-2xs text-[rgba(230,237,247,0.3)]',
};

export default function Text({ children, variant = 'body', as: Tag = 'span', className = '' }: TextProps) {
  return <Tag className={`${styles[variant]} ${className}`}>{children}</Tag>;
}
