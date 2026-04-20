-- home_calc_profiles: saved home calculator inputs per user
create table if not exists fire.home_calc_profiles (
  id            uuid primary key default gen_random_uuid(),
  user_id       uuid not null references auth.users(id) on delete cascade,
  name          text not null default 'My Home Profile',
  break_even    jsonb,
  mortgage      jsonb,
  affordability jsonb,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now(),
  unique(user_id, name)
);

create index if not exists home_calc_profiles_user_id_idx on fire.home_calc_profiles(user_id);

alter table fire.home_calc_profiles enable row level security;

create policy "Users can manage their own home calc profiles"
  on fire.home_calc_profiles
  for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create or replace function fire.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger home_calc_profiles_updated_at
  before update on fire.home_calc_profiles
  for each row execute function fire.set_updated_at();
