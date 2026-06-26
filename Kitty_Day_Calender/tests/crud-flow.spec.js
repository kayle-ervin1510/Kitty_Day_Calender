/**
 * Core CRUD + auth flow
 *
 * Covers, in order:
 *  1. Login
 *  2. Create an event
 *  3. Edit the event
 *  4. Delete the event (soft-delete → Litter Box)
 *  5. Logout
 *
 * Run with:
 *   npx playwright test tests/crud-flow.spec.js
 */

import { test, expect } from '@playwright/test'

const EMAIL    = 'racecarslazersarrowplanes@gmail.com'
const PASSWORD = 'desperateNESTHENS*'

const EVENT_NAME    = 'Playwright Test Event'
const EVENT_EDITED  = 'Playwright Test Event (Edited)'
const EVENT_DATE    = '2026-12-25'

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

// ─── 2. Create event ─────────────────────────────────────────────────────────

test('2 — create a new event', async ({ page }) => {
  await signIn(page)
  await page.goto('/events/new')

  await page.locator('#ev-name').fill(EVENT_NAME)
  await page.locator('#ev-date').fill(EVENT_DATE)

  // Pick event type "other" (safe default — no image picker required)
  await page.locator('.event-type-btn', { hasText: /other/i }).click()

  await page.locator('button', { hasText: 'Create Event!' }).click()

  // Success screen appears
  await expect(page.locator('.event-saved-screen')).toBeVisible({ timeout: 10000 })
})

// ─── 3. Edit event ───────────────────────────────────────────────────────────

test('3 — edit the event name', async ({ page }) => {
  await signIn(page)

  // Navigate to the calendar day view for the event date so we can find it
  await page.goto(`/calendar?date=${EVENT_DATE}`)

  // Click through to day view containing our event
  const editBtn = page.locator('.cal-day-event-row', { hasText: EVENT_NAME })
    .locator('a, button', { hasText: 'Edit Event' })
  await editBtn.waitFor({ timeout: 10000 })
  await editBtn.click()

  await expect(page).toHaveURL(/\/events\/.*\/edit/, { timeout: 10000 })

  // Clear and retype the name
  await page.locator('#ev-name').fill('')
  await page.locator('#ev-name').fill(EVENT_EDITED)

  await page.locator('button', { hasText: 'Save Changes' }).click()

  // Success screen
  await expect(page.locator('.event-saved-screen')).toBeVisible({ timeout: 10000 })
})

// ─── 4. Delete event ─────────────────────────────────────────────────────────

test('4 — delete the event (soft-delete to Litter Box)', async ({ page }) => {
  await signIn(page)

  await page.goto(`/calendar?date=${EVENT_DATE}`)

  const editBtn = page.locator('.cal-day-event-row', { hasText: EVENT_EDITED })
    .locator('a, button', { hasText: 'Edit Event' })
  await editBtn.waitFor({ timeout: 10000 })
  await editBtn.click()

  await expect(page).toHaveURL(/\/events\/.*\/edit/, { timeout: 10000 })

  // Click Delete Event, then confirm in the modal
  await page.locator('button', { hasText: 'Delete Event' }).click()
  await page.locator('.logout-modal button', { hasText: 'Yes, delete it' }).click()

  // Success / redirect — event is gone, we should leave the edit page
  await expect(page).not.toHaveURL(/\/events\/.*\/edit/, { timeout: 10000 })

  // Confirm the event is no longer on the calendar day
  await page.goto(`/calendar?date=${EVENT_DATE}`)
  await expect(
    page.locator('.cal-day-event-row', { hasText: EVENT_EDITED })
  ).not.toBeVisible()
})

// ─── 5. Logout ───────────────────────────────────────────────────────────────

test('5 — logout returns to login page', async ({ page }) => {
  await signIn(page)

  // Open the nav menu / logout button
  await page.locator('button', { hasText: /logout|sign out|log out/i }).first().click()

  // Confirm in the three-state modal
  const confirmBtn = page.locator('.logout-modal button', { hasText: /yes|logout|sign out|goodbye/i }).first()
  if (await confirmBtn.isVisible({ timeout: 3000 }).catch(() => false)) {
    await confirmBtn.click()
  }

  await expect(page).toHaveURL('/login', { timeout: 10000 })
})
