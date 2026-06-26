# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: auth-phases.spec.js >> Phase 5 — Session persistence on refresh >> navigating directly to /profile while authenticated works
- Location: tests/auth-phases.spec.js:258:3

# Error details

```
Error: expect(page).toHaveURL(expected) failed

Expected: "http://localhost:5173/home"
Received: "http://localhost:5173/login"
Timeout:  15000ms

Call log:
  - Expect "toHaveURL" with timeout 15000ms
    34 × unexpected value "http://localhost:5173/login"

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
- text: Preferred Name
- textbox "Preferred Name":
  - /placeholder: e.g. Kitty (optional)
- text: Username
- textbox "Username":
  - /placeholder: Choose a username
- text: Email
- textbox "Email":
  - /placeholder: your@email.com
- text: Confirm Email
- textbox "Confirm Email":
  - /placeholder: Re-enter your email
- text: Password
- textbox "Password":
  - /placeholder: At least 6 characters
- text: Confirm Password
- textbox "Confirm Password":
  - /placeholder: Re-enter your password
- paragraph: No account found — create one below!
- button "Create Account 🐱"
- paragraph:
  - text: Already have an account?
  - button "Sign in here"
```

# Test source

```ts
  1   | /**
  2   |  * Supabase Authentication — 5-phase verification
  3   |  *
  4   |  * Phases:
  5   |  *  1. New user registers → reaches /confirm with their email shown
  6   |  *  2. Returning user logs in → routed to /home on success
  7   |  *  3. Auth failure → error shown, form stays accessible for retry
  8   |  *  4. Authenticated user only sees their own events (RLS)
  9   |  *  5. After page refresh, authenticated user stays on the app (session persists)
  10  |  *
  11  |  * Phases 2–5 require a pre-confirmed test account.
  12  |  * Set env vars before running:
  13  |  *   TEST_USER=<username_or_email>  TEST_PASS=<password>  npm test
  14  |  *
  15  |  * If those vars are absent the tests are skipped with a clear message.
  16  |  */
  17  | 
  18  | import { test, expect } from '@playwright/test'
  19  | 
  20  | const TEST_USER = process.env.TEST_USER
  21  | const TEST_PASS = process.env.TEST_PASS
  22  | const hasCredentials = Boolean(TEST_USER && TEST_PASS)
  23  | 
  24  | // ─── helpers ────────────────────────────────────────────────────────────────
  25  | 
  26  | /** Sign in via the login form and wait until /home is loaded. */
  27  | async function signIn(page) {
  28  |   await page.goto('/login')
  29  |   await page.locator('#si-id').fill(TEST_USER)
  30  |   await page.locator('#si-pw').fill(TEST_PASS)
  31  |   await page.locator('button[type="submit"]').click()
> 32  |   await expect(page).toHaveURL('/home', { timeout: 15000 })
      |                      ^ Error: expect(page).toHaveURL(expected) failed
  33  | }
  34  | 
  35  | // ─── Phase 1: Registration flow ──────────────────────────────────────────────
  36  | 
  37  | test.describe('Phase 1 — New user registration', () => {
  38  |   test('form validation: mismatched passwords shows error', async ({ page }) => {
  39  |     await page.goto('/login')
  40  |     await page.locator('button.login-tab', { hasText: 'Sign Up' }).click()
  41  | 
  42  |     const ts = Date.now()
  43  |     await page.locator('#su-name').fill('Test Kitty')
  44  |     await page.locator('#su-user').fill(`testuser${ts}`)
  45  |     await page.locator('#su-email').fill(`test${ts}@example.com`)
  46  |     await page.locator('#su-cemail').fill(`test${ts}@example.com`)
  47  |     await page.locator('#su-pw').fill('Password1!')
  48  |     await page.locator('#su-cpw').fill('DIFFERENT')
  49  | 
  50  |     await page.getByRole('button', { name: /create account/i }).click()
  51  | 
  52  |     // Should stay on /login and show mismatch error — never hit Supabase
  53  |     await expect(page).toHaveURL('/login')
  54  |     await expect(page.getByText('Passwords do not match')).toBeVisible()
  55  |   })
  56  | 
  57  |   test('form validation: mismatched emails shows error', async ({ page }) => {
  58  |     await page.goto('/login')
  59  |     await page.locator('button.login-tab', { hasText: 'Sign Up' }).click()
  60  | 
  61  |     const ts = Date.now()
  62  |     await page.locator('#su-name').fill('Test Kitty')
  63  |     await page.locator('#su-user').fill(`testuser${ts}`)
  64  |     await page.locator('#su-email').fill(`test${ts}@example.com`)
  65  |     await page.locator('#su-cemail').fill(`other${ts}@example.com`)
  66  |     await page.locator('#su-pw').fill('Password1!')
  67  |     await page.locator('#su-cpw').fill('Password1!')
  68  | 
  69  |     await page.getByRole('button', { name: /create account/i }).click()
  70  | 
  71  |     await expect(page).toHaveURL('/login')
  72  |     await expect(page.getByText('Email addresses do not match')).toBeVisible()
  73  |   })
  74  | 
  75  |   // NOTE: Supabase free tier limits signup confirmation emails to ~3/hour.
  76  |   // This test is intentionally skipped here because auth-callback.spec.js
  77  |   // already covers the same scenario. Run it separately with spacing to avoid
  78  |   // the rate limit. The test body is preserved for reference.
  79  |   test.skip('successful registration → /confirm shows submitted email', async ({ page }) => {
  80  |     await page.goto('/login')
  81  |     await page.locator('button.login-tab', { hasText: 'Sign Up' }).click()
  82  | 
  83  |     const ts = Date.now()
  84  |     const email = `testkitty${ts}@gmail.com`
  85  | 
  86  |     await page.locator('#su-name').fill('Test Kitty')
  87  |     await page.locator('#su-pref').fill('Kitty')
  88  |     await page.locator('#su-user').fill(`testkitty${ts}`)
  89  |     await page.locator('#su-email').fill(email)
  90  |     await page.locator('#su-cemail').fill(email)
  91  |     await page.locator('#su-pw').fill('TestPass123!')
  92  |     await page.locator('#su-cpw').fill('TestPass123!')
  93  | 
  94  |     await page.getByRole('button', { name: /create account/i }).click()
  95  | 
  96  |     // PublicLayout allows /confirm even for pendingUser (not yet confirmed)
  97  |     await expect(page).toHaveURL('/confirm', { timeout: 15000 })
  98  |     await expect(page.getByText(email)).toBeVisible()
  99  |     await expect(page.getByText(/check your email/i)).toBeVisible()
  100 |   })
  101 | })
  102 | 
  103 | // ─── Phase 2: Returning user login ──────────────────────────────────────────
  104 | 
  105 | test.describe('Phase 2 — Returning user login', () => {
  106 |   test.skip(!hasCredentials, 'Set TEST_USER and TEST_PASS env vars to run')
  107 | 
  108 |   test('logs in and lands on /home', async ({ page }) => {
  109 |     await page.goto('/login')
  110 |     await page.locator('#si-id').fill(TEST_USER)
  111 |     await page.locator('#si-pw').fill(TEST_PASS)
  112 |     await page.locator('button[type="submit"]').click()
  113 | 
  114 |     await expect(page).toHaveURL('/home', { timeout: 15000 })
  115 | 
  116 |     // Navbar should be visible (ProtectedLayout rendered)
  117 |     await expect(page.locator('nav')).toBeVisible()
  118 |   })
  119 | 
  120 |   test('unauthenticated visit to /home redirects to /login', async ({ page }) => {
  121 |     // Intentionally do NOT sign in first
  122 |     await page.goto('/home')
  123 |     await expect(page).toHaveURL('/login', { timeout: 10000 })
  124 |   })
  125 | 
  126 |   test('login works with username (not just email)', async ({ page }) => {
  127 |     // TEST_USER may be an email; this test is most useful when TEST_USER is a username
  128 |     await page.goto('/login')
  129 |     await page.locator('#si-id').fill(TEST_USER)
  130 |     await page.locator('#si-pw').fill(TEST_PASS)
  131 |     await page.locator('button[type="submit"]').click()
  132 | 
```