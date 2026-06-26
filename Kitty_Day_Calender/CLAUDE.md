# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this app is

**Kitty Day Calendar** — a cat-themed calendar SPA. Users register, create events (`holiday` | `birthday` | `other`), and get a daily cat fact. Family accounts allow multiple profiles under one login. Supabase Auth + Postgres are fully integrated.

> **Authoritative reference:** `../CLAUDE.md` (Project_2 root) has more complete docs including Supabase tables, RPCs, and migration history. This file covers frontend-only context.

## Commands (run from this directory)

```bash
npm run dev        # Vite dev server at localhost:5173
npm run build      # Production build → dist/
npm run preview    # Serve the dist/ build locally
npm run lint       # ESLint
```

Playwright is configured. Tests live in `tests/`; `npm test` auto-starts the dev server.

```bash
npm test                                                                # run all tests (local dev server)
BASE_URL=https://kitty-day-calender.vercel.app npm test                # run against production

npx playwright test tests/auth-phases.spec.js   # 5-phase auth suite (requires TEST_USER / TEST_PASS env vars for phases 2–5)
npx playwright test tests/auth-callback.spec.js # email-confirm callback (hits Supabase signUp — rate-limited ~3/hr)
npx playwright test tests/crud-flow.spec.js     # login → create → edit → delete → logout
npx playwright test tests/password-reset.spec.js # password reset UI flow
npx playwright test --headed                    # run with browser visible
```

**Test gotchas:**
- `crud-flow.spec.js` — event names > 11 chars are truncated in calendar pill DOM text; use `.cal-pill[title="..."]` to match full names. Uses Day view (month view caps at 2 pills per cell).
- `auth-callback.spec.js` — hits Supabase's free-tier email rate limit. Disable email confirmation in Supabase → Authentication → Providers → Email to bypass during dev.

## Architecture

### Routing (`src/App.jsx`)
React Router DOM v7. Two layout wrappers:
- `PublicLayout` — redirects `user != null` → `/home`. `pendingUser` (mid-registration) does **not** trigger this redirect, so `/confirm` stays accessible.
- `ProtectedLayout` — redirects `user == null` → `/login`; renders `<Navbar>` + `<Outlet>`. Returns `null` while `initializing` is true to prevent flash-redirect.

Root `/` redirects to `/login`. Catch-all `*` renders `ErrorPage`.

| Path | Page | Notes |
|---|---|---|
| `/login` | `LoginPage` | Handles both login and register |
| `/confirm` | `ConfirmPage` | Email confirm step after register |
| `/reset-password` | `ResetPasswordPage` | Outside both layouts |
| `/home` | `HomePage` | |
| `/calendar` | `CalendarPage` | |
| `/events/new` | `AddEventPage` | Pre-fills `date` from `?date=YYYY-MM-DD` query param |
| `/events/:id/edit` | `EditEventPage` | |
| `/profile` | `ProfilePage` | User info + theme picker + notification prefs |
| `/family` | `FamilyPage` | |
| `/about` | `AboutPage` | |
| `/contact` | `ContactPage` | |
| `/litter-box` | `LitterBoxPage` | Soft-deleted events; badge count shown in Navbar |
| `/family/join` | `JoinFamilyPage` | Invite acceptance — outside both layouts; reads `?token=` query param |
| `/auth/callback` | `AuthCallbackPage` | Supabase email-confirm callback — outside both layouts |

### Global state (`src/context/AppContext.jsx`)
Single `AppContext`; `useApp()` is the only access point. All Supabase calls live here — pages never call `supabase` directly.

**DB snake_case ↔ camelCase:** `normalizeProfile`, `normalizeEvent`, and `normalizeMember` helpers convert DB rows to camelCase. When writing DB updates, map field names back to snake_case manually.

**Registration flow:** `register()` calls `supabase.auth.signUp`, sets `pendingUser` (not `user`), and navigates to `/confirm`. `onAuthStateChange` fires on email confirmation, calls `loadUserData`, sets `user`, and `PublicLayout` redirects to `/home`.

**Key exports:**

| Export | Description |
|---|---|
| `user` | Logged-in user object or `null` |
| `pendingUser` | Registered but not yet confirmed |
| `initializing` | `true` until session check resolves; `ProtectedLayout` returns `null` during this time |
| `isYearOfCat` | Boolean — whether today falls in a Vietnamese Year of the Cat (`yearOfCat.js`) |
| `userEvents` | Events for current user where `deletedAt` is null |
| `deletedEvents` | Soft-deleted events for current user (the Litter Box) |
| `sharedEvents` | Family-visible events from linked family account owners |
| `familyMembers` | Members from `family_members` table for current user's family account |
| `prefs` | `{ theme, showFederalHolidays, showInternationalHolidays, showFamilyEvents, showCatHolidays, showUsPopularHolidays }` |
| `catFact` / `catFactDate` | Daily cat fact — same fact all day, rotates on next-day page load |
| `register(userData)` | `supabase.auth.signUp`; sets `pendingUser`; returns `{ success, error? }` |
| `login(usernameOrEmail, password)` | Resolves username → email via `get_email_by_username` RPC, then `signInWithPassword`; returns `{ success, error? }` |
| `logout()` | `supabase.auth.signOut()`; state cleared by `onAuthStateChange` |
| `resetPassword(email)` | Sends Supabase password-reset email |
| `changePassword(newPw)` | Calls `supabase.auth.updateUser` with new password |
| `updateProfile(updates)` | Patches `user_profiles`; also calls `supabase.auth.updateUser` if `email` changes |
| `addEvent / updateEvent / deleteEvent / restoreEvent / emptyLitterBox` | Full CRUD on `user_events`; `deleteEvent` is a soft delete (`deleted_at`) |
| `updatePrefs(updates)` | Merges into `prefs`; persists `theme` to `user_profiles.theme` and toggles to `user_profiles.calendar_prefs` (JSONB) |
| `getDailyCatFact()` | Fetches from `cat-fact.herokuapp.com`; falls back to hardcoded strings on failure. Caches in `localStorage`. |
| `addFamilyMember` / `removeFamilyMember` | Creates `family_accounts` row if needed; inserts/deletes `family_members` |
| `generateInvite(memberId, email)` | Creates/reuses a pending `family_invites` row; returns `{ success, url? }` |
| `acceptInvite(token)` | Calls `accept_family_invite(p_token)` RPC; links `family_members.linked_user_id` to current user |

**Error return shape:** All async mutations return `{ success: bool, error?: string, status?: number }`. `status` is the Supabase HTTP status code — pass it to `<FormError>` to conditionally show an HTTP cat image alongside the error message.

### Event data shape

`{ id, userId, createdAt, name, date (YYYY-MM-DD), startTime, endTime, eventType ('holiday'|'birthday'|'other'), notifyOptions, familyVisible, note, imageUrl, imageCaption, deletedAt }`

### Components (`src/components/`)
- **`Navbar.jsx`** — rendered by `ProtectedLayout`. Shows a Litter Box badge when `deletedEvents.length > 0`. Logout uses a three-state modal (`confirming` → `goodbye` / `staying`).
- **`KittyClock.jsx`** — SVG cat-face clock on `CalendarPage`. Props: `clockTime`, `expanded`, `onToggle`. Collapsed: sleepy eyes + digital HH:MM; expanded: wide eyes + seconds hand + timezone.
- **`HttpCatImage.jsx`** — renders `<img>` from `https://http.cat/{status}`. Falls back to 404 if the code isn't in `HTTP_CAT_SUPPORTED` (`httpCat.js`). Used directly by `LoginPage`, `EditEventPage`, and `ErrorPage`; used indirectly via `FormError` everywhere else.
- **`FormError.jsx`** — shared error block: renders `HttpCatImage` when a Supabase HTTP status is available, then the error message. Props: `message` (string), `status` (number|null), `centered` (bool). Use this in pages — don't inline the `form-error-block` pattern.
- **`CatImagePicker.jsx`** — lets users attach a cat image to an event. For `holiday`/`birthday` fetches a wild-cat photo (Unsplash) + animal fact (API Ninjas `buildFact`); for `other` fetches a domestic-cat photo (The Cat API). `onChange(url, fact)` passes both image URL and fact string (stored as `imageCaption`). Used by `AddEventPage` and `EditEventPage`.

### CalendarPage details (`src/pages/CalendarPage.jsx`)
Three views (`month`, `week`, `day`) with prev/next navigation; clicking a month or week cell drills into day view. Federal holidays computed dynamically per year via weekday-offset math (`getFederalHolidays`). International holidays are a hardcoded fixed-date list (`INTL_HOLIDAYS`). Both toggled via `prefs`. A live clock ticks via `setInterval` and drives `KittyClock`.

Holiday images are static PNGs in `src/assets/federal-holidays/` and `src/assets/us-popular-holidays/`.

### Styling
Global CSS in `src/index.css` and `src/App.css`. Theme applied by `data-theme` on `<html>`.

**Available themes** (set via `updatePrefs`, stored in `user_profiles.theme`):

| Key | Aesthetic |
|---|---|
| `light` | Default — warm cream, sage green, gentle mauve |
| `dark` | Dark backgrounds, pastel accents |
| `rainbow` | Bold purples, electric teals, vivid pinks |
| `meow-mixer` | Rich orange, dark green, tanned brown |
| `mewture` | Muted natural tones — soft earth, warm beige |
| `year-of-cat` | Auto-downgrades to `light` outside Vietnamese Year of the Cat dates |

**`mix-blend-mode` gotcha:** Image classes that use `mix-blend-mode: multiply` (looks good on light/mewture) must also include a `mix-blend-mode: normal` override for the four dark themes (`dark`, `meow-mixer`, `rainbow`, `year-of-cat`) — otherwise images render nearly black. See the existing override blocks in `App.css` for `.cal-holiday-img`, `.oops-cat-img`, and `.scratch-confirm-img` as the pattern to follow.

**Shared utility classes:** `.btn`, `.btn-primary`, `.btn-secondary`, `.btn-danger`, `.btn-sm`, `.btn-lg`, `.btn-full`, `.card`, `.form-group`, `.form-error`, `.badge`, `.badge-event`, `.badge-holiday`, `.badge-birthday`, `.divider`, `.page-title`, `.page-subtitle`, `.cat-fact-banner`.

## Planned but not yet implemented

- Email / SMS notifications (toggle exists in `ProfilePage`; nothing is wired)
- Notification timing options (2 days prior, day-of)
- Allow Permissions page (button stub on `HomePage`)
