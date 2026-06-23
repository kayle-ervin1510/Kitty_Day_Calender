# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

Supabase backend for **Kitty Day Calendar** — a cat-themed calendar SPA. This directory holds the Supabase CLI project, already linked to the hosted project. No local `config.toml`, migrations, or Edge Functions exist yet.

**Linked project:** `Kitty Day Calendar` (ref: `ntazfxyuwzqoavsfvdmm`, AWS us-east-1, Postgres 17.6)

The frontend lives at `../Kitty_Day_Calender/`. All state is currently in-memory in the frontend — nothing persists to Supabase yet.

## Directory layout

```
supabase/          ← this repo root (working directory)
├── reference/
│   ├── Kitty_Day_Calendar.sql    # original MySQL-syntax schema (reference only)
│   ├── Kitty_Day_Calendar.webp   # ERD screenshot
│   ├── prompt.md                 # original schema-review prompt with instructions
│   └── user_journey.md           # full user journey narrative (authoritative for UX/schema decisions)
└── supabase/      ← Supabase CLI project root (run CLI commands from here)
    └── .temp/     # linked project metadata (project-ref, versions)
```

## Supabase CLI commands

The CLI is available via `npx supabase` (v2.107.0) and the project is already linked. Run all commands from inside the `supabase/supabase/` subdirectory:

```bash
npx supabase login                        # authenticate
npx supabase init                         # creates config.toml (not yet run)
npx supabase link --project-ref ntazfxyuwzqoavsfvdmm   # re-link if needed
npx supabase db pull                      # pull remote schema → local migrations
npx supabase migration new <name>         # create a new migration file
npx supabase db push                      # push local migrations to remote
npx supabase functions new <name>         # scaffold an Edge Function
npx supabase functions deploy <name>      # deploy an Edge Function
npx supabase gen types typescript --local # generate TypeScript types from schema
```

## Planned schema

The reference schema lives at `reference/Kitty_Day_Calendar.sql` (MySQL backtick syntax with spaced identifiers — convert everything to snake_case for Postgres). Use Supabase Auth (`auth.users`) instead of the `Login/Signup` table. Ignore all password-related columns on `User Profile` — Auth owns credentials.

**Core tables to create:**

| Logical name | Supabase table | Notes |
|---|---|---|
| `Login/Signup` | replaced by `auth.users` | Supabase Auth handles this |
| `User Profile` | `user_profiles` | FK to `auth.users.id`; stores `display_name`, `preferred_name`, `profile_picture` (emoji string for now), `family_account` boolean |
| `User Events` | `user_events` | FK to `user_profiles.id`; `name`, `date` (DATE), `start_time`, `end_time`, `event_type` (`holiday`/`birthday`/`other`), `notify` boolean, `notify_timing` (array or enum: `1_week`/`1_day`/`1_hour`/`30_min`/`15_min`), `family_visible` boolean, `note` text, `soft_deleted_at` TIMESTAMPTZ |
| `Family Account` | `family_accounts` | Links profiles sharing a calendar; FK from `user_profiles` |
| `Profile 1` (family member) | `family_members` | `name`, `email`, `phone`, `notifications_enabled` boolean, FK to `family_accounts.id` |

**Schema translation decisions from `reference/Kitty_Day_Calendar.sql`:**
- The reference `Calender` table is purely frontend view state — do not create it as a DB table.
- The reference `My Events` table on `Profile 1` maps to family-member-visible events — handle via `family_visible` flag on `user_events` plus RLS.
- `Event Expiration` in the reference schema becomes `soft_deleted_at` (events expire/pass but stay queryable; only purged when user explicitly deletes).
- `Event_Image_Details`, `Cat_Image_Details`, `Daily_Login_Message_Details` — defer until Animals API is integrated.

## User journey notes (schema-relevant)

From `reference/user_journey.md`:
- Delete confirmation phrase: **"Do you really want to delete me?"** / success: **"Your event has been shredded - Meow meow"** — deleted events go to the "Litter Box" (soft delete), not immediately purged.
- Events have a **time range** (start + end), not a single time.
- Notification timing options the schema must support: 1 week prior, 1 day prior, 1 hour prior, 30 minutes prior, 15 minutes prior.
- Cat fact is **one per day per user** — resets at midnight. No table needed yet (frontend hardcodes facts); when Animals API is wired, a `daily_cat_facts` table or edge function cache will be needed.
- Family events: a `family_visible` flag on `user_events` controls visibility to `family_members`.

## RLS

All tables need Row Level Security. Standard pattern:

```sql
alter table user_events enable row level security;

-- owner access
create policy "Users manage own events"
  on user_events for all
  using (
    auth.uid() = (select auth_id from user_profiles where id = user_id)
  );

-- family members can read family_visible events
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

The frontend reads from `../Kitty_Day_Calender/.env`:

| Variable | Purpose |
|---|---|
| `VITE_SUPABASE_URL` | Supabase project REST URL |
| `VITE_SUPABASE_ANON_KEY` | Supabase public anon key |

## What still needs to be done

1. Run `npx supabase init` inside `supabase/supabase/` to create `config.toml` (project is already linked — this just scaffolds the local config)
2. Run `npx supabase db pull` to generate a baseline migration reflecting the remote project's current state
3. Create migrations for the planned schema tables above
4. Wire the frontend (`AppContext.jsx`) to Supabase Auth and the new tables
5. Integrate the Animals API for cat images and daily cat facts
