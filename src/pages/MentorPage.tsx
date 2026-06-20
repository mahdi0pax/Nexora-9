import { BrainCircuit } from 'lucide-react';
import type { Player } from '../lib/supabase';
import { ComingSoon } from '../components/PageHeader';

interface Props {
  player: Player;
  onBack: () => void;
}

export default function MentorPage({ player, onBack }: Props) {
  return (
    <ComingSoon
      title="AI Mentor"
      subtitle="Your personal AI mentor designs a tailored learning path based on your mastery and goals."
      icon={BrainCircuit}
      accent="#00C896"
      player={player}
      onBack={onBack}
    />
  );
}
