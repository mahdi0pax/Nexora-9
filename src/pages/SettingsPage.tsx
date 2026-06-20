import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { User, Bell, Eye, Gamepad2, Moon, Wallet, ChevronRight, Shield, LogOut, ChevronLeft } from 'lucide-react';
import { Player } from '../lib/supabase';

type SettingsSection = 'account' | 'notifications' | 'privacy' | 'gameplay' | 'appearance';

const SECTIONS: { id: SettingsSection; label: string; icon: React.ReactNode }[] = [
  { id: 'account',       label: 'Account',       icon: <User size={16} /> },
  { id: 'notifications', label: 'Notifications', icon: <Bell size={16} /> },
  { id: 'privacy',       label: 'Privacy',       icon: <Eye size={16} /> },
  { id: 'gameplay',      label: 'Gameplay',      icon: <Gamepad2 size={16} /> },
  { id: 'appearance',    label: 'Appearance',    icon: <Moon size={16} /> },
];

function Toggle({ value, onChange }: { value: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      onClick={() => onChange(!value)}
      className="relative flex-shrink-0 w-10 h-5 rounded-full transition-all duration-300"
      style={{
        background: value ? 'rgba(124,92,252,0.7)' : 'rgba(28,38,64,0.8)',
        border: value ? '1px solid rgba(124,92,252,0.5)' : '1px solid rgba(230,237,247,0.15)',
      }}
    >
      <span
        className="absolute top-0.5 w-4 h-4 rounded-full transition-transform duration-300"
        style={{ left: value ? '22px' : '2px', background: value ? '#E6EDF7' : 'rgba(230,237,247,0.35)' }}
      />
    </button>
  );
}

function Row({ label, desc, children }: { label: string; desc?: string; children: React.ReactNode }) {
  return (
    <div
      className="flex items-center justify-between gap-4 py-4"
      style={{ borderBottom: '1px solid rgba(230,237,247,0.06)' }}
    >
      <div>
        <div className="text-sm font-medium" style={{ color: '#E6EDF7' }}>{label}</div>
        {desc && <div className="text-xs mt-0.5" style={{ color: 'rgba(230,237,247,0.4)' }}>{desc}</div>}
      </div>
      {children}
    </div>
  );
}

interface Props {
  player: Player;
  walletAddress: string;
  onBack: () => void;
  onDisconnect: () => void;
}

export default function SettingsPage({ player, walletAddress, onBack, onDisconnect }: Props) {
  const [section, setSection] = useState<SettingsSection>('account');

  const [notifyAchievements, setNotifyAchievements] = useState(true);
  const [notifyLeaderboard,  setNotifyLeaderboard]  = useState(true);
  const [notifyBoss,         setNotifyBoss]         = useState(true);
  const [notifyDaily,        setNotifyDaily]        = useState(true);

  const [showOnLeaderboard, setShowOnLeaderboard] = useState(true);
  const [showActivity,      setShowActivity]      = useState(true);
  const [showInventory,     setShowInventory]     = useState(false);

  const [autoAdvance,      setAutoAdvance]      = useState(false);
  const [soundEffects,     setSoundEffects]     = useState(true);
  const [showExplanations, setShowExplanations] = useState(true);
  const [confirmQuit,      setConfirmQuit]      = useState(true);

  const [reducedMotion, setReducedMotion] = useState(false);
  const [compactMode,   setCompactMode]   = useState(false);

  return (
    <div className="p-4 md:p-6 max-w-4xl mx-auto pb-10">
      <button onClick={onBack} className="nx-nav-item w-fit mb-4"><ChevronLeft size={16} /> Dashboard</button>

      <motion.div
        initial={{ opacity: 0, y: -12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="mb-6 space-y-1"
      >
        <h1
          className="font-title font-extrabold text-3xl md:text-4xl"
          style={{ color: '#E6EDF7', letterSpacing: '-0.04em' }}
        >
          Settings
        </h1>
        <p className="text-sm" style={{ color: 'rgba(230,237,247,0.4)' }}>Manage your account and preferences.</p>
      </motion.div>

      <div className="flex flex-col md:flex-row gap-5">

        {/* Nav sidebar */}
        <motion.div
          initial={{ opacity: 0, x: -12 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1 }}
          className="w-full md:w-52 flex-shrink-0"
        >
          <div
            className="rounded-2xl p-2 space-y-0.5"
            style={{ background: 'linear-gradient(145deg, rgba(28,38,64,0.9), rgba(20,27,45,0.95))', border: '1px solid rgba(230,237,247,0.07)' }}
          >
            {SECTIONS.map(s => (
              <button
                key={s.id}
                onClick={() => setSection(s.id)}
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-title font-medium transition-all text-left"
                style={section === s.id
                  ? { background: 'rgba(124,92,252,0.18)', color: '#9B81FF' }
                  : { color: 'rgba(230,237,247,0.5)' }
                }
              >
                <span style={{ color: section === s.id ? '#9B81FF' : 'rgba(230,237,247,0.3)' }}>{s.icon}</span>
                {s.label}
                {section === s.id && <ChevronRight size={14} className="ml-auto" style={{ color: '#9B81FF' }} />}
              </button>
            ))}
          </div>
        </motion.div>

        {/* Content */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.15 }}
          className="flex-1 rounded-2xl p-6"
          style={{ background: 'linear-gradient(145deg, rgba(28,38,64,0.9), rgba(20,27,45,0.95))', border: '1px solid rgba(230,237,247,0.07)' }}
        >
          <AnimatePresence mode="wait">

            {section === 'account' && (
              <motion.div
                key="account"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.2 }}
              >
                <h2 className="font-title font-bold text-lg mb-5" style={{ color: '#E6EDF7' }}>Account</h2>

                <div
                  className="rounded-xl p-5 mb-5 space-y-4"
                  style={{ background: 'rgba(20,27,45,0.8)', border: '1px solid rgba(230,237,247,0.07)' }}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                      style={{ background: 'rgba(124,92,252,0.15)', border: '1px solid rgba(124,92,252,0.3)', color: '#9B81FF' }}
                    >
                      <Wallet size={18} />
                    </div>
                    <div>
                      <div className="font-title font-semibold text-sm" style={{ color: '#E6EDF7' }}>Connected Wallet</div>
                      <div className="font-mono text-xs mt-0.5" style={{ color: 'rgba(230,237,247,0.3)' }}>{walletAddress}</div>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    {[
                      { label: 'Username',     value: player.username },
                      { label: 'Level',        value: String(player.level) },
                      { label: 'Rank Tier',    value: player.rank_tier },
                      { label: 'Member Since', value: new Date(player.created_at).toLocaleDateString('en-US', { month: 'short', year: 'numeric' }) },
                    ].map(item => (
                      <div key={item.label}>
                        <div className="text-xs" style={{ color: 'rgba(230,237,247,0.4)' }}>{item.label}</div>
                        <div className="font-title font-semibold capitalize mt-0.5" style={{ color: '#E6EDF7' }}>{item.value}</div>
                      </div>
                    ))}
                  </div>
                </div>

                <Row
                  label="Premium Status"
                  desc={player.premium_until ? `Active until ${new Date(player.premium_until).toLocaleDateString()}` : 'Not active'}
                >
                  <span
                    className="text-xs px-2.5 py-1 rounded-full font-title font-semibold"
                    style={player.premium_until
                      ? { background: 'rgba(0,200,150,0.1)', border: '1px solid rgba(0,200,150,0.25)', color: '#33E8B8' }
                      : { background: 'rgba(230,237,247,0.06)', border: '1px solid rgba(230,237,247,0.1)', color: 'rgba(230,237,247,0.4)' }
                    }
                  >
                    {player.premium_until ? 'Premium' : 'Standard'}
                  </span>
                </Row>

                <Row label="Rank Score" desc="Composite score from XP, accuracy, streak, and boss wins">
                  <span className="font-title font-bold text-sm" style={{ color: '#9B81FF' }}>{player.rank_score.toLocaleString()}</span>
                </Row>

                <div className="pt-5">
                  <button
                    onClick={onDisconnect}
                    className="w-full h-11 rounded-xl flex items-center justify-center gap-2 font-title font-semibold text-sm transition-colors"
                    style={{ background: 'rgba(224,85,85,0.08)', border: '1px solid rgba(224,85,85,0.25)', color: '#FF6B6B' }}
                    onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = 'rgba(224,85,85,0.5)'; }}
                    onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = 'rgba(224,85,85,0.25)'; }}
                  >
                    <LogOut size={15} /> Disconnect Wallet
                  </button>
                  <p className="text-2xs text-center mt-2" style={{ color: 'rgba(230,237,247,0.25)' }}>
                    Your progress is saved on-chain and will persist after reconnecting.
                  </p>
                </div>
              </motion.div>
            )}

            {section === 'notifications' && (
              <motion.div
                key="notifications"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.2 }}
              >
                <h2 className="font-title font-bold text-lg mb-5" style={{ color: '#E6EDF7' }}>Notifications</h2>
                <Row label="Achievement Unlocks" desc="Get notified when you earn a new achievement"><Toggle value={notifyAchievements} onChange={setNotifyAchievements} /></Row>
                <Row label="Leaderboard Changes" desc="Alert when your rank position changes"><Toggle value={notifyLeaderboard} onChange={setNotifyLeaderboard} /></Row>
                <Row label="Boss Challenge Available" desc="Weekly boss challenge reminder"><Toggle value={notifyBoss} onChange={setNotifyBoss} /></Row>
                <Row label="Daily Challenge Reset" desc="Remind me when daily challenge resets"><Toggle value={notifyDaily} onChange={setNotifyDaily} /></Row>
                <div className="pt-4">
                  <div
                    className="flex items-center gap-2 p-3 rounded-xl text-xs"
                    style={{ background: 'rgba(0,212,255,0.06)', border: '1px solid rgba(0,212,255,0.15)' }}
                  >
                    <Bell size={13} style={{ color: '#33DEFF', flexShrink: 0 }} />
                    <span style={{ color: 'rgba(230,237,247,0.45)' }}>Notification delivery depends on your browser permissions.</span>
                  </div>
                </div>
              </motion.div>
            )}

            {section === 'privacy' && (
              <motion.div
                key="privacy"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.2 }}
              >
                <h2 className="font-title font-bold text-lg mb-5" style={{ color: '#E6EDF7' }}>Privacy &amp; Visibility</h2>
                <Row label="Show on Leaderboard" desc="Allow others to see your rank and score"><Toggle value={showOnLeaderboard} onChange={setShowOnLeaderboard} /></Row>
                <Row label="Public Activity" desc="Show your recent challenges to other players"><Toggle value={showActivity} onChange={setShowActivity} /></Row>
                <Row label="Show Inventory" desc="Let others see your purchased items"><Toggle value={showInventory} onChange={setShowInventory} /></Row>
                <div className="pt-4">
                  <div
                    className="flex items-center gap-2 p-3 rounded-xl text-xs"
                    style={{ background: 'rgba(0,200,150,0.06)', border: '1px solid rgba(0,200,150,0.15)' }}
                  >
                    <Shield size={13} style={{ color: '#33E8B8', flexShrink: 0 }} />
                    <span style={{ color: 'rgba(230,237,247,0.45)' }}>Your wallet address is never exposed in public-facing views.</span>
                  </div>
                </div>
              </motion.div>
            )}

            {section === 'gameplay' && (
              <motion.div
                key="gameplay"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.2 }}
              >
                <h2 className="font-title font-bold text-lg mb-5" style={{ color: '#E6EDF7' }}>Gameplay Preferences</h2>
                <Row label="Auto-advance Questions" desc="Automatically proceed after revealing an answer"><Toggle value={autoAdvance} onChange={setAutoAdvance} /></Row>
                <Row label="Sound Effects" desc="Play audio cues for correct/incorrect answers"><Toggle value={soundEffects} onChange={setSoundEffects} /></Row>
                <Row label="Show Answer Explanations" desc="Display explanations after each answer"><Toggle value={showExplanations} onChange={setShowExplanations} /></Row>
                <Row label="Confirm Before Quitting" desc="Show confirmation dialog when abandoning a challenge"><Toggle value={confirmQuit} onChange={setConfirmQuit} /></Row>
              </motion.div>
            )}

            {section === 'appearance' && (
              <motion.div
                key="appearance"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.2 }}
              >
                <h2 className="font-title font-bold text-lg mb-5" style={{ color: '#E6EDF7' }}>Appearance</h2>
                <Row label="Reduced Motion" desc="Disable non-essential animations for accessibility"><Toggle value={reducedMotion} onChange={setReducedMotion} /></Row>
                <Row label="Compact Mode" desc="Use a denser layout with smaller spacing"><Toggle value={compactMode} onChange={setCompactMode} /></Row>
                <Row label="Color Theme" desc="Dark theme (the only correct choice)">
                  <span
                    className="text-xs px-2.5 py-1 rounded-full font-title font-semibold"
                    style={{ background: 'rgba(230,237,247,0.06)', border: '1px solid rgba(230,237,247,0.1)', color: 'rgba(230,237,247,0.5)' }}
                  >
                    Dark
                  </span>
                </Row>
                <div className="pt-4">
                  <div
                    className="flex items-center gap-2 p-3 rounded-xl text-xs"
                    style={{ background: 'rgba(28,38,64,0.6)', border: '1px solid rgba(230,237,247,0.07)' }}
                  >
                    <Moon size={13} style={{ color: 'rgba(230,237,247,0.4)', flexShrink: 0 }} />
                    <span style={{ color: 'rgba(230,237,247,0.4)' }}>Nexora is designed exclusively for dark mode. Additional themes may be added in future updates.</span>
                  </div>
                </div>
              </motion.div>
            )}

          </AnimatePresence>
        </motion.div>
      </div>
    </div>
  );
}
