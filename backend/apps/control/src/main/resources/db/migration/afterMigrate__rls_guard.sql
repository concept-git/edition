-- Flyway afterMigrate callback: fail the migration when the RLS contract drifts.
--
-- Every ordinary or partitioned table in the five business schemas must declare
-- exactly one classification at the start of its table comment:
--   rls:tenant/<reason>
--   rls:global/<reason>
--   rls:infrastructure/<reason>
--
-- Tenant tables must enable and force RLS. Their tenant_isolation policy must
-- cover every command, explicitly target only space_app, and provide
-- both USING and WITH CHECK expressions. Framework-owned tables are excluded
-- by exact schema/name pairs because their lifecycle is not owned by our DDL.

do $rls_guard$
declare
  app_role_oid oid;
  violations text;
  tenant_table_count integer;
begin
  select role.oid
    into app_role_oid
    from pg_catalog.pg_roles as role
   where role.rolname = 'space_app'
     and not role.rolsuper
     and not role.rolbypassrls
     and not role.rolcanlogin
     and not role.rolcreatedb
     and not role.rolcreaterole
     and not role.rolreplication;

  if app_role_oid is null then
    if exists (
      select 1
        from pg_catalog.pg_roles as role
       where role.rolname = 'space_app'
    ) then
      raise exception
        'RLS guard: role space_app must be NOLOGIN, NOSUPERUSER, NOCREATEDB, NOCREATEROLE, NOREPLICATION and NOBYPASSRLS';
    end if;

    raise exception 'RLS guard: required role space_app does not exist';
  end if;

  with framework_table(schema_name, table_name) as (
    values
      ('shared'::text, 'flyway_schema_history'::text),
      ('shared'::text, 'event_publication'::text),
      ('shared'::text, 'event_publication_archive'::text)
  )
  select pg_catalog.string_agg(
           pg_catalog.format('%I.%I', namespace.nspname, relation.relname),
           ', ' order by namespace.nspname, relation.relname)
    into violations
    from pg_catalog.pg_class as relation
    join pg_catalog.pg_namespace as namespace
      on namespace.oid = relation.relnamespace
    left join framework_table as framework
      on framework.schema_name = namespace.nspname
     and framework.table_name = relation.relname
   where namespace.nspname = any (
           array['shared', 'iam', 'authoring', 'releases', 'hosting']::text[])
     and relation.relkind in ('r', 'p')
     and framework.table_name is null
     and coalesce(pg_catalog.obj_description(relation.oid, 'pg_class'), '')
           !~ '^rls:(tenant|global|infrastructure)/';

  if violations is not null then
    raise exception
      'RLS guard: business tables have a missing or invalid RLS classification comment: %',
      violations;
  end if;

  select count(*)
    into tenant_table_count
    from pg_catalog.pg_class as relation
    join pg_catalog.pg_namespace as namespace
      on namespace.oid = relation.relnamespace
   where namespace.nspname = any (
           array['shared', 'iam', 'authoring', 'releases', 'hosting']::text[])
     and relation.relkind in ('r', 'p')
     and pg_catalog.obj_description(relation.oid, 'pg_class') like 'rls:tenant/%';

  if tenant_table_count = 0 then
    raise exception 'RLS guard: no table is classified as rls:tenant';
  end if;

  select pg_catalog.string_agg(
           pg_catalog.format('%I.%I', namespace.nspname, relation.relname),
           ', ' order by namespace.nspname, relation.relname)
    into violations
    from pg_catalog.pg_class as relation
    join pg_catalog.pg_namespace as namespace
      on namespace.oid = relation.relnamespace
   where namespace.nspname = any (
           array['shared', 'iam', 'authoring', 'releases', 'hosting']::text[])
     and relation.relkind in ('r', 'p')
     and pg_catalog.obj_description(relation.oid, 'pg_class') like 'rls:tenant/%'
     and (not relation.relrowsecurity or not relation.relforcerowsecurity);

  if violations is not null then
    raise exception
      'RLS guard: tenant tables must ENABLE and FORCE ROW LEVEL SECURITY: %',
      violations;
  end if;

  select pg_catalog.string_agg(
           pg_catalog.format('%I.%I', namespace.nspname, relation.relname),
           ', ' order by namespace.nspname, relation.relname)
    into violations
    from pg_catalog.pg_class as relation
    join pg_catalog.pg_namespace as namespace
      on namespace.oid = relation.relnamespace
   where namespace.nspname = any (
           array['shared', 'iam', 'authoring', 'releases', 'hosting']::text[])
     and relation.relkind in ('r', 'p')
     and pg_catalog.obj_description(relation.oid, 'pg_class') like 'rls:tenant/%'
     and relation.relowner = app_role_oid;

  if violations is not null then
    raise exception
      'RLS guard: runtime roles must not own tenant tables: %',
      violations;
  end if;

  select pg_catalog.string_agg(
           pg_catalog.format(
             '%I.%I[%s]',
             namespace.nspname,
             relation.relname,
             case
               when policy.oid is null then 'missing tenant_isolation policy'
               else pg_catalog.concat_ws(
                 '; ',
                 case when policy.polcmd <> '*' then 'command is not ALL' end,
                 case when not policy.polpermissive then 'policy is not permissive' end,
                 case when not (
                   pg_catalog.array_length(policy.polroles, 1) = 1
                   and app_role_oid = any (policy.polroles))
                   then 'role target is not exactly space_app' end,
                 case when policy.polqual is null then 'USING is missing' end,
                 case when policy.polwithcheck is null then 'WITH CHECK is missing' end)
             end),
           ', ' order by namespace.nspname, relation.relname)
    into violations
    from pg_catalog.pg_class as relation
    join pg_catalog.pg_namespace as namespace
      on namespace.oid = relation.relnamespace
    left join pg_catalog.pg_policy as policy
      on policy.polrelid = relation.oid
     and policy.polname = 'tenant_isolation'
   where namespace.nspname = any (
           array['shared', 'iam', 'authoring', 'releases', 'hosting']::text[])
     and relation.relkind in ('r', 'p')
     and pg_catalog.obj_description(relation.oid, 'pg_class') like 'rls:tenant/%'
     and (
       policy.oid is null
       or policy.polcmd <> '*'
       or not policy.polpermissive
       or not (
         pg_catalog.array_length(policy.polroles, 1) = 1
         and app_role_oid = any (policy.polroles))
       or policy.polqual is null
       or policy.polwithcheck is null);

  if violations is not null then
    raise exception 'RLS guard: invalid tenant isolation policies: %', violations;
  end if;

  -- 策略正确但没有 GRANT 的表，运行时角色一碰就是 permission denied：RLS 策略再严也白搭，
  -- 而症状是 503 而非 403，极难归因（V5 的 space_page_placements 正是如此，V8 补授权）。
  --   rls:tenant  —— 租户数据由应用读写，必须有 SELECT/INSERT/DELETE；
  --                  UPDATE 只对未被 ADR-0008 forbid_update 锁死的表要求，
  --                  故无需豁免清单——不可变快照表由触发器自证。
  --   rls:global  —— 至少可读；写权限按需单独授予（如 iam.permission_roles 的种子角色由迁移拥有）。
  select pg_catalog.string_agg(
           pg_catalog.format(
             '%I.%I[%s]',
             relation.nspname,
             relation.relname,
             pg_catalog.concat_ws(
               '; ',
               case when not pg_catalog.has_table_privilege(app_role_oid, relation.oid, 'select')
                 then 'missing SELECT' end,
               case when relation.tenant_scoped
                     and not pg_catalog.has_table_privilege(app_role_oid, relation.oid, 'insert')
                 then 'missing INSERT' end,
               case when relation.tenant_scoped
                     and not pg_catalog.has_table_privilege(app_role_oid, relation.oid, 'delete')
                 then 'missing DELETE' end,
               case when relation.tenant_scoped and not relation.immutable
                     and not pg_catalog.has_table_privilege(app_role_oid, relation.oid, 'update')
                 then 'missing UPDATE' end)),
           ', ' order by relation.nspname, relation.relname)
    into violations
    from (
      select relation.oid,
             namespace.nspname,
             relation.relname,
             pg_catalog.obj_description(relation.oid, 'pg_class') like 'rls:tenant/%' as tenant_scoped,
             exists (
               select 1
                 from pg_catalog.pg_trigger as trigger
                where trigger.tgrelid = relation.oid
                  and not trigger.tgisinternal
                  and trigger.tgfoid = 'shared.forbid_update()'::regprocedure
             ) as immutable
        from pg_catalog.pg_class as relation
        join pg_catalog.pg_namespace as namespace
          on namespace.oid = relation.relnamespace
       where namespace.nspname = any (
               array['shared', 'iam', 'authoring', 'releases', 'hosting']::text[])
         and relation.relkind in ('r', 'p')
         and pg_catalog.obj_description(relation.oid, 'pg_class') ~ '^rls:(tenant|global)/'
    ) as relation
   where not pg_catalog.has_table_privilege(app_role_oid, relation.oid, 'select')
      or (relation.tenant_scoped
          and (not pg_catalog.has_table_privilege(app_role_oid, relation.oid, 'insert')
               or not pg_catalog.has_table_privilege(app_role_oid, relation.oid, 'delete')
               or (not relation.immutable
                   and not pg_catalog.has_table_privilege(app_role_oid, relation.oid, 'update'))));

  if violations is not null then
    raise exception
      'RLS guard: space_app lacks the DML privileges these business tables need: %',
      violations;
  end if;

end
$rls_guard$;
