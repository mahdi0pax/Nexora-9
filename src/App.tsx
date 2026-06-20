import { useGameStore } from './store/useGameStore';
import AppShell from './components/AppShell';
import Landing from './pages/Landing';
import Dashboard from './pages/Dashboard';
import CategorySelect from './pages/game/CategorySelect';
import ChallengeStart from './pages/game/ChallengeStart';
import Playing from './pages/game/Playing';
import ChallengeComplete from './pages/game/ChallengeComplete';
import LeaderboardPage from './pages/LeaderboardPage';
import ShopPage from './pages/ShopPage';
import ProfilePage from './pages/ProfilePage';
import AchievementsPage from './pages/AchievementsPage';
import SettingsPage from './pages/SettingsPage';

type AppScreen = 'dashboard' | 'category_select' | 'challenge_start' | 'playing' | 'complete' | 'leaderboard' | 'shop' | 'profile' | 'achievements' | 'settings';

export default function App() {
  const {
    state,
    connectWallet,
    startChallenge,
    beginPlaying,
    submitAnswer,
    nextQuestion,
    goToDashboard,
    goToCategorySelect,
    goToLeaderboard,
    goToShop,
    goToProfile,
    goToAchievements,
    goToSettings,
    showToast,
    purchaseShopItem,
  } = useGameStore();

  const prevRankRef = useRef<string>(state.player?.rank_tier ?? 'bronze');

  if (state.screen === 'playing' && state.player) {
    prevRankRef.current = state.player.rank_tier;
  }

  function handleNavigate(screen: AppScreen) {
    switch (screen) {
      case 'dashboard':    goToDashboard();    break;
      case 'leaderboard':  goToLeaderboard();  break;
      case 'shop':         goToShop();         break;
      case 'profile':      goToProfile();      break;
      case 'achievements': goToAchievements(); break;
      case 'settings':     goToSettings();     break;
    }
  }

  function handleDisconnect() {
    showToast('Wallet disconnected', 'info');
    window.location.reload();
  }

  if (state.screen === 'landing') {
    return <Landing onConnectWallet={() => connectWallet()} />;
  }

  if (!state.player || !state.walletAddress) {
    return <Landing onConnectWallet={() => connectWallet()} />;
  }

  const pageContent = (() => {
    switch (state.screen) {
      case 'dashboard':
        return (
          <Dashboard
            state={state}
            onStartChallenge={startChallenge}
            onGoToCategorySelect={goToCategorySelect}
            onGoToLeaderboard={goToLeaderboard}
            onGoToShop={goToShop}
            onGoToProfile={goToProfile}
            onGoToAchievements={goToAchievements}
            onGoToSettings={goToSettings}
          />
        );

      case 'category_select':
        return (
          <CategorySelect
            player={state.player!}
            mastery={state.mastery}
            onSelect={(id) => startChallenge(id)}
            onBack={goToDashboard}
          />
        );

      case 'challenge_start':
        if (!state.categoryId) return null;
        return (
          <ChallengeStart
            player={state.player!}
            categoryId={state.categoryId}
            isBoss={state.isBoss}
            isDaily={state.isDaily}
            totalQ={state.totalQ}
            onBegin={beginPlaying}
            onBack={goToCategorySelect}
          />
        );

      case 'playing':
        if (!state.categoryId) return null;
        return (
          <Playing
            player={state.player!}
            categoryId={state.categoryId}
            questions={state.questions}
            currentQ={state.currentQ}
            totalQ={state.totalQ}
            selectedOption={state.selectedOption}
            answerState={state.answerState}
            sessionCorrect={state.sessionCorrect}
            sessionScore={state.sessionScore}
            pendingXp={state.pendingXp}
            isBoss={state.isBoss}
            isDaily={state.isDaily}
            onSubmit={submitAnswer}
            onNext={nextQuestion}
            onQuit={() => {
              showToast('Challenge abandoned', 'info');
              goToDashboard();
            }}
          />
        );

      case 'complete':
        if (!state.categoryId) return null;
        return (
          <ChallengeComplete
            player={state.player!}
            categoryId={state.categoryId}
            totalQ={state.totalQ}
            sessionCorrect={state.sessionCorrect}
            sessionScore={state.sessionScore}
            isBoss={state.isBoss}
            isDaily={state.isDaily}
            prevRankTier={prevRankRef.current}
            onPlayAgain={() => startChallenge(state.categoryId!)}
            onDashboard={goToDashboard}
          />
        );

      case 'leaderboard':
        return (
          <LeaderboardPage
            walletAddress={state.walletAddress!}
            allTimeLb={state.leaderboard}
            onBack={goToDashboard}
          />
        );

      case 'shop':
        return (
          <ShopPage
            player={state.player!}
            inventory={state.inventory}
            onPurchase={purchaseShopItem}
            onBack={goToDashboard}
          />
        );

      case 'profile':
        return (
          <ProfilePage
            player={state.player!}
            mastery={state.mastery}
            sessions={state.recentSessions}
            achievements={state.achievements}
            inventory={state.inventory}
            walletAddress={state.walletAddress!}
            onBack={goToDashboard}
            onGoToAchievements={goToAchievements}
          />
        );

      case 'achievements':
        return (
          <AchievementsPage
            achievements={state.achievements}
            onBack={goToDashboard}
          />
        );

      case 'settings':
        return (
          <SettingsPage
            player={state.player!}
            walletAddress={state.walletAddress!}
            onBack={goToDashboard}
            onDisconnect={handleDisconnect}
          />
        );

      default:
        return <Landing onConnectWallet={() => connectWallet()} />;
    }
  })();

  return (
    <AppShell
      player={state.player}
      walletAddress={state.walletAddress}
      currentScreen={state.screen as AppScreen}
      onNavigate={handleNavigate}
      onDisconnect={handleDisconnect}
    >
      {pageContent}
    </AppShell>
  );
}
