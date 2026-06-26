/**
 * Password reset flow — UI verification
 *
 * What this covers:
 *  1. "Forgot password?" button reveals the email form on LoginPage
 *  2. Submitting an invalid (non-email) value is blocked by the browser
 *  3. Submitting a well-formed email shows the success message
 *  4. /reset-password renders the new-password form
 *  5. Client-side validation errors on /reset-password (too short, mismatch)
 *
 * What this cannot cover:
 *  - Clicking the actual link Supabase emails (requires inbox access)
 *  - supabase.auth.updateUser succeeding with a real token
 *
 * Phase 3 (email submission) requires a real Supabase-registered email so the
 * API accepts the request and the success message appears.
 * Set TEST_EMAIL before running:
 *   TEST_EMAIL=you@example.com npm test tests/password-reset.spec.js
 * Without it, Phase 3 is skipped.
 */

import { test, expect } from '@playwright/test'

const TEST_EMAIL = process.env.TEST_EMAIL
const hasEmail   = Boolean(TEST_EMAIL)

// ─── Phase 1: Forgot-password form appears ──────────────────────────────────

test.describe('Phase 1 — Forgot password form', () => {
  test('clicking "Forgot password?" reveals the email input', async ({ page }) => {
    await page.goto('/login')

    // Form should be hidden to start
    await expect(page.locator('.forgot-form')).not.toBeVisible()

    // Click the toggle link
    await page.locator('text=Forgot password?').click()

    // Form and email input should now be visible
    await expect(page.locator('.forgot-form')).toBeVisible()
    await expect(page.locator('#forgot-email')).toBeVisible()
  })
})

// ─── Phase 2: Empty / malformed email is blocked ────────────────────────────

test.describe('Phase 2 — Email field validation', () => {
  test('submitting without an email does not call the API', async ({ page }) => {
    await page.goto('/login')
    await page.locator('text=Forgot password?').click()
    await expect(page.locator('.forgot-form')).toBeVisible()

    // Leave field empty and submit
    await page.locator('.forgot-form button[type="submit"]').click()

    // No success message — form is still there
    await expect(page.locator('#forgot-email')).toBeVisible()
    await expect(page.locator('text=Check your email')).not.toBeVisible()
  })

  test('submitting a non-email string does not proceed', async ({ page }) => {
    await page.goto('/login')
    await page.locator('text=Forgot password?').click()
    await page.locator('#forgot-email').fill('notanemail')
    await page.locator('.forgot-form button[type="submit"]').click()

    // Still on the form — no success message
    await expect(page.locator('text=Check your email')).not.toBeVisible()
  })
})

// ─── Phase 3: Valid email shows success message ──────────────────────────────

test.describe('Phase 3 — Reset email sent', () => {
  test.skip(!hasEmail, 'Set TEST_EMAIL=you@example.com to run this phase')

  test('submitting a registered email shows the confirmation message', async ({ page }) => {
    await page.goto('/login')
    await page.locator('text=Forgot password?').click()
    await page.locator('#forgot-email').fill(TEST_EMAIL)
    await page.locator('.forgot-form button[type="submit"]').click()

    // Wait for either success or error to appear so we can report what happened
    const success = page.locator('.form-success')
    const error   = page.locator('.forgot-form .form-error')

    await Promise.race([
      success.waitFor({ state: 'visible', timeout: 10000 }).catch(() => null),
      error.waitFor({ state: 'visible', timeout: 10000 }).catch(() => null),
    ])

    const errorText   = await error.isVisible()   ? await error.textContent()   : null
    const successText = await success.isVisible() ? await success.textContent() : null

    if (errorText) {
      throw new Error(`Reset password returned an error: "${errorText.trim()}"`)
    }
    if (!successText) {
      throw new Error('Neither a success nor an error message appeared — check the form submission.')
    }

    expect(successText).toContain('Check your email for a password reset link')
  })
})

// ─── Phase 4: /reset-password page renders ──────────────────────────────────

test.describe('Phase 4 — Reset password page', () => {
  test('page loads and shows the new-password form', async ({ page }) => {
    await page.goto('/reset-password')

    await expect(page.locator('h1', { hasText: 'Set New Password' })).toBeVisible()
    await expect(page.locator('#rp-pw')).toBeVisible()
    await expect(page.locator('#rp-cpw')).toBeVisible()
    await expect(page.locator('button[type="submit"]')).toBeVisible()
  })
})

// ─── Phase 5: /reset-password client-side validation ────────────────────────

test.describe('Phase 5 — New password validation', () => {
  test('password shorter than 6 characters shows an error', async ({ page }) => {
    await page.goto('/reset-password')
    await page.locator('#rp-pw').fill('abc')
    await page.locator('#rp-cpw').fill('abc')
    await page.locator('button[type="submit"]').click()

    await expect(
      page.locator('text=Password must be at least 6 characters')
    ).toBeVisible()
  })

  test('mismatched passwords shows an error', async ({ page }) => {
    await page.goto('/reset-password')
    await page.locator('#rp-pw').fill('correctpassword')
    await page.locator('#rp-cpw').fill('differentpassword')
    await page.locator('button[type="submit"]').click()

    await expect(
      page.locator('text=Passwords do not match')
    ).toBeVisible()
  })
})
