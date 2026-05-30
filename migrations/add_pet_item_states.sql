alter table public.profiles
  add column if not exists pet_item_states jsonb not null default '{}'::jsonb;
