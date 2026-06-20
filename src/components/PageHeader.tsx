import type { LucideIcon } from 'lucide-react';
import { motion } from 'framer-motion';
import { ChevronLeft, Sparkles } from 'lucide-react';
import type { Player } from '../lib/supabase';

export interface PageHeaderProps {
  title: string;
  subtitle?: string;
  icon?: LucideIcon;
  accent?: string;
  onBack?: () => void;
  player?: Player;
  headerExtra?: React.ReactNode;
}

export function PageHeader({ title, subtitle, icon: Icon, accent = '#7C5CFC', onBack, headerExtra }: PageHeaderProps) {
  return (
    <div>
      {onBack && (
        <button onClick={onBack} className="nx-nav-item w-fit mb-4">
          <ChevronLeft size={16} /> Dashboard
        </button>
      )}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="flex items-start justify-between gap-4 flex-wrap"
      >
        <div className="flex items-start gap-4">
          {Icon && (
            <div
              className="w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0"
              style={{ background: `${accent}1a`, border: `1px solid ${accent}33`, color: accent }}
            >
              <Icon size={22} />
            </div>
          )}
          <div>
            <h1
              className="font-title font-extrabold text-2xl md:text-3xl"
              style={{ color: '#E6EDF7', letterSpacing: '-0.03em' }}
            >
              {title}
            </h1>
            {subtitle && (
              <p className="text-sm mt-1" style={{ color: 'rgba(230,237,247,0.5)' }}>
                {subtitle}
              </p>
            )}
          </div>
        </div>
        {headerExtra}
      </motion.div>
    </div>
  );
}

export interface ComingSoonProps {
  title: string;
  subtitle?: string;
  icon?: LucideIcon;
  accent?: string;
  onBack?: () => void;
  player?: Player;
  children?: React.ReactNode;
}

export function ComingSoon({ title, subtitle, icon: Icon, accent = '#7C5CFC', onBack, player, children }: ComingSoonProps) {
  return (
    <div className="p-4 md:p-6 max-w-5xl mx-auto space-y-8 pb-10">
      <PageHeader title={title} subtitle={subtitle} icon={Icon} accent={accent} onBack={onBack} player={player} />

      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.1 }}
        className="rounded-3xl p-8 md:p-12 text-center relative overflow-hidden"
        style={{
          background: 'linear-gradient(135deg, rgba(28,38,64,0.6), rgba(11,16,32,0.6))',
          border: `1px solid ${accent}22`,
        }}
      >
        <div
          className="absolute inset-0 opacity-[0.04] pointer-events-none"
          style={{ background: `radial-gradient(circle at 50% 30%, ${accent}, transparent 70%)` }}
        />
        <div className="relative z-10">
          <div
            className="w-20 h-20 rounded-3xl flex items-center justify-center mx-auto mb-6"
            style={{ background: `${accent}1a`, border: `1px solid ${accent}33`, color: accent }}
          >
            {Icon ? <Icon size={36} /> : <Sparkles size={36} />}
          </div>
          <h2 className="font-title font-extrabold text-xl md:text-2xl mb-2" style={{ color: '#E6EDF7' }}>
            {title} is coming soon
          </h2>
          <p className="text-sm max-w-md mx-auto" style={{ color: 'rgba(230,237,247,0.5)' }}>
            {subtitle ?? 'This module is being forged in the Nexora forge. Check back soon for the full experience.'}
          </p>
          {children}
        </div>
      </motion.div>
    </div>
  );
}
