alter table public.profiles
  add column if not exists xp integer not null default 0;

update public.profiles
set xp = 0
where xp is null;
