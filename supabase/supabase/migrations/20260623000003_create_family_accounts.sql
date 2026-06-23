create table if not exists family_accounts (
  id         uuid primary key default gen_random_uuid(),
  owner_id   uuid references user_profiles(id) on delete cascade not null,
  created_at timestamptz default now()
);

alter table family_accounts enable row level security;

create policy "Owners manage their family account"
  on family_accounts for all
  using  (owner_id = (select id from user_profiles where auth_id = auth.uid()))
  with check (owner_id = (select id from user_profiles where auth_id = auth.uid()));
