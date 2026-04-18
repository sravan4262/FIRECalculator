-- tracker_categories: per-user savings categories
create table if not exists tracker_categories (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references auth.users(id) on delete cascade,
  label       text not null,
  color       text not null,
  sort_order  integer not null default 0
);

create index if not exists tracker_categories_user_id_idx on tracker_categories(user_id);
