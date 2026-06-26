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

  // AddEventPage shows the success screen immediately (addEvent is fire-and-forget)
  await expect(page.locator('.event-saved-screen')).toBeVisible({ timeout: 10000 })

  // Wait for auto-navigation + pill to appear, confirming the Supabase insert completed
  await expect(page).toHaveURL('/calendar', { timeout: 10000 })
  await expect(page.locator(`.cal-pill[title="${EVENT_NAME}"]`).first()).toBeVisible({ timeout: 10000 })

  // ── Edit ────────────────────────────────────────────────────────────────────
  await page.locator(`.cal-pill[title="${EVENT_NAME}"]`).first().click()

  const editBtn = page.locator('.cal-day-event-row', { hasText: EVENT_NAME })
    .locator('button', { hasText: 'Edit Event' }).first()
  await editBtn.waitFor({ timeout: 10000 })
  await editBtn.click()

  await expect(page).toHaveURL(/\/events\/.*\/edit/, { timeout: 10000 })
  await page.locator('#ev-name').fill('')
  await page.locator('#ev-name').fill(EVENT_EDITED)
  await page.locator('button', { hasText: 'Save Changes' }).click()

  // EditEventPage navigates directly to /calendar on save (no success screen).
  // Wait for the renamed pill — confirms the Supabase update completed.
  await expect(page).toHaveURL('/calendar', { timeout: 10000 })
  await expect(page.locator(`.cal-pill[title="${EVENT_EDITED}"]`).first()).toBeVisible({ timeout: 10000 })

  // ── Delete ───────────────────────────────────────────────────────────────────
  await page.locator(`.cal-pill[title="${EVENT_EDITED}"]`).first().click()

  const deleteEditBtn = page.locator('.cal-day-event-row', { hasText: EVENT_EDITED })
    .locator('button', { hasText: 'Edit Event' }).first()
  await deleteEditBtn.waitFor({ timeout: 10000 })
  await deleteEditBtn.click()

  await expect(page).toHaveURL(/\/events\/.*\/edit/, { timeout: 10000 })
  await page.locator('button', { hasText: 'Delete Event' }).click()
  await page.locator('.logout-modal button', { hasText: 'Yes, delete it' }).click()

  // EditEventPage shows a success/goodbye screen then navigates to /calendar
  await expect(page.locator('.event-saved-screen')).toBeVisible({ timeout: 10000 })
  await expect(page).toHaveURL('/calendar', { timeout: 10000 })

  // Confirm the pill is gone
  await expect(page.locator(`.cal-pill[title="${EVENT_EDITED}"]`)).not.toBeVisible({ timeout: 5000 })
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
