create table public.user_events (
  id uuid not null default gen_random_uuid (),
  user_id uuid not null,
  name text not null,
  date date not null,
  start_time time without time zone null,
  end_time time without time zone null,
  event_type text null,
  notify_options jsonb null,
  family_visible boolean null default false,
  note text null,
  deleted_at timestamp with time zone null,
  created_at timestamp with time zone null default now(),
  image_url text null,
  constraint user_events_pkey primary key (id),
  constraint user_events_user_id_fkey foreign KEY (user_id) references user_profiles (id) on delete CASCADE,
  constraint user_events_event_type_check check (
    (
      event_type = any (
        array['holiday'::text, 'birthday'::text, 'other'::text]
      )
    )
  )
) TABLESPACE pg_default;

create index IF not exists user_events_user_id_idx on public.user_events using btree (user_id) TABLESPACE pg_default;
