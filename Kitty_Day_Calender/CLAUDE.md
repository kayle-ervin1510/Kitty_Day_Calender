# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this app is

**Kitty Day Calendar** — a cat-themed calendar SPA. Users register, create events (`holiday` | `birthday` | `other`), and get a daily cat fact. Family accounts allow multiple profiles under one login. Supabase Auth + Postgres are fully integrated.

## Commands (run from this directory)

```bash
npm run dev        # Vite dev server at localhost:5173
npm run build      # Production build → dist/
npm run preview    # Serve the dist/ build locally
npm run lint       # ESLint
```

Playwright is configured. Tests live in `tests/`; `npm test` auto-starts the dev server.

## Architecture

### Routing (`src/App.jsx`)
React Router DOM v7. Two layout wrappers:
- `PublicLayout` — redirects `user != null` → `/home`. `pendingUser` (mid-registration) does **not** trigger this redirect, so `/confirm` stays accessible.
- `ProtectedLayout` — redirects `user == null` → `/login`; renders `<Navbar>` + `<Outlet>`

Root `/` redirects to `/login`. Catch-all `*` renders `ErrorPage`.

| Path | Page |
|---|---|
| `/login` | `LoginPage` — handles both login and register |
| `/confirm` | `ConfirmPage` — email confirm step after register |
| `/home` | `HomePage` |
| `/calendar` | `CalendarPage` |
| `/events/new` | `AddEventPage` — pre-fills `date` from `?date=YYYY-MM-DD` query param |
| `/events/:id/edit` | `EditEventPage` |
| `/profile` | `ProfilePage` — user info + theme picker + notification prefs |
| `/family` | `FamilyPage` |
| `/about` | `AboutPage` |
| `/contact` | `ContactPage` |
| `/litter-box` | `LitterBoxPage` — soft-deleted events; badge count shown in Navbar |

### Global state (`src/context/AppContext.jsx`)
Single `AppContext`; `useApp()` is the only access point. All Supabase calls live here — pages never call `supabase` directly.

**DB snake_case ↔ camelCase:** `normalizeProfile`, `normalizeEvent`, and `normalizeMember` helpers convert DB rows to camelCase. When writing DB updates, map field names back to snake_case manually.

**Registration flow:** `register()` calls `supabase.auth.signUp`, sets `pendingUser` (not `user`), and navigates to `/confirm`. `onAuthStateChange` fires on email confirmation, calls `loadUserData`, sets `user`, and `PublicLayout` redirects to `/home`.

**Key exports:**

| Export | Description |
|---|---|
| `user` | Logged-in user object or `null` |
| `pendingUser` | Registered but not yet confirmed |
| `userEvents` | Events for current user (derived from `events`) |
| `deletedEvents` | Soft-deleted events for current user (the Litter Box) |
| `prefs` | `{ theme, showFederalHolidays, showInternationalHolidays, showFamilyEvents }` |
| `catFact` / `catFactDate` | Daily cat fact — same fact all day, randomised on page refresh |
| `register(userData)` | `supabase.auth.signUp`; sets `pendingUser`; returns `{ success, error? }` |
| `login(usernameOrEmail, password)` | Resolves username → email via `get_email_by_username` RPC, then `signInWithPassword`; returns `{ success, error? }` |
| `logout()` | `supabase.auth.signOut()`; state cleared by `onAuthStateChange` |
| `updateProfile(updates)` | Patches `user_profiles`; also calls `supabase.auth.updateUser` if `email` changes |
| `addEvent / updateEvent / deleteEvent / restoreEvent / emptyLitterBox` | Full CRUD on `user_events`; `deleteEvent` is a soft delete (`deleted_at`) |
| `updatePrefs(updates)` | Merges into `prefs`; if `theme` changes, sets `data-theme` on `<html>` — **in-memory only, not persisted** |
| `getDailyCatFact()` | Returns same fact for the day within a session; rotates on page refresh |
| `addFamilyMember` / `removeFamilyMember` | Creates `family_accounts` row if needed; inserts/deletes `family_members` |

Cat facts are a hardcoded array of 20 strings inside `AppContext.jsx`.

### Event data shape

`{ id, userId, createdAt, name, date (YYYY-MM-DD), startTime, endTime, eventType, notifyOptions, familyVisible, note }`

### Components (`src/components/`)
- **`Navbar.jsx`** — shared nav bar rendered by `ProtectedLayout`. Shows a Litter Box badge when `deletedEvents.length > 0`. Logout uses a three-state modal (`confirming` → `goodbye` / `staying`).
- **`KittyClock.jsx`** — SVG cat-face clock rendered on `CalendarPage`. Receives `clockTime`, `expanded`, and `onToggle` props. Collapsed shows sleepy eyes + digital HH:MM; expanded shows wide eyes + seconds hand + timezone.

### CalendarPage details (`src/pages/CalendarPage.jsx`)
Three views (`month`, `week`, `day`) with prev/next navigation; clicking a month or week cell drills into day view. Federal holidays are computed dynamically per year via weekday-offset math (`getFederalHolidays`). International holidays are a hardcoded fixed-date list (`INTL_HOLIDAYS`). Both are toggled via `prefs`. A live clock ticks via `setInterval` and drives the `KittyClock` component.

### Styling
Global CSS in `src/index.css` and `src/App.css`. Theme applied by `data-theme` on `<html>`.

**CSS tokens** (all themes override these custom properties):

| Token | Role |
|---|---|
| `--bg` | Page background |
| `--bg-card` | Card / surface background |
| `--bg-nav` | Navbar background |
| `--text-primary` / `--text-secondary` | Body and muted text |
| `--accent-1` through `--accent-4` | Brand accent colours |
| `--danger` | Destructive actions |
| `--border` / `--shadow` | Borders and drop shadows |
| `--btn-primary-bg/text` / `--btn-danger-bg/text` | Button surfaces |
| `--radius-sm/md/lg` | Border radius scale |

**Available themes:**

| Key | Aesthetic |
|---|---|
| `light` | Default — warm cream, sage green, gentle mauve (Beatrice Potter pastels) |
| `dark` | Dark backgrounds, same pastel accents |
| `rainbow` | Bold purples, electric teals, vivid pinks, bright gold |
| `meow-mixer` | Rich orange, dark green, tanned brown, deep earthy tones |
| `mewture` | Muted natural tones — soft earth, warm beige, quiet greens |

**Shared utility classes:** `.btn`, `.btn-primary`, `.btn-secondary`, `.btn-danger`, `.btn-sm`, `.btn-lg`, `.btn-full`, `.card`, `.form-group`, `.form-error`, `.badge`, `.badge-event`, `.badge-holiday`, `.badge-birthday`, `.divider`, `.page-title`, `.page-subtitle`, `.cat-fact-banner`.

## Planning docs

Design reference lives in `../Client/skeleton/`:
- `style_guide.md` — colour/theme brief
- `app_guide.md` / `app_info.md` — feature goals and UX decisions
- `user_journey.md` / `user_stories.md` — user flows
- `My_Schema_Example.sql` — planned schema (MySQL backtick style; convert to snake_case for Supabase)

## Planned but not yet implemented

- Animals API integration (cat images for events, profile pictures, `ErrorPage`)
- Email / SMS notifications (toggle exists in `ProfilePage`; nothing is wired)
- Notification timing options (2 days prior, day-of)
- Allow Permissions page (button stub on `HomePage`)
- `prefs` persistence to Supabase
