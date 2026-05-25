create extension if not exists pgcrypto;

create table if not exists public.users (
  id uuid primary key references auth.users (id) on delete cascade,
  email text not null,
  created_at timestamptz not null default now(),
  plan text not null default 'free'
);

alter table public.users enable row level security;

create policy "users_select_own"
on public.users
for select
to authenticated
using (id = auth.uid());

create policy "users_update_own"
on public.users
for update
to authenticated
using (id = auth.uid())
with check (id = auth.uid());

create table if not exists public.profiles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null unique references public.users (id) on delete cascade,
  username text,
  plan text not null default 'free',
  coins integer not null default 0,
  streak integer not null default 0,
  last_study_date date,
  last_login_date date not null default current_date,
  pet_happiness integer not null default 100,
  pet_level integer not null default 1,
  pet_last_updated date not null default current_date,
  pet_colour text not null default 'pink',
  pet_accessories text[] not null default '{}'::text[],
  avatar_colour text not null default 'pink',
  language text not null default 'en',
  ads_watched_today int not null default 0,
  ads_reset_date date not null default current_date,
  notify_daily boolean not null default true,
  notify_streak_risk boolean not null default true,
  notify_exam boolean not null default true,
  notify_group boolean not null default true,
  stripe_customer_id text,
  stripe_subscription_id text,
  stripe_renewal_at timestamptz
);

alter table public.profiles add column if not exists language text default 'en';
alter table public.profiles add column if not exists ads_watched_today int default 0;
alter table public.profiles add column if not exists ads_reset_date date default current_date;

alter table public.profiles enable row level security;

create policy "profiles_select_own"
on public.profiles
for select
to authenticated
using (user_id = auth.uid());

create policy "profiles_update_own"
on public.profiles
for update
to authenticated
using (user_id = auth.uid())
with check (user_id = auth.uid());

create table if not exists public.flashcard_decks (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users (id) on delete cascade,
  title text not null,
  subject text not null,
  is_public boolean not null default false,
  last_studied_at timestamptz,
  created_at timestamptz not null default now()
);

alter table public.flashcard_decks enable row level security;

create policy "decks_select_own_or_public"
on public.flashcard_decks
for select
to authenticated
using (user_id = auth.uid() or is_public = true);

create policy "decks_insert_own"
on public.flashcard_decks
for insert
to authenticated
with check (user_id = auth.uid());

create policy "decks_update_own"
on public.flashcard_decks
for update
to authenticated
using (user_id = auth.uid())
with check (user_id = auth.uid());

create policy "decks_delete_own"
on public.flashcard_decks
for delete
to authenticated
using (user_id = auth.uid());

create table if not exists public.flashcards (
  id uuid primary key default gen_random_uuid(),
  deck_id uuid not null references public.flashcard_decks (id) on delete cascade,
  front text not null,
  back text not null,
  difficulty integer not null default 3,
  next_review timestamptz
);

alter table public.flashcards enable row level security;

create policy "flashcards_select_own_or_public"
on public.flashcards
for select
to authenticated
using (
  exists (
    select 1
    from public.flashcard_decks d
    where d.id = deck_id
      and (d.user_id = auth.uid() or d.is_public = true)
  )
);

create policy "flashcards_insert_own"
on public.flashcards
for insert
to authenticated
with check (
  exists (
    select 1
    from public.flashcard_decks d
    where d.id = deck_id
      and d.user_id = auth.uid()
  )
);

create policy "flashcards_update_own"
on public.flashcards
for update
to authenticated
using (
  exists (
    select 1
    from public.flashcard_decks d
    where d.id = deck_id
      and d.user_id = auth.uid()
  )
)
with check (
  exists (
    select 1
    from public.flashcard_decks d
    where d.id = deck_id
      and d.user_id = auth.uid()
  )
);

create policy "flashcards_delete_own"
on public.flashcards
for delete
to authenticated
using (
  exists (
    select 1
    from public.flashcard_decks d
    where d.id = deck_id
      and d.user_id = auth.uid()
  )
);

create table if not exists public.study_sessions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users (id) on delete cascade,
  duration integer not null,
  subject text,
  coins_earned integer not null default 0,
  created_at timestamptz not null default now()
);

alter table public.study_sessions enable row level security;

create policy "sessions_select_own"
on public.study_sessions
for select
to authenticated
using (user_id = auth.uid());

create policy "sessions_insert_own"
on public.study_sessions
for insert
to authenticated
with check (user_id = auth.uid());

create table if not exists public.exams (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users (id) on delete cascade,
  name text not null,
  subject text not null,
  exam_date date not null,
  created_at timestamptz not null default now()
);

alter table public.exams enable row level security;

create policy "exams_select_own"
on public.exams
for select
to authenticated
using (user_id = auth.uid());

create policy "exams_insert_own"
on public.exams
for insert
to authenticated
with check (user_id = auth.uid());

create policy "exams_update_own"
on public.exams
for update
to authenticated
using (user_id = auth.uid())
with check (user_id = auth.uid());

create policy "exams_delete_own"
on public.exams
for delete
to authenticated
using (user_id = auth.uid());

create table if not exists public.study_groups (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  subject text not null,
  created_by uuid not null references public.users (id) on delete cascade,
  join_code text not null unique,
  is_private boolean not null default false,
  created_at timestamptz not null default now()
);

alter table public.study_groups enable row level security;

create policy "groups_select_member"
on public.study_groups
for select
to authenticated
using (
  created_by = auth.uid()
  or exists (
    select 1
    from public.group_members gm
    where gm.group_id = id
      and gm.user_id = auth.uid()
  )
);

create policy "groups_insert_any"
on public.study_groups
for insert
to authenticated
with check (created_by = auth.uid());

create table if not exists public.group_members (
  id uuid primary key default gen_random_uuid(),
  group_id uuid not null references public.study_groups (id) on delete cascade,
  user_id uuid not null references public.users (id) on delete cascade,
  role text not null default 'member',
  joined_at timestamptz not null default now(),
  unique (group_id, user_id)
);

alter table public.group_members enable row level security;

create policy "group_members_select_own"
on public.group_members
for select
to authenticated
using (user_id = auth.uid());

create policy "group_members_insert_own"
on public.group_members
for insert
to authenticated
with check (user_id = auth.uid());

create table if not exists public.group_decks (
  id uuid primary key default gen_random_uuid(),
  group_id uuid not null references public.study_groups (id) on delete cascade,
  deck_id uuid not null references public.flashcard_decks (id) on delete cascade,
  shared_by uuid not null references public.users (id) on delete cascade,
  created_at timestamptz not null default now(),
  unique (group_id, deck_id)
);

alter table public.group_decks enable row level security;

create policy "group_decks_select_member"
on public.group_decks
for select
to authenticated
using (
  exists (
    select 1 from public.group_members gm
    where gm.group_id = group_id and gm.user_id = auth.uid()
  )
);

create policy "group_decks_insert_member"
on public.group_decks
for insert
to authenticated
with check (
  shared_by = auth.uid()
  and exists (
    select 1 from public.group_members gm
    where gm.group_id = group_id and gm.user_id = auth.uid()
  )
);

create table if not exists public.group_chat_messages (
  id uuid primary key default gen_random_uuid(),
  group_id uuid not null references public.study_groups (id) on delete cascade,
  user_id uuid not null references public.users (id) on delete cascade,
  message text not null,
  created_at timestamptz not null default now()
);

alter table public.group_chat_messages enable row level security;

create policy "group_chat_select_member"
on public.group_chat_messages
for select
to authenticated
using (
  exists (
    select 1 from public.group_members gm
    where gm.group_id = group_id and gm.user_id = auth.uid()
  )
);

create policy "group_chat_insert_member"
on public.group_chat_messages
for insert
to authenticated
with check (
  user_id = auth.uid()
  and exists (
    select 1 from public.group_members gm
    where gm.group_id = group_id and gm.user_id = auth.uid()
  )
);

create table if not exists public.flashcard_reviews (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users (id) on delete cascade,
  deck_id uuid not null references public.flashcard_decks (id) on delete cascade,
  card_id uuid not null references public.flashcards (id) on delete cascade,
  known boolean not null,
  created_at timestamptz not null default now()
);

alter table public.flashcard_reviews enable row level security;

create policy "flashcard_reviews_select_own"
on public.flashcard_reviews
for select
to authenticated
using (user_id = auth.uid());

create policy "flashcard_reviews_insert_own"
on public.flashcard_reviews
for insert
to authenticated
with check (user_id = auth.uid());

create table if not exists public.flashcard_mastery (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users (id) on delete cascade,
  card_id uuid not null references public.flashcards (id) on delete cascade,
  known_count integer not null default 0,
  unknown_count integer not null default 0,
  mastered boolean not null default false,
  updated_at timestamptz not null default now(),
  unique (user_id, card_id)
);

alter table public.flashcard_mastery enable row level security;

create policy "flashcard_mastery_select_own"
on public.flashcard_mastery
for select
to authenticated
using (user_id = auth.uid());

create policy "flashcard_mastery_upsert_own"
on public.flashcard_mastery
for insert
to authenticated
with check (user_id = auth.uid());

create policy "flashcard_mastery_update_own"
on public.flashcard_mastery
for update
to authenticated
using (user_id = auth.uid())
with check (user_id = auth.uid());

create table if not exists public.deck_completions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users (id) on delete cascade,
  deck_id uuid not null references public.flashcard_decks (id) on delete cascade,
  completed_date date not null default current_date,
  created_at timestamptz not null default now(),
  unique (user_id, deck_id, completed_date)
);

alter table public.deck_completions enable row level security;

create policy "deck_completions_select_own"
on public.deck_completions
for select
to authenticated
using (user_id = auth.uid());

create policy "deck_completions_insert_own"
on public.deck_completions
for insert
to authenticated
with check (user_id = auth.uid());

create table if not exists public.quiz_attempts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users (id) on delete cascade,
  deck_id uuid references public.flashcard_decks (id) on delete set null,
  mode text not null,
  question_count integer not null,
  correct_count integer not null,
  duration_seconds integer not null,
  created_at timestamptz not null default now()
);

alter table public.quiz_attempts enable row level security;

create policy "quiz_attempts_select_own"
on public.quiz_attempts
for select
to authenticated
using (user_id = auth.uid());

create policy "quiz_attempts_insert_own"
on public.quiz_attempts
for insert
to authenticated
with check (user_id = auth.uid());

create table if not exists public.coins_ledger (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users (id) on delete cascade,
  amount integer not null,
  reason text not null,
  created_at timestamptz not null default now()
);

alter table public.coins_ledger enable row level security;

create policy "coins_ledger_select_own"
on public.coins_ledger
for select
to authenticated
using (user_id = auth.uid());

create table if not exists public.planner_tasks (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users (id) on delete cascade,
  title text not null,
  subject text not null,
  estimated_minutes integer not null default 10,
  scheduled_date date not null default current_date,
  completed_at timestamptz,
  created_at timestamptz not null default now()
);

alter table public.planner_tasks enable row level security;

create policy "planner_tasks_select_own"
on public.planner_tasks
for select
to authenticated
using (user_id = auth.uid());

create policy "planner_tasks_insert_own"
on public.planner_tasks
for insert
to authenticated
with check (user_id = auth.uid());

create policy "planner_tasks_update_own"
on public.planner_tasks
for update
to authenticated
using (user_id = auth.uid())
with check (user_id = auth.uid());

create policy "planner_tasks_delete_own"
on public.planner_tasks
for delete
to authenticated
using (user_id = auth.uid());

create table if not exists public.revision_completions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users (id) on delete cascade,
  exam_id uuid not null references public.exams (id) on delete cascade,
  scheduled_date date not null,
  completed_at timestamptz not null default now(),
  unique (user_id, exam_id, scheduled_date)
);

alter table public.revision_completions enable row level security;

create policy "revision_completions_select_own"
on public.revision_completions
for select
to authenticated
using (user_id = auth.uid());

create policy "revision_completions_insert_own"
on public.revision_completions
for insert
to authenticated
with check (user_id = auth.uid());

create table if not exists public.shop_items (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  type text not null,
  cost integer not null default 0,
  image_url text,
  is_premium boolean not null default false,
  is_seasonal boolean not null default false
);

alter table public.shop_items enable row level security;

create policy "shop_items_select_all"
on public.shop_items
for select
to authenticated
using (true);

create table if not exists public.user_items (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users (id) on delete cascade,
  item_id uuid not null references public.shop_items (id) on delete cascade,
  purchased_at timestamptz not null default now(),
  unique (user_id, item_id)
);

alter table public.user_items enable row level security;

create policy "user_items_select_own"
on public.user_items
for select
to authenticated
using (user_id = auth.uid());

create policy "user_items_insert_own"
on public.user_items
for insert
to authenticated
with check (user_id = auth.uid());

create table if not exists public.ai_usage (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users (id) on delete cascade,
  month text not null,
  count integer not null default 0,
  unique (user_id, month)
);

alter table public.ai_usage enable row level security;

create policy "ai_usage_select_own"
on public.ai_usage
for select
to authenticated
using (user_id = auth.uid());

create policy "ai_usage_upsert_own"
on public.ai_usage
for insert
to authenticated
with check (user_id = auth.uid());

create policy "ai_usage_update_own"
on public.ai_usage
for update
to authenticated
using (user_id = auth.uid())
with check (user_id = auth.uid());

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.users (id, email)
  values (new.id, new.email)
  on conflict (id) do nothing;

  insert into public.profiles (user_id, username, plan, pet_happiness, pet_last_updated, last_login_date, avatar_colour, language)
  values (new.id, split_part(new.email, '@', 1), 'free', 100, current_date, current_date, 'pink', 'en')
  on conflict (user_id) do nothing;

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;

create trigger on_auth_user_created
after insert on auth.users
for each row execute procedure public.handle_new_user();
