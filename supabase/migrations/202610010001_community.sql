-- Accounts are managed by Supabase Auth. No passwords or emails enter public tables.
begin;
create schema if not exists private;
revoke all on schema private from public;
grant usage on schema private to authenticated;

create table private.editors (
  user_id uuid primary key references auth.users(id) on delete cascade,
  added_at timestamptz not null default now()
);
alter table private.editors enable row level security;
revoke all on private.editors from anon, authenticated;

create function private.is_editor() returns boolean language sql stable security definer set search_path = '' as $$
  select exists(select 1 from private.editors where user_id = (select auth.uid()));
$$;
revoke all on function private.is_editor() from public;
grant execute on function private.is_editor() to authenticated;
create function public.is_editor() returns boolean language sql stable security invoker set search_path = '' as $$ select private.is_editor(); $$;
revoke all on function public.is_editor() from public, anon;
grant execute on function public.is_editor() to authenticated;

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text not null default '' check (char_length(display_name) <= 80),
  bio text not null default '' check (char_length(bio) <= 1000),
  region_id text check (region_id in ('bandung', 'kanazawa')),
  connection text not null default '' check (char_length(connection) <= 300),
  website text not null default '' check (char_length(website) <= 2000 and (website = '' or website ~ '^https?://[^[:space:]@]+$')),
  is_public boolean not null default false,
  updated_at timestamptz not null default now()
);
alter table public.profiles enable row level security;
revoke all on public.profiles from anon, authenticated;
grant select on public.profiles to anon, authenticated;
grant update (display_name, bio, region_id, connection, website, is_public) on public.profiles to authenticated;
create policy public_profile_read on public.profiles for select to anon, authenticated using (is_public);
create policy own_profile_read on public.profiles for select to authenticated using (id = (select auth.uid()) or (select private.is_editor()));
create policy own_profile_update on public.profiles for update to authenticated using (id = (select auth.uid())) with check (id = (select auth.uid()) and char_length(btrim(display_name)) >= 2);

create function private.new_profile() returns trigger language plpgsql security definer set search_path = '' as $$
begin
  insert into public.profiles(id, display_name) values(new.id, left(coalesce(new.raw_user_meta_data->>'display_name', ''), 80));
  return new;
end;
$$;
revoke all on function private.new_profile() from public, anon, authenticated;
create trigger create_contributor_profile after insert on auth.users for each row execute function private.new_profile();

create function private.valid_sources(value jsonb) returns boolean language plpgsql immutable set search_path = '' as $$
declare item jsonb;
begin
  if jsonb_typeof(value) <> 'array' or jsonb_array_length(value) > 8 then return false; end if;
  for item in select * from jsonb_array_elements(value) loop
    if jsonb_typeof(item) <> 'string' or char_length(item #>> '{}') > 2000 or (item #>> '{}') !~ '^https?://[^[:space:]@]+$' then return false; end if;
  end loop;
  return true;
end;
$$;
revoke all on function private.valid_sources(jsonb) from public, anon;
grant execute on function private.valid_sources(jsonb) to authenticated;

create table public.contributions (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users(id) on delete cascade,
  kind text not null check (kind in ('story','correction','suggestion')),
  region_id text not null check (region_id in ('bandung','kanazawa')),
  theme text not null check (theme in ('people','food','music','dance','language','fashion','beliefs','craft','events')),
  title text not null check (char_length(btrim(title)) between 3 and 160),
  body text not null check (char_length(btrim(body)) between 20 and 12000),
  scope text not null check (char_length(btrim(scope)) between 2 and 300),
  evidence_kind text not null check (evidence_kind in ('documented','firsthand')),
  sources jsonb not null default '[]' check (private.valid_sources(sources)),
  media_url text not null default '' check (char_length(media_url) <= 2000 and (media_url = '' or media_url ~ '^https?://[^[:space:]@]+$')),
  media_creator text not null default '' check (char_length(media_creator) <= 200),
  media_rights text not null default 'link_only' check (media_rights in ('link_only','own_work','permission_recorded')),
  publish_consent boolean not null default false,
  status text not null default 'draft' check (status in ('draft','pending','changes_requested','approved','rejected','withdrawn')),
  credit_name text not null default '',
  review_note text not null default '' check (char_length(review_note) <= 2000),
  submitted_at timestamptz,
  reviewed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (media_url = '' or char_length(btrim(media_creator)) >= 1)
);
create index contributions_owner on public.contributions(owner_id, updated_at desc);
create index contributions_queue on public.contributions(status, submitted_at);
alter table public.contributions enable row level security;
revoke all on public.contributions from anon, authenticated;
grant select on public.contributions to authenticated;
create policy contribution_private_read on public.contributions for select to authenticated using (owner_id = (select auth.uid()) or (select private.is_editor()));

create table public.published_contributions (
  id uuid primary key references public.contributions(id) on delete cascade,
  contributor_id uuid not null references auth.users(id) on delete cascade,
  kind text not null,
  region_id text not null,
  theme text not null,
  title text not null,
  body text not null,
  scope text not null,
  evidence_kind text not null,
  sources jsonb not null,
  media_url text not null,
  media_creator text not null,
  media_rights text not null,
  credit_name text not null,
  published_at timestamptz not null default now()
);
create index publications_region on public.published_contributions(region_id, theme, published_at desc);
alter table public.published_contributions enable row level security;
revoke all on public.published_contributions from anon, authenticated;
grant select on public.published_contributions to anon, authenticated;
create policy approved_public_read on public.published_contributions for select to anon, authenticated using (true);

create table private.review_events (
  id bigint generated always as identity primary key,
  contribution_id uuid not null references public.contributions(id) on delete cascade,
  editor_id uuid not null references auth.users(id),
  decision text not null,
  feedback text not null,
  created_at timestamptz not null default now()
);
alter table private.review_events enable row level security;
revoke all on private.review_events from anon, authenticated;

create function private.require_contributor() returns uuid language plpgsql stable security definer set search_path = '' as $$
declare actor uuid := auth.uid();
begin
  if actor is null or not exists(select 1 from auth.users where id = actor and email_confirmed_at is not null) then
    raise exception 'Confirm your email and sign in before contributing.' using errcode = '42501';
  end if;
  return actor;
end;
$$;
revoke all on function private.require_contributor() from public, anon, authenticated;

create function private.save_contribution(payload jsonb, target_id uuid default null) returns uuid language plpgsql security definer set search_path = '' as $$
declare actor uuid := private.require_contributor(); result_id uuid; existing public.contributions;
begin
  -- Serialise per contributor so parallel requests cannot bypass creation limits.
  perform 1 from public.profiles where id = actor for update;
  if target_id is not null then
    select * into existing from public.contributions where id = target_id and owner_id = actor for update;
    if not found or existing.status not in ('draft','changes_requested') then raise exception 'Only your drafts and requested revisions can be edited.' using errcode = '42501'; end if;
    result_id := existing.id;
  else
    if (select count(*) from public.contributions where owner_id = actor and created_at > now() - interval '1 hour') >= 10 then raise exception 'Please wait before creating more drafts.'; end if;
    result_id := gen_random_uuid();
  end if;
  insert into public.contributions (id, owner_id, kind, region_id, theme, title, body, scope, evidence_kind, sources, media_url, media_creator, media_rights, publish_consent)
  values(result_id, actor, payload->>'kind', payload->>'region_id', payload->>'theme', btrim(payload->>'title'), btrim(payload->>'body'), btrim(payload->>'scope'), payload->>'evidence_kind', coalesce(payload->'sources','[]'::jsonb), coalesce(payload->>'media_url',''), coalesce(payload->>'media_creator',''), coalesce(payload->>'media_rights','link_only'), coalesce((payload->>'publish_consent')::boolean,false))
  on conflict (id) do update set kind=excluded.kind, region_id=excluded.region_id, theme=excluded.theme, title=excluded.title, body=excluded.body, scope=excluded.scope, evidence_kind=excluded.evidence_kind, sources=excluded.sources, media_url=excluded.media_url, media_creator=excluded.media_creator, media_rights=excluded.media_rights, publish_consent=excluded.publish_consent, updated_at=now();
  return result_id;
end;
$$;

create function private.submit_contribution(target_id uuid) returns void language plpgsql security definer set search_path = '' as $$
declare actor uuid := private.require_contributor(); item public.contributions; credit text;
begin
  select display_name into credit from public.profiles where id = actor for update;
  select * into item from public.contributions where id = target_id and owner_id = actor for update;
  if not found or item.status not in ('draft','changes_requested') then raise exception 'This contribution cannot be submitted.' using errcode = '42501'; end if;
  if not item.publish_consent or char_length(btrim(credit)) < 2 or (item.evidence_kind = 'documented' and jsonb_array_length(item.sources) = 0) then raise exception 'Complete your profile, add sources for documented claims, and give publication permission.'; end if;
  if (select count(*) from public.contributions where owner_id = actor and status = 'pending') >= 5 then raise exception 'You already have five contributions awaiting review.'; end if;
  update public.contributions set status='pending', credit_name=credit, submitted_at=now(), updated_at=now() where id=target_id;
end;
$$;

create function private.withdraw_contribution(target_id uuid) returns void language plpgsql security definer set search_path = '' as $$
declare actor uuid := private.require_contributor(); item public.contributions;
begin
  select * into item from public.contributions where id=target_id and owner_id=actor for update;
  if not found then raise exception 'Contribution not found.' using errcode = '42501'; end if;
  update public.contributions set status='withdrawn', updated_at=now() where id=target_id;
  delete from public.published_contributions where id=target_id;
end;
$$;

create function private.review_contribution(target_id uuid, decision text, feedback text default '') returns void language plpgsql security definer set search_path = '' as $$
declare actor uuid := private.require_contributor(); item public.contributions;
begin
  if not private.is_editor() then raise exception 'Editor access required.' using errcode = '42501'; end if;
  if decision not in ('approved','changes_requested','rejected') or char_length(feedback) > 2000 or (decision <> 'approved' and char_length(btrim(feedback)) < 5) then raise exception 'Choose a decision and give useful feedback for revisions or rejection.'; end if;
  select * into item from public.contributions where id=target_id for update;
  if not found or item.status <> 'pending' then raise exception 'This contribution is no longer awaiting review.'; end if;
  if item.owner_id = actor then raise exception 'Ask another editor to review your own contribution.' using errcode = '42501'; end if;
  update public.contributions set status=decision, review_note=feedback, reviewed_at=now(), updated_at=now() where id=target_id;
  insert into private.review_events(contribution_id,editor_id,decision,feedback) values(target_id,actor,decision,feedback);
  if decision='approved' then
    insert into public.published_contributions (id, contributor_id, kind, region_id, theme, title, body, scope, evidence_kind, sources, media_url, media_creator, media_rights, credit_name)
    values(item.id,item.owner_id,item.kind,item.region_id,item.theme,item.title,item.body,item.scope,item.evidence_kind,item.sources,item.media_url,item.media_creator,item.media_rights,item.credit_name);
  end if;
end;
$$;

-- Exposed RPC wrappers run as the caller. Privileged implementations stay in an
-- unexposed schema and authenticate/authorise every request independently.
create function public.save_contribution(payload jsonb, target_id uuid default null) returns uuid language sql security invoker set search_path = '' as $$ select private.save_contribution(payload,target_id); $$;
create function public.submit_contribution(target_id uuid) returns void language sql security invoker set search_path = '' as $$ select private.submit_contribution(target_id); $$;
create function public.withdraw_contribution(target_id uuid) returns void language sql security invoker set search_path = '' as $$ select private.withdraw_contribution(target_id); $$;
create function public.review_contribution(target_id uuid, decision text, feedback text default '') returns void language sql security invoker set search_path = '' as $$ select private.review_contribution(target_id,decision,feedback); $$;
revoke all on function private.save_contribution(jsonb,uuid), private.submit_contribution(uuid), private.withdraw_contribution(uuid), private.review_contribution(uuid,text,text) from public, anon;
grant execute on function private.save_contribution(jsonb,uuid), private.submit_contribution(uuid), private.withdraw_contribution(uuid), private.review_contribution(uuid,text,text) to authenticated;
revoke all on function public.save_contribution(jsonb,uuid), public.submit_contribution(uuid), public.withdraw_contribution(uuid), public.review_contribution(uuid,text,text) from public, anon;
grant execute on function public.save_contribution(jsonb,uuid), public.submit_contribution(uuid), public.withdraw_contribution(uuid), public.review_contribution(uuid,text,text) to authenticated;
commit;
