alter table user_events
  add column if not exists image_url text default null;
