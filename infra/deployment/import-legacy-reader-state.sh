#!/usr/bin/env bash
set -euo pipefail

if (( $# != 3 )); then
    printf 'Usage: %s <legacy-identity-db> <legacy-delivery-db> <migrated-primary-db>\n' "$0" >&2
    exit 2
fi

umask 077
folder="$(mktemp -d)"
trap 'rm -rf -- "$folder"' EXIT
cd "$folder"

psql -Xq -v ON_ERROR_STOP=1 --dbname="$1" >credentials.csv <<'SQL'
copy (
    select coalesce(account.id, pending.user_id),
           coalesce(account.password_hash, pending.password_hash),
           coalesce(account.failures, 0), account.locked_until
    from identity.users account
    full join identity.pending_passwords pending on account.id=pending.user_id
    where account.status is distinct from 'erased'
      and coalesce(account.password_hash, pending.password_hash) is not null
) to stdout with (format csv);
SQL
psql -Xq -v ON_ERROR_STOP=1 --dbname="$2" >history.csv <<'SQL'
copy (
    select site_id, user_id, space_slug, page_path, viewed_at from reader_state.history
) to stdout with (format csv);
SQL

psql -X -v ON_ERROR_STOP=1 -v VERBOSITY=terse --dbname="$3" <<'SQL'
begin;
create temporary table imported_passwords (
    user_id uuid, password_hash text, failures integer, locked_until timestamptz
) on commit drop;
\copy imported_passwords from 'credentials.csv' with (format csv)
create temporary table imported_history (
    site_id uuid, user_id uuid, space_slug text, page_path text, viewed_at timestamptz
) on commit drop;
\copy imported_history from 'history.csv' with (format csv)

insert into iam.password_credentials(user_id,password_hash,failures,locked_until)
select legacy.user_id,legacy.password_hash,legacy.failures,legacy.locked_until
from imported_passwords legacy
join iam.users account on account.id=legacy.user_id and account.status<>'erased'
on conflict (user_id) do nothing;

insert into reader_state.history as current (site_id,user_id,space_slug,page_path,viewed_at)
select legacy.site_id,legacy.user_id,legacy.space_slug,legacy.page_path,legacy.viewed_at
from imported_history legacy
join iam.users account on account.id=legacy.user_id and account.status<>'erased'
join hosting.sites site on site.id=legacy.site_id
on conflict (site_id,user_id,space_slug) do update
set page_path=excluded.page_path, viewed_at=excluded.viewed_at
where current.viewed_at<excluded.viewed_at;
commit;
SQL
