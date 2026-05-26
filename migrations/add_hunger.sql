alter table public.profiles
  add column if not exists hunger_level integer not null default 100;

alter table public.profiles
  add column if not exists last_fed_at timestamptz not null default now();

update public.profiles
set hunger_level = 100
where hunger_level is null;

update public.profiles
set last_fed_at = now()
where last_fed_at is null;
