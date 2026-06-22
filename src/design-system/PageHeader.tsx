import { motion } from 'framer-motion';
import { IconBox } from './index';
import type { ReactNode } from 'react';

interface PageHeaderProps {
  icon: ReactNode;
  iconVariant?: Parameters<typeof IconBox>[0]['variant'];
  title: string;
  subtitle?: string;
  action?: ReactNode;
}

export default function PageHeader({ icon, iconVariant = 'violet', title, subtitle, action }: PageHeaderProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="flex items-start justify-between gap-4 mb-8"
    >
      <div className="flex items-center gap-4">
        <IconBox variant={iconVariant} size="lg">{icon}</IconBox>
        <div>
          <h1 className="font-title font-bold text-2xl text-[#E6EDF7]">{title}</h1>
          {subtitle && (
            <p className="text-sm mt-1 text-[rgba(230,237,247,0.4)]">{subtitle}</p>
          )}
        </div>
      </div>
      {action && <div className="flex-shrink-0">{action}</div>}
    </motion.div>
  );
}
