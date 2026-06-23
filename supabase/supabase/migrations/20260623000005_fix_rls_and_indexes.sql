-- Fix RLS performance on user_events: wrap auth.uid() in subquery
drop policy if exists "Users manage own events" on user_events;

create policy "Users manage own events"
  on user_events for all
  using  (user_id = (select id from user_profiles where auth_id = (select auth.uid())))
  with check (user_id = (select id from user_profiles where auth_id = (select auth.uid())));

-- Fix RLS performance on family_accounts: wrap auth.uid() in subquery
drop policy if exists "Owners manage their family account" on family_accounts;

create policy "Owners manage their family account"
  on family_accounts for all
  using  (owner_id = (select id from user_profiles where auth_id = (select auth.uid())))
  with check (owner_id = (select id from user_profiles where auth_id = (select auth.uid())));

-- Add covering indexes for unindexed foreign keys
create index if not exists user_events_user_id_idx on user_events (user_id);
create index if not exists family_accounts_owner_id_idx on family_accounts (owner_id);
