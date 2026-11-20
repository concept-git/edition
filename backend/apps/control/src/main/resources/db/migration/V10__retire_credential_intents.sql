-- Finish old fail-closed revocations before removing their read-side fences.
-- Credential import from the retired Identity database precedes the deployment cutover.
update iam.sessions
set ended_at=coalesce(ended_at,now())
where principal_id in (select user_id from iam.session_revocations);
drop table iam.session_revocations;
drop table shared.identity_provisioning;
