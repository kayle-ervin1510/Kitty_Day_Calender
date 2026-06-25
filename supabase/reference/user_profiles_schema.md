create table public.user_profiles (
  id uuid not null default gen_random_uuid (),
  auth_id uuid not null,
  username text not null,
  name text not null,
  preferred_name text null,
  email text not null,
  phone_number text null default ''::text,
  profile_pic text null default '🐱'::text,
  timezone text null,
  notifications_enabled boolean null default false,
  notification_method text null default 'email'::text,
  is_family_account boolean null default false,
  created_at timestamp with time zone null default now(),
  theme text not null default 'light'::text,
  daily_cat_fact jsonb null,
  calendar_prefs jsonb null,
  constraint user_profiles_pkey primary key (id),
  constraint user_profiles_auth_id_key unique (auth_id),
  constraint user_profiles_username_key unique (username),
  constraint user_profiles_auth_id_fkey foreign KEY (auth_id) references auth.users (id) on delete CASCADE,
  constraint user_profiles_notification_method_check check (
    (
      notification_method = any (array['email'::text, 'sms'::text])
    )
  ),
  constraint user_profiles_theme_check check (
    (
      theme = any (
        array[
          'light'::text,
          'dark'::text,
          'rainbow'::text,
          'meow-mixer'::text,
          'mewture'::text,
          'year-of-cat'::text
        ]
      )
    )
  )
) TABLESPACE pg_default;
