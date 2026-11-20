-- ReaderSecurity owns host-scoped reader sessions and personal history on the primary.
create schema if not exists reader_state;
create table if not exists reader_state.sessions (
 session_id uuid primary key,
 site_id uuid not null,
 user_id uuid not null,
 host text not null,
 access_hash text not null unique,
 refresh_hash text not null unique,
 access_expires_at timestamptz not null,
 expires_at timestamptz not null,
 identity_epoch bigint not null check(identity_epoch>=0),
 ended_at timestamptz,
 created_at timestamptz not null default now(),
 check(access_expires_at<=expires_at)
);
create table if not exists reader_state.history (
 site_id uuid not null,
 user_id uuid not null,
 space_slug text not null check(space_slug ~ '^[a-z0-9][a-z0-9-]{0,99}$'),
 page_path text not null check(length(page_path)<=512 and page_path like '/' || space_slug || '/%'),
 viewed_at timestamptz not null default now(),
 primary key(site_id,user_id,space_slug)
);
create index if not exists reader_history_recent on reader_state.history(site_id,user_id,viewed_at desc);
create index if not exists reader_session_user on reader_state.sessions(user_id);
comment on table reader_state.sessions is 'rls:global/reader-credential-bootstrap; ReaderSecurity host-scoped opaque sessions';
comment on table reader_state.history is 'rls:global/reader-personal-state; ReaderSecurity state scoped by verified site and user';

-- Remove the old security-head and separate-writer protocols without cascading to unrelated state.
drop trigger if exists reject_erased_session on reader_state.sessions;
drop function if exists reader_state.reject_erased_session();
drop function if exists reader_state.lookup_access(text);
drop function if exists reader_state.lookup_refresh(text);
drop function if exists reader_state.authorize_history(uuid,uuid,uuid);
drop function if exists reader_state.fence_user(uuid,bigint);
drop function if exists reader_state.pending_user_fences(uuid,integer);
drop function if exists reader_state.apply_user_security(uuid,bigint,bigint,boolean);
drop function if exists reader_state.erase_user(uuid);
drop table if exists reader_state.user_security;
alter table reader_state.sessions drop column if exists identity_checked_at;
drop policy if exists reader_state_session_owner on reader_state.sessions;
drop policy if exists reader_state_history_owner on reader_state.history;
alter table reader_state.sessions enable row level security;
alter table reader_state.sessions force row level security;
alter table reader_state.history enable row level security;
alter table reader_state.history force row level security;
create policy reader_command on reader_state.sessions to space_app using(true) with check(true);
create policy reader_history_command on reader_state.history to space_app
 using(user_id=nullif(current_setting('reader_state.user_id',true),'')::uuid
   and (site_id=nullif(current_setting('reader_state.site_id',true),'')::uuid
     or current_setting('reader_state.erasure',true)='true'))
 with check(user_id=nullif(current_setting('reader_state.user_id',true),'')::uuid
   and site_id=nullif(current_setting('reader_state.site_id',true),'')::uuid);
grant usage on schema reader_state to space_app,space_publication_view;
grant select,insert,update,delete on reader_state.sessions,reader_state.history to space_app;
create policy publication_read on reader_state.sessions for select to space_publication_view using(true);
grant select(site_id,user_id,host,access_hash,access_expires_at,expires_at,identity_epoch,ended_at)
 on reader_state.sessions to space_publication_view;
do $$ declare retired text; begin
 foreach retired in array array['reader_state_writer','delivery_writer','delivery_fencer'] loop
  if exists(select 1 from pg_roles where rolname=retired) then
   execute format('revoke all on reader_state.sessions,reader_state.history from %I',retired);
   execute format('revoke all on schema reader_state from %I',retired);
  end if;
 end loop;
end $$;

-- Resolve proof, account status and current revocation version in the document's snapshot.
create or replace function publication_v1.read_session(p_proof text, p_host text, p_site uuid)
returns table(user_id uuid,outcome text)
language plpgsql stable strict rows 1 set search_path=pg_catalog
as $session$
begin
 if p_proof='' then return; end if;
 return query
 select session.user_id, case
  when session.host<>p_host or session.site_id<>p_site then 'reader_session_invalid'
  when session.access_expires_at<=statement_timestamp() then 'reader_access_expired'
  when account.id is null or session.identity_epoch<>account.reader_epoch then 'reader_session_invalid'
  else 'ok'
 end
 from reader_state.sessions session
 left join iam.users account on account.id=session.user_id and account.status='active' and account.verified
 where session.access_hash=p_proof and session.ended_at is null and session.expires_at>statement_timestamp();
end
$session$;
