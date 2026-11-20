-- Publishing and access control are read directly from the authoritative schema.
drop function shared.claim_delivery_publication(uuid);
drop function shared.renew_delivery_publication(uuid,bigint,uuid);
drop function shared.finish_delivery_publication(uuid,bigint,uuid,text);
drop function shared.pin_delivery_source(uuid,bigint,uuid,text);
drop function shared.release_delivery_source(uuid,text);
drop function shared.delivery_publication_health();
drop function shared.claim_reader_security(uuid);
drop function shared.finish_reader_security(text,uuid,bigint,uuid,text,boolean);
drop function shared.claim_reader_state_erasure(uuid);
drop function shared.finish_reader_state_erasure(uuid,uuid,text);
drop table shared.delivery_publications;
drop function shared.record_delivery_outcome();
drop table shared.delivery_events, shared.delivery_source_pins, shared.reader_security_publications,
    shared.reader_state_erasures;
drop sequence shared.delivery_epoch;

create function publication_v1.search_health()
returns table (backlog bigint, recent_failures bigint)
language sql stable security definer set search_path=pg_catalog as $health$
    select count(*) filter (where status in ('queued','retrying')),
           count(*) filter (where status='failed' and updated_at > now()-interval '24 hours')
    from serving.search_jobs
$health$;
revoke all on function publication_v1.search_health() from public;
grant execute on function publication_v1.search_health() to space_app;
