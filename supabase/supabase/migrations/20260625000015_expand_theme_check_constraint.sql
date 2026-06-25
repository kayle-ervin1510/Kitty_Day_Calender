alter table user_profiles
  drop constraint if exists user_profiles_theme_check;

alter table user_profiles
  add constraint user_profiles_theme_check
    check (theme in ('light', 'dark', 'rainbow', 'meow-mixer', 'mewture', 'year-of-cat', 'ode-to-catnip'));
