/*
# Ritual Testnet Economy — Transactions, Premium & Boss Access

Adds persistence for on-chain Ritual payments and derived access state.

## Tables

### ritual_transactions
Immutable ledger of every on-chain Ritual transfer tied to gameplay:
shop purchases, premium pass activations, boss ticket purchases, crate
purchases, and spin rewards funded by Ritual. Each row stores the real
chain id, the contract address used, the from/to addresses, amount in
RITUAL units, the explorer-confirmed transaction hash, and typed metadata
(item slug, payment kind, status).

### ritual_config
Single-row table holding configurable contract metadata: the Ritual
ERC-20 contract address, the chain id, the number of decimals used for
RITUAL display, and the fee-recipient address that receives player payments.

### premium_league_entries
Per-player premium League state. Rows are created when a player activates a
Premium Challenge Pass (either by Ritual payment or by consuming a
`premium_pass` inventory item). `ends_at` drives gating across the app.

### boss_access_entries
Per-week boss access grants. A row exists when a player either paid Ritual
for a boss ticket, consumed a `boss_ticket` inventory item, or met the weekly
eligibility threshold. `access_kind` distinguishes paid vs free eligibility.

## Notes
- `ritual_transactions.transaction_hash` + `ritual_transactions.wallet_address`
  are unique together so re-inserts after a replay are idempotent.
- `ritual_config.fee_recipient` is the only configured fee destination; the
  app reads it before constructing any payment request.
*/

-- ── ritual_config ────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS ritual_config (
  id              integer PRIMARY KEY DEFAULT 1,
  ritual_contract text,
  chain_id         integer,
  decimals         integer NOT NULL DEFAULT 18,
  fee_recipient    text NOT NULL,
  network_name     text NOT NULL DEFAULT 'Ritual Testnet',
  explorer_url     text,
  updated_at       timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT ritual_config_singleton CHECK (id = 1)
);

ALTER TABLE ritual_config ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "anon_select_ritual_config" ON ritual_config;
CREATE POLICY "anon_select_ritual_config" ON ritual_config
  FOR SELECT TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "anon_update_ritual_config" ON ritual_config;
CREATE POLICY "anon_update_ritual_config" ON ritual_config
  FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);

INSERT INTO ritual_config (id, fee_recipient, ritual_contract, chain_id, network_name, explorer_url)
VALUES (1, '0xd06bC18129a8be9af885E7E63B1B95FB19c261b3', NULL, NULL, 'Ritual Testnet', NULL)
ON CONFLICT (id) DO UPDATE
  SET fee_recipient = EXCLUDED.fee_recipient,
      updated_at    = now();

-- ── ritual_transactions ─────────────────────────────────────────────────────
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
DROP POLICY IF EXISTS "anon_select_ritual_transactions" ON ritual_transactions;
CREATE POLICY "anon_select_ritual_transactions" ON ritual_transactions
  FOR SELECT TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "anon_insert_ritual_transactions" ON ritual_transactions;
CREATE POLICY "anon_insert_ritual_transactions" ON ritual_transactions
  FOR INSERT TO anon, authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "anon_update_ritual_transactions" ON ritual_transactions;
CREATE POLICY "anon_update_ritual_transactions" ON ritual_transactions
  FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "anon_delete_ritual_transactions" ON ritual_transactions;
CREATE POLICY "anon_delete_ritual_transactions" ON ritual_transactions
  FOR DELETE TO anon, authenticated USING (true);

CREATE INDEX IF NOT EXISTS idx_ritual_tx_wallet ON ritual_transactions(wallet_address);
CREATE INDEX IF NOT EXISTS idx_ritual_tx_created ON ritual_transactions(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_ritual_tx_kind   ON ritual_transactions(payment_kind);
CREATE INDEX IF NOT EXISTS idx_ritual_tx_status ON ritual_transactions(status);

-- ── premium_league_entries ──────────────────────────────────────────────────
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
DROP POLICY IF EXISTS "anon_select_premium_league_entries" ON premium_league_entries;
CREATE POLICY "anon_select_premium_league_entries" ON premium_league_entries
  FOR SELECT TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "anon_insert_premium_league_entries" ON premium_league_entries;
CREATE POLICY "anon_insert_premium_league_entries" ON premium_league_entries
  FOR INSERT TO anon, authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "anon_update_premium_league_entries" ON premium_league_entries;
CREATE POLICY "anon_update_premium_league_entries" ON premium_league_entries
  FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "anon_delete_premium_league_entries" ON premium_league_entries;
CREATE POLICY "anon_delete_premium_league_entries" ON premium_league_entries
  FOR DELETE TO anon, authenticated USING (true);

CREATE INDEX IF NOT EXISTS idx_premium_wallet ON premium_league_entries(wallet_address);
CREATE INDEX IF NOT EXISTS idx_premium_ends  ON premium_league_entries(ends_at DESC);

-- ── boss_access_entries ─────────────────────────────────────────────────────
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
DROP POLICY IF EXISTS "anon_select_boss_access_entries" ON boss_access_entries;
CREATE POLICY "anon_select_boss_access_entries" ON boss_access_entries
  FOR SELECT TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "anon_insert_boss_access_entries" ON boss_access_entries;
CREATE POLICY "anon_insert_boss_access_entries" ON boss_access_entries
  FOR INSERT TO anon, authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "anon_update_boss_access_entries" ON boss_access_entries;
CREATE POLICY "anon_update_boss_access_entries" ON boss_access_entries
  FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "anon_delete_boss_access_entries" ON boss_access_entries;
CREATE POLICY "anon_delete_boss_access_entries" ON boss_access_entries
  FOR DELETE TO anon, authenticated USING (true);

CREATE INDEX IF NOT EXISTS idx_boss_access_wallet ON boss_access_entries(wallet_address);
CREATE INDEX IF NOT EXISTS idx_boss_access_week  ON boss_access_entries(week_key);
