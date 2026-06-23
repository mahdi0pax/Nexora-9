-- ═══════════════════════════════════════════════════════
-- NEXORA COMPLETE DATABASE SETUP
-- Run this entire file once in Supabase SQL Editor
-- Project: Nexora — Challenge Your Mind. Climb the Ranks.
-- ═══════════════════════════════════════════════════════

─────────────────────────────────────────
SECTION 1: players table
─────────────────────────────────────────

CREATE TABLE IF NOT EXISTS players (
  wallet_address     text PRIMARY KEY,
  username           text NOT NULL DEFAULT 'Challenger',
  level              int  NOT NULL DEFAULT 1,
  total_xp           int  NOT NULL DEFAULT 0,
  current_xp         int  NOT NULL DEFAULT 0,
  rank_score         int  NOT NULL DEFAULT 0,
  rank_tier          text NOT NULL DEFAULT 'bronze',
  streak_days        int  NOT NULL DEFAULT 0,
  streak_shield      boolean NOT NULL DEFAULT false,
  last_activity_date date,
  accuracy_rate      numeric(5,4) NOT NULL DEFAULT 0,
  total_correct      int  NOT NULL DEFAULT 0,
  total_answered     int  NOT NULL DEFAULT 0,
  boss_wins          int  NOT NULL DEFAULT 0,
  premium_until      timestamptz,
  ritual_balance     numeric(12,4) NOT NULL DEFAULT 0,
  spin_last_date     date,
  created_at         timestamptz NOT NULL DEFAULT now(),
  updated_at         timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE players ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "players_select" ON players;
CREATE POLICY "players_select" ON players FOR SELECT TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "players_insert" ON players;
CREATE POLICY "players_insert" ON players FOR INSERT TO anon, authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "players_update" ON players;
CREATE POLICY "players_update" ON players FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);

─────────────────────────────────────────
SECTION 2: category_mastery table
─────────────────────────────────────────

CREATE TABLE IF NOT EXISTS category_mastery (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  wallet_address  text NOT NULL REFERENCES players(wallet_address) ON DELETE CASCADE,
  category_id     text NOT NULL,
  mastery_level   int  NOT NULL DEFAULT 1,
  mastery_xp      int  NOT NULL DEFAULT 0,
  total_correct   int  NOT NULL DEFAULT 0,
  total_answered  int  NOT NULL DEFAULT 0,
  created_at      timestamptz NOT NULL DEFAULT now(),
  updated_at      timestamptz NOT NULL DEFAULT now(),
  UNIQUE(wallet_address, category_id)
);

ALTER TABLE category_mastery ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "mastery_select" ON category_mastery;
CREATE POLICY "mastery_select" ON category_mastery FOR SELECT TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "mastery_insert" ON category_mastery;
CREATE POLICY "mastery_insert" ON category_mastery FOR INSERT TO anon, authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "mastery_update" ON category_mastery;
CREATE POLICY "mastery_update" ON category_mastery FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);

─────────────────────────────────────────
SECTION 3: challenge_sessions table
─────────────────────────────────────────

CREATE TABLE IF NOT EXISTS challenge_sessions (
  id               uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  wallet_address   text NOT NULL REFERENCES players(wallet_address) ON DELETE CASCADE,
  category_id      text NOT NULL,
  difficulty       text NOT NULL DEFAULT 'medium',
  score            int  NOT NULL DEFAULT 0,
  correct_count    int  NOT NULL DEFAULT 0,
  total_questions  int  NOT NULL DEFAULT 5,
  duration_seconds int  NOT NULL DEFAULT 0,
  is_daily         boolean NOT NULL DEFAULT false,
  is_boss          boolean NOT NULL DEFAULT false,
  completed_at     timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE challenge_sessions ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "sessions_select" ON challenge_sessions;
CREATE POLICY "sessions_select" ON challenge_sessions FOR SELECT TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "sessions_insert" ON challenge_sessions;
CREATE POLICY "sessions_insert" ON challenge_sessions FOR INSERT TO anon, authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "sessions_update" ON challenge_sessions;
CREATE POLICY "sessions_update" ON challenge_sessions FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);

─────────────────────────────────────────
SECTION 4: challenge_questions table
─────────────────────────────────────────

CREATE TABLE IF NOT EXISTS challenge_questions (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id      uuid REFERENCES challenge_sessions(id) ON DELETE CASCADE,
  wallet_address  text NOT NULL,
  category_id     text NOT NULL,
  difficulty      text NOT NULL,
  question_text   text NOT NULL,
  correct_answer  text NOT NULL,
  player_answer   text,
  is_correct      boolean,
  time_taken_ms   int,
  xp_awarded      int NOT NULL DEFAULT 0,
  answered_at     timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE challenge_questions ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "questions_select" ON challenge_questions;
CREATE POLICY "questions_select" ON challenge_questions FOR SELECT TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "questions_insert" ON challenge_questions;
CREATE POLICY "questions_insert" ON challenge_questions FOR INSERT TO anon, authenticated WITH CHECK (true);

─────────────────────────────────────────
SECTION 5: achievements table
─────────────────────────────────────────

CREATE TABLE IF NOT EXISTS achievements (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  wallet_address  text NOT NULL REFERENCES players(wallet_address) ON DELETE CASCADE,
  achievement_id  text NOT NULL,
  unlocked_at     timestamptz NOT NULL DEFAULT now(),
  UNIQUE(wallet_address, achievement_id)
);

ALTER TABLE achievements ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "achievements_select" ON achievements;
CREATE POLICY "achievements_select" ON achievements FOR SELECT TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "achievements_insert" ON achievements;
CREATE POLICY "achievements_insert" ON achievements FOR INSERT TO anon, authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "achievements_upsert" ON achievements;
CREATE POLICY "achievements_upsert" ON achievements FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);

─────────────────────────────────────────
SECTION 6: daily_challenge_completions table
─────────────────────────────────────────

CREATE TABLE IF NOT EXISTS daily_challenge_completions (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  wallet_address  text NOT NULL,
  challenge_date  date NOT NULL,
  completed_at    timestamptz NOT NULL DEFAULT now(),
  xp_awarded      int NOT NULL DEFAULT 0,
  UNIQUE(wallet_address, challenge_date)
);

ALTER TABLE daily_challenge_completions ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "daily_select" ON daily_challenge_completions;
CREATE POLICY "daily_select" ON daily_challenge_completions FOR SELECT TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "daily_insert" ON daily_challenge_completions;
CREATE POLICY "daily_insert" ON daily_challenge_completions FOR INSERT TO anon, authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "daily_update" ON daily_challenge_completions;
CREATE POLICY "daily_update" ON daily_challenge_completions FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);

─────────────────────────────────────────
SECTION 7: spin_results table
─────────────────────────────────────────

CREATE TABLE IF NOT EXISTS spin_results (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  wallet_address  text NOT NULL,
  reward_type     text NOT NULL,
  reward_value    text NOT NULL,
  spun_at         timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE spin_results ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "spin_select" ON spin_results;
CREATE POLICY "spin_select" ON spin_results FOR SELECT TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "spin_insert" ON spin_results;
CREATE POLICY "spin_insert" ON spin_results FOR INSERT TO anon, authenticated WITH CHECK (true);

─────────────────────────────────────────
SECTION 8: shop_items table
─────────────────────────────────────────

CREATE TABLE IF NOT EXISTS shop_items (
  id             uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug           text UNIQUE NOT NULL,
  name           text NOT NULL,
  description    text NOT NULL DEFAULT '',
  category       text NOT NULL DEFAULT 'utility',
  price_ritual   numeric(10,4) NOT NULL DEFAULT 0.01,
  rarity         text NOT NULL DEFAULT 'common',
  duration_hours int,
  effect_type    text NOT NULL DEFAULT 'utility',
  effect_value   numeric(10,4) NOT NULL DEFAULT 1.0,
  is_active      boolean NOT NULL DEFAULT true,
  created_at     timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE shop_items ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "shop_select" ON shop_items;
CREATE POLICY "shop_select" ON shop_items FOR SELECT TO anon, authenticated USING (true);

─────────────────────────────────────────
SECTION 9: inventory_items table
─────────────────────────────────────────

CREATE TABLE IF NOT EXISTS inventory_items (
  id               uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  wallet_address   text NOT NULL,
  item_slug        text NOT NULL,
  quantity         int NOT NULL DEFAULT 1,
  is_active        boolean NOT NULL DEFAULT false,
  activated_at     timestamptz,
  expires_at       timestamptz,
  transaction_hash text,
  purchased_at     timestamptz NOT NULL DEFAULT now(),
  created_at       timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE inventory_items ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "inventory_select" ON inventory_items;
CREATE POLICY "inventory_select" ON inventory_items FOR SELECT TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "inventory_insert" ON inventory_items;
CREATE POLICY "inventory_insert" ON inventory_items FOR INSERT TO anon, authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "inventory_update" ON inventory_items;
CREATE POLICY "inventory_update" ON inventory_items FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);

─────────────────────────────────────────
SECTION 10: ritual_config table
─────────────────────────────────────────

CREATE TABLE IF NOT EXISTS ritual_config (
  id               integer PRIMARY KEY DEFAULT 1,
  ritual_contract  text,
  chain_id         integer,
  decimals         integer NOT NULL DEFAULT 18,
  fee_recipient    text NOT NULL,
  network_name     text NOT NULL DEFAULT 'Ritual Testnet',
  explorer_url     text,
  updated_at       timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT ritual_config_singleton CHECK (id = 1)
);

ALTER TABLE ritual_config ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "config_select" ON ritual_config;
CREATE POLICY "config_select" ON ritual_config FOR SELECT TO anon, authenticated USING (true);

INSERT INTO ritual_config (id, fee_recipient, ritual_contract, chain_id, network_name, explorer_url, decimals)
VALUES (1, '0xd06bC18129a8be9af885E7E63B1B95FB19c261b3', NULL, 1979, 'Ritual Testnet', 'https://explorer.ritualfoundation.org', 18)
ON CONFLICT (id) DO UPDATE SET
  fee_recipient  = EXCLUDED.fee_recipient,
  chain_id       = EXCLUDED.chain_id,
  network_name   = EXCLUDED.network_name,
  explorer_url   = EXCLUDED.explorer_url,
  updated_at     = now();

─────────────────────────────────────────
SECTION 11: ritual_transactions table
─────────────────────────────────────────

CREATE TABLE IF NOT EXISTS ritual_transactions (
  id                uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  wallet_address    text NOT NULL,
  recipient_address text NOT NULL,
  ritual_contract   text,
  chain_id          integer,
  transaction_hash  text NOT NULL,
  amount_ritual     float NOT NULL DEFAULT 0,
  amount_raw        text,
  payment_kind      text NOT NULL,
  item_slug         text,
  status            text NOT NULL DEFAULT 'pending',
  block_number      bigint,
  memo              text,
  created_at        timestamptz NOT NULL DEFAULT now(),
  confirmed_at      timestamptz,
  UNIQUE(wallet_address, transaction_hash)
);

ALTER TABLE ritual_transactions ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "tx_select" ON ritual_transactions;
CREATE POLICY "tx_select" ON ritual_transactions FOR SELECT TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "tx_insert" ON ritual_transactions;
CREATE POLICY "tx_insert" ON ritual_transactions FOR INSERT TO anon, authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "tx_update" ON ritual_transactions;
CREATE POLICY "tx_update" ON ritual_transactions FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);

─────────────────────────────────────────
SECTION 12: premium_league_entries table
─────────────────────────────────────────

CREATE TABLE IF NOT EXISTS premium_league_entries (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  wallet_address  text NOT NULL,
  starts_at       timestamptz NOT NULL DEFAULT now(),
  ends_at         timestamptz NOT NULL,
  activation_kind text NOT NULL DEFAULT 'ritual',
  transaction_id  uuid REFERENCES ritual_transactions(id) ON DELETE SET NULL,
  created_at      timestamptz NOT NULL DEFAULT now(),
  UNIQUE(wallet_address, starts_at)
);

ALTER TABLE premium_league_entries ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "premium_select" ON premium_league_entries;
CREATE POLICY "premium_select" ON premium_league_entries FOR SELECT TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "premium_insert" ON premium_league_entries;
CREATE POLICY "premium_insert" ON premium_league_entries FOR INSERT TO anon, authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "premium_update" ON premium_league_entries;
CREATE POLICY "premium_update" ON premium_league_entries FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);

─────────────────────────────────────────
SECTION 13: boss_access_entries table
─────────────────────────────────────────

CREATE TABLE IF NOT EXISTS boss_access_entries (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  wallet_address  text NOT NULL,
  week_key        text NOT NULL,
  access_kind     text NOT NULL DEFAULT 'ritual',
  transaction_id  uuid REFERENCES ritual_transactions(id) ON DELETE SET NULL,
  created_at      timestamptz NOT NULL DEFAULT now(),
  UNIQUE(wallet_address, week_key)
);

ALTER TABLE boss_access_entries ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "boss_select" ON boss_access_entries;
CREATE POLICY "boss_select" ON boss_access_entries FOR SELECT TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "boss_insert" ON boss_access_entries;
CREATE POLICY "boss_insert" ON boss_access_entries FOR INSERT TO anon, authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "boss_update" ON boss_access_entries;
CREATE POLICY "boss_update" ON boss_access_entries FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);

─────────────────────────────────────────
SECTION 14: All indexes
─────────────────────────────────────────

CREATE INDEX IF NOT EXISTS idx_sessions_wallet    ON challenge_sessions(wallet_address);
CREATE INDEX IF NOT EXISTS idx_sessions_completed ON challenge_sessions(completed_at DESC);
CREATE INDEX IF NOT EXISTS idx_questions_session  ON challenge_questions(session_id);
CREATE INDEX IF NOT EXISTS idx_questions_wallet   ON challenge_questions(wallet_address);
CREATE INDEX IF NOT EXISTS idx_mastery_wallet     ON category_mastery(wallet_address);
CREATE INDEX IF NOT EXISTS idx_achievements_wallet ON achievements(wallet_address);
CREATE INDEX IF NOT EXISTS idx_daily_wallet_date  ON daily_challenge_completions(wallet_address, challenge_date);
CREATE INDEX IF NOT EXISTS idx_players_rank       ON players(rank_score DESC);
CREATE INDEX IF NOT EXISTS idx_inventory_wallet   ON inventory_items(wallet_address);
CREATE INDEX IF NOT EXISTS idx_spin_wallet        ON spin_results(wallet_address);
CREATE INDEX IF NOT EXISTS idx_tx_wallet          ON ritual_transactions(wallet_address);
CREATE INDEX IF NOT EXISTS idx_tx_created         ON ritual_transactions(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_premium_wallet     ON premium_league_entries(wallet_address);
CREATE INDEX IF NOT EXISTS idx_premium_ends       ON premium_league_entries(ends_at DESC);
CREATE INDEX IF NOT EXISTS idx_boss_wallet        ON boss_access_entries(wallet_address);

─────────────────────────────────────────
SECTION 15: Shop seed data
─────────────────────────────────────────

INSERT INTO shop_items (slug, name, description, category, price_ritual, rarity, duration_hours, effect_type, effect_value, is_active) VALUES
('xp_boost_1h',       'XP Boost 1h',            'Double all XP gains for one hour.',                                          'boost',      0.01,  'common',    1,    'xp_multiplier',     2.0, true),
('xp_boost_6h',       'XP Boost 6h',             'Double all XP gains for six hours.',                                         'boost',      0.05,  'uncommon',  6,    'xp_multiplier',     2.0, true),
('xp_boost_24h',      'XP Boost 24h',            'Double all XP gains for a full day.',                                        'boost',      0.1,   'rare',      24,   'xp_multiplier',     2.0, true),
('streak_shield_1',   'Streak Shield I',          'Protect your streak from one missed day.',                                   'protection', 0.02,  'common',    NULL, 'streak_shield',     1.0, true),
('streak_shield_3',   'Streak Shield III',        'Protect your streak for up to three missed days.',                           'protection', 0.05,  'uncommon',  NULL, 'streak_shield',     3.0, true),
('streak_shield_7',   'Streak Shield VII',        'Protect your streak for an entire week.',                                    'protection', 0.1,   'rare',      NULL, 'streak_shield',     7.0, true),
('hint_token',        'Hint Token',               'Reveal a clue for one difficult question.',                                  'utility',    0.005, 'common',    NULL, 'hint',              1.0, true),
('retry_ticket',      'Retry Ticket',             'Re-attempt a challenge you already completed today.',                        'utility',    0.002, 'common',    NULL, 'retry',             1.0, true),
('boss_ticket',       'Boss Ticket',              'Gain entry to any Weekly Boss Challenge.',                                   'access',     0.2,   'epic',      NULL, 'boss_access',       1.0, true),
('double_reward_1h',  'Double Reward Token 1h',   'Earn double rewards for one hour.',                                         'boost',      0.02,  'uncommon',  1,    'reward_multiplier', 2.0, true),
('double_reward_24h', 'Double Reward Token 24h',  'Earn double rewards for 24 hours.',                                         'boost',      0.05,  'rare',      24,   'reward_multiplier', 2.0, true),
('premium_pass',      'Premium Challenge Pass',   'Seven days of Premium League access, exclusive challenges, extra XP.',      'access',     0.15,  'epic',      168,  'premium_access',    1.0, true),
('mystic_box',        'Mystic Box',               'A mystery crate with a random rare item or bonus XP.',                      'crate',      0.05,  'rare',      NULL, 'mystery',           0.0, true),
('legendary_crate',   'Legendary Crate',          'Guaranteed epic or legendary loot: items, large XP bundles, or titles.',   'crate',      0.2,   'legendary', NULL, 'mystery',           0.0, true)
ON CONFLICT (slug) DO UPDATE SET
  name           = EXCLUDED.name,
  description    = EXCLUDED.description,
  price_ritual   = EXCLUDED.price_ritual,
  rarity         = EXCLUDED.rarity,
  duration_hours = EXCLUDED.duration_hours,
  effect_type    = EXCLUDED.effect_type,
  effect_value   = EXCLUDED.effect_value,
  is_active      = EXCLUDED.is_active;

─────────────────────────────────────────
END OF FILE
─────────────────────────────────────────
