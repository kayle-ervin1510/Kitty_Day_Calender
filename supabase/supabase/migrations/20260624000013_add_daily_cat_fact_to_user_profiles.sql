alter table user_profiles
  add column if not exists daily_cat_fact jsonb default null;
