alter table public.deck_completions
  drop constraint if exists deck_completions_user_id_deck_id_completed_date_key;

alter table public.deck_completions
  add column if not exists score_percent integer,
  add column if not exists cards_reviewed integer,
  add column if not exists correct_count integer,
  add column if not exists total_count integer;
