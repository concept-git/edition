-- The public reader can query published rows only. Its login is provisioned outside Flyway.
do $roles$
begin
    if not exists (select 1 from pg_catalog.pg_roles where rolname = 'space_publication_view') then
        create role space_publication_view nologin;
    end if;
    if not exists (select 1 from pg_catalog.pg_roles where rolname = 'space_publication_reader') then
        create role space_publication_reader nologin;
    end if;
end
$roles$;

create schema publication_v1;
grant usage on schema publication_v1 to space_publication_reader;
grant usage, create on schema publication_v1 to space_publication_view;
grant usage on schema hosting, authoring, releases, iam to space_publication_view;
grant select on hosting.sites, hosting.custom_domains, hosting.site_mounts,
    authoring.space_page_placements, releases.releases, releases.release_pages, releases.release_contents, releases.release_toc,
    iam.permission_grants, iam.permission_roles, iam.permission_restriction_scopes, iam.permission_restrictions, hosting.redirects
    to space_publication_view;

create policy publication_read on hosting.sites for select to space_publication_view using (true);
create policy publication_read on hosting.custom_domains for select to space_publication_view using (true);
create policy publication_read on hosting.site_mounts for select to space_publication_view using (true);
create policy publication_read on hosting.redirects for select to space_publication_view using (true);
create policy publication_read on authoring.space_page_placements for select to space_publication_view using (true);
create policy publication_read on releases.releases for select to space_publication_view using (true);
create policy publication_read on releases.release_pages for select to space_publication_view using (true);
create policy publication_read on releases.release_contents for select to space_publication_view using (true);
create policy publication_read on releases.release_toc for select to space_publication_view using (true);
create policy publication_read on iam.permission_grants for select to space_publication_view using (true);
create policy publication_read on iam.permission_restriction_scopes for select to space_publication_view using (true);
create policy publication_read on iam.permission_restrictions for select to space_publication_view using (true);
grant select (id, tenant_id, space_id, secret_hash, scopes, expires_at, revoked_at)
    on iam.api_tokens to space_publication_view;
create policy publication_read on iam.api_tokens for select to space_publication_view using (true);
grant select (id, status, verified) on iam.users to space_publication_view;
grant select (tenant_id, group_type, group_id, member_id) on iam.memberships to space_publication_view;
create policy publication_read on iam.memberships for select to space_publication_view using (true);
grant select (id, tenant_id, name) on authoring.spaces to space_publication_view;
create policy publication_read on authoring.spaces for select to space_publication_view using (true);

create index release_pages_read_path on releases.release_pages (release_id, slug);
create index release_pages_toc_ref on releases.release_pages (release_id, external_id) where external_id is not null;

-- One revision per tenant and committing transaction binds cursors without copying facts.
create sequence publication_v1.revisions;
create table publication_v1.tenant_versions(
    tenant_id uuid primary key,
    revision bigint not null,
    writer_xid xid8 not null
);
comment on table publication_v1.tenant_versions is 'rls:infrastructure/transactional publication cursor version';
insert into publication_v1.tenant_versions
select id,nextval('publication_v1.revisions'),pg_current_xact_id() from shared.tenants;
grant select on publication_v1.tenant_versions to space_publication_view;

-- Placement membership changes affect index input even when the immutable Release stays live.
create table publication_v1.space_versions(space_id uuid primary key,revision bigint not null,writer_xid xid8 not null);
comment on table publication_v1.space_versions is 'rls:infrastructure/transactional index-input version';
insert into publication_v1.space_versions select id,0,pg_current_xact_id() from authoring.spaces;
grant select on publication_v1.space_versions to space_publication_view;

create function publication_v1.changed_tenant(p_row jsonb) returns uuid
language sql stable set search_path=pg_catalog as $version$
    select coalesce(
        (p_row->>'tenant_id')::uuid,
        (select tenant_id from authoring.spaces where id=(p_row->>'space_id')::uuid),
        (select tenant_id from hosting.sites where id=(p_row->>'site_id')::uuid),
        (select s.tenant_id from releases.releases r join authoring.spaces s on s.id=r.space_id
         where r.id=(p_row->>'release_id')::uuid),
        case p_row->>'group_type'
            when 'tenant' then (p_row->>'group_id')::uuid
            when 'team' then (select tenant_id from iam.teams where id=(p_row->>'group_id')::uuid)
        end
    )
$version$;
revoke all on function publication_v1.changed_tenant(jsonb) from public;

create function publication_v1.bump_version() returns trigger
language plpgsql security definer set search_path=pg_catalog as $version$
declare target uuid;
begin
    for target in
        select distinct tenant from (
            values (publication_v1.changed_tenant(to_jsonb(old))),
                   (publication_v1.changed_tenant(to_jsonb(new)))
        ) affected(tenant) where tenant is not null order by tenant
    loop
        insert into publication_v1.tenant_versions values(target,nextval('publication_v1.revisions'),pg_current_xact_id())
        on conflict(tenant_id) do update
            set revision=excluded.revision,writer_xid=excluded.writer_xid
            where publication_v1.tenant_versions.writer_xid<>excluded.writer_xid;
    end loop;
    if tg_table_schema='authoring' and tg_table_name='space_page_placements' then
        for target in select distinct space from (
            values ((to_jsonb(old)->>'space_id')::uuid),((to_jsonb(new)->>'space_id')::uuid)
        ) affected(space) where space is not null order by space loop
            insert into publication_v1.space_versions values(target,nextval('publication_v1.revisions'),pg_current_xact_id())
            on conflict(space_id) do update set revision=excluded.revision,writer_xid=excluded.writer_xid
                where publication_v1.space_versions.writer_xid<>excluded.writer_xid;
        end loop;
    end if;
    return null;
end
$version$;
revoke all on function publication_v1.bump_version() from public;

do $triggers$
declare relation text;
begin
    foreach relation in array array[
        'authoring.spaces','authoring.space_page_placements','releases.releases','releases.release_pages','releases.release_toc',
        'hosting.sites','hosting.site_mounts','hosting.custom_domains','hosting.redirects','hosting.search_settings',
        'iam.memberships','iam.permission_grants','iam.permission_restriction_scopes','iam.permission_restrictions','iam.api_tokens'
    ] loop
        execute format('create trigger publication_version after insert or update or delete on %s
                        for each row execute function publication_v1.bump_version()', relation);
    end loop;
end
$triggers$;

-- The same restrictions and nearest grant rules apply to points, space entry and navigation.
create function publication_v1.visible_pages(p_tenant uuid,p_site uuid,p_space uuid,p_pages uuid[],p_kind text,p_id uuid)
returns table(page_id uuid)
language sql stable set search_path=pg_catalog as $permission$
    with targets as materialized (select * from unnest(p_pages) with ordinality target(page_id,position)),
    chain as materialized (
        select target.position,resource.* from targets target
        cross join lateral (values ('tenant',p_tenant,1),('site',p_site,2),('space',p_space,3),('page',target.page_id,4))
            resource(resource_type,resource_id,depth)
    ), principals as materialized (
        select p_kind as kind,p_id as id,true as direct
        union all select 'anonymous',null,true where p_kind<>'anonymous'
        union all select 'team',team.group_id,false from iam.memberships team
         where p_kind='user' and team.member_id=p_id and team.tenant_id=p_tenant and team.group_type='team'
           and exists (select 1 from iam.memberships member where member.member_id=p_id
                        and member.group_type='tenant' and member.group_id=p_tenant and member.tenant_id=p_tenant)
    ), decisions as (
        select distinct on (chain.position,principal.kind='anonymous')
               chain.position,principal.kind='anonymous' as anonymous,
               coalesce(bool_or('read'=any(role.operations)) filter(where principal.direct),
                        bool_or('read'=any(role.operations))) as allowed
          from chain join iam.permission_grants grant_row using(resource_type,resource_id)
          join iam.permission_roles role on role.role=grant_row.role
          join principals principal on principal.kind=grant_row.principal_type
                                    and principal.id is not distinct from grant_row.principal_id
         where grant_row.tenant_id=p_tenant
         group by chain.position,principal.kind='anonymous',chain.depth
         order by chain.position,principal.kind='anonymous',chain.depth desc
    ), restrictions as (
        select distinct chain.position,variant.anonymous
          from (values(true),(false)) variant(anonymous) join chain on true
          join iam.permission_restriction_scopes scope using(resource_type,resource_id)
         where scope.tenant_id=p_tenant and scope.active and not exists (
             select 1 from iam.permission_restrictions restriction
             join principals principal on principal.kind=restriction.principal_type
                                       and principal.id is not distinct from restriction.principal_id
              where restriction.tenant_id=scope.tenant_id and restriction.resource_type=scope.resource_type
                and restriction.resource_id=scope.resource_id and (principal.kind='anonymous')=variant.anonymous
         )
    )
    select target.page_id from targets target
    left join decisions own on own.position=target.position and own.anonymous=(p_kind='anonymous')
    left join decisions fallback on fallback.position=target.position and fallback.anonymous
    where not exists(select 1 from restrictions r where r.position=target.position and r.anonymous=(p_kind='anonymous'))
      and coalesce(own.allowed,case when not exists(select 1 from restrictions r
          where r.position=target.position and r.anonymous) then fallback.allowed end,false)
$permission$;
alter function publication_v1.visible_pages(uuid,uuid,uuid,uuid[],text,uuid) owner to space_publication_view;
revoke all on function publication_v1.visible_pages(uuid,uuid,uuid,uuid[],text,uuid) from public;

create function publication_v1.can_view(p_tenant uuid,p_site uuid,p_space uuid,p_page uuid,p_kind text,p_id uuid)
returns boolean language plpgsql stable set search_path=pg_catalog
set plan_cache_mode=force_generic_plan as $permission$
begin
    return exists(select 1 from publication_v1.visible_pages(p_tenant,p_site,p_space,array[p_page],p_kind,p_id));
end
$permission$;
alter function publication_v1.can_view(uuid,uuid,uuid,uuid,text,uuid) owner to space_publication_view;
revoke all on function publication_v1.can_view(uuid,uuid,uuid,uuid,text,uuid) from public;

create function publication_v1.can_read_public(p_tenant uuid, p_site uuid, p_space uuid, p_page uuid)
returns boolean
language plpgsql stable security definer set search_path = pg_catalog
as $query$
begin
    return (
    select publication_v1.can_view(p_tenant,p_site,p_space,p_page,'anonymous',null)
    );
end
$query$;
alter function publication_v1.can_read_public(uuid, uuid, uuid, uuid) owner to space_publication_view;
revoke all on function publication_v1.can_read_public(uuid, uuid, uuid, uuid) from public;
grant execute on function publication_v1.can_read_public(uuid, uuid, uuid, uuid) to space_publication_reader;

create view publication_v1.live_pages as
select domain.host, site.tenant_id, site.id as site_id, mount.space_id, release.id as release_id, page.page_id,
       mount.slug as space_slug, page.slug as page_slug, page.external_id,
       '/' || mount.slug || '/' || page.slug as path, page.title, page.format,
       page.seo, page.properties, page.attachments, page.content_hash, page.content_profile,
       page.content_definition, release.promoted_at
  from hosting.custom_domains as domain
  join hosting.sites as site on site.id = domain.site_id
  join hosting.site_mounts as mount on mount.site_id = site.id
  join releases.releases as release on release.space_id = mount.space_id and release.status = 'live'
  join releases.release_pages as page on page.release_id = release.id and page.tenant_id = site.tenant_id
  join authoring.space_page_placements as placement
    on placement.space_id = mount.space_id and placement.page_id = page.page_id
 where domain.verified;

alter view publication_v1.live_pages owner to space_publication_view;
create view publication_v1.public_pages with (security_barrier = true) as
select live.host, live.tenant_id, live.site_id, live.space_id, live.release_id, live.page_id, live.path,
       live.title, live.format, content.body
  from publication_v1.live_pages live
  join releases.release_contents content on content.tenant_id = live.tenant_id and content.content_hash = live.content_hash
 where publication_v1.can_read_public(live.tenant_id,live.site_id,live.space_id,live.page_id);
alter view publication_v1.public_pages owner to space_publication_view;
grant select on publication_v1.public_pages to space_publication_reader;

-- Resolved only in the shared topology, after installing the reader-state lookup grant.
create function publication_v1.read_session(p_proof text, p_host text, p_site uuid)
returns table (user_id uuid, outcome text)
language plpgsql stable strict rows 1 set search_path = pg_catalog
as $session$
begin
    if p_proof = '' then return; end if;
    return query
        select session.user_id, case
            when session.host <> p_host or session.site_id <> p_site then 'reader_session_invalid'
            when session.access_expires_at <= statement_timestamp() then 'reader_access_expired'
            when account.id is null then 'reader_session_invalid'
            when session.applied_source_epoch = 0 or session.fence_source_epoch > session.applied_source_epoch
                then 'access_update_pending'
            when not session.security_active or session.identity_epoch <> session.security_epoch then 'reader_session_invalid'
            else 'ok'
        end
        from reader_state.lookup_access(p_proof) session
        left join iam.users account
            on account.id = session.user_id and account.status = 'active' and account.verified;
end
$session$;
alter function publication_v1.read_session(text, text, uuid) owner to space_publication_view;
revoke all on function publication_v1.read_session(text, text, uuid) from public;

-- The credential always resolves to at most one subject. Application connections cannot call this function.
create function publication_v1.read_identity(p_host text, p_site uuid, p_tenant uuid,
    p_token uuid, p_proof text, p_session text)
returns table (outcome text, kind text, principal_id uuid, token_space uuid)
language plpgsql stable rows 1 set search_path = pg_catalog
set plan_cache_mode = force_generic_plan
as $query$
begin
    return query
    select case
        when p_session is not null and (p_token is not null or p_proof is not null) then 'reader_session_invalid'
        when p_session is not null then coalesce(session.outcome, 'reader_session_invalid')
        when p_token is null and p_proof is null then 'ok'
        when token.id is null then 'invalid_token'
        when not ('read' = any(token.scopes)) then 'forbidden'
        else 'ok'
    end,
    case when p_session is not null then 'user' when p_token is not null then 'token' else 'anonymous' end,
    coalesce(session.user_id, token.id), token.space_id
    from (values (p_token)) input(token_id)
    left join iam.api_tokens token
      on token.id = input.token_id and token.tenant_id = p_tenant
     and token.revoked_at is null and token.expires_at > statement_timestamp()
     and encode(token.secret_hash, 'hex') = p_proof
    left join lateral publication_v1.read_session(p_session, p_host, p_site) session on true;
end
$query$;
alter function publication_v1.read_identity(text, uuid, uuid, uuid, text, text) owner to space_publication_view;
revoke all on function publication_v1.read_identity(text, uuid, uuid, uuid, text, text) from public;

create function publication_v1.page_payload(p_page publication_v1.live_pages,p_content text,p_bytes bigint default null)
returns jsonb language sql immutable as $page$
    select jsonb_build_object(
        'id',p_page.page_id,'spaceId',p_page.space_id,'releaseId',p_page.release_id,'path',p_page.path,
        'format',upper(p_page.format),'title',p_page.title,'content',p_content,
        'contentHash',encode(sha256(convert_to(jsonb_build_array(p_page.format,p_page.title,p_page.content_hash,
            p_page.content_profile,p_page.content_definition)::text,'UTF8')),'hex'),
        'contentSha256',p_page.content_hash,'contentBytes',coalesce(p_bytes,octet_length(p_content)),
        'seo',jsonb_strip_nulls(coalesce(p_page.seo,'{}'::jsonb)),
        'properties',coalesce(p_page.properties,'{}'::jsonb),'attachments',coalesce(p_page.attachments,'[]'::jsonb),
        'promotedAt',p_page.promoted_at,'contentProfile',p_page.content_profile,'contentTypeDefinition',p_page.content_definition)
$page$;
alter function publication_v1.page_payload(publication_v1.live_pages,text,bigint) owner to space_publication_view;
revoke all on function publication_v1.page_payload(publication_v1.live_pages,text,bigint) from public;

-- Credentials are verified against current IAM state. The caller never supplies a subject or tenant.
create function publication_v1.read_page(p_host text, p_path text, p_token uuid, p_proof text, p_session text default null)
returns table (outcome text, primary_host text, tenant_id uuid, site_id uuid, page jsonb)
language plpgsql stable rows 1 security definer set search_path = pg_catalog
set plan_cache_mode = force_generic_plan
as $query$
begin
    return query
    select result.outcome, primary_domain.host, site.tenant_id, site.id, case when result.outcome = 'ok' then publication_v1.page_payload(live,content.body) end
      from (values (p_host)) request(host)
      left join hosting.custom_domains domain on domain.host = request.host and domain.verified
      left join hosting.sites site on site.id = domain.site_id
      left join hosting.custom_domains primary_domain
        on primary_domain.site_id = domain.site_id and primary_domain.verified and primary_domain.is_primary
      left join publication_v1.live_pages live
        on live.host = domain.host and live.space_slug = split_part(p_path, '/', 2)
       and live.page_slug = substr(p_path, length(split_part(p_path, '/', 2)) + 3)
       and live.path = p_path
      cross join lateral publication_v1.read_identity(domain.host,site.id,site.tenant_id,p_token,p_proof,p_session) identity
      cross join lateral (
          select case
              when domain.site_id is null then 'site_not_found'
              when primary_domain.host <> domain.host then 'redirect'
              when p_token is null and identity.outcome <> 'ok' then identity.outcome
              when live.page_id is null then 'page_not_found'
              when identity.outcome <> 'ok' then identity.outcome
              when (identity.kind <> 'token' or identity.token_space = live.space_id)
               and publication_v1.can_view(live.tenant_id, live.site_id, live.space_id, live.page_id,
                                           identity.kind, identity.principal_id) then 'ok'
              else 'forbidden'
          end as outcome
      ) as result
      left join releases.release_contents content
        on result.outcome = 'ok' and content.tenant_id = live.tenant_id and content.content_hash = live.content_hash;
end
$query$;

alter function publication_v1.read_page(text, text, uuid, text, text) owner to space_publication_view;
revoke all on function publication_v1.read_page(text, text, uuid, text, text) from public;
grant execute on function publication_v1.read_page(text, text, uuid, text, text) to space_publication_reader;

create function publication_v1.toc_nodes(p_tree jsonb, p_targets jsonb)
returns jsonb
language plpgsql immutable set search_path = pg_catalog
as $toc$
declare
    node jsonb;
    children jsonb;
    target jsonb;
    url text;
    nodes jsonb := '[]'::jsonb;
begin
    if jsonb_typeof(p_tree) is distinct from 'array' then return nodes; end if;
    for node in select value from jsonb_array_elements(p_tree) with ordinality order by ordinality
    loop
        children := publication_v1.toc_nodes(node->'children', p_targets);
        case node->>'kind'
            when 'TARGET' then
                target := p_targets->(node->>'ref');
                if target is null then
                    nodes := nodes || children;
                    continue;
                end if;
                node := jsonb_build_object('kind', 'target', 'label', node->>'label',
                    'href', target->>'path', 'pageId', target->>'id', 'children', children);
            when 'GROUP' then
                if children = '[]'::jsonb then continue; end if;
                node := jsonb_build_object('kind', 'group', 'label', node->>'label', 'children', children);
            else
                url := node->>'url';
                node := jsonb_build_object('kind', 'link', 'label', node->>'label', 'children', children,
                    'href', case when url ~ '^(https?://|/|#)' then url else '#' end);
        end case;
        nodes := nodes || jsonb_build_array(node);
    end loop;
    return nodes;
end
$toc$;
alter function publication_v1.toc_nodes(jsonb, jsonb) owner to space_publication_view;
revoke all on function publication_v1.toc_nodes(jsonb, jsonb) from public;

-- Resolve a mount and render only the TOC entries the current subject can see.
create function publication_v1.read_navigation(p_host text, p_kind text, p_slug text,
    p_token uuid, p_proof text, p_session text)
returns table (outcome text, primary_host text, tenant_id uuid, site_id uuid, brand jsonb, document jsonb)
language plpgsql stable rows 1 security definer set search_path = pg_catalog
set plan_cache_mode = force_generic_plan
as $query$
begin
    return query
    select result.outcome, primary_domain.host, site.tenant_id, site.id,
           case when site.id is not null then jsonb_build_object(
               'siteName', site.name, 'logo', site.branding->>'logo', 'favicon', site.branding->>'favicon',
               'primaryColor', site.branding->>'primaryColor', 'locale', site.locale,
               'titleTemplate', site.title_template, 'analyticsId', site.analytics_id, 'robotsPolicy', site.robots_policy
           ) end,
           case when result.outcome = 'ok' then case p_kind
               when 'robots' then to_jsonb(site.robots_policy)
               when 'sitemap' then (
                   select coalesce(jsonb_agg(live.path order by live.path), '[]'::jsonb)
                     from publication_v1.live_pages live where live.host = domain.host
                      and publication_v1.can_read_public(live.tenant_id,live.site_id,live.space_id,live.page_id) and live.seo->>'noIndex' is distinct from 'true'
               )
               else publication_v1.toc_nodes(toc.tree, visible.targets)
           end end
      from (values (p_host)) request(host)
      left join hosting.custom_domains domain on domain.host = request.host and domain.verified
      left join hosting.sites site on site.id = domain.site_id
      left join hosting.custom_domains primary_domain
        on primary_domain.site_id = site.id and primary_domain.is_primary and primary_domain.verified
      left join hosting.site_mounts mount on p_kind in ('toc','mount') and mount.site_id = site.id and mount.slug = p_slug
      left join releases.releases release on release.space_id = mount.space_id and release.status = 'live'
      left join releases.release_toc toc on toc.release_id = release.id
      cross join lateral publication_v1.read_identity(domain.host,site.id,site.tenant_id,p_token,p_proof,p_session) identity
      left join lateral (
          select jsonb_object_agg(live.external_id, jsonb_build_object('id', live.page_id, 'path', live.path)) as targets
            from (select distinct value #>> '{}' as ref
                    from jsonb_path_query(toc.tree, '$.**.ref') as item(value)) refs
            join publication_v1.live_pages live on live.release_id = release.id and live.external_id = refs.ref
           where live.host = domain.host and live.space_id = mount.space_id
             and identity.outcome = 'ok'
             and (identity.kind <> 'token' or identity.token_space = live.space_id)
             and publication_v1.can_view(site.tenant_id, site.id, mount.space_id, live.page_id,
                                         identity.kind, identity.principal_id)
      ) visible on mount.space_id is not null
      cross join lateral (
          select case
              when site.id is null then 'site_not_found'
              when primary_domain.host <> domain.host and p_kind <> 'mount' then 'redirect'
              when p_kind in ('robots', 'sitemap') then 'ok'
              when p_token is null and identity.outcome <> 'ok' then identity.outcome
              when p_kind not in ('toc','mount') or mount.space_id is null then 'space_not_found'
              when identity.outcome <> 'ok' then identity.outcome
              when (identity.kind <> 'token' or identity.token_space = mount.space_id)
               and (visible.targets is not null
                    or publication_v1.can_view(site.tenant_id, site.id, mount.space_id, null,
                                               identity.kind, identity.principal_id)
                    or exists (
                        select 1 from publication_v1.live_pages live
                         where live.host = domain.host and live.space_id = mount.space_id
                           and publication_v1.can_view(site.tenant_id, site.id, mount.space_id, live.page_id,
                                                       identity.kind, identity.principal_id)
                    )) then 'ok'
              else 'forbidden'
          end as outcome
      ) as result;
end
$query$;
alter function publication_v1.read_navigation(text, text, text, uuid, text, text) owner to space_publication_view;
revoke all on function publication_v1.read_navigation(text, text, text, uuid, text, text) from public;
grant execute on function publication_v1.read_navigation(text, text, text, uuid, text, text) to space_publication_reader;

create function publication_v1.read_document(p_host text, p_path text, p_token uuid, p_proof text, p_session text)
returns table (outcome text, primary_host text, redirect_path text, tenant_id uuid, site_id uuid,
               page jsonb, attachment jsonb, context jsonb)
language plpgsql stable rows 1 security definer set search_path = pg_catalog
set plan_cache_mode = force_generic_plan
as $query$
declare
    home_outcome text;
    selected_path text := p_path;
begin
    if p_path ~ '^/[^/]*$' then
        select navigation.outcome,
               jsonb_path_query_first(navigation.document,'$.** ? (@.kind == "target").href') #>> '{}'
          into home_outcome, selected_path
          from hosting.custom_domains domain
          join hosting.sites site on site.id=domain.site_id
          join hosting.site_mounts mount on mount.site_id=site.id
           and ((p_path='/' and mount.space_id=site.home_space_id) or p_path='/' || mount.slug)
          cross join lateral publication_v1.read_navigation(
              p_host,'toc',mount.slug,p_token,p_proof,p_session) navigation
         where domain.host=p_host and domain.verified;
    end if;
    return query
    select case when result.outcome in ('site_not_found','redirect') then result.outcome
                when home_outcome is not null and home_outcome <> 'ok' then home_outcome
                when home_outcome = 'ok' and p_path <> '/' and result.outcome = 'ok' then 'home_redirect'
                when result.outcome = 'page_not_found' and file.entry is not null then
                    case when file.outcome <> 'ok' then file.outcome
                         when file.allowed then 'attachment' else 'forbidden' end
                when result.outcome = 'page_not_found' and redirect.path is not null then 'path_redirect'
                else result.outcome end, result.primary_host,
           case when home_outcome='ok' and p_path<>'/' then result.page->>'path' else redirect.path end,
           result.tenant_id, result.site_id, result.page,
           case when file.allowed then file.entry end,
           case when site.id is not null then jsonb_build_object(
               'brand', jsonb_build_object(
                   'siteName', site.name, 'logo', site.branding->>'logo', 'favicon', site.branding->>'favicon',
                   'primaryColor', site.branding->>'primaryColor', 'locale', site.locale,
                   'titleTemplate', site.title_template, 'analyticsId', site.analytics_id, 'robotsPolicy', site.robots_policy
               ), 'home', site.home_space_id,
               'revision',(select v.revision from publication_v1.tenant_versions v where v.tenant_id=site.tenant_id),
               'spaces', case when result.outcome = 'ok' then (
                   select coalesce(jsonb_agg(jsonb_build_object(
                       'id', space.id, 'slug', mount.slug, 'name', space.name, 'releaseId', release.id,
                       'navigation', navigation.document
                   ) order by mount.position), '[]'::jsonb)
                     from hosting.site_mounts mount
                     join authoring.spaces space on space.id = mount.space_id and space.tenant_id = site.tenant_id
                     left join releases.releases release on release.space_id = space.id and release.status = 'live'
                     cross join lateral publication_v1.read_navigation(
                         p_host, 'toc', mount.slug, p_token, p_proof, p_session) navigation
                    where mount.site_id = site.id and navigation.outcome = 'ok'
               ) else '[]'::jsonb end
           ) end
      from publication_v1.read_page(
          p_host,coalesce(selected_path,p_path),p_token,p_proof,p_session) result
      left join hosting.sites site on site.id=result.site_id
      left join lateral (
          select entry.value as entry, identity.outcome,
                 identity.outcome = 'ok' and (identity.kind <> 'token' or identity.token_space = live.space_id)
                  and publication_v1.can_view(site.tenant_id,site.id,live.space_id,live.page_id,
                                              identity.kind,identity.principal_id) as allowed
            from publication_v1.live_pages live
            cross join lateral jsonb_array_elements(live.attachments) entry
            cross join lateral publication_v1.read_identity(
                p_host,site.id,site.tenant_id,p_token,p_proof,p_session) identity
           where result.outcome = 'page_not_found' and live.host = p_host
             and live.space_slug = split_part(p_path,'/',2)
             and (p_path = '/' || live.space_slug || '/' || (entry.value->>'path')
                  or p_path = live.path || '/' || (entry.value->>'path'))
           order by allowed desc
           limit 1
      ) file on true
      left join lateral (
          select coalesce(target.path, '/' || mount.slug)
                 || case when right(rule.path,2) = '/*' then substr(p_path,length(rule.path)-1) else '' end as path
            from hosting.redirects rule
            left join publication_v1.live_pages target
                on rule.target_type = 'page' and target.page_id = rule.target_id and target.host = p_host
            left join hosting.site_mounts mount
                on rule.target_type = 'space' and mount.space_id = rule.target_id and mount.site_id = site.id
           where result.outcome = 'page_not_found' and rule.site_id = site.id
             and (target.page_id is not null or mount.space_id is not null)
             and (rule.path = p_path or (right(rule.path,2)='/*'
                  and (p_path=left(rule.path,-2) or starts_with(p_path,left(rule.path,-1)))))
           order by right(rule.path,2)<>'/*' desc, length(rule.path) desc
           limit 1
      ) redirect on true;
end
$query$;
alter function publication_v1.read_document(text, text, uuid, text, text) owner to space_publication_view;
revoke all on function publication_v1.read_document(text, text, uuid, text, text) from public;
grant execute on function publication_v1.read_document(text, text, uuid, text, text) to space_publication_reader;
create function publication_v1.read_mount(p_host text,p_slug text,p_token uuid,p_proof text,p_session text)
returns table(outcome text,tenant_id uuid,site_id uuid,snapshot text,binding text,space jsonb)
language plpgsql stable rows 1 security definer set search_path=pg_catalog
set plan_cache_mode=force_generic_plan as $mount$
begin
    return query
    select navigation.outcome,
           navigation.tenant_id,navigation.site_id,
           navigation.site_id::text || ':' || mount.space_id::text || ':' || version.revision::text,
           coalesce(p_token::text,p_session,'anonymous'),
           case when navigation.outcome='ok' then jsonb_build_object(
               'id',mount.space_id,'slug',mount.slug,'name',space.name,'releaseId',release.id,
               'navigation',coalesce(navigation.document,'[]'::jsonb)) end
      from publication_v1.read_navigation(p_host,'mount',p_slug,p_token,p_proof,p_session) navigation
      left join hosting.site_mounts mount on mount.site_id=navigation.site_id and mount.slug=p_slug
      left join authoring.spaces space on space.id=mount.space_id
      left join releases.releases release on release.space_id=mount.space_id and release.status='live'
      left join publication_v1.tenant_versions version on version.tenant_id=navigation.tenant_id;
end
$mount$;
alter function publication_v1.read_mount(text,text,uuid,text,text) owner to space_publication_view;
revoke all on function publication_v1.read_mount(text,text,uuid,text,text) from public;
grant execute on function publication_v1.read_mount(text,text,uuid,text,text) to space_publication_reader;

create function publication_v1.read_files(p_host text,p_slug text,p_snapshot text,p_token uuid,p_proof text,p_session text,
                                        p_after text,p_limit integer,p_exact text)
returns table(outcome text,entry jsonb)
language plpgsql stable rows 201 security definer set search_path=pg_catalog
set jit=off
set plan_cache_mode=force_generic_plan as $files$
declare mount record; identity record;
begin
    select * into mount from publication_v1.read_mount(p_host,p_slug,p_token,p_proof,p_session);
    if mount.outcome<>'ok' then return query select mount.outcome,null::jsonb; return; end if;
    if mount.snapshot is distinct from p_snapshot then return query select 'snapshot_changed'::text,null::jsonb; return; end if;
    select * into identity from publication_v1.read_identity(
        p_host,mount.site_id,mount.tenant_id,p_token,p_proof,p_session);
    return query
    with candidates as materialized (
        select live.page_slug,live.content_hash,live.page_id,live.attachments
          from publication_v1.live_pages live
         where live.host=p_host and live.space_slug=p_slug
           and (identity.kind<>'token' or identity.token_space=live.space_id)
    ), pages as materialized (
        select candidates.* from publication_v1.visible_pages(mount.tenant_id,mount.site_id,
            (mount.space->>'id')::uuid,(select array_agg(c.page_id) from candidates c),identity.kind,identity.principal_id) visible
        join candidates on candidates.page_id=visible.page_id
    ), files as (
        select '/' || pages.page_slug as path,'file'::text as kind,page_id,true as body,content_hash as hash from pages
        union all
        select '/' || (attachment->>'path'),'file',page_id,false,attachment->>'sha256'
          from pages cross join lateral jsonb_array_elements(attachments) attachment
    ), entries as (
        select * from files
        union all
        select distinct array_to_string((string_to_array(path,'/'))[1:n],'/'),'directory',page_id,false,null::text
          from files cross join lateral generate_series(2,array_length(string_to_array(path,'/'),1)-1) n
    ), selected as (
        select path,kind,body,hash,array_agg(distinct page_id) as owners
          from entries where path collate "C">p_after collate "C" and (p_exact is null or path=p_exact)
         group by path,kind,body,hash order by path collate "C" limit greatest(1,least(p_limit,201))
    )
    select 'ok'::text,jsonb_build_object(
        'path',selected.path,'kind',selected.kind,'owners',payload.pages,
        'size',case when selected.body then payload.size end,'sha256',selected.hash)
      from selected cross join lateral (
          select jsonb_agg(publication_v1.page_payload(live,null,octet_length(content.body))) as pages,
                 min(octet_length(content.body)) as size
            from unnest(selected.owners) ids(id)
            join publication_v1.live_pages live on live.page_id=ids.id and live.host=p_host and live.space_slug=p_slug
            join releases.release_contents content on content.tenant_id=live.tenant_id and content.content_hash=live.content_hash
      ) payload order by selected.path collate "C";
end
$files$;
alter function publication_v1.read_files(text,text,text,uuid,text,text,text,integer,text) owner to space_publication_view;
revoke all on function publication_v1.read_files(text,text,text,uuid,text,text,text,integer,text) from public;
grant execute on function publication_v1.read_files(text,text,text,uuid,text,text,text,integer,text) to space_publication_reader;


-- Machine indexes validate supplied credentials, but their curated output is always anonymous.
create function publication_v1.read_machine(p_host text,p_slug text,p_token uuid,p_proof text,p_session text)
returns table(outcome text,primary_host text,tenant_id uuid,site_id uuid,brand jsonb,document jsonb)
language plpgsql stable rows 1 security definer set search_path=pg_catalog
set plan_cache_mode=force_generic_plan as $machine$
declare navigation record; identity record;
begin
    select * into navigation from publication_v1.read_navigation(p_host,'robots',null,null,null,null);
    outcome:=navigation.outcome;primary_host:=navigation.primary_host;tenant_id:=navigation.tenant_id;
    site_id:=navigation.site_id;brand:=navigation.brand;
    if outcome<>'ok' then return next;return;end if;
    select * into identity from publication_v1.read_identity(p_host,site_id,tenant_id,p_token,p_proof,p_session);
    if identity.outcome<>'ok' then outcome:=identity.outcome;return next;return;end if;
    if brand->>'robotsPolicy'='noindex' then outcome:='machine_index_not_found';return next;return;end if;
    if p_slug is not null and not exists(select 1 from hosting.site_mounts m where m.site_id=navigation.site_id and m.slug=p_slug)
    then outcome:='space_not_found';return next;return;end if;
    with mounts as materialized (
        select m.space_id,m.slug,m.position,space.name,release.id as release_id,anonymous.document as nodes
          from hosting.site_mounts m join authoring.spaces space on space.id=m.space_id
          left join releases.releases release on release.space_id=m.space_id and release.status='live'
          cross join lateral publication_v1.read_navigation(p_host,'toc',m.slug,null,null,null) anonymous
         where m.site_id=navigation.site_id and (p_slug is null or m.slug=p_slug) and anonymous.outcome='ok'
    ), targets as (
        select distinct m.space_id,(ref.value #>> '{}')::uuid as page_id from mounts m
        cross join lateral jsonb_path_query(m.nodes,'$.**.pageId') ref(value)
    )
    select jsonb_build_object(
        'spaces',coalesce((select jsonb_agg(jsonb_build_object('id',m.space_id,'slug',m.slug,'name',m.name,
                   'releaseId',m.release_id,'navigation',m.nodes) order by m.position,m.slug) from mounts m),'[]'::jsonb),
        'pages',coalesce((select jsonb_agg(jsonb_build_object('id',live.page_id,'spaceId',live.space_id,'path',live.path,
                     'noIndex',coalesce(live.seo->>'noIndex','false')='true','description',live.seo->>'description'))
                   from targets t join publication_v1.live_pages live on live.host=p_host
                     and live.space_id=t.space_id and live.page_id=t.page_id),'[]'::jsonb)
    ) into document;
    return next;
end
$machine$;
alter function publication_v1.read_machine(text,text,uuid,text,text) owner to space_publication_view;
revoke all on function publication_v1.read_machine(text,text,uuid,text,text) from public;
grant execute on function publication_v1.read_machine(text,text,uuid,text,text) to space_publication_reader;

grant select on hosting.search_settings to space_publication_view;
create policy publication_read on hosting.search_settings for select to space_publication_view using(true);

create function publication_v1.search_key(p_site uuid) returns text
language sql stable set search_path=pg_catalog as $search$
    select encode(sha256(convert_to(jsonb_build_object(
        'releases',coalesce((select jsonb_agg(jsonb_build_array(m.space_id,m.slug,r.id,coalesce(v.revision,0)) order by m.space_id,m.slug)
            from hosting.site_mounts m left join releases.releases r on r.space_id=m.space_id and r.status='live'
            left join publication_v1.space_versions v on v.space_id=m.space_id where m.site_id=p_site),'[]'::jsonb),
        'settings',coalesce((select to_jsonb(settings) - 'tenant_id' - 'site_id' from hosting.search_settings settings
                             where settings.site_id=p_site),'{}'::jsonb))::text,'UTF8')),'hex')
$search$;
alter function publication_v1.search_key(uuid) owner to space_publication_view;
revoke all on function publication_v1.search_key(uuid) from public;

create function publication_v1.read_search_context(p_host text,p_slug text,p_snapshot text,p_token uuid,p_proof text,p_session text)
returns table(outcome text,primary_host text,tenant_id uuid,site_id uuid,brand jsonb,document jsonb)
language plpgsql stable rows 1 security definer set search_path=pg_catalog
set plan_cache_mode=force_generic_plan as $search$
declare navigation record;identity record;mounted record;generation jsonb;revision bigint;spaces jsonb;
begin
    select * into navigation from publication_v1.read_navigation(p_host,'robots',null,null,null,null);
    outcome:=navigation.outcome;primary_host:=navigation.primary_host;tenant_id:=navigation.tenant_id;
    site_id:=navigation.site_id;brand:=navigation.brand;
    if outcome not in ('ok','redirect') then return next;return;end if;
    select * into identity from publication_v1.read_identity(p_host,site_id,tenant_id,p_token,p_proof,p_session);
    outcome:=identity.outcome;
    if outcome<>'ok' then return next;return;end if;
    select v.revision into revision from publication_v1.tenant_versions v where v.tenant_id=navigation.tenant_id;
    if p_slug is not null then
        select * into mounted from publication_v1.read_mount(p_host,p_slug,p_token,p_proof,p_session);
        if mounted.outcome<>'ok' then outcome:=mounted.outcome;return next;return;end if;
        if mounted.snapshot is distinct from p_snapshot then outcome:='snapshot_changed';return next;return;end if;
    end if;
    if to_regprocedure('serving.publication_search_state(uuid)') is not null then
        execute 'select serving.publication_search_state($1)' into generation using site_id;
    end if;
    select coalesce(jsonb_agg(visible_mount.space order by m.position,m.slug),'[]'::jsonb) into spaces
      from hosting.site_mounts m
      cross join lateral publication_v1.read_mount(p_host,m.slug,p_token,p_proof,p_session) visible_mount
     where m.site_id=navigation.site_id and visible_mount.outcome='ok';
    document:=jsonb_build_object('siteId',site_id,'revision',revision,
        'binding',coalesce(p_token::text,p_session,'anonymous'),'spaces',spaces,
        'searchKey',publication_v1.search_key(site_id),'indexedKey',generation->>'key','index',case when generation->>'key' is not null then generation->>'index' end,
        'hasRelease',exists(select 1 from hosting.site_mounts m join releases.releases r on r.space_id=m.space_id
                            where m.site_id=navigation.site_id and r.status='live'));
    return next;
end
$search$;
alter function publication_v1.read_search_context(text,text,text,uuid,text,text) owner to space_publication_view;
revoke all on function publication_v1.read_search_context(text,text,text,uuid,text,text) from public;
grant execute on function publication_v1.read_search_context(text,text,text,uuid,text,text) to space_publication_reader;

create function publication_v1.read_search_pages(p_host text,p_pages uuid[],p_revision bigint,p_token uuid,p_proof text,p_session text)
returns table(outcome text,page jsonb)
language plpgsql stable rows 200 security definer set search_path=pg_catalog
set plan_cache_mode=force_generic_plan set jit=off as $search$
declare navigation record;identity record;revision bigint;
begin
    select * into navigation from publication_v1.read_navigation(p_host,'robots',null,null,null,null);
    if navigation.outcome not in ('ok','redirect') then return query select navigation.outcome,null::jsonb;return;end if;
    select * into identity from publication_v1.read_identity(p_host,navigation.site_id,navigation.tenant_id,p_token,p_proof,p_session);
    if identity.outcome<>'ok' then return query select identity.outcome,null::jsonb;return;end if;
    select v.revision into revision from publication_v1.tenant_versions v where v.tenant_id=navigation.tenant_id;
    if revision is distinct from p_revision then return query select 'snapshot_changed'::text,null::jsonb;return;end if;
    if cardinality(p_pages)>200 then return query select 'validation_failed'::text,null::jsonb;return;end if;
    return query
    with candidates as materialized (
        select live.* from unnest(p_pages) ids(id)
        join publication_v1.live_pages live on live.page_id=ids.id and live.host=p_host
         where identity.kind<>'token' or identity.token_space=live.space_id
    ), scopes as (
        select c.tenant_id,c.site_id,c.space_id,array_agg(c.page_id) as ids from candidates c
         group by c.tenant_id,c.site_id,c.space_id
    )
    select 'ok'::text,publication_v1.page_payload(c,null) from scopes scope
    cross join lateral publication_v1.visible_pages(scope.tenant_id,scope.site_id,scope.space_id,scope.ids,
                                                   identity.kind,identity.principal_id) visible
    join candidates c on c.page_id=visible.page_id and c.space_id=scope.space_id;
end
$search$;
alter function publication_v1.read_search_pages(text,uuid[],bigint,uuid,text,text) owner to space_publication_view;
revoke all on function publication_v1.read_search_pages(text,uuid[],bigint,uuid,text,text) from public;
grant execute on function publication_v1.read_search_pages(text,uuid[],bigint,uuid,text,text) to space_publication_reader;

-- Only the trusted index writer consumes this canonical, unfiltered publication input.
create view publication_v1.search_sources as
select site.id as site_id,site.tenant_id,domain.host,publication_v1.search_key(site.id) as source_key
  from hosting.sites site cross join lateral (
      select d.host from hosting.custom_domains d where d.site_id=site.id and d.verified
       order by d.is_primary desc,d.host limit 1
  ) domain;
alter view publication_v1.search_sources owner to space_publication_view;

revoke create on schema publication_v1 from space_publication_view;
