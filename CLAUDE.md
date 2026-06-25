# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this app is

**Kitty Day Calendar** — a cat-themed calendar SPA. Users register, create events, and get a daily cat fact. Events are typed as holiday, birthday, or other. Family accounts allow multiple profiles under one login. HTTP error states show cat-themed images via `http.cat`. Notifications can be sent via email or SMS (planned — not yet wired).

## Repository layout

```
Project_2/
├── Client/
│   ├── app_outline.md          # Feature goals and fundamental design questions
│   └── skeleton/               # Planning docs: app_info.md, app_guide.md,
│                               #   style_guide.md, user_journey.md, user_stories.md,
│                               #   My_Schema_Example.sql, Kitty_Day_Bio.md
├── Kitty_Day_Calender/         # React + Vite frontend (the actual app)
│   ├── src/
│   │   ├── App.jsx             # Root — BrowserRouter, AppProvider, all routes
│   │   ├── context/AppContext.jsx  # All global state + Supabase calls
│   │   ├── lib/supabase.js     # Supabase client (reads VITE_SUPABASE_* env vars)
│   │   ├── lib/httpCat.js      # HTTP status code map + set of codes http.cat supports
│   │   ├── lib/yearOfCat.js    # Vietnamese zodiac Year of the Cat date ranges
│   │   ├── components/         # Navbar.jsx, KittyClock.jsx, HttpCatImage.jsx, CatImagePicker.jsx
│   │   └── pages/              # One file per route (see Routing section)
│   ├── tests/                  # Playwright E2E tests (auth-callback.spec.js)
│   └── package.json
├── supabase/                   # Supabase CLI project (linked to remote)
│   ├── reference/              # ERD screenshot, original schema, UX decisions
│   └── supabase/               # CLI root — run all `npx supabase` commands from here
│       ├── config.toml
│       └── migrations/         # 14 applied migrations
└── Main/supabase/              # Empty placeholder — backend lives in supabase/ above
```

## Commands (run from `Kitty_Day_Calender/`)

```bash
npm run dev        # Vite dev server at localhost:5173
npm run build      # Production build → dist/
npm run preview    # Serve the dist/ build locally
npm run lint       # ESLint
```

Playwright is configured for E2E tests. Tests live in `tests/`. The dev server starts automatically:

```bash
npm test                                         # run all Playwright tests
npx playwright test tests/auth-phases.spec.js   # run the 5-phase auth suite
npx playwright test tests/auth-callback.spec.js # run the email-confirm callback test
npx playwright test --headed                    # run with browser visible
```

`auth-phases.spec.js` covers 5 phases: registration form validation, login, auth failure, RLS isolation, and session persistence. Phases 2–5 require env vars: `TEST_USER=<username_or_email> TEST_PASS=<password> npm test` — without them those phases are skipped.

> **Test rate-limit gotcha:** `auth-callback.spec.js` calls `supabase.auth.signUp`, which counts against Supabase's free-tier email limit (~3 confirmation emails/hour). Running it too frequently returns "email rate limit exceeded." Bypass during dev by disabling email confirmation in Supabase → Authentication → Providers → Email → "Confirm email."

## Environment variables

Place in `Kitty_Day_Calender/.env` (not committed):

| Variable | Purpose |
|---|---|
| `VITE_SUPABASE_URL` | Supabase project REST URL |
| `VITE_SUPABASE_ANON_KEY` | Supabase public anon key |
| `VITE_CAT_API_KEY` | The Cat API key (used by `CatImagePicker`) |
| `VITE_UNSPLASH_ACCESS_KEY` | Unsplash API key (used by `CatImagePicker` for wild-cat images) |
| `VITE_API_NINJAS_KEY` | API Ninjas key (used by `CatImagePicker` for animal facts) |

The three image/fact API keys are optional — `CatImagePicker` degrades gracefully when they are absent.

## Tech stack

- **Frontend:** React 19 + Vite 8 + React Router DOM v7, plain CSS — no TypeScript (all files are `.jsx`/`.js`)
- **Backend:** Supabase (Postgres + Auth) — **fully integrated**
- **External APIs:** `cat-fact.herokuapp.com` (live cat facts, with fallback), The Cat API / Unsplash / API Ninjas (event images, optional)

## Routing (`src/App.jsx`)

Two layout wrappers:
- `PublicLayout` — redirects `user != null` → `/home`. `pendingUser` (mid-registration) does **not** trigger this redirect, so `/confirm` stays accessible after `register()`.
- `ProtectedLayout` — redirects `user == null` → `/login`; renders `<Navbar>` + `<Outlet>`. Returns `null` while `initializing` is true to prevent flash-redirect.

| Path | Page | Notes |
|---|---|---|
| `/login` | `LoginPage` | Handles both login and register; public |
| `/confirm` | `ConfirmPage` | Shows instructions to check email; public |
| `/reset-password` | `ResetPasswordPage` | Password-reset flow; outside both layouts |
| `/home` | `HomePage` | Landing after login |
| `/calendar` | `CalendarPage` | Full calendar UI |
| `/events/new` | `AddEventPage` | Pre-fills `date` from `?date=YYYY-MM-DD` query param |
| `/events/:id/edit` | `EditEventPage` | |
| `/profile` | `ProfilePage` | User info + theme picker + notification prefs |
| `/family` | `FamilyPage` | Add/remove family members |
| `/about` | `AboutPage` | Static about page |
| `/contact` | `ContactPage` | Support contact info |
| `/litter-box` | `LitterBoxPage` | Soft-deleted events; badge count shown in Navbar |
| `/auth/callback` | `AuthCallbackPage` | Supabase OAuth/email-confirm callback — intentionally outside both layout wrappers so the session can be set before any redirect |
| `*` | `ErrorPage` | Cat-themed 404 |

Root `/` redirects to `/login`.

## Global state (`src/context/AppContext.jsx`)

Single `AppContext`; `useApp()` is the only access point. All Supabase calls live here — pages never call `supabase` directly.

**DB snake_case ↔ camelCase:** `normalizeProfile`, `normalizeEvent`, and `normalizeMember` helpers convert DB rows to camelCase for the UI. When writing DB updates, field names must be mapped back to snake_case manually (see `updateProfile` and `updateEvent` for the pattern).

**Session bootstrap:** `supabase.auth.getSession()` + `onAuthStateChange` both call `loadUserData(authUser)`, which fetches the `user_profiles` row by `auth_id`. If the row is missing (can happen if the DB trigger that creates it on `auth.users` insert had an RLS error), `loadUserData` re-creates it from `authUser.user_metadata`.

**Registration flow:** `register()` calls `supabase.auth.signUp` with user metadata so the server-side DB trigger can create the `user_profiles` row. It sets `pendingUser` (not `user`) and navigates to `/confirm`. The `/confirm` page is just a holding screen — `onAuthStateChange` fires when the user clicks their confirmation email, which calls `loadUserData` and sets `user`, which triggers `PublicLayout` to redirect to `/home`.

**Key state and mutations:**

| Export | Description |
|---|---|
| `user` | Logged-in user object (normalized from `user_profiles`), or `null` |
| `pendingUser` | `{ email }` set after `register()`, cleared by `onAuthStateChange` |
| `initializing` | `true` until the session check resolves; `ProtectedLayout` returns `null` during this time |
| `isYearOfCat` | Boolean — whether today falls in a Vietnamese Year of the Cat (from `yearOfCat.js`) |
| `userEvents` | Events for current user where `deletedAt` is null (derived from `events`) |
| `deletedEvents` | Events for current user where `deletedAt` is set (the Litter Box) |
| `familyMembers` | Members from the `family_members` table for the current user's family account |
| `prefs` | `{ theme, showFederalHolidays, showInternationalHolidays, showFamilyEvents, showCatHolidays, showUsPopularHolidays }` |
| `catFact` / `catFactDate` | Daily cat fact — cached in `localStorage`; same fact returned all day, rotates on next-day page load |
| `familyAccountId` | `family_accounts.id` for the current user's family account, or `null` |
| `register(userData)` | Returns `{ success, error? }` |
| `login(usernameOrEmail, password)` | Resolves username → email via `get_email_by_username` RPC, then `signInWithPassword`; returns `{ success, error? }` |
| `logout()` | Calls `supabase.auth.signOut()`; state cleared by `onAuthStateChange` |
| `resetPassword(email)` | Sends Supabase password-reset email |
| `changePassword(newPw)` | Calls `supabase.auth.updateUser` with new password |
| `updateProfile(updates)` | Patches `user_profiles`; also calls `supabase.auth.updateUser` if `email` changes; returns `{ success, error? }` |
| `refreshProfile()` | Re-fetches `user_profiles` row and updates `user` state |
| `addEvent(eventData)` | Inserts into `user_events`; returns `{ success, event? }` |
| `updateEvent(id, updates)` | Updates `user_events` row; returns `{ success, error? }` |
| `deleteEvent(id)` | Sets `deleted_at` on the `user_events` row (soft delete); returns `{ success, error? }` |
| `restoreEvent(id)` | Clears `deleted_at` on a soft-deleted event; returns `{ success, error? }` |
| `emptyLitterBox()` | Hard-deletes all soft-deleted events for current user; returns `{ success, error? }` |
| `updatePrefs(updates)` | Merges into `prefs`; persists `theme` to `user_profiles.theme` and all toggle flags to `user_profiles.calendar_prefs` (JSONB) |
| `getDailyCatFact()` | Fetches from `cat-fact.herokuapp.com`; falls back to 10 hardcoded strings on network failure. Caches in `localStorage`; same fact returned all day. |
| `saveDailyCatFact(payload)` | Persists a JSONB `{ date, fact, img }` object to `user_profiles.daily_cat_fact` |
| `addFamilyMember(memberData)` | Creates `family_accounts` row if needed, then inserts into `family_members`; returns `{ success, member? }` |
| `removeFamilyMember(id)` | Deletes from `family_members`; returns `{ success, error? }` |

**Theme persistence:** `theme` is stored in `user_profiles.theme` and loaded on session restore. The special `year-of-cat` theme is automatically downgraded to `light` when `isCurrentlyYearOfCat()` returns false.

## Supabase tables

| Table | Key columns |
|---|---|
| `user_profiles` | `id`, `auth_id` (FK to `auth.users`), `username`, `name`, `preferred_name`, `email`, `phone_number`, `profile_pic`, `timezone`, `notifications_enabled`, `notification_method`, `is_family_account`, `theme`, `daily_cat_fact`, `calendar_prefs` (JSONB), `created_at` |
| `user_events` | `id`, `user_id` (FK to `user_profiles`), `name`, `date`, `start_time`, `end_time`, `event_type`, `notify_options`, `family_visible`, `note`, `image_url`, `deleted_at`, `created_at` |
| `family_accounts` | `id`, `owner_id` (FK to `user_profiles`) |
| `family_members` | `id`, `family_account_id`, `name`, `email`, `phone`, `notifications_enabled`, `created_at` |

RPC: `get_email_by_username(p_username)` — returns the email for a given username (used by `login()`).

A DB trigger on `auth.users` INSERT creates the `user_profiles` row from auth metadata. The `loadUserData` fallback re-creates it if the trigger failed due to RLS.

## Components (`src/components/`)

- **`Navbar.jsx`** — rendered by `ProtectedLayout`. Shows a Litter Box badge when `deletedEvents.length > 0`. Logout uses a three-state modal (`confirming` → `goodbye` / `staying`).
- **`KittyClock.jsx`** — SVG cat-face clock rendered on `CalendarPage`. Props: `clockTime`, `expanded`, `onToggle`. Collapsed shows sleepy eyes + digital HH:MM; expanded shows wide eyes + seconds hand + timezone.
- **`HttpCatImage.jsx`** — renders an `<img>` from `https://http.cat/{status}`. Falls back to 404 if the code isn't in the supported set (`httpCat.js`). Used by `LoginPage`, `EditEventPage`, and `ErrorPage`.
- **`CatImagePicker.jsx`** — lets users attach a cat image to an event. For `holiday`/`birthday` types, fetches a wild-cat photo (Unsplash) + animal fact (API Ninjas); for `other`, fetches a domestic-cat photo (The Cat API). Used by `AddEventPage` and `EditEventPage`.

## Lib utilities (`src/lib/`)

- **`supabase.js`** — Supabase JS client, reads `VITE_SUPABASE_*` env vars.
- **`httpCat.js`** — `HTTP_STATUS_MESSAGES` map and `HTTP_CAT_SUPPORTED` set. Import both when rendering HTTP status UI.
- **`yearOfCat.js`** — `isCurrentlyYearOfCat()` (boolean) and `getYearOfCatHoliday(calYear)` (returns holiday object or null). `CalendarPage` calls `getYearOfCatHoliday` when building its holiday list; `AppContext` calls `isCurrentlyYearOfCat` to guard the `year-of-cat` theme.

## CalendarPage details

Three views (`month`, `week`, `day`) with prev/next navigation; clicking a month or week cell drills into day view. Federal holidays computed dynamically per year via weekday-offset math (`getFederalHolidays`). International holidays are a hardcoded fixed-date list (`INTL_HOLIDAYS`). Both toggled via `prefs`. Vietnamese Year of the Cat start date added when `prefs.showCatHolidays` is on. A live clock ticks via `setInterval` and drives `KittyClock`.

**Holiday images** — static PNGs live in `src/assets/`:
- `federal-holidays/` — one image per US federal holiday (MLK Day, Presidents Day, Memorial Day, Juneteenth, Independence Day, Labor Day, Columbus Day, Veterans Day, Thanksgiving, Christmas, New Year's Day)
- `us-popular-holidays/` — one image per popular US holiday (Valentine's Day, St. Patrick's Day, Easter, April Fools, Cinco de Mayo, Mother's Day, Father's Day, Grandparents Day, Halloween, Thanksgiving, Christmas Eve, New Year's Eve, Black Friday, Cyber Monday, Earth Day, Groundhog Day)

## Event data shape

`{ id, userId, createdAt, name, date (YYYY-MM-DD), startTime, endTime, eventType ('holiday'|'birthday'|'other'), notifyOptions, familyVisible, note, imageUrl, deletedAt }`

## Styling

Global CSS in `src/index.css` and `src/App.css`. Theme applied by `data-theme` on `<html>`.

**CSS tokens** (all themes override these custom properties):

| Token | Role |
|---|---|
| `--bg` / `--bg-card` / `--bg-nav` | Page, surface, and nav backgrounds |
| `--text-primary` / `--text-secondary` | Body and muted text |
| `--accent-1` through `--accent-4` | Brand accents |
| `--danger` | Destructive actions |
| `--border` / `--shadow` | Borders and drop shadows |
| `--btn-primary-bg/text` / `--btn-danger-bg/text` | Button surfaces |
| `--radius-sm/md/lg` | Border radius scale |

Available themes (set in `ProfilePage`, applied by `updatePrefs`):

| Key | Aesthetic |
|---|---|
| `light` | Default — warm cream, sage green, gentle mauve (Beatrice Potter pastels) |
| `dark` | Dark backgrounds, same pastel accents |
| `rainbow` | Bold purples, electric teals, vivid pinks, bright gold |
| `meow-mixer` | Rich orange, dark green, tanned brown, deep earthy tones |
| `mewture` | Muted natural tones — soft earth, warm beige, quiet greens |
| `year-of-cat` | Special theme; auto-downgrades to `light` outside Vietnamese Year of the Cat dates |

Shared utility classes: `.btn`, `.btn-primary`, `.btn-secondary`, `.btn-danger`, `.btn-sm`, `.btn-lg`, `.btn-full`, `.card`, `.form-group`, `.form-error`, `.badge`, `.badge-event`, `.badge-holiday`, `.badge-birthday`, `.divider`, `.page-title`, `.page-subtitle`, `.cat-fact-banner`.

## Planned features not yet implemented

- Email / SMS notifications (toggle exists in `ProfilePage`; nothing is wired)
- Notification timing options (2 days prior, day-of)
- Allow Permissions page (currently a button stub on `HomePage`)

## Supabase CLI (run from `supabase/supabase/`)

```bash
npx supabase login
npx supabase link --project-ref ntazfxyuwzqoavsfvdmm   # re-link if needed
npx supabase migration new <name>   # create a new migration file
npx supabase db push                # push local migrations to remote
npx supabase db pull                # pull remote schema → baseline migration
```

Linked project: **Kitty Day Calendar** (ref `ntazfxyuwzqoavsfvdmm`, AWS us-east-1, Postgres 17.6). 14 migrations applied.

## Schema reference

`Client/skeleton/My_Schema_Example.sql` contains the original planned schema in MySQL backtick style with spaced names. The live Supabase schema diverges from this — treat it as historical context only. `supabase/reference/` has the ERD screenshot and authoritative UX/schema decisions.

## See also

- `Kitty_Day_Calender/CLAUDE.md` — frontend-scoped reference; **note:** may lag behind this file on recently added features
- `supabase/CLAUDE.md` — Supabase schema and RLS details
