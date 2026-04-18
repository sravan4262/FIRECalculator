-- tracker_entries: monthly planned vs actual per category
create table if not exists fire.tracker_entries (
  id           uuid primary key default gen_random_uuid(),
  user_id      uuid not null references auth.users(id) on delete cascade,
  month        varchar(7) not null,
  category_id  uuid not null references fire.tracker_categories(id) on delete cascade,
  planned      numeric,
  actual       numeric,
  unique (user_id, month, category_id)
);

create index if not exists tracker_entries_user_month_idx on fire.tracker_entries(user_id, month);
