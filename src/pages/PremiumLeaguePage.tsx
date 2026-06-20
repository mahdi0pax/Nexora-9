import { Crown } from 'lucide-react';
import type { Player } from '../lib/supabase';
import { ComingSoon } from '../components/PageHeader';

interface Props {
  player: Player;
  onBack: () => void;
}

export default function PremiumLeaguePage({ player, onBack }: Props) {
  return (
    <ComingSoon
      title="Premium League"
      subtitle="Stake RITUAL tokens to join the exclusive Premium League with elevated rewards and seasonal prizes."
      icon={Crown}
      accent="#B9F2FF"
      player={player}
      onBack={onBack}
    />
  );
}
