import { test, expect } from '@playwright/test'

// These tests verify the /auth/callback route — the handler that processes
// Supabase email confirmation links. When a user clicks "Confirm Email" in
// their inbox, Supabase redirects them to:
//   http://localhost:5173/auth/callback?code=<one-time-code>
//
// Without this route the app had no way to exchange the code for a session,
// so confirmation silently failed.

test.describe('/auth/callback — email confirmation handler', () => {

  test('no code param → redirects to /login', async ({ page }) => {
    await page.goto('/auth/callback')
    await expect(page).toHaveURL('/login')
  })

  test('invalid/expired code → shows error card, not a crash', async ({ page }) => {
    await page.goto('/auth/callback?code=invalid-code-that-supabase-will-reject')

    // Loading state appears first
    await expect(page.getByText('Confirming your account')).toBeVisible()

    // Supabase rejects the bad code; error card should appear
    await expect(page.getByText('Confirmation Failed')).toBeVisible({ timeout: 10000 })
    await expect(page.getByText(/expired|already used/i)).toBeVisible()
    await expect(page.getByRole('button', { name: /back to login/i })).toBeVisible()
  })

  test('error card "Back to Login" button navigates to /login', async ({ page }) => {
    await page.goto('/auth/callback?code=invalid-code-that-supabase-will-reject')
    await expect(page.getByText('Confirmation Failed')).toBeVisible({ timeout: 10000 })

    await page.getByRole('button', { name: /back to login/i }).click()
    await expect(page).toHaveURL('/login')
  })

  // NOTE: Supabase free tier limits signup confirmation emails to ~3/hour.
  // This test will fail with "email rate limit exceeded" if run too frequently.
  // Run it manually or in CI with sufficient spacing between runs.
  // To bypass for dev: temporarily disable email confirmation in
  // Supabase → Authentication → Providers → Email → "Confirm email" toggle.
  test('registration flow reaches /confirm and shows the email address', async ({ page }) => {
    await page.goto('/login')

    // Switch to the Sign Up tab (.login-tab — not the "Sign up here" inline link)
    await page.locator('button.login-tab', { hasText: 'Sign Up' }).click()

    const timestamp = Date.now()
    const testEmail = `testkitty${timestamp}@gmail.com`

    await page.locator('#su-name').fill('Test Kitty')
    await page.locator('#su-pref').fill('Kitty')
    await page.locator('#su-user').fill(`testkitty${timestamp}`)
    await page.locator('#su-email').fill(testEmail)
    await page.locator('#su-cemail').fill(testEmail)
    await page.locator('#su-pw').fill('TestPass123!')
    await page.locator('#su-cpw').fill('TestPass123!')

    await page.getByRole('button', { name: /create account/i }).click()

    // Should land on /confirm and display the submitted email
    await expect(page).toHaveURL('/confirm', { timeout: 15000 })
    await expect(page.getByText(testEmail)).toBeVisible()
    await expect(page.getByText(/check your email/i)).toBeVisible()
  })

})
