create table public.family_members (
  id uuid not null default gen_random_uuid (),
  family_account_id uuid not null,
  name text not null,
  email text null,
  phone text null,
  notifications_enabled boolean null default false,
  created_at timestamp with time zone null default now(),
  constraint family_members_pkey primary key (id),
  constraint family_members_family_account_id_fkey foreign KEY (family_account_id) references family_accounts (id) on delete CASCADE
) TABLESPACE pg_default;

create index IF not exists family_members_family_account_id_idx on public.family_members using btree (family_account_id) TABLESPACE pg_default;

