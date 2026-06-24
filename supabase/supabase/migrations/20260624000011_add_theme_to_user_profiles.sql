alter table user_profiles
  add column if not exists theme text not null default 'light'
    check (theme in ('light', 'dark', 'rainbow', 'meow-mixer', 'mewture'));
