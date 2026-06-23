create table if not exists user_events (
  id             uuid primary key default gen_random_uuid(),
  user_id        uuid references user_profiles(id) on delete cascade not null,
  name           text not null,
  date           date not null,
  start_time     time,
  end_time       time,
  event_type     text check (event_type in ('holiday', 'birthday', 'other')),
  notify_options jsonb,
  family_visible boolean default false,
  note           text,
  deleted_at     timestamptz,
  created_at     timestamptz default now()
);

alter table user_events enable row level security;

create policy "Users manage own events"
  on user_events for all
  using  (user_id = (select id from user_profiles where auth_id = auth.uid()))
  with check (user_id = (select id from user_profiles where auth_id = auth.uid()));
