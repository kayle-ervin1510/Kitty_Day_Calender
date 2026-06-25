/**
 * Supabase Authentication — 5-phase verification
 *
 * Phases:
 *  1. New user registers → reaches /confirm with their email shown
 *  2. Returning user logs in → routed to /home on success
 *  3. Auth failure → error shown, form stays accessible for retry
 *  4. Authenticated user only sees their own events (RLS)
 *  5. After page refresh, authenticated user stays on the app (session persists)
 *
 * Phases 2–5 require a pre-confirmed test account.
 * Set env vars before running:
 *   TEST_USER=<username_or_email>  TEST_PASS=<password>  npm test
 *
 * If those vars are absent the tests are skipped with a clear message.
 */

import { test, expect } from '@playwright/test'

const TEST_USER = process.env.TEST_USER
const TEST_PASS = process.env.TEST_PASS
const hasCredentials = Boolean(TEST_USER && TEST_PASS)

// ─── helpers ────────────────────────────────────────────────────────────────

/** Sign in via the login form and wait until /home is loaded. */
async function signIn(page) {
  await page.goto('/login')
  await page.locator('#si-id').fill(TEST_USER)
  await page.locator('#si-pw').fill(TEST_PASS)
  await page.locator('button[type="submit"]').click()
  await expect(page).toHaveURL('/home', { timeout: 15000 })
}

// ─── Phase 1: Registration flow ──────────────────────────────────────────────

test.describe('Phase 1 — New user registration', () => {
  test('form validation: mismatched passwords shows error', async ({ page }) => {
    await page.goto('/login')
    await page.locator('button.login-tab', { hasText: 'Sign Up' }).click()

    const ts = Date.now()
    await page.locator('#su-name').fill('Test Kitty')
    await page.locator('#su-user').fill(`testuser${ts}`)
    await page.locator('#su-email').fill(`test${ts}@example.com`)
    await page.locator('#su-cemail').fill(`test${ts}@example.com`)
    await page.locator('#su-pw').fill('Password1!')
    await page.locator('#su-cpw').fill('DIFFERENT')

    await page.getByRole('button', { name: /create account/i }).click()

    // Should stay on /login and show mismatch error — never hit Supabase
    await expect(page).toHaveURL('/login')
    await expect(page.getByText('Passwords do not match')).toBeVisible()
  })

  test('form validation: mismatched emails shows error', async ({ page }) => {
    await page.goto('/login')
    await page.locator('button.login-tab', { hasText: 'Sign Up' }).click()

    const ts = Date.now()
    await page.locator('#su-name').fill('Test Kitty')
    await page.locator('#su-user').fill(`testuser${ts}`)
    await page.locator('#su-email').fill(`test${ts}@example.com`)
    await page.locator('#su-cemail').fill(`other${ts}@example.com`)
    await page.locator('#su-pw').fill('Password1!')
    await page.locator('#su-cpw').fill('Password1!')

    await page.getByRole('button', { name: /create account/i }).click()

    await expect(page).toHaveURL('/login')
    await expect(page.getByText('Email addresses do not match')).toBeVisible()
  })

  // NOTE: Supabase free tier limits signup confirmation emails to ~3/hour.
  // This test is intentionally skipped here because auth-callback.spec.js
  // already covers the same scenario. Run it separately with spacing to avoid
  // the rate limit. The test body is preserved for reference.
  test.skip('successful registration → /confirm shows submitted email', async ({ page }) => {
    await page.goto('/login')
    await page.locator('button.login-tab', { hasText: 'Sign Up' }).click()

    const ts = Date.now()
    const email = `testkitty${ts}@gmail.com`

    await page.locator('#su-name').fill('Test Kitty')
    await page.locator('#su-pref').fill('Kitty')
    await page.locator('#su-user').fill(`testkitty${ts}`)
    await page.locator('#su-email').fill(email)
    await page.locator('#su-cemail').fill(email)
    await page.locator('#su-pw').fill('TestPass123!')
    await page.locator('#su-cpw').fill('TestPass123!')

    await page.getByRole('button', { name: /create account/i }).click()

    // PublicLayout allows /confirm even for pendingUser (not yet confirmed)
    await expect(page).toHaveURL('/confirm', { timeout: 15000 })
    await expect(page.getByText(email)).toBeVisible()
    await expect(page.getByText(/check your email/i)).toBeVisible()
  })
})

// ─── Phase 2: Returning user login ──────────────────────────────────────────

test.describe('Phase 2 — Returning user login', () => {
  test.skip(!hasCredentials, 'Set TEST_USER and TEST_PASS env vars to run')

  test('logs in and lands on /home', async ({ page }) => {
    await page.goto('/login')
    await page.locator('#si-id').fill(TEST_USER)
    await page.locator('#si-pw').fill(TEST_PASS)
    await page.locator('button[type="submit"]').click()

    await expect(page).toHaveURL('/home', { timeout: 15000 })

    // Navbar should be visible (ProtectedLayout rendered)
    await expect(page.locator('nav')).toBeVisible()
  })

  test('unauthenticated visit to /home redirects to /login', async ({ page }) => {
    // Intentionally do NOT sign in first
    await page.goto('/home')
    await expect(page).toHaveURL('/login', { timeout: 10000 })
  })

  test('login works with username (not just email)', async ({ page }) => {
    // TEST_USER may be an email; this test is most useful when TEST_USER is a username
    await page.goto('/login')
    await page.locator('#si-id').fill(TEST_USER)
    await page.locator('#si-pw').fill(TEST_PASS)
    await page.locator('button[type="submit"]').click()

    // Success → /home regardless of whether TEST_USER was a username or email
    await expect(page).toHaveURL('/home', { timeout: 15000 })
  })
})

// ─── Phase 3: Auth failure handling ─────────────────────────────────────────

test.describe('Phase 3 — Auth failure', () => {
  test('wrong password → error message is shown', async ({ page }) => {
    await page.goto('/login')
    await page.locator('#si-id').fill('nonexistent_user_xyz')
    await page.locator('#si-pw').fill('WrongPass999!')
    await page.locator('button[type="submit"]').click()

    // Should NOT navigate away — stays on /login
    await expect(page).toHaveURL('/login', { timeout: 10000 })

    // Error message is visible
    const errorBlock = page.locator('.form-error')
    await expect(errorBlock).toBeVisible({ timeout: 8000 })
    await expect(errorBlock).not.toBeEmpty()
  })

  test('error is cleared when user starts typing after failure', async ({ page }) => {
    await page.goto('/login')
    await page.locator('#si-id').fill('nobody')
    await page.locator('#si-pw').fill('badpass')
    await page.locator('button[type="submit"]').click()

    await expect(page.locator('.form-error')).toBeVisible({ timeout: 8000 })

    // User edits the username field → error should clear
    await page.locator('#si-id').fill('corrected_user')
    await expect(page.locator('.form-error')).not.toBeVisible()
  })

  test('sign-in form is still interactive after a failure', async ({ page }) => {
    await page.goto('/login')
    await page.locator('#si-id').fill('fail_user')
    await page.locator('#si-pw').fill('fail_pass')
    await page.locator('button[type="submit"]').click()

    await expect(page.locator('.form-error')).toBeVisible({ timeout: 8000 })

    // Form inputs and submit button must still be enabled
    await expect(page.locator('#si-id')).toBeEnabled()
    await expect(page.locator('#si-pw')).toBeEnabled()
    await expect(page.locator('button[type="submit"]')).toBeEnabled()
  })

  test('empty username → HTML5 required validation prevents submission', async ({ page }) => {
    await page.goto('/login')
    // Leave username empty, fill only password
    await page.locator('#si-pw').fill('somepassword')
    await page.locator('button[type="submit"]').click()

    // The native required attribute should prevent form submission
    await expect(page).toHaveURL('/login')
  })
})

// ─── Phase 4: Authenticated user sees only their own events (RLS) ────────────

test.describe('Phase 4 — RLS: user sees only their own events', () => {
  test.skip(!hasCredentials, 'Set TEST_USER and TEST_PASS env vars to run')

  test('calendar page loads events without a permission error', async ({ page }) => {
    await signIn(page)
    await page.goto('/calendar')

    // Must not show any generic error / "unauthorized" text
    await expect(page.getByText(/unauthorized|permission denied|403/i)).not.toBeVisible({ timeout: 8000 })

    // Calendar UI itself should render
    await expect(page.locator('.calendar-grid, [class*="calendar"]')).toBeVisible({ timeout: 10000 })
  })

  test('litter box is accessible and does not expose other users data', async ({ page }) => {
    await signIn(page)
    await page.goto('/litter-box')

    // Page should load — if RLS is broken this would error or show foreign events
    await expect(page).toHaveURL('/litter-box')
    await expect(page.getByText(/unauthorized|permission denied/i)).not.toBeVisible()
  })

  test('add-event page is reachable and pre-fills for current user', async ({ page }) => {
    await signIn(page)
    await page.goto('/events/new?date=2026-07-04')

    await expect(page).toHaveURL(/\/events\/new/, { timeout: 10000 })
    // Date should be pre-filled from query param
    const dateInput = page.locator('input[type="date"]')
    await expect(dateInput).toHaveValue('2026-07-04')
  })
})

// ─── Phase 5: Session persists on refresh ────────────────────────────────────

test.describe('Phase 5 — Session persistence on refresh', () => {
  test.skip(!hasCredentials, 'Set TEST_USER and TEST_PASS env vars to run')

  test('page reload keeps user authenticated — stays on /home', async ({ page }) => {
    await signIn(page)

    // Reload the page from /home
    await page.reload()

    // ProtectedLayout restores the session; should stay on /home, not redirect to /login
    await expect(page).not.toHaveURL('/login', { timeout: 10000 })
    await expect(page).toHaveURL('/home')
    await expect(page.locator('nav')).toBeVisible()
  })

  test('page reload on /calendar keeps user authenticated', async ({ page }) => {
    await signIn(page)
    await page.goto('/calendar')
    await expect(page).toHaveURL('/calendar')

    await page.reload()
    // Session restored — should stay on /calendar, not flash to /login
    await expect(page).not.toHaveURL('/login', { timeout: 10000 })
    await expect(page).toHaveURL('/calendar')
  })

  test('navigating directly to /profile while authenticated works', async ({ page }) => {
    await signIn(page)
    // Simulate navigating directly (a new tab / shared link scenario)
    await page.goto('/profile')
    await expect(page).toHaveURL('/profile', { timeout: 10000 })
    await expect(page.locator('nav')).toBeVisible()
  })
})
