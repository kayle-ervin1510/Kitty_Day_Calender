-- Add calendar_prefs JSONB to persist per-user toggle preferences
-- (showFederalHolidays, showInternationalHolidays, showFamilyEvents,
--  showCatHolidays, showUsPopularHolidays)
alter table user_profiles
  add column if not exists calendar_prefs jsonb default null;

-- Fix theme constraint to include year-of-cat (omitted from migration 11)
alter table user_profiles
  drop constraint if exists user_profiles_theme_check;

alter table user_profiles
  add constraint user_profiles_theme_check
    check (theme in ('light', 'dark', 'rainbow', 'meow-mixer', 'mewture', 'year-of-cat'));
