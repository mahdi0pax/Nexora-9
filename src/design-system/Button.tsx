import type { ReactNode } from 'react';

type ButtonVariant = 'primary' | 'cyan' | 'amber' | 'emerald' | 'ghost' | 'surface';
type ButtonSize = 'sm' | 'md' | 'lg';

interface ButtonProps {
  children: ReactNode;
  variant?: ButtonVariant;
  size?: ButtonSize;
  className?: string;
  disabled?: boolean;
  onClick?: () => void;
  type?: 'button' | 'submit';
}

const variantClasses: Record<ButtonVariant, string> = {
  primary: 'bg-gradient-to-br from-[#9B81FF] via-[#7C5CFC] to-[#5E3DE8] text-[#F0F5FF] shadow-[0_4px_14px_rgba(124,92,252,0.45)] hover:shadow-[0_6px_22px_rgba(124,92,252,0.6)] hover:-translate-y-px',
  cyan: 'bg-gradient-to-br from-[#33DEFF] via-[#00D4FF] to-[#00A8CC] text-[#0B1020] font-bold shadow-[0_4px_14px_rgba(0,212,255,0.4)] hover:shadow-[0_6px_22px_rgba(0,212,255,0.55)] hover:-translate-y-px',
  amber: 'bg-gradient-to-br from-[#FFD080] via-[#FFB84D] to-[#E8960A] text-[#0B1020] font-bold shadow-[0_4px_14px_rgba(255,184,77,0.4)] hover:shadow-[0_6px_22px_rgba(255,184,77,0.55)] hover:-translate-y-px',
  emerald: 'bg-gradient-to-br from-[#33E8B8] via-[#00C896] to-[#009E78] text-[#0B1020] font-bold shadow-[0_4px_14px_rgba(0,200,150,0.4)] hover:shadow-[0_6px_22px_rgba(0,200,150,0.55)] hover:-translate-y-px',
  ghost: 'bg-transparent text-[rgba(230,237,247,0.72)] border border-[rgba(230,237,247,0.14)] hover:bg-[rgba(230,237,247,0.06)] hover:text-[#E6EDF7] hover:border-[rgba(230,237,247,0.24)]',
  surface: 'bg-[rgba(28,38,64,0.9)] text-[rgba(230,237,247,0.8)] border border-[rgba(230,237,247,0.1)] hover:bg-[rgba(36,50,80,0.95)] hover:border-[rgba(230,237,247,0.2)]',
};

const sizeClasses: Record<ButtonSize, string> = {
  sm: 'text-xs px-4 py-2 rounded-lg',
  md: 'text-sm px-5 py-2.5 rounded-xl',
  lg: 'text-base px-8 py-3.5 rounded-xl',
};

export default function Button({
  children,
  variant = 'primary',
  size = 'md',
  className = '',
  disabled = false,
  onClick,
  type = 'button',
}: ButtonProps) {
  return (
    <button
      type={type}
      disabled={disabled}
      onClick={onClick}
      className={`inline-flex items-center justify-center gap-2 font-title font-semibold tracking-wide transition-all duration-200 active:scale-[0.97] disabled:opacity-40 disabled:cursor-not-allowed disabled:transform-none ${variantClasses[variant]} ${sizeClasses[size]} ${className}`}
    >
      {children}
    </button>
  );
}
