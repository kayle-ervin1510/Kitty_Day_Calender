/**
 * Core CRUD + auth flow
 *
 * Tests:
 *  1. Login
 *  2. Create → Edit → Delete (single browser session; avoids cross-test state issues)
 *  3. Logout
 *
 * Run with:
 *   BASE_URL=https://kitty-day-calender.vercel.app npx playwright test tests/crud-flow.spec.js
 *
 * NOTE: Event names > 11 chars are truncated in calendar pill DOM text.
 *       Use the `title` attribute selector (.cal-pill[title="..."]) to match full names.
 *       CalendarPage: e.name.length > 11 ? e.name.slice(0, 10) + '…' : e.name
 *
 * NOTE: addEvent and updateEvent are fire-and-forget in AddEventPage / EditEventPage.
 *       Tests confirm the DB write completed by waiting for the pill to appear on the
 *       calendar before ending that browser step.
 */

import { test, expect } from '@playwright/test'

const EMAIL    = 'racecarslazersarrowplanes@gmail.com'
const PASSWORD = 'desperateNESTHENS*'

// Fixed names — Playwright re-evaluates module-level code per test (separate
// browser contexts), so Date.now() would give different IDs across tests.
// Using fixed names + .first() handles any leftover events from prior runs.
const EVENT_NAME   = 'PW CRUD Test'
const EVENT_EDITED = 'PW CRUD Test (Edited)'

const today = new Date()
const EVENT_DATE = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`

// ─── helpers ────────────────────────────────────────────────────────────────

async function signIn(page) {
  await page.goto('/login')
  await page.locator('#si-id').fill(EMAIL)
  await page.locator('#si-pw').fill(PASSWORD)
  await page.locator('button[type="submit"]').first().click()
  await expect(page).toHaveURL('/home', { timeout: 15000 })
}

// ─── 1. Login ────────────────────────────────────────────────────────────────

test('1 — login with valid credentials reaches /home', async ({ page }) => {
  await signIn(page)
  await expect(page.locator('text=Welcome to Kitty Day Calendar')).toBeVisible()
})

// ─── 2. Create → Edit → Delete ───────────────────────────────────────────────
// Kept in one test to share the browser context and avoid cross-test state issues
// with fire-and-forget addEvent / updateEvent calls.

test('2 — create, edit, and delete an event', async ({ page }) => {
  await signIn(page)

  // ── Create ──────────────────────────────────────────────────────────────────
  // Pass ?date= so AddEventPage pre-fills the date via its URL-param logic —
  // avoids unreliable fill() on <input type="date"> in Playwright.
  await page.goto(`/events/new?date=${EVENT_DATE}`)
  await page.locator('#ev-name').fill(EVENT_NAME)
  await page.locator('button', { hasText: 'Regular event' }).click()
  await page.locator('button', { hasText: 'Create Event!' }).click()

  // AddEventPage now awaits addEvent before showing the success screen
  await expect(page.locator('.event-saved-screen')).toBeVisible({ timeout: 10000 })

  // Wait for auto-navigation to /calendar
  await expect(page).toHaveURL('/calendar', { timeout: 10000 })

  // The month view only renders the first 2 pills per cell — when prior test
  // runs have left >2 events on today's date, the new pill is hidden behind "+N".
  // Switch to Day view to see ALL events without the 2-pill limit.
  await page.getByRole('button', { name: 'Day', exact: true }).click()
  const createdRow = page.locator('.cal-day-event-row', { hasText: EVENT_NAME }).first()
  await createdRow.waitFor({ timeout: 10000 })

  // ── Edit ────────────────────────────────────────────────────────────────────
  const editBtn = createdRow.locator('button', { hasText: 'Edit Event' })
  await editBtn.click()

  await expect(page).toHaveURL(/\/events\/.*\/edit/, { timeout: 10000 })
  await page.locator('#ev-name').fill('')
  await page.locator('#ev-name').fill(EVENT_EDITED)
  await page.locator('button', { hasText: 'Save Changes' }).click()

  // EditEventPage navigates directly to /calendar on save (no success screen)
  await expect(page).toHaveURL('/calendar', { timeout: 10000 })

  // Back to Day view to confirm the rename and find the event for deletion
  await page.getByRole('button', { name: 'Day', exact: true }).click()
  const editedRow = page.locator('.cal-day-event-row', { hasText: EVENT_EDITED }).first()
  await editedRow.waitFor({ timeout: 10000 })

  // ── Delete ───────────────────────────────────────────────────────────────────
  const deleteEditBtn = editedRow.locator('button', { hasText: 'Edit Event' })
  await deleteEditBtn.click()

  await expect(page).toHaveURL(/\/events\/.*\/edit/, { timeout: 10000 })
  await page.locator('button', { hasText: 'Delete Event' }).click()
  await page.locator('.logout-modal button', { hasText: 'Yes, delete it' }).click()

  // EditEventPage shows a goodbye screen then auto-navigates to /calendar
  await expect(page.locator('.event-saved-screen')).toBeVisible({ timeout: 10000 })
  await expect(page).toHaveURL('/calendar', { timeout: 10000 })

  // Confirm the event is gone from Day view
  await page.getByRole('button', { name: 'Day', exact: true }).click()
  await expect(
    page.locator('.cal-day-event-row', { hasText: EVENT_EDITED })
  ).not.toBeVisible({ timeout: 5000 })
})

// ─── 3. Logout ───────────────────────────────────────────────────────────────

test('3 — logout returns to login page', async ({ page }) => {
  await signIn(page)

  await page.locator('button', { hasText: /logout|sign out|log out/i }).first().click()

  const confirmBtn = page.locator('.logout-modal button', { hasText: /yes|logout|sign out|goodbye/i }).first()
  if (await confirmBtn.isVisible({ timeout: 3000 }).catch(() => false)) {
    await confirmBtn.click()
  }

  await expect(page).toHaveURL('/login', { timeout: 10000 })
})
