# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

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
    └── migrations/
        ├── 20260623000001_create_user_profiles.sql
        ├── 20260623000002_create_user_events.sql
        └── 20260623000003_create_family_accounts.sql
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

Three migrations have been applied (or are ready to push). All tables have RLS enabled.

### `user_profiles`
FK to `auth.users(id)` on delete cascade. Key columns: `auth_id`, `username` (unique), `name`, `preferred_name`, `email`, `phone_number`, `profile_pic` (emoji, default `🐱`), `timezone`, `notifications_enabled`, `notification_method` (`email`|`sms`), `is_family_account`.

RLS: users can only read/write their own row (`auth.uid() = auth_id`).

### `user_events`
FK to `user_profiles(id)` on delete cascade. Key columns: `name`, `date` (DATE), `start_time`/`end_time` (TIME), `event_type` (`holiday`|`birthday`|`other`), `notify_options` (JSONB), `family_visible`, `note`, `deleted_at` (soft-delete timestamp).

RLS: owner access via `user_id = (select id from user_profiles where auth_id = auth.uid())`.

> **Litter Box** — deleted events use `deleted_at` (soft delete). The frontend calls the view "Litter Box" and shows a "Your event has been shredded - Meow meow" message on delete.

### `family_accounts`
Columns: `id`, `owner_id` (FK → `user_profiles`), `created_at`. The `family_members` table (linking non-owner members) has **not yet been created** — it is next.

## Schema still to create

- **`family_members`** — `name`, `email`, `phone`, `notifications_enabled` boolean, FK to `family_accounts.id`. Enables family-member-visible events via RLS on `user_events` for rows where `family_visible = true`.

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

1. Create `family_members` migration
2. Wire the frontend `AppContext.jsx` to Supabase Auth and the new tables
3. Integrate the Animals API for cat images and daily cat facts
