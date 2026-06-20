import { Swords } from 'lucide-react';
import type { Player } from '../lib/supabase';
import { ComingSoon } from '../components/PageHeader';

interface Props {
  player: Player;
  onBack: () => void;
}

export default function BossChallengePage({ player, onBack }: Props) {
  return (
    <ComingSoon
      title="Boss Challenge"
      subtitle="Face off against the Nexora Wardens in high-stakes boss challenges for legendary rewards."
      icon={Swords}
      accent="#FF5A5A"
      player={player}
      onBack={onBack}
    />
  );
}
