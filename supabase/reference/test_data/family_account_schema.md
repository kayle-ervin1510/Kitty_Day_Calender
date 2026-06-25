create table public.family_accounts (
  id uuid not null default gen_random_uuid (),
  owner_id uuid not null,
  created_at timestamp with time zone null default now(),
  constraint family_accounts_pkey primary key (id),
  constraint family_accounts_owner_id_fkey foreign KEY (owner_id) references user_profiles (id) on delete CASCADE
) TABLESPACE pg_default;

create index IF not exists family_accounts_owner_id_idx on public.family_accounts using btree (owner_id) TABLESPACE pg_default;
