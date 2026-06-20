import { BarChart3 } from 'lucide-react';
import type { Player } from '../lib/supabase';
import { ComingSoon } from '../components/PageHeader';

interface Props {
  player: Player;
  onBack: () => void;
}

export default function WeeklyReportPage({ player, onBack }: Props) {
  return (
    <ComingSoon
      title="Weekly Report"
      subtitle="Your performance, streaks, and progress summarized every week with shareable insights."
      icon={BarChart3}
      accent="#00D4FF"
      player={player}
      onBack={onBack}
    />
  );
}
