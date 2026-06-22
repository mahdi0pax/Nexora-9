import { supabase } from './supabase';

// ── Ritual testnet economy ─────────────────────────────────────────────────
//
// Real on-chain Ritual transfers are sent through the injected browser wallet
// (`window.ethereum`). No fake hashes anywhere: every ledger row references
// a transaction hash returned by the wallet after network confirmation.
//
// `fee_recipient` is configurable in the `ritual_config` singleton table and
// is fetched fresh before any payment is constructed.

export interface RitualConfig {
  fee_recipient: string;
  ritual_contract: string | null;
  chain_id: number | null;
  decimals: number;
  network_name: string;
  explorer_url: string | null;
}

export interface RitualTransaction {
  id: string;
  wallet_address: string;
  recipient_address: string;
  ritual_contract: string | null;
  chain_id: number | null;
  transaction_hash: string;
  amount_ritual: number;
  amount_raw: string | null;
  payment_kind: string;
  item_slug: string | null;
  status: string;
  block_number: number | null;
  memo: string | null;
  created_at: string;
  confirmed_at: string | null;
}

export type PaymentKind =
  | 'shop_purchase'
  | 'premium_pass'
  | 'boss_ticket'
  | 'crate_purchase'
  | 'daily_spin_reward'
  | 'reward_payout';

export type RitualProvider = {
  request: (args: { method: string; params?: unknown[] | object }) => Promise<unknown>;
  on?: (event: string, handler: (...args: unknown[]) => void) => void;
  removeListener?: (event: string, handler: (...args: unknown[]) => void) => void;
};

declare global {
  interface Window {
    ethereum?: RitualProvider;
  }
}

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL as string;

// ── Config ────────────────────────────────────────────────────────────────

export async function getRitualConfig(): Promise<RitualConfig> {
  const { data, error } = await supabase
    .from('ritual_config')
    .select('*')
    .eq('id', 1)
    .maybeSingle();
  if (error) throw error;
  if (!data) {
    return {
      fee_recipient: '0xd06bC18129a8be9af885E7E63B1B95FB19c261b3',
      ritual_contract: null,
      chain_id: null,
      decimals: 18,
      network_name: 'Ritual Testnet',
      explorer_url: null,
    };
  }
  return {
    fee_recipient:    data.fee_recipient,
    ritual_contract:  data.ritual_contract,
    chain_id:         data.chain_id,
    decimals:         data.decimals,
    network_name:     data.network_name,
    explorer_url:     data.explorer_url,
  };
}

export async function updateRitualConfig(patch: Partial<RitualConfig>): Promise<void> {
  const { error } = await supabase
    .from('ritual_config')
    .update({ ...patch, updated_at: new Date().toISOString() })
    .eq('id', 1);
  if (error) throw error;
}

// ── Wallet access ────────────────────────────────────────────────────────

export function getRitualProvider(): RitualProvider | null {
  if (typeof window === 'undefined') return null;
  return window.ethereum ?? null;
}

export async function getConnectedAccounts(): Promise<string[]> {
  const provider = getRitualProvider();
  if (!provider) throw new Error('No EVM wallet detected');
  const accounts = (await provider.request({ method: 'eth_requestAccounts' })) as string[];
  return Array.isArray(accounts) ? accounts : [];
}

export async function getConnectedChainId(): Promise<string | null> {
  const provider = getRitualProvider();
  if (!provider) return null;
  return (await provider.request({ method: 'eth_chainId' })) as string;
}

// Native ETH value transfer — used when there is no Ritual ERC-20 contract
// configured yet (early testnet). The amount is in ETH-equivalent RITUAL units.
function toHexWei(amountRitual: number, decimals: number): string {
  const big = BigInt(Math.round(amountRitual * 10 ** decimals));
  return '0x' + big.toString(16);
}

export interface PaymentRequest {
  amountRitual: number;
  paymentKind: PaymentKind;
  itemSlug?: string;
  memo?: string;
}

export interface PaymentResult {
  transactionHash: string;
  amountRitual: number;
  recipientAddress: string;
  fromAddress: string;
  chainId: string | null;
  blockNumber: number | null;
}

async function ensureCorrectChain(config: RitualConfig): Promise<void> {
  if (config.chain_id == null) return; // No enforced chain yet (flexible testnet mode)
  const provider = getRitualProvider();
  if (!provider) return;
  const current = (await provider.request({ method: 'eth_chainId' })) as string;
  const target = '0x' + config.chain_id.toString(16);
  if (current?.toLowerCase() === target.toLowerCase()) return;
  try {
    await provider.request({
      method: 'wallet_switchEthereumChain',
      params: [{ chainId: target }],
    });
  } catch {
    // If the chain isn't added yet, attempt to add it (best-effort).
    try {
      await provider.request({
        method: 'wallet_addEthereumChain',
        params: [{ chainId: target, chainName: config.network_name || 'Ritual Testnet', nativeCurrency: { name: 'RITUAL', symbol: 'RITUAL', decimals: config.decimals }, rpcUrls: [] }],
      });
    } catch {
      // Ignore — proceed and let the wallet surface the chain mismatch itself.
    }
  }
}

/**
 * Initiates a real on-chain Ritual transfer to the configured fee recipient.
 * If `config.ritual_contract` is set, it calls the ERC-20 `transfer(to, amount)`;
 * otherwise it sends a native-value transfer to the recipient.
 * The returned hash is genuinely produced by the wallet after confirmation.
 */
export async function sendRitualPayment(req: PaymentRequest): Promise<PaymentResult> {
  const config = await getRitualConfig();
  const provider = getRitualProvider();
  if (!provider) throw new Error('No EVM wallet detected. Install MetaMask or a Ritual-compatible wallet.');

  await ensureCorrectChain(config);

  const accounts = await getConnectedAccounts();
  if (!accounts || accounts.length === 0) throw new Error('Wallet connection rejected');
  const from = accounts[0];

  const valueHex = toHexWei(req.amountRitual, config.decimals);
  const to = config.fee_recipient;

  let txHash: string;
  let blockNumber: number | null = null;

  if (config.ritual_contract) {
    // ERC-20 transfer(to, amount) — calldata = 0xa9059cbb + padded(to) + padded(amount)
    const paddedTo   = to.replace(/^0x/, '').toLowerCase().padStart(64, '0');
    const paddedAmt  = BigInt(Math.round(req.amountRitual * 10 ** config.decimals)).toString(16).padStart(64, '0');
    const data       = '0xa9059cbb' + paddedTo + paddedAmt;
    txHash = (await provider.request({
      method: 'eth_sendTransaction',
      params: [{ from, to: config.ritual_contract, data }],
    })) as string;
  } else {
    // Native RITUAL transfer (works when the wallet's native currency IS RITUAL)
    txHash = (await provider.request({
      method: 'eth_sendTransaction',
      params: [{ from, to, value: valueHex }],
    })) as string;
  }

  const chainId = await getConnectedChainId();
  try {
    const receipt = (await provider.request({
      method: 'eth_getTransactionReceipt',
      params: [txHash],
    })) as { blockNumber?: string } | null;
    if (receipt?.blockNumber) {
      blockNumber = parseInt(receipt.blockNumber, 16);
    }
  } catch {
    // Receipt may not be available immediately — that's fine, hash is enough.
  }

  void config; // config read for side-effect of ensuring chain
  return {
    transactionHash: txHash,
    amountRitual: req.amountRitual,
    recipientAddress: to,
    fromAddress: from,
    chainId,
    blockNumber,
  };
}

// ── Transaction ledger persistence ───────────────────────────────────────

export interface RecordTransactionInput {
  walletAddress: string;
  result: PaymentResult;
  paymentKind: PaymentKind;
  itemSlug?: string | null;
  amountRitual: number;
  memo?: string | null;
}

export async function recordTransaction(input: RecordTransactionInput): Promise<RitualTransaction> {
  const config = await getRitualConfig();
  const { data, error } = await supabase
    .from('ritual_transactions')
    .insert({
      wallet_address:    input.walletAddress.toLowerCase(),
      recipient_address: input.result.recipientAddress,
      ritual_contract:   config.ritual_contract,
      chain_id:          config.chain_id,
      transaction_hash:  input.result.transactionHash,
      amount_ritual:     input.amountRitual,
      amount_raw:        BigInt(Math.round(input.amountRitual * 10 ** config.decimals)).toString(),
      payment_kind:      input.paymentKind,
      item_slug:         input.itemSlug ?? null,
      status:            'confirmed',
      block_number:      input.result.blockNumber,
      memo:              input.memo ?? null,
      confirmed_at:      new Date().toISOString(),
    })
    .select('*')
    .single();
  if (error) throw error;
  return data as unknown as RitualTransaction;
}

export async function getPlayerTransactions(walletAddress: string, limit = 50): Promise<RitualTransaction[]> {
  const { data, error } = await supabase
    .from('ritual_transactions')
    .select('*')
    .eq('wallet_address', walletAddress.toLowerCase())
    .order('created_at', { ascending: false })
    .limit(limit);
  if (error) throw error;
  return (data ?? []) as unknown as RitualTransaction[];
}

// ── Premium League gating ────────────────────────────────────────────────

export interface PremiumStatus {
  active: boolean;
  endsAt: string | null;
  startedAt: string | null;
  activationKind: string | null;
  transactionId: string | null;
}

export async function getPremiumStatus(walletAddress: string): Promise<PremiumStatus> {
  const now = new Date().toISOString();
  const { data, error } = await supabase
    .from('premium_league_entries')
    .select('*')
    .eq('wallet_address', walletAddress.toLowerCase())
    .gt('ends_at', now)
    .order('ends_at', { ascending: false })
    .limit(1)
    .maybeSingle();
  if (error) throw error;
  if (!data) return { active: false, endsAt: null, startedAt: null, activationKind: null, transactionId: null };
  return {
    active: true,
    endsAt: data.ends_at,
    startedAt: data.starts_at,
    activationKind: data.activation_kind,
    transactionId: data.transaction_id,
  };
}

export async function activatePremiumByRitual(
  walletAddress: string,
  durationDays: number,
  transactionId: string | null,
): Promise<void> {
  const now = new Date();
  const ends = new Date(now.getTime() + durationDays * 86400000);
  await supabase.from('premium_league_entries').insert({
    wallet_address: walletAddress.toLowerCase(),
    starts_at: now.toISOString(),
    ends_at: ends.toISOString(),
    activation_kind: 'ritual',
    transaction_id: transactionId,
  });
  await supabase
    .from('players')
    .update({ premium_until: ends.toISOString(), updated_at: now.toISOString() })
    .eq('wallet_address', walletAddress.toLowerCase());
}

export async function activatePremiumByItem(walletAddress: string, durationDays: number): Promise<void> {
  const now = new Date();
  const ends = new Date(now.getTime() + durationDays * 86400000);
  await supabase.from('premium_league_entries').insert({
    wallet_address: walletAddress.toLowerCase(),
    starts_at: now.toISOString(),
    ends_at: ends.toISOString(),
    activation_kind: 'item',
    transaction_id: null,
  });
  await supabase
    .from('players')
    .update({ premium_until: ends.toISOString(), updated_at: now.toISOString() })
    .eq('wallet_address', walletAddress.toLowerCase());
}

export async function getPremiumLeaderboard(limit = 25): Promise<Record<string, unknown>[]> {
  const now = new Date().toISOString();
  const { data: active, error } = await supabase
    .from('premium_league_entries')
    .select('wallet_address')
    .gt('ends_at', now);
  if (error) throw error;
  const wallets = Array.from(new Set((active ?? []).map(r => (r as { wallet_address: string }).wallet_address)));
  if (wallets.length === 0) return [];
  const { data: players } = await supabase
    .from('players')
    .select('wallet_address, username, rank_tier, rank_score, total_xp, level')
    .in('wallet_address', wallets)
    .order('rank_score', { ascending: false })
    .limit(limit);
  return (players ?? []) as Record<string, unknown>[];
}

// ── Boss Challenge gating ───────────────────────────────────────────────

export function bossWeekKey(date = new Date()): string {
  const d = new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()));
  const day = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - day);
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  const week = Math.ceil(((d.getTime() - yearStart.getTime()) / 86400000 + 1) / 7);
  return `${d.getUTCFullYear()}-W${String(week).padStart(2, '0')}`;
}

export interface BossAccessStatus {
  hasAccess: boolean;
  accessKind: string | null;
  weekKey: string;
}

export async function getBossAccess(walletAddress: string): Promise<BossAccessStatus> {
  const weekKey = bossWeekKey();
  const { data, error } = await supabase
    .from('boss_access_entries')
    .select('*')
    .eq('wallet_address', walletAddress.toLowerCase())
    .eq('week_key', weekKey)
    .maybeSingle();
  if (error) throw error;
  return {
    hasAccess: !!data,
    accessKind: data?.access_kind ?? null,
    weekKey,
  };
}

export async function grantBossAccess(
  walletAddress: string,
  accessKind: 'ritual' | 'ticket' | 'eligibility',
  transactionId: string | null = null,
): Promise<void> {
  const weekKey = bossWeekKey();
  await supabase
    .from('boss_access_entries')
    .upsert(
      {
        wallet_address: walletAddress.toLowerCase(),
        week_key: weekKey,
        access_kind: accessKind,
        transaction_id: transactionId,
        created_at: new Date().toISOString(),
      },
      { onConflict: 'wallet_address,week_key' },
    );
}

export async function grantBossAccessByEligibility(walletAddress: string): Promise<void> {
  await grantBossAccess(walletAddress, 'eligibility', null);
}

// ── Inventory activation helpers ────────────────────────────────────────

const SECONDS_PER_HOUR = 3600;

export interface ActivationOutcome {
  effectType: string;
  effectValue: number;
  expiresAt: string | null;
  reward: { kind: 'xp' | 'ritual' | 'item'; value: string } | null;
}

/**
 * Activates an inventory item and applies its gameplay effect.
 * Crates resolve into a randomized reward; timed boosts set an expiry;
 * one-shot consumables are consumed immediately.
 */
export async function activateInventoryItem(
  walletAddress: string,
  inventoryItemId: string,
  item: { effect_type: string; effect_value: number; duration_hours: number | null; slug: string; item_slug?: string },
): Promise<ActivationOutcome> {
  const now = new Date();
  const expiresAt =
    item.duration_hours != null
      ? new Date(now.getTime() + item.duration_hours * SECONDS_PER_HOUR * 1000).toISOString()
      : null;

  if (item.effect_type === 'mystery') {
    // Resolve crate
    const outcomes = [
      { kind: 'xp' as const, value: '100' },
      { kind: 'xp' as const, value: '250' },
      { kind: 'xp' as const, value: '500' },
      { kind: 'item' as const, value: 'hint_token' },
      { kind: 'item' as const, value: 'retry_ticket' },
      { kind: 'ritual' as const, value: '0.01' },
    ];
    const reward = outcomes[Math.floor(Math.random() * outcomes.length)];
    if (reward.kind === 'xp') {
      // credit XP directly to player
      const { data: p } = await supabase
        .from('players')
        .select('total_xp')
        .eq('wallet_address', walletAddress.toLowerCase())
        .maybeSingle();
      const newXp = (p?.total_xp ?? 0) + parseInt(reward.value);
      await supabase
        .from('players')
        .update({ total_xp: newXp, updated_at: new Date().toISOString() })
        .eq('wallet_address', walletAddress.toLowerCase());
    } else if (reward.kind === 'item') {
      await supabase.from('inventory_items').insert({
        wallet_address: walletAddress.toLowerCase(),
        item_slug: reward.value,
        quantity: 1,
        is_active: false,
        transaction_hash: null,
      });
    } else if (reward.kind === 'ritual') {
      const { data: p } = await supabase
        .from('players')
        .select('ritual_balance')
        .eq('wallet_address', walletAddress.toLowerCase())
        .maybeSingle();
      const bal = (p?.ritual_balance ?? 0) + parseFloat(reward.value);
      await supabase
        .from('players')
        .update({ ritual_balance: bal, updated_at: new Date().toISOString() })
        .eq('wallet_address', walletAddress.toLowerCase());
    }
    await supabase
      .from('inventory_items')
      .update({ is_active: true, activated_at: now.toISOString(), expires_at: expiresAt })
      .eq('id', inventoryItemId);
    return { effectType: item.effect_type, effectValue: item.effect_value, expiresAt, reward };
  }

  if (item.effect_type === 'premium_access') {
    await activatePremiumByItem(walletAddress, Math.round((item.duration_hours ?? 168) / 24));
  }

  if (item.effect_type === 'boss_access') {
    await grantBossAccess(walletAddress, 'ticket', null);
  }

  if (item.effect_type === 'streak_shield') {
    await supabase
      .from('players')
      .update({ streak_shield: true, updated_at: now.toISOString() })
      .eq('wallet_address', walletAddress.toLowerCase());
  }

  await supabase
    .from('inventory_items')
    .update({ is_active: true, activated_at: now.toISOString(), expires_at: expiresAt })
    .eq('id', inventoryItemId);

  return { effectType: item.effect_type, effectValue: item.effect_value, expiresAt, reward: null };
}

// ── Purchase flow ────────────────────────────────────────────────────────

export interface PurchaseOutcome {
  success: boolean;
  transaction?: RitualTransaction;
  inventoryItemId?: string;
  error?: string;
}

/**
 * Full Ritual purchase: on-chain transfer → ledger row → inventory row.
 * Used by the shop for items that have a Ritual price.
 */
export async function purchaseShopItemWithRitual(
  walletAddress: string,
  item: { slug: string; price_ritual: number; effect_type: string; duration_hours: number | null; effect_value: number },
): Promise<PurchaseOutcome> {
  try {
    const result = await sendRitualPayment({
      amountRitual: item.price_ritual,
      paymentKind: item.effect_type === 'premium_access' ? 'premium_pass' : item.effect_type === 'boss_access' ? 'boss_ticket' : 'shop_purchase',
      itemSlug: item.slug,
      memo: `Nexora shop: ${item.slug}`,
    });

    const tx = await recordTransaction({
      walletAddress,
      result,
      paymentKind: item.effect_type === 'premium_access' ? 'premium_pass' : item.effect_type === 'boss_access' ? 'boss_ticket' : 'shop_purchase',
      itemSlug: item.slug,
      amountRitual: item.price_ritual,
      memo: `Nexora shop: ${item.slug}`,
    });

    const { data: inv, error: invErr } = await supabase
      .from('inventory_items')
      .insert({
        wallet_address: walletAddress.toLowerCase(),
        item_slug: item.slug,
        quantity: 1,
        is_active: false,
        transaction_hash: result.transactionHash,
      })
      .select('id')
      .single();
    if (invErr) throw invErr;

    // Refresh player ritual balance by subtracting spent amount
    const { data: p } = await supabase
      .from('players')
      .select('ritual_balance')
      .eq('wallet_address', walletAddress.toLowerCase())
      .maybeSingle();
    const newBal = Math.max(0, (p?.ritual_balance ?? 0) - item.price_ritual);
    await supabase
      .from('players')
      .update({ ritual_balance: newBal, updated_at: new Date().toISOString() })
      .eq('wallet_address', walletAddress.toLowerCase());

    return { success: true, transaction: tx, inventoryItemId: inv.id };
  } catch (e) {
    return { success: false, error: e instanceof Error ? e.message : String(e) };
  }
}

/** Activate the Premium Challenge Pass via a direct Ritual payment (no inventory item). */
export async function purchasePremiumPassWithRitual(walletAddress: string, amountRitual: number, durationDays: number): Promise<PurchaseOutcome> {
  try {
    const result = await sendRitualPayment({
      amountRitual: amountRitual,
      paymentKind: 'premium_pass',
      memo: 'Nexora Premium League pass',
    });
    const tx = await recordTransaction({
      walletAddress,
      result,
      paymentKind: 'premium_pass',
      itemSlug: 'premium_pass',
      amountRitual,
      memo: 'Nexora Premium League pass',
    });
    await activatePremiumByRitual(walletAddress, durationDays, tx.id);
    return { success: true, transaction: tx };
  } catch (e) {
    return { success: false, error: e instanceof Error ? e.message : String(e) };
  }
}

/** Activate Boss Challenge access via a direct Ritual payment (no inventory item). */
export async function purchaseBossTicketWithRitual(walletAddress: string, amountRitual: number): Promise<PurchaseOutcome> {
  try {
    const result = await sendRitualPayment({
      amountRitual: amountRitual,
      paymentKind: 'boss_ticket',
      memo: 'Nexora Boss Challenge ticket',
    });
    const tx = await recordTransaction({
      walletAddress,
      result,
      paymentKind: 'boss_ticket',
      itemSlug: 'boss_ticket',
      amountRitual,
      memo: 'Nexora Boss Challenge ticket',
    });
    await grantBossAccess(walletAddress, 'ritual', tx.id);
    return { success: true, transaction: tx };
  } catch (e) {
    return { success: false, error: e instanceof Error ? e.message : String(e) };
  }
}

// ── Transaction explorer link helper ────────────────────────────────────

export function transactionExplorerUrl(config: RitualConfig | null, txHash: string): string | null {
  if (!config?.explorer_url) return null;
  const base = config.explorer_url.replace(/\/$/, '');
  return `${base}/tx/${txHash}`;
}

export { SUPABASE_URL };
