import { Eye } from 'lucide-react';
import type { Player } from '../lib/supabase';
import { ComingSoon } from '../components/PageHeader';

interface Props {
  player: Player;
  onBack: () => void;
}

export default function OraclePage({ player, onBack }: Props) {
  return (
    <ComingSoon
      title="Oracle"
      subtitle="Consult the Oracle for AI-driven insights into your playstyle, weaknesses, and optimal next moves."
      icon={Eye}
      accent="#7C5CFC"
      player={player}
      onBack={onBack}
    />
  );
}
