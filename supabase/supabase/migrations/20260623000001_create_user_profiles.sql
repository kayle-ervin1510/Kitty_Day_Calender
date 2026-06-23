create table if not exists user_profiles (
  id                    uuid primary key default gen_random_uuid(),
  auth_id               uuid references auth.users(id) on delete cascade not null unique,
  username              text not null unique,
  name                  text not null,
  preferred_name        text,
  email                 text not null,
  phone_number          text default '',
  profile_pic           text default '🐱',
  timezone              text,
  notifications_enabled boolean default false,
  notification_method   text default 'email' check (notification_method in ('email', 'sms')),
  is_family_account     boolean default false,
  created_at            timestamptz default now()
);

alter table user_profiles enable row level security;

create policy "Users manage own profile"
  on user_profiles for all
  using  (auth.uid() = auth_id)
  with check (auth.uid() = auth_id);
