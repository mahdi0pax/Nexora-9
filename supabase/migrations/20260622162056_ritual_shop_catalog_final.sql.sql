/*
# Ritual Shop Catalog Finalization

Re-seeds the complete required item catalog with activation state metadata
and effect types the gameplay layer reads. Existing rows are updated in place
so prior wallet inventory rows keep their references valid.

Effect types used by the gameplay layer:
- xp_multiplier      : multiplies XP gains for a session window
- reward_multiplier : multiplies all rewards (XP + ritual-credited effects)
- streak_shield     : absorbs streak losses
- hint              : reveals a clue per token
- retry             : allows re-attempting a completed challenge
- boss_access       : grants weekly Boss Challenge entry
- premium_access    : grants Premium League entry for a window
- mystery           : crate that resolves to a random reward on activation

Activation state lives on inventory_items.is_active / activated_at / expires_at.
*/

INSERT INTO shop_items (slug, name, description, category, price_ritual, rarity, duration_hours, effect_type, effect_value, is_active)
VALUES
  ('xp_boost_1h',        'XP Boost 1h',          'Double all XP gains for one hour. Stacks with streak multipliers.',        'boost',      0.01, 'common',    1,    'xp_multiplier',     2.0, true),
  ('xp_boost_6h',        'XP Boost 6h',          'Double all XP gains for six hours. Perfect for a long session.',            'boost',      0.05, 'uncommon',  6,    'xp_multiplier',     2.0, true),
  ('xp_boost_24h',       'XP Boost 24h',         'Double all XP gains for a full day. Best value for dedicated players.',     'boost',      0.1,  'rare',      24,   'xp_multiplier',     2.0, true),
  ('streak_shield_1',    'Streak Shield I',      'Protect your streak from one missed day.',                                 'protection', 0.02, 'common',    NULL, 'streak_shield',     1.0, true),
  ('streak_shield_3',    'Streak Shield III',    'Protect your streak for up to three missed days.',                          'protection', 0.05, 'uncommon',  NULL, 'streak_shield',     3.0, true),
  ('streak_shield_7',    'Streak Shield VII',    'Protect your streak for an entire week of missed days.',                    'protection', 0.1,  'rare',      NULL, 'streak_shield',     7.0, true),
  ('hint_token',         'Hint Token',           'Reveal a clue for one difficult question during a challenge.',             'utility',    0.005,'common',    NULL, 'hint',              1.0, true),
  ('retry_ticket',       'Retry Ticket',         'Re-attempt a challenge you already completed today.',                      'utility',    0.002,'common',    NULL, 'retry',             1.0, true),
  ('boss_ticket',        'Boss Ticket',          'Gain entry to any Weekly Boss Challenge regardless of tier.',              'access',     0.2,  'epic',      NULL, 'boss_access',       1.0, true),
  ('double_reward_1h',   'Double Reward Token 1h','Earn double rewards from all challenge types for one hour.',               'boost',      0.02, 'uncommon',  1,    'reward_multiplier', 2.0, true),
  ('double_reward_24h',  'Double Reward Token 24h','Earn double rewards from all challenge types for 24 hours.',            'boost',      0.05, 'rare',      24,   'reward_multiplier', 2.0, true),
  ('premium_pass',       'Premium Challenge Pass','Unlocks seven days of Premium League: exclusive challenges, extra XP, and a premium badge.', 'access', 0.15, 'epic', 168, 'premium_access', 1.0, true),
  ('mystic_box',         'Mystic Box',           'A mystery crate that resolves into a random rare item or bonus XP on activation.', 'crate', 0.05, 'rare', NULL, 'mystery', 0.0, true),
  ('legendary_crate',    'Legendary Crate',      'Guaranteed epic or legendary loot: items, large XP bundles, or cosmetic titles.', 'crate', 0.2, 'legendary', NULL, 'mystery', 0.0, true)
ON CONFLICT (slug) DO UPDATE SET
  name           = EXCLUDED.name,
  description    = EXCLUDED.description,
  category       = EXCLUDED.category,
  price_ritual   = EXCLUDED.price_ritual,
  rarity         = EXCLUDED.rarity,
  duration_hours = EXCLUDED.duration_hours,
  effect_type    = EXCLUDED.effect_type,
  effect_value   = EXCLUDED.effect_value,
  is_active      = EXCLUDED.is_active;
