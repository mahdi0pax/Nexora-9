import { BookMarked } from 'lucide-react';
import type { Player } from '../lib/supabase';
import { ComingSoon } from '../components/PageHeader';

interface Props {
  player: Player;
  onBack: () => void;
}

export default function LorePage({ player, onBack }: Props) {
  return (
    <ComingSoon
      title="Lore & Progress Story"
      subtitle="Unfold the saga of Nexora — your journey through the realms, ranks, and rivalries."
      icon={BookMarked}
      accent="#9B81FF"
      player={player}
      onBack={onBack}
    />
  );
}
