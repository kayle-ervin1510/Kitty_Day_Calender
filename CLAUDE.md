# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this app is

**Kitty Day Calendar** — a cat-themed calendar SPA. Users register, create events, and get a daily cat fact. Events are typed as holiday, birthday, or other. Family accounts allow multiple profiles under one login. HTTP error states show cat-coordinated images. Notifications can be sent via email or SMS (planned — not yet wired).

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
│   │   ├── context/AppContext.jsx  # All global state (in-memory, no persistence yet)
│   │   ├── components/Navbar.jsx   # Only shared component
│   │   └── pages/              # One file per route (see Routing section)
│   └── package.json
└── Main/supabase/              # Backend placeholder — empty, not yet configured
```

## Commands (run from `Kitty_Day_Calender/`)

```bash
npm run dev        # Vite dev server at localhost:5173
npm run build      # Production build → dist/
npm run preview    # Serve the dist/ build locally
npm run lint       # ESLint
```

No test runner is configured.

## Tech stack

- **Frontend:** React 19 + Vite 8 + React Router DOM v7, plain CSS
- **Backend:** Supabase (Postgres + Auth) — planned, not yet integrated
- **External API:** Animals API — cat images for event notices, profile pictures, error pages — planned, not yet integrated

## Routing (`src/App.jsx`)

Two layout wrappers:
- `PublicLayout` — redirects authenticated users (`user != null`) to `/home`
- `ProtectedLayout` — redirects unauthenticated users to `/login`; renders `<Navbar>` + `<Outlet>`

| Path | Page | Notes |
|---|---|---|
| `/login` | `LoginPage` | Handles both login and register; public |
| `/confirm` | `ConfirmPage` | Email confirm step after register; public |
| `/home` | `HomePage` | Landing after login |
| `/calendar` | `CalendarPage` | Full calendar UI |
| `/events/new` | `AddEventPage` | Pre-fills `date` from `?date=YYYY-MM-DD` query param |
| `/events/:id/edit` | `EditEventPage` | |
| `/profile` | `ProfilePage` | User info + theme picker + notification prefs |
| `/family` | `FamilyPage` | Add/remove family members |
| `/about` | `AboutPage` | Static about page |
| `/contact` | `ContactPage` | Support contact info |
| `/litter-box` | `LitterBoxPage` | Soft-deleted events; badge count shown in Navbar |
| `*` | `ErrorPage` | Cat-themed 404 |

Root `/` redirects to `/login`.

## Global state (`src/context/AppContext.jsx`)

**All state is in-memory** — nothing persists to Supabase yet. `useApp()` is the only access point.

**Registration flow:** `register()` validates for duplicate username/email, creates a user object, and sets `pendingUser` (not `user`). The `/confirm` page calls `confirmRegistration()`, which promotes `pendingUser` → `user` and clears `pendingUser`. `PublicLayout` only redirects on `user`, so `/confirm` stays accessible mid-registration.

**Key state and mutations:**

| Export | Description |
|---|---|
| `user` | Logged-in user object, or `null` |
| `pendingUser` | Registered but not yet confirmed |
| `userEvents` | Events belonging to the current user (derived from `events`) |
| `deletedEvents` | Soft-deleted events for current user (the "Litter Box") |
| `prefs` | `{ theme, showFederalHolidays, showInternationalHolidays, showFamilyEvents }` |
| `catFact` / `catFactDate` | Daily cat fact (locked one per calendar day; resets on page refresh) |
| `register(userData)` | Returns `{ success, error? }` |
| `confirmRegistration()` | Promotes `pendingUser` → `user` |
| `login(usernameOrEmail, password)` | Returns `{ success, error? }` |
| `logout()` | Clears `user` and `pendingUser` |
| `updateProfile(updates)` | Patches `user` and syncs into `users` array |
| `addEvent(eventData)` | Assigns `id`, `userId`, `createdAt`; returns the new event |
| `updateEvent(id, updates)` | Patches by id |
| `deleteEvent(id)` | Moves to `deletedEvents` with `deletedAt` timestamp |
| `emptyLitterBox()` | Permanently removes current user's deleted events |
| `updatePrefs(updates)` | Merges into `prefs`; if `theme` changes, sets `data-theme` on `document.documentElement` |
| `getDailyCatFact()` | Returns same fact for the day; rotates at midnight |
| `addFamilyMember` / `removeFamilyMember` | Manages `familyMembers` array |

**Cat facts** are a hardcoded array of 20 strings inside `AppContext.jsx` — the Animals API is not yet integrated.

**Profile pictures** are stored as emoji (`🐱`) — the Animals API picker is not yet implemented.

## Components (`src/components/`)

- **`Navbar.jsx`** — rendered by `ProtectedLayout`. Shows a Litter Box badge when `deletedEvents.length > 0`. Logout uses a three-state modal (`confirming` → `goodbye` / `staying`).
- **`KittyClock.jsx`** — SVG cat-face clock on `CalendarPage`. Props: `clockTime`, `expanded`, `onToggle`. Collapsed: sleepy eyes + digital HH:MM; expanded: wide eyes + seconds hand + timezone.

## Calendar page details

`CalendarPage` implements three views (`month`, `week`, `day`) with prev/next navigation. Clicking a month or week cell drills into day view. Federal holidays are computed dynamically per year using weekday-offset math; international holidays are a hardcoded fixed-date list. Both are toggled via `prefs.showFederalHolidays` / `prefs.showInternationalHolidays`. A live clock ticks every second via `setInterval` and drives `KittyClock`.

## Event data shape

Events stored by `addEvent` include: `id`, `userId`, `createdAt`, `name`, `date` (YYYY-MM-DD string), `startTime`, `endTime`, `eventType` (`'holiday'` | `'birthday'` | `'other'`), `notifyOptions`, `familyVisible`, `note`.

## Styling

Global CSS in `src/index.css` and `src/App.css`. Theme is applied by setting the `data-theme` attribute on `<html>` via `updatePrefs({ theme })`.

All themes override these CSS custom properties:

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

| Theme key | Aesthetic |
|---|---|
| `light` | Default — warm cream, sage green, gentle mauve (Beatrice Potter pastels) |
| `dark` | Dark backgrounds, same pastel accents |
| `rainbow` | Bold purples, electric teals, vivid pinks, bright gold |
| `meow-mixer` | Rich orange, dark green, tanned brown, deep earthy tones |
| `mewture` | Muted natural tones — soft earth, warm beige, quiet greens |

Shared utility classes: `.btn`, `.btn-primary`, `.btn-secondary`, `.btn-danger`, `.btn-sm`, `.btn-lg`, `.btn-full`, `.card`, `.form-group`, `.form-error`, `.badge`, `.badge-event`, `.badge-holiday`, `.badge-birthday`, `.divider`, `.page-title`, `.page-subtitle`, `.cat-fact-banner`.

## Planned features not yet implemented

- Supabase Auth + Postgres persistence (all state is in-memory)
- Animals API integration (cat images for events, profile pictures, error pages)
- Email / SMS notifications
- Notification timing options (2 days prior, day-of)
- Allow Permissions page (currently a button stub on `HomePage`)

## Schema reference

`Client/skeleton/My_Schema_Example.sql` contains the planned schema in MySQL backtick style with spaced names. When implementing the Supabase schema, convert all identifiers to snake_case and use Supabase Auth for the `Login/Signup` table equivalent.

## See also

`Kitty_Day_Calender/CLAUDE.md` is a more detailed reference scoped to the frontend directory — use it when working inside `Kitty_Day_Calender/src/`.
