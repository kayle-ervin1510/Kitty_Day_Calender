# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

> **This file is stale.** The authoritative schema, table definitions, RPCs, and migration count are in `../CLAUDE.md` (the Project_2 root). Use that file — this one is missing `family_invites`, `get_shared_events_for_user`, `accept_family_invite`, `image_caption` on `user_events`, and 8+ migrations.

## What this is

Supabase backend for **Kitty Day Calendar** — a cat-themed calendar SPA. The frontend lives at `../Kitty_Day_Calender/`.

**Linked project:** `Kitty Day Calendar` (ref: `ntazfxyuwzqoavsfvdmm`, AWS us-east-1, Postgres 17.6)

## Directory layout

```
supabase/                         ← repo root (this working directory)
├── reference/
│   ├── Kitty_Day_Calendar.sql    # original MySQL-syntax schema (reference only)
│   ├── Kitty_Day_Calendar.webp   # ERD screenshot
│   ├── prompt.md                 # original schema-review prompt
│   └── user_journey.md           # authoritative UX/schema decisions
└── supabase/                     ← Supabase CLI project root (run ALL CLI commands from here)
    ├── config.toml               # local dev config (project initialized)
    └── migrations/               # 13 migrations applied
        ├── 20260623000001_create_user_profiles.sql
        ├── 20260623000002_create_user_events.sql
        ├── 20260623000003_create_family_accounts.sql
        ├── 20260623000004_fix_rls_performance.sql
        ├── 20260623000005_fix_rls_and_indexes.sql
        ├── 20260623000006_create_family_members.sql
        ├── 20260623000007_create_user_profile_trigger.sql
        ├── 20260623000008_get_email_by_username.sql
        ├── 20260623000009_grant_rpc_execute.sql
        ├── 20260623000010_tighten_function_permissions.sql
        ├── 20260624000011_add_theme_to_user_profiles.sql
        ├── 20260624000012_add_image_url_to_user_events.sql
        ├── 20260624000013_add_daily_cat_fact_to_user_profiles.sql
        └── 20260625000014_add_calendar_prefs_to_user_profiles.sql
```

## CLI commands

Run all `npx supabase` commands from inside `supabase/supabase/`:

```bash
npx supabase login                                        # authenticate
npx supabase link --project-ref ntazfxyuwzqoavsfvdmm    # re-link if needed
npx supabase db pull                                      # pull remote schema → baseline migration
npx supabase migration new <name>                         # create a new migration file
npx supabase db push                                      # push local migrations to remote
npx supabase functions new <name>                         # scaffold an Edge Function
npx supabase functions deploy <name>                      # deploy an Edge Function
npx supabase gen types typescript --local                 # generate TS types from schema
```

## Current schema

All 14 migrations have been applied. All tables have RLS enabled.

### `user_profiles`
FK to `auth.users(id)` on delete cascade. Key columns: `auth_id`, `username` (unique), `name`, `preferred_name`, `email`, `phone_number`, `profile_pic` (emoji, default `🐱`), `timezone`, `notifications_enabled`, `notification_method` (`email`|`sms`), `is_family_account`, `theme`, `daily_cat_fact`, `calendar_prefs` (JSONB — stores `showFederalHolidays`, `showInternationalHolidays`, `showFamilyEvents`, `showCatHolidays`, `showUsPopularHolidays`).

RLS: users can only read/write their own row (`auth.uid() = auth_id`).

### `user_events`
FK to `user_profiles(id)` on delete cascade. Key columns: `name`, `date` (DATE), `start_time`/`end_time` (TIME), `event_type` (`holiday`|`birthday`|`other`), `notify_options` (JSONB), `family_visible`, `note`, `image_url`, `deleted_at` (soft-delete timestamp).

RLS: owner access via `user_id = (select id from user_profiles where auth_id = auth.uid())`.

> **Litter Box** — deleted events use `deleted_at` (soft delete). The frontend calls the view "Litter Box" and shows a "Your event has been shredded - Meow meow" message on delete.

### `family_accounts`
Columns: `id`, `owner_id` (FK → `user_profiles`), `created_at`.

### `family_members`
FK to `family_accounts.id`. Columns: `id`, `family_account_id`, `name`, `email`, `phone`, `notifications_enabled`, `created_at`. Enables family-member-visible events via RLS on `user_events` for rows where `family_visible = true`.

## Key design decisions

- The reference `Calender` table is frontend view state — no DB table.
- `notify_options` on `user_events` is JSONB storing timing options: `1_week`, `1_day`, `1_hour`, `30_min`, `15_min`.
- `Event_Image_Details`, `Cat_Image_Details`, `Daily_Login_Message_Details` — deferred until Animals API is integrated.
- Cat fact is one per day per user; currently hardcoded in the frontend. When Animals API lands, a `daily_cat_facts` table or edge function cache will be needed.

## RLS pattern for family-visible events

```sql
create policy "Family members read shared events"
  on user_events for select
  using (
    family_visible = true
    and exists (
      select 1 from family_members fm
      join family_accounts fa on fa.id = fm.family_account_id
      join user_profiles up on up.family_account_id = fa.id
      where up.auth_id = auth.uid()
    )
  );
```

## Environment variables

Frontend reads from `../Kitty_Day_Calender/.env`:

| Variable | Purpose |
|---|---|
| `VITE_SUPABASE_URL` | Supabase project REST URL |
| `VITE_SUPABASE_ANON_KEY` | Supabase public anon key |

## What still needs to be done

1. Integrate the Animals API for cat images and daily cat facts
2. Wire email / SMS notifications (schema supports it; frontend toggle exists but nothing sends)
