-- Mole Madness beta: approved reviewers and their case reviews.
--
-- Run this in the Supabase dashboard (SQL Editor → New query → paste → Run).
-- It is safe to run again: everything is created only if missing or replaced.
--
-- Who can do what (enforced by the database, not the website):
--   * Anyone can use the quiz as a guest.
--   * Only emails on the `reviewers` list can sign in: the sign-in hook below
--     refuses to create accounts (or send codes) for anyone else.
--   * Reviewers review a fixed set of images (webapp/src/data/reviewSet.json): one
--     review per image, which they can read and update but not delete. Nobody
--     sees anyone else's.
--   * You read everything in the dashboard (Table Editor), which bypasses these
--     rules because it runs as the database owner.
--
-- To approve a reviewer: insert into public.reviewers (email, name) values ('a@b.org', 'Dr A');
-- To remove one:         delete from public.reviewers where email = 'a@b.org';

-- Approved reviewers. Emails are stored lowercase.
create table if not exists public.reviewers (
  email text primary key check (email = lower(email)),
  name text,
  added_at timestamptz not null default now()
);
alter table public.reviewers enable row level security;
revoke all on public.reviewers from anon, authenticated;
-- No policies: the list is invisible to the website. Only the functions below read it.

-- Sign-in gate: Supabase calls this before creating an account, which happens the
-- first time someone asks for a code. Turn it on under Authentication → Auth Hooks
-- → "Before User Created" → Postgres → public.hook_reviewers_only.
create or replace function public.hook_reviewers_only(event jsonb)
returns jsonb
language plpgsql
stable
security definer
set search_path = ''
as $$
begin
  if exists (select 1 from public.reviewers where email = lower(event -> 'user' ->> 'email')) then
    return '{}'::jsonb;
  end if;
  return jsonb_build_object('error', jsonb_build_object(
    'http_code', 403,
    'message', 'This email isn''t on the reviewer list. Ask the person who shared this link to add it.'
  ));
end;
$$;
revoke all on function public.hook_reviewers_only(jsonb) from public, anon, authenticated;
grant execute on function public.hook_reviewers_only(jsonb) to supabase_auth_admin;

-- True when the signed-in user has a verified email on the reviewers list
-- (false for someone who signed in before being removed from it).
create or replace function public.is_reviewer()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from auth.users u
    join public.reviewers r on r.email = lower(u.email)
    where u.id = auth.uid() and u.email_confirmed_at is not null
  );
$$;
revoke all on function public.is_reviewer() from public, anon;
grant execute on function public.is_reviewer() to authenticated;

-- One review per reviewer and case, from the fixed review set (reviewSet.json).
--   present        checklist or other features the reviewer ticked
--   unassessable   checklist features they marked "can't assess" (vs. absent: unticked)
--   offered        the diagnosis' checklist they were shown (= the features Claude was asked about)
--   claude_present / claude_uncertain  Claude's raw calls on that checklist, from the
--                  saved run named in reviewSet.json (absent = the rest of `offered`)
--   blind          saved without filling in from, or looking at, Claude's calls
--   initial_*      the first save, kept when the review is later updated, so blind
--                  calls survive a reviewer changing their mind
-- An earlier draft of this table (quiz reviews, with `shown`) is replaced; it only
-- ever held test data.
do $$
begin
  if exists (select 1 from information_schema.columns
             where table_schema = 'public' and table_name = 'case_reviews' and column_name = 'shown') then
    drop table public.case_reviews;
  end if;
end;
$$;

create table if not exists public.case_reviews (
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  email text default lower(auth.jwt() ->> 'email'),
  review_set text not null check (char_length(review_set) <= 40),
  case_id text not null check (char_length(case_id) <= 40),
  code text check (char_length(code) <= 20),
  dx text check (char_length(dx) <= 60),
  diagnosis text check (char_length(diagnosis) <= 200),
  present text[] not null default '{}' check (cardinality(present) <= 120),
  unassessable text[] not null default '{}' check (cardinality(unassessable) <= 120),
  offered text[] not null default '{}' check (cardinality(offered) <= 120),
  claude_present text[] not null default '{}' check (cardinality(claude_present) <= 120),
  claude_uncertain text[] not null default '{}' check (cardinality(claude_uncertain) <= 120),
  blind boolean not null,
  comment text check (char_length(comment) <= 2000),
  initial_present text[],
  initial_unassessable text[],
  initial_blind boolean,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  primary key (user_id, case_id),
  check (not (present && unassessable))
);
alter table public.case_reviews enable row level security;

revoke all on public.case_reviews from anon, authenticated;
-- Saving uses insert-or-update, which needs read access to every column it writes.
grant select (user_id, review_set, case_id, code, dx, diagnosis, present, unassessable, offered,
              claude_present, claude_uncertain, blind, comment) on public.case_reviews to authenticated;
grant insert (review_set, case_id, code, dx, diagnosis, present, unassessable, offered,
              claude_present, claude_uncertain, blind, comment) on public.case_reviews to authenticated;
grant update (review_set, case_id, code, dx, diagnosis, present, unassessable, offered,
              claude_present, claude_uncertain, blind, comment) on public.case_reviews to authenticated;

drop policy if exists "reviewers read their own reviews" on public.case_reviews;
create policy "reviewers read their own reviews"
  on public.case_reviews for select
  to authenticated
  using (user_id = auth.uid());

drop policy if exists "reviewers add their own reviews" on public.case_reviews;
create policy "reviewers add their own reviews"
  on public.case_reviews for insert
  to authenticated
  with check (user_id = auth.uid() and public.is_reviewer());

drop policy if exists "reviewers update their own reviews" on public.case_reviews;
create policy "reviewers update their own reviews"
  on public.case_reviews for update
  to authenticated
  using (user_id = auth.uid() and public.is_reviewer())
  with check (user_id = auth.uid() and public.is_reviewer());

-- Keeps the first save and stamps updates.
create or replace function public.case_reviews_history()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  if tg_op = 'INSERT' then
    new.initial_present = new.present;
    new.initial_unassessable = new.unassessable;
    new.initial_blind = new.blind;
  else
    new.initial_present = old.initial_present;
    new.initial_unassessable = old.initial_unassessable;
    new.initial_blind = old.initial_blind;
    new.created_at = old.created_at;
    new.updated_at = now();
  end if;
  return new;
end;
$$;

drop trigger if exists case_reviews_history on public.case_reviews;
create trigger case_reviews_history
  before insert or update on public.case_reviews
  for each row execute function public.case_reviews_history();

-- Clean-up from earlier drafts of this script (empty unless you tested with them).
drop table if exists public.comments, public.feature_reviews, public.reports, public.testers;
drop function if exists public.limit_comments(), public.limit_reports(), public.touch_updated_at(), public.is_tester();
