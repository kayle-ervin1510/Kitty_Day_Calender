# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: auth-callback.spec.js >> /auth/callback — email confirmation handler >> registration flow reaches /confirm and shows the email address
- Location: tests/auth-callback.spec.js:43:3

# Error details

```
Error: expect(page).toHaveURL(expected) failed

Expected: "http://localhost:5173/confirm"
Received: "http://localhost:5173/login"
Timeout:  15000ms

Call log:
  - Expect "toHaveURL" with timeout 15000ms
    33 × unexpected value "http://localhost:5173/login"

```

```yaml
- text: 🐱
- heading "Kitty Day Calendar" [level=1]
- paragraph: Create your account and start tracking your schedule with daily cat facts!
- button "Sign In"
- button "Sign Up"
- text: Full Name
- textbox "Full Name":
  - /placeholder: Your full name
  - text: Test Kitty
- text: Preferred Name
- textbox "Preferred Name":
  - /placeholder: e.g. Kitty (optional)
  - text: Kitty
- text: Username
- textbox "Username":
  - /placeholder: Choose a username
  - text: testkitty1782402084392
- text: Email
- textbox "Email":
  - /placeholder: your@email.com
  - text: testkitty1782402084392@gmail.com
- text: Confirm Email
- textbox "Confirm Email":
  - /placeholder: Re-enter your email
  - text: testkitty1782402084392@gmail.com
- text: Password
- textbox "Password":
  - /placeholder: At least 6 characters
  - text: TestPass123!
- text: Confirm Password
- textbox "Confirm Password":
  - /placeholder: Re-enter your password
  - text: TestPass123!
- img "HTTP 429 — Too Many Requests"
- paragraph: email rate limit exceeded
- button "Create Account 🐱"
- paragraph:
  - text: Already have an account?
  - button "Sign in here"
```

# Test source

```ts
  1  | import { test, expect } from '@playwright/test'
  2  | 
  3  | // These tests verify the /auth/callback route — the handler that processes
  4  | // Supabase email confirmation links. When a user clicks "Confirm Email" in
  5  | // their inbox, Supabase redirects them to:
  6  | //   http://localhost:5173/auth/callback?code=<one-time-code>
  7  | //
  8  | // Without this route the app had no way to exchange the code for a session,
  9  | // so confirmation silently failed.
  10 | 
  11 | test.describe('/auth/callback — email confirmation handler', () => {
  12 | 
  13 |   test('no code param → redirects to /login', async ({ page }) => {
  14 |     await page.goto('/auth/callback')
  15 |     await expect(page).toHaveURL('/login')
  16 |   })
  17 | 
  18 |   test('invalid/expired code → shows error card, not a crash', async ({ page }) => {
  19 |     await page.goto('/auth/callback?code=invalid-code-that-supabase-will-reject')
  20 | 
  21 |     // Loading state appears first
  22 |     await expect(page.getByText('Confirming your account')).toBeVisible()
  23 | 
  24 |     // Supabase rejects the bad code; error card should appear
  25 |     await expect(page.getByText('Confirmation Failed')).toBeVisible({ timeout: 10000 })
  26 |     await expect(page.getByText(/expired|already used/i)).toBeVisible()
  27 |     await expect(page.getByRole('button', { name: /back to login/i })).toBeVisible()
  28 |   })
  29 | 
  30 |   test('error card "Back to Login" button navigates to /login', async ({ page }) => {
  31 |     await page.goto('/auth/callback?code=invalid-code-that-supabase-will-reject')
  32 |     await expect(page.getByText('Confirmation Failed')).toBeVisible({ timeout: 10000 })
  33 | 
  34 |     await page.getByRole('button', { name: /back to login/i }).click()
  35 |     await expect(page).toHaveURL('/login')
  36 |   })
  37 | 
  38 |   // NOTE: Supabase free tier limits signup confirmation emails to ~3/hour.
  39 |   // This test will fail with "email rate limit exceeded" if run too frequently.
  40 |   // Run it manually or in CI with sufficient spacing between runs.
  41 |   // To bypass for dev: temporarily disable email confirmation in
  42 |   // Supabase → Authentication → Providers → Email → "Confirm email" toggle.
  43 |   test('registration flow reaches /confirm and shows the email address', async ({ page }) => {
  44 |     await page.goto('/login')
  45 | 
  46 |     // Switch to the Sign Up tab (.login-tab — not the "Sign up here" inline link)
  47 |     await page.locator('button.login-tab', { hasText: 'Sign Up' }).click()
  48 | 
  49 |     const timestamp = Date.now()
  50 |     const testEmail = `testkitty${timestamp}@gmail.com`
  51 | 
  52 |     await page.locator('#su-name').fill('Test Kitty')
  53 |     await page.locator('#su-pref').fill('Kitty')
  54 |     await page.locator('#su-user').fill(`testkitty${timestamp}`)
  55 |     await page.locator('#su-email').fill(testEmail)
  56 |     await page.locator('#su-cemail').fill(testEmail)
  57 |     await page.locator('#su-pw').fill('TestPass123!')
  58 |     await page.locator('#su-cpw').fill('TestPass123!')
  59 | 
  60 |     await page.getByRole('button', { name: /create account/i }).click()
  61 | 
  62 |     // Should land on /confirm and display the submitted email
> 63 |     await expect(page).toHaveURL('/confirm', { timeout: 15000 })
     |                        ^ Error: expect(page).toHaveURL(expected) failed
  64 |     await expect(page.getByText(testEmail)).toBeVisible()
  65 |     await expect(page.getByText(/check your email/i)).toBeVisible()
  66 |   })
  67 | 
  68 | })
  69 | 
```