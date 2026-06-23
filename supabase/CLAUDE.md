# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

Supabase backend for **Kitty Day Calendar** — a cat-themed calendar SPA. This directory holds the Supabase CLI project, already linked to the hosted project. No local `config.toml`, migrations, or Edge Functions exist yet.

**Linked project:** `Kitty Day Calendar` (ref: `ntazfxyuwzqoavsfvdmm`, AWS us-east-1, Postgres 17)

The frontend lives at `../Kitty_Day_Calender/`. All state is currently in-memory in the frontend — nothing persists to Supabase yet.

## Directory layout

```
supabase/          ← this repo root (working directory)
├── reference/
│   ├── Kitty_Day_Calendar.sql   # original MySQL-syntax schema (reference only)
│   └── Kitty_Day_Calendar.webp  # ERD screenshot
└── supabase/      ← Supabase CLI project root (run CLI commands from here)
    └── .temp/     # linked project metadata (project-ref, versions)
```

## Supabase CLI commands

The CLI is available via `npx supabase` (v2.107.0) and the project is already linked. Run all commands from inside the `supabase/supabase/` subdirectory:

```bash
npx supabase login                        # authenticate
npx supabase link --project-ref ntazfxyuwzqoavsfvdmm   # re-link if needed
npx supabase db pull                      # pull remote schema → local migrations
npx supabase migration new <name>         # create a new migration file
npx supabase db push                      # push local migrations to remote
npx supabase functions new <name>         # scaffold an Edge Function
npx supabase functions deploy <name>      # deploy an Edge Function
npx supabase gen types typescript --local # generate TypeScript types from schema
```

## Planned schema

The reference schema lives at `reference/Kitty_Day_Calendar.sql` (MySQL backtick syntax with spaced identifiers — convert everything to snake_case for Postgres). Use Supabase Auth (`auth.users`) instead of the `Login/Signup` table. The reference schema encodes password fields directly on `User Profile` — ignore those; Auth owns credentials.

**Core tables to create:**

| Logical name | Supabase table | Notes |
|---|---|---|
| `Login/Signup` | replaced by `auth.users` | Supabase Auth handles this |
| `User Profile` | `user_profiles` | FK to `auth.users.id`; stores display name, preferred name, profile picture (emoji for now), `family_account` boolean |
| `User Events` | `user_events` | FK to `user_profiles.id`; stores name, date, start/end time, event_type (`holiday`/`birthday`/`other`), notify boolean, family_visible boolean, note, soft-delete timestamp |
| `Family Account` | `family_accounts` | Links profiles sharing a calendar |
| `Profile 1` (family member) | `family_members` | Name, email, phone, notifications flag, FK to `family_accounts` |

Tables not yet needed: `Event_Image_Details`, `Cat_Image_Details`, `Daily_Login_Message_Details` — these will be integrated when the Animals API is wired up.

## RLS

All tables will need Row Level Security. The standard pattern for this app:

```sql
-- Example for user_events:
alter table user_events enable row level security;
create policy "Users manage own events"
  on user_events for all
  using (auth.uid() = user_id);
```

## Environment variables

The frontend reads from `../Kitty_Day_Calender/.env`:

| Variable | Purpose |
|---|---|
| `VITE_SUPABASE_URL` | Supabase project REST URL |
| `VITE_SUPABASE_ANON_KEY` | Supabase public anon key |

## What still needs to be done

1. Install Supabase CLI and run `supabase init` inside `supabase/`
2. Run `supabase db pull` to generate a baseline migration from the remote project's current state
3. Create migrations for the planned schema tables above
4. Wire the frontend (`AppContext.jsx`) to Supabase Auth and the new tables
5. Integrate the Animals API for cat images and profile pictures
