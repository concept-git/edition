-- Password owns credentials; User IDs are opaque values, not foreign concept state.
create table iam.password_credentials (
    user_id uuid primary key,
    password_hash text not null,
    failures integer not null default 0 check (failures >= 0),
    locked_until timestamptz,
    reset_token_hash text unique,
    reset_expires_at timestamptz,
    updated_at timestamptz not null default now(),
    check ((reset_token_hash is null) = (reset_expires_at is null))
);
comment on table iam.password_credentials is 'rls:global/password; Password credential state; owned by Password';
grant select, insert, update, delete on iam.password_credentials to space_app;
