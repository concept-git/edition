-- Legacy rows contain only a historical address. Keep them for erasure without guessing their IDs.
create table reader_state.page_history (
    site_id uuid not null,
    user_id uuid not null,
    space_id uuid not null,
    page_id uuid not null,
    viewed_at timestamptz not null default statement_timestamp(),
    primary key (site_id, user_id, space_id)
);
create index reader_page_history_recent on reader_state.page_history(site_id,user_id,viewed_at desc);
comment on table reader_state.page_history is 'rls:global/reader-personal-state; ReaderSecurity history by stable Site, User, Space and Page IDs';
alter table reader_state.page_history enable row level security;
alter table reader_state.page_history force row level security;
create policy reader_page_history_command on reader_state.page_history to space_app
 using(user_id=nullif(current_setting('reader_state.user_id',true),'')::uuid
   and (site_id=nullif(current_setting('reader_state.site_id',true),'')::uuid
     or current_setting('reader_state.erasure',true)='true'))
 with check(user_id=nullif(current_setting('reader_state.user_id',true),'')::uuid
   and site_id=nullif(current_setting('reader_state.site_id',true),'')::uuid);
grant select,insert,update,delete on reader_state.page_history to space_app;

-- Resolve one incoming address or project recent Page IDs in the verified reader's publication scope.
create function publication_v1.reader_history_pages(
    p_host text, p_site uuid, p_access_hash text, p_path text, p_pages uuid[]
)
returns table (space_id uuid, page_id uuid, space_slug text, page_path text)
language sql stable security definer set search_path=pg_catalog as $history$
    select live.space_id, live.page_id, live.space_slug, live.path
      from publication_v1.live_pages live
      cross join lateral publication_v1.read_identity(
          live.host, live.site_id, live.tenant_id, null, null, p_access_hash) identity
     where live.host=p_host and live.site_id=p_site
       and ((p_path is not null and live.space_slug=split_part(p_path,'/',2)
             and live.page_slug=substr(p_path,length(split_part(p_path,'/',2))+3)
             and live.path=p_path)
            or (p_path is null and cardinality(p_pages)<=100 and live.page_id=any(p_pages)))
       and length(live.path)<=512
       and identity.kind='user' and identity.outcome='ok'
       and publication_v1.can_view(live.tenant_id,live.site_id,live.space_id,live.page_id,
                                   identity.kind,identity.principal_id)
       and not exists(select 1 from hosting.custom_domains primary_domain
                       where primary_domain.site_id=p_site and primary_domain.verified
                         and primary_domain.is_primary and primary_domain.host<>p_host)
$history$;
alter function publication_v1.reader_history_pages(text,uuid,text,text,uuid[]) owner to space_publication_view;
revoke all on function publication_v1.reader_history_pages(text,uuid,text,text,uuid[]) from public;
grant usage on schema publication_v1 to space_app;
grant execute on function publication_v1.reader_history_pages(text,uuid,text,text,uuid[]) to space_app;
