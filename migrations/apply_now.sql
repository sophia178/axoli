-- Run this in the Supabase SQL editor for your project.
-- It applies the hunger columns and the deck completion columns if they haven't been applied yet.

alter table public.profiles
  add column if not exists hunger_level integer default 100;

alter table public.profiles
  add column if not exists last_fed_at timestamptz default now();

update public.profiles
set hunger_level = 100
where hunger_level is null;

update public.profiles
set last_fed_at = now()
where last_fed_at is null;

alter table public.deck_completions
  add column if not exists cards_reviewed integer default 0;

alter table public.deck_completions
  add column if not exists score_percentage integer default 0;

alter table public.deck_completions
  add column if not exists score_percent integer default 0;

update public.deck_completions
set cards_reviewed = 0
where cards_reviewed is null;

update public.deck_completions
set score_percentage = 0
where score_percentage is null;

update public.deck_completions
set score_percent = 0
where score_percent is null;
