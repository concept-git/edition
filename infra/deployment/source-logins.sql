-- Provision restricted logins before Flyway creates their schema grants.
do $$
begin
 if not exists(select 1 from pg_roles where rolname='space_publication_reader') then
  create role space_publication_reader nologin;
 end if;
 if not exists(select 1 from pg_roles where rolname='delivery_writer') then
  create role delivery_writer nologin;
 end if;
 if not exists(select 1 from pg_roles where rolname='publication_reader_login') then
  create role publication_reader_login login password 'publication-local-reader';
 end if;
 if not exists(select 1 from pg_roles where rolname='publication_search_login') then
  create role publication_search_login login password 'publication-local-search';
 end if;
end $$;
grant space_publication_reader to publication_reader_login;
grant delivery_writer to publication_search_login;
