import { Dices } from 'lucide-react';
import type { Player } from '../lib/supabase';
import { ComingSoon } from '../components/PageHeader';

interface Props {
  player: Player;
  onBack: () => void;
}

export default function DailySpinPage({ player, onBack }: Props) {
  return (
    <ComingSoon
      title="Daily Spin"
      subtitle="Spin the Wheel of Fates once every 24 hours for bonus XP, RITUAL tokens, and rare loot."
      icon={Dices}
      accent="#FFB84D"
      player={player}
      onBack={onBack}
    />
  );
}
