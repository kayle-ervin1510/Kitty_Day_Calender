create table if not exists family_members (
  id                    uuid primary key default gen_random_uuid(),
  family_account_id     uuid references family_accounts(id) on delete cascade not null,
  name                  text not null,
  email                 text,
  phone                 text,
  notifications_enabled boolean default false,
  created_at            timestamptz default now()
);

alter table family_members enable row level security;

-- Only the family account owner can manage their members
create policy "Owners manage their family members"
  on family_members for all
  using (
    family_account_id in (
      select id from family_accounts
      where owner_id = (select id from user_profiles where auth_id = (select auth.uid()))
    )
  )
  with check (
    family_account_id in (
      select id from family_accounts
      where owner_id = (select id from user_profiles where auth_id = (select auth.uid()))
    )
  );

-- Covering index for the FK (avoids unindexed FK advisor warning)
create index if not exists family_members_family_account_id_idx on family_members (family_account_id);
