-- Dev seed for local PostgreSQL (no Supabase auth dependency).
-- Executed by db/scripts/setup-local.sh — do not run manually.
-- :dev_user_id is substituted from the DEV_USER_ID env var.

-- Dev user (matches DEV_USER_ID in api/.env)
insert into users (id, email)
values (:'dev_user_id'::uuid, 'dev@local')
on conflict (id) do nothing;

-- Default tracker categories
insert into tracker_categories (user_id, label, color, sort_order) values
  (:'dev_user_id'::uuid, 'Stocks / Equity',    'oklch(0.62 0.22 270)', 0),
  (:'dev_user_id'::uuid, 'SIP / Mutual Funds',  'oklch(0.70 0.18 200)', 1),
  (:'dev_user_id'::uuid, '401k / EPF',          'oklch(0.65 0.20 150)', 2),
  (:'dev_user_id'::uuid, 'IRA / PPF',           'oklch(0.68 0.16 130)', 3),
  (:'dev_user_id'::uuid, 'HSA',                 'oklch(0.72 0.15 165)', 4),
  (:'dev_user_id'::uuid, 'LIC / Insurance',     'oklch(0.60 0.14 310)', 5),
  (:'dev_user_id'::uuid, 'Gold',                'oklch(0.76 0.155 75)', 6),
  (:'dev_user_id'::uuid, 'FDs / Bonds',         'oklch(0.64 0.13 50)',  7),
  (:'dev_user_id'::uuid, 'Savings / HYSA',      'oklch(0.70 0.12 230)', 8),
  (:'dev_user_id'::uuid, 'Chits / Others',      'oklch(0.58 0.10 280)', 9)
on conflict do nothing;
