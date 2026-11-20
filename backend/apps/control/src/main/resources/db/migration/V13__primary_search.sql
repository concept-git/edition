-- Shared-primary search owns derived jobs and index pointers only.
create schema serving;
do $$ begin
 if not exists(select 1 from pg_roles where rolname='delivery_writer') then
  create role delivery_writer nologin;
 end if;
end $$;
grant usage on schema serving to delivery_writer;
create table serving.sites (
 site_id uuid primary key, tenant_id uuid not null, epoch bigint not null default 0,
 fence bigint not null default 0, search_epoch bigint, search_index text,
 updated_at timestamptz not null default now()
);
create table serving.search_jobs (
 site_id uuid primary key, tenant_id uuid not null, epoch bigint not null,
 status text not null check(status in ('queued','running','retrying','failed','completed')),
 token uuid, lease_until timestamptz, attempts int not null default 0,
 next_run_at timestamptz not null default now(), error text, updated_at timestamptz not null default now()
);
create table serving.index_garbage(index_uid text primary key, delete_after timestamptz not null);

alter table serving.search_jobs enable row level security;
alter table serving.search_jobs force row level security;
create policy search_job_tenant on serving.search_jobs to delivery_writer
 using(tenant_id=nullif(current_setting('app.tenant_id',true),'')::uuid);
grant select,update on serving.search_jobs to delivery_writer;
grant select,insert,update,delete on serving.index_garbage to delivery_writer;
create function serving.collectable_indexes() returns table(index_uid text)
 language sql security definer set search_path=pg_catalog as $$
 select g.index_uid from serving.index_garbage g where g.delete_after<=now()
 and not exists(select 1 from serving.sites s where exists(select 1 from jsonb_array_elements(s.search_index::jsonb) part where part->>'indexUid'=g.index_uid)) limit 20
$$;
revoke all on function serving.collectable_indexes() from public;
grant execute on function serving.collectable_indexes() to delivery_writer;

alter table serving.sites add column source_key text;
alter table serving.search_jobs add column source_key text;
grant usage on schema serving to space_publication_view;

create function serving.publication_search_state(p_site uuid) returns jsonb
language sql stable security definer set search_path=pg_catalog as $search$
    select jsonb_build_object('key',source_key,'index',search_index) from serving.sites where site_id=p_site
$search$;
revoke all on function serving.publication_search_state(uuid) from public;
grant execute on function serving.publication_search_state(uuid) to space_publication_view,delivery_writer;

create function serving.claim_publication_search(p_token uuid) returns setof serving.search_jobs
language plpgsql security definer set search_path=pg_catalog as $search$
begin
    insert into serving.index_garbage(index_uid,delete_after)
    select part->>'indexUid',now()+interval '2 minutes' from serving.sites site
    cross join lateral jsonb_array_elements(site.search_index::jsonb) part
     where not exists(select 1 from publication_v1.search_sources source where source.site_id=site.site_id)
    on conflict(index_uid) do nothing;
    delete from serving.search_jobs job where not exists(select 1 from publication_v1.search_sources source where source.site_id=job.site_id);
    delete from serving.sites site where not exists(select 1 from publication_v1.search_sources source where source.site_id=site.site_id);
    insert into serving.sites(site_id,tenant_id)
    select site_id,tenant_id from publication_v1.search_sources on conflict do nothing;
    insert into serving.search_jobs(site_id,tenant_id,epoch,status,source_key)
    select site_id,tenant_id,nextval('publication_v1.revisions'),'queued',source_key from publication_v1.search_sources
    on conflict(site_id) do update set epoch=excluded.epoch,source_key=excluded.source_key,
        status='queued',token=null,lease_until=null,attempts=0,next_run_at=now(),error=null,updated_at=now()
        where serving.search_jobs.source_key is distinct from excluded.source_key;
    return query
    update serving.search_jobs job set status='running',token=p_token,lease_until=now()+interval '2 minutes',
        attempts=job.attempts+1,updated_at=now()
     where job.site_id=(select pending.site_id from serving.search_jobs pending
        join publication_v1.search_sources source on source.site_id=pending.site_id
        where (pending.status in ('queued','retrying') and pending.next_run_at<=now())
           or (pending.status='running' and pending.lease_until<now())
        order by pending.next_run_at,pending.site_id for update of pending skip locked limit 1)
     returning job.*;
end
$search$;
revoke all on function serving.claim_publication_search(uuid) from public;
grant execute on function serving.claim_publication_search(uuid) to delivery_writer;

create function serving.publication_search_input(p_site uuid,p_epoch bigint,p_token uuid) returns jsonb
language sql stable security definer set search_path=pg_catalog as $search$
    select jsonb_build_object('settings',jsonb_build_object(
        'fields',coalesce(settings.fields,array['title','headings','body']),'revision',coalesce(settings.revision,0)),
        'pageCount',(select count(*) from publication_v1.live_pages live where live.host=source.host))
      from publication_v1.search_sources source
      join serving.search_jobs job on job.site_id=source.site_id and job.source_key=source.source_key
      left join hosting.search_settings settings on settings.site_id=source.site_id
     where source.site_id=p_site and job.epoch=p_epoch and job.token=p_token and job.lease_until>now()
$search$;
revoke all on function serving.publication_search_input(uuid,bigint,uuid) from public;
grant execute on function serving.publication_search_input(uuid,bigint,uuid) to delivery_writer;

-- Bounded rows avoid aggregating an entire site's bodies in a PostgreSQL JSON value.
create function serving.publication_search_pages(p_site uuid,p_epoch bigint,p_token uuid,p_offset integer,p_limit integer)
returns setof jsonb language sql stable rows 1000 security definer set search_path=pg_catalog set jit=off as $search$
    select publication_v1.page_payload(live,content.body)
      from publication_v1.search_sources source
      join serving.search_jobs job on job.site_id=source.site_id and job.source_key=source.source_key
      join publication_v1.live_pages live on live.host=source.host
      join releases.release_contents content on content.tenant_id=live.tenant_id and content.content_hash=live.content_hash
     where source.site_id=p_site and job.epoch=p_epoch and job.token=p_token and job.lease_until>now()
     order by live.page_id limit greatest(1,least(p_limit,1000)) offset greatest(0,p_offset)
$search$;
revoke all on function serving.publication_search_pages(uuid,bigint,uuid,integer,integer) from public;
grant execute on function serving.publication_search_pages(uuid,bigint,uuid,integer,integer) to delivery_writer;

create function serving.finish_publication_search(p_site uuid,p_epoch bigint,p_token uuid,p_indexes text) returns boolean
language plpgsql security definer set search_path=pg_catalog as $search$
declare current_job serving.search_jobs;previous text;part jsonb;
begin
    select job.* into current_job from serving.search_jobs job
     join publication_v1.search_sources source on source.site_id=job.site_id and source.source_key=job.source_key
     where job.site_id=p_site and job.epoch=p_epoch and job.token=p_token and job.lease_until>now()
     for update of job;
    if not found then return false;end if;
    select search_index into previous from serving.sites where site_id=p_site for update;
    update serving.sites set source_key=current_job.source_key,search_index=p_indexes,
        search_epoch=p_epoch,updated_at=now() where site_id=p_site;
    update serving.search_jobs set status='completed',token=null,lease_until=null,error=null where site_id=p_site;
    for part in select value from jsonb_array_elements(p_indexes::jsonb) loop
        delete from serving.index_garbage where index_uid=part->>'indexUid';
    end loop;
    for part in select value from jsonb_array_elements(previous::jsonb) loop
        if not exists(select 1 from jsonb_array_elements(p_indexes::jsonb) current_part
                       where current_part->>'indexUid'=part->>'indexUid') then
            insert into serving.index_garbage values(part->>'indexUid',now()+interval '2 minutes')
             on conflict(index_uid) do update set delete_after=excluded.delete_after;
        end if;
    end loop;
    return true;
end
$search$;
revoke all on function serving.finish_publication_search(uuid,bigint,uuid,text) from public;
grant execute on function serving.finish_publication_search(uuid,bigint,uuid,text) to delivery_writer;

-- Management status is scoped to the caller's authorized tenant, with no body or policy snapshot.
create function publication_v1.delivery_status(p_site uuid) returns jsonb
language sql stable security definer set search_path=pg_catalog as $status$
 select jsonb_build_object(
    'revision',version.revision,'host',source.host,
    'search',case when source.site_id is null then null
                  when indexed.source_key=source.source_key then 'completed'
                  when job.source_key=source.source_key then job.status else 'queued' end,
    'spaces',coalesce(mounts.spaces,'[]'::jsonb))
 from hosting.sites site
 join publication_v1.tenant_versions version on version.tenant_id=site.tenant_id
 left join publication_v1.search_sources source on source.site_id=site.id
 left join serving.sites indexed on indexed.site_id=site.id
 left join serving.search_jobs job on job.site_id=site.id
 left join lateral (
    select jsonb_agg(jsonb_build_object('spaceId',m.space_id,'slug',m.slug,'releaseId',r.id)
           order by m.position,m.slug) as spaces
    from hosting.site_mounts m
    left join releases.releases r on r.space_id=m.space_id and r.status='live'
    where m.site_id=site.id
 ) mounts on true
 where site.id=p_site and site.tenant_id=nullif(current_setting('app.tenant_id',true),'')::uuid
$status$;

create function publication_v1.retry_search(p_site uuid) returns void
language sql security definer set search_path=pg_catalog as $retry$
 update serving.search_jobs set status='queued',attempts=0,next_run_at=now(),error=null
 where site_id=p_site and status in ('failed','retrying')
   and tenant_id=nullif(current_setting('app.tenant_id',true),'')::uuid
$retry$;

revoke all on function publication_v1.delivery_status(uuid),publication_v1.retry_search(uuid) from public;
grant usage on schema publication_v1 to space_app;
grant execute on function publication_v1.delivery_status(uuid),publication_v1.retry_search(uuid) to space_app;

grant usage on schema shared to delivery_writer;
grant execute on function shared.record_service_heartbeat(text,text,text,jsonb) to delivery_writer;
