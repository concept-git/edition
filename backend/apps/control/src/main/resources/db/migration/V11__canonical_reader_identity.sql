-- User owns current account facts and the reader-session revocation version.
alter table iam.users add column reader_epoch bigint not null default 0 check(reader_epoch>=0);
grant select(reader_epoch) on iam.users to space_publication_view;
-- Do not reactivate previously issued cookies when replacing the old version protocol.
do $$ begin
 if to_regclass('reader_state.sessions') is not null then
  execute 'update reader_state.sessions set ended_at=coalesce(ended_at,now())';
 end if;
end $$;

drop trigger identity_user_snapshot on iam.users;
drop function shared.revoke_identity_sessions(uuid);
drop function shared.queue_identity_user_trigger();
drop function shared.queue_identity_snapshot(uuid);
drop function shared.claim_identity_snapshot(uuid);
drop function shared.finish_identity_snapshot(uuid,bigint,uuid,text);
drop table shared.identity_publications;
drop sequence shared.identity_publication_epochs;

create or replace function publication_v1.read_session(p_proof text, p_host text, p_site uuid)
returns table (user_id uuid, outcome text)
language plpgsql stable strict rows 1 set search_path=pg_catalog
as $session$
begin
 if p_proof='' or to_regprocedure('reader_state.lookup_access(text)') is null then return; end if;
 return query
 select session.user_id, case
  when session.host<>p_host or session.site_id<>p_site then 'reader_session_invalid'
  when session.access_expires_at<=statement_timestamp() then 'reader_access_expired'
  when account.id is null or session.identity_epoch<>account.reader_epoch then 'reader_session_invalid'
  else 'ok'
 end
 from reader_state.lookup_access(p_proof) session
 left join iam.users account on account.id=session.user_id and account.status='active' and account.verified;
end
$session$;
