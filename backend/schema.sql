-- =====================================================================
-- UniClub — Supabase PostgreSQL Schema
-- Run this in the Supabase SQL Editor (Dashboard → SQL Editor → New Query)
-- =====================================================================

-- 0. Extensions
create extension if not exists "uuid-ossp";

-- =====================================================================
-- 1. PROFILES  (extends Supabase auth.users)
-- =====================================================================
create table public.profiles (
  id          uuid primary key references auth.users(id) on delete cascade,
  full_name   text not null,
  email       text not null,
  role        text not null check (role in ('student','faculty')),
  department  text,
  year        int,                       -- students only (1-4)
  avatar_url  text,
  quiz_interests   text[] default '{}',  -- e.g. {'AI','Design','Cooking'}
  quiz_commitment  text,                 -- 'light','medium','heavy'
  quiz_focus       text[] default '{}',  -- e.g. {'Networking','Competitions'}
  created_at  timestamptz default now()
);

alter table public.profiles enable row level security;

create policy "Anyone can read profiles"      on public.profiles for select using (true);
create policy "Users can update own profile"  on public.profiles for update using (auth.uid() = id);
create policy "Users can insert own profile"  on public.profiles for insert with check (auth.uid() = id);

-- =====================================================================
-- 2. CLUBS
-- =====================================================================
create table public.clubs (
  id           uuid primary key default uuid_generate_v4(),
  name         text not null,
  slug         text unique not null,
  description  text,
  category     text not null check (category in ('tech','arts','sports','non-tech')),
  domain       text,               -- e.g. 'Technology', 'Creative Arts'
  tags         text[] default '{}', -- for quiz matching
  status       text default 'ACTIVE HIRING' check (status in ('ACTIVE HIRING','AUDITIONS OPEN','CLOSING SOON','CLOSED')),
  faculty_id   uuid not null references public.profiles(id),
  achievements text[] default '{}',
  social_links jsonb default '{}', -- {"github":"...","instagram":"..."}
  founded_year int default 2020,
  meeting_schedule text default 'Weekly',
  created_at   timestamptz default now()
);

alter table public.clubs enable row level security;

create policy "Anyone can read clubs"          on public.clubs for select using (true);
create policy "Faculty can create clubs"       on public.clubs for insert with check (
  auth.uid() = faculty_id and
  exists (select 1 from public.profiles where id = auth.uid() and role = 'faculty')
);
create policy "Faculty can update own clubs"   on public.clubs for update using (auth.uid() = faculty_id);
create policy "Faculty can delete own clubs"   on public.clubs for delete using (auth.uid() = faculty_id);

create index idx_clubs_faculty on public.clubs(faculty_id);
create index idx_clubs_category on public.clubs(category);

-- =====================================================================
-- 3. CLUB MEMBERS  (junction table)
-- =====================================================================
create table public.club_members (
  id        uuid primary key default uuid_generate_v4(),
  club_id   uuid not null references public.clubs(id) on delete cascade,
  user_id   uuid not null references public.profiles(id) on delete cascade,
  role      text default 'Member' check (role in ('Member','Lead','Secretary','Treasurer','Vice President','President')),
  joined_at timestamptz default now(),
  unique(club_id, user_id)
);

alter table public.club_members enable row level security;

create policy "Anyone can read club members"       on public.club_members for select using (true);
create policy "Faculty can add members to own clubs" on public.club_members for insert with check (
  exists (select 1 from public.clubs where id = club_id and faculty_id = auth.uid())
  or auth.uid() = user_id  -- students can add themselves (via approved request)
);
create policy "Faculty or self can update member role" on public.club_members for update using (
  exists (select 1 from public.clubs where id = club_id and faculty_id = auth.uid())
  or auth.uid() = user_id
);
create policy "Faculty or self can remove membership" on public.club_members for delete using (
  exists (select 1 from public.clubs where id = club_id and faculty_id = auth.uid())
  or auth.uid() = user_id
);

create index idx_club_members_club on public.club_members(club_id);
create index idx_club_members_user on public.club_members(user_id);

-- =====================================================================
-- 4. POSTS
-- =====================================================================
create table public.posts (
  id          uuid primary key default uuid_generate_v4(),
  author_id   uuid not null references public.profiles(id),
  club_id     uuid references public.clubs(id) on delete set null,
  title       text not null,
  body        text not null,
  type        text default 'Event' check (type in ('Event','Announcement','Recruitment')),
  image_url   text,
  created_at  timestamptz default now()
);

alter table public.posts enable row level security;

create policy "Anyone can read posts"          on public.posts for select using (true);
create policy "Faculty can create posts"       on public.posts for insert with check (
  auth.uid() = author_id and
  exists (select 1 from public.profiles where id = auth.uid() and role = 'faculty')
);
create policy "Faculty can update own posts"   on public.posts for update using (auth.uid() = author_id);
create policy "Faculty can delete own posts"   on public.posts for delete using (auth.uid() = author_id);

create index idx_posts_author on public.posts(author_id);
create index idx_posts_created on public.posts(created_at desc);

-- =====================================================================
-- 5. POST LIKES
-- =====================================================================
create table public.post_likes (
  id       uuid primary key default uuid_generate_v4(),
  post_id  uuid not null references public.posts(id) on delete cascade,
  user_id  uuid not null references public.profiles(id) on delete cascade,
  created_at timestamptz default now(),
  unique(post_id, user_id)
);

alter table public.post_likes enable row level security;

create policy "Anyone can read likes"        on public.post_likes for select using (true);
create policy "Auth users can like"          on public.post_likes for insert with check (auth.uid() = user_id);
create policy "Users can unlike"             on public.post_likes for delete using (auth.uid() = user_id);

create index idx_post_likes_post on public.post_likes(post_id);

-- =====================================================================
-- 6. POST COMMENTS
-- =====================================================================
create table public.post_comments (
  id         uuid primary key default uuid_generate_v4(),
  post_id    uuid not null references public.posts(id) on delete cascade,
  user_id    uuid not null references public.profiles(id) on delete cascade,
  parent_id  uuid references public.post_comments(id) on delete cascade,
  body       text not null,
  created_at timestamptz default now()
);

alter table public.post_comments enable row level security;

create policy "Anyone can read comments"       on public.post_comments for select using (true);
create policy "Auth users can comment"         on public.post_comments for insert with check (auth.uid() = user_id);
create policy "Users can delete own comments or faculty can delete on own posts"
  on public.post_comments for delete using (
    auth.uid() = user_id
    OR exists (
      select 1 from public.posts p
      where p.id = post_comments.post_id
      and p.author_id = auth.uid()
    )
  );

create index idx_post_comments_post on public.post_comments(post_id);

-- =====================================================================
-- 7. POST IMPRESSIONS  (view tracking)
-- =====================================================================
create table public.post_impressions (
  id        uuid primary key default uuid_generate_v4(),
  post_id   uuid not null references public.posts(id) on delete cascade,
  user_id   uuid references public.profiles(id) on delete set null,
  viewed_at timestamptz default now()
);

alter table public.post_impressions enable row level security;

create policy "Auth users can record impressions" on public.post_impressions for insert with check (auth.uid() = user_id);
create policy "Faculty can read impressions on own posts" on public.post_impressions for select using (
  exists (select 1 from public.posts where id = post_id and author_id = auth.uid())
  or auth.uid() = user_id
);

create index idx_post_impressions_post on public.post_impressions(post_id);
create index idx_post_impressions_date on public.post_impressions(viewed_at);

-- =====================================================================
-- 8. JOIN REQUESTS
-- =====================================================================
create table public.join_requests (
  id          uuid primary key default uuid_generate_v4(),
  club_id     uuid not null references public.clubs(id) on delete cascade,
  user_id     uuid not null references public.profiles(id) on delete cascade,
  type        text not null check (type in ('join','leave')),
  status      text default 'pending' check (status in ('pending','approved','rejected')),
  message     text,
  created_at  timestamptz default now(),
  reviewed_at timestamptz
);

alter table public.join_requests enable row level security;

create policy "Students can read own requests"  on public.join_requests for select using (auth.uid() = user_id);
create policy "Faculty can read club requests"  on public.join_requests for select using (
  exists (select 1 from public.clubs where id = club_id and faculty_id = auth.uid())
);
create policy "Students can create requests"    on public.join_requests for insert with check (auth.uid() = user_id);
create policy "Faculty can update club requests" on public.join_requests for update using (
  exists (select 1 from public.clubs where id = club_id and faculty_id = auth.uid())
);

create index idx_join_requests_club on public.join_requests(club_id);
create index idx_join_requests_user on public.join_requests(user_id);

-- =====================================================================
-- VIEWS & FUNCTIONS
-- =====================================================================

-- View: club with member count and like count on its posts
create or replace view public.clubs_with_stats as
select
  c.*,
  coalesce(m.member_count, 0) as member_count,
  p.full_name as faculty_name
from public.clubs c
left join (
  select club_id, count(*) as member_count
  from public.club_members
  group by club_id
) m on m.club_id = c.id
left join public.profiles p on p.id = c.faculty_id;

-- View: post with aggregated likes, comments, impressions
create or replace view public.posts_with_stats as
select
  p.*,
  pr.full_name as author_name,
  pr.role as author_role,
  c.name as club_name,
  coalesce(lk.like_count, 0) as like_count,
  coalesce(cm.comment_count, 0) as comment_count,
  coalesce(imp.impression_count, 0) as impression_count
from public.posts p
left join public.profiles pr on pr.id = p.author_id
left join public.clubs c on c.id = p.club_id
left join (select post_id, count(*) as like_count from public.post_likes group by post_id) lk on lk.post_id = p.id
left join (select post_id, count(*) as comment_count from public.post_comments group by post_id) cm on cm.post_id = p.id
left join (select post_id, count(*) as impression_count from public.post_impressions group by post_id) imp on imp.post_id = p.id;

-- Function: get faculty impression time series for dashboard chart
create or replace function public.get_faculty_impressions(faculty_uuid uuid, days_back int default 14)
returns table (day date, impressions bigint)
language sql
stable
as $$
  select
    date_trunc('day', pi.viewed_at)::date as day,
    count(*) as impressions
  from public.post_impressions pi
  join public.posts p on p.id = pi.post_id
  where p.author_id = faculty_uuid
    and pi.viewed_at >= now() - (days_back || ' days')::interval
  group by day
  order by day;
$$;

-- Function: get club recommendation scores based on quiz tags
create or replace function public.get_recommended_clubs(user_uuid uuid)
returns table (club_id uuid, club_name text, score bigint)
language sql
stable
as $$
  with user_prefs as (
    select
      quiz_interests,
      quiz_focus
    from public.profiles
    where id = user_uuid
  )
  select
    c.id as club_id,
    c.name as club_name,
    (
      select count(*)
      from unnest(c.tags) t
      where t = any(up.quiz_interests) or t = any(up.quiz_focus)
    ) as score
  from public.clubs c, user_prefs up
  where c.status != 'CLOSED'
  order by score desc, c.name
  limit 20;
$$;

-- Trigger: auto-create profile on auth signup
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, full_name, email, role, department)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'full_name', 'New User'),
    new.email,
    coalesce(new.raw_user_meta_data->>'role', 'student'),
    coalesce(new.raw_user_meta_data->>'department', '')
  );
  return new;
end;
$$;

-- Drop trigger if exists, then create
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- =====================================================================
-- 9. STORAGE (Post Images)
-- =====================================================================
-- Create bucket if it doesn't exist
insert into storage.buckets (id, name, public)
values ('uniclub', 'uniclub', true)
on conflict (id) do nothing;

-- Storage policies (requires RLS on storage.objects)
create policy "Public read access for post images"
  on storage.objects for select
  using (bucket_id = 'uniclub');

create policy "Authenticated users can upload post images"
  on storage.objects for insert
  with check (bucket_id = 'uniclub' and auth.role() = 'authenticated');

create policy "Authenticated users can update own images"
  on storage.objects for update
  using (bucket_id = 'uniclub' and owner = auth.uid());

create policy "Authenticated users can delete own images"
  on storage.objects for delete
  using (bucket_id = 'uniclub' and owner = auth.uid());
