# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: password-reset.spec.js >> Phase 3 — Reset email sent >> submitting a registered email shows the confirmation message
- Location: tests/password-reset.spec.js:77:3

# Error details

```
Error: Reset password returned an error: "email rate limit exceeded"
```

# Page snapshot

```yaml
- generic [ref=e3]:
  - generic [ref=e4]:
    - generic [ref=e5]: 🐱
    - heading "Kitty Day Calendar" [level=1] [ref=e6]
    - paragraph [ref=e7]: To log in, enter your username or email and password. New here? Please sign up!
  - generic [ref=e8]:
    - generic [ref=e9]:
      - button "Sign In" [ref=e10] [cursor=pointer]
      - button "Sign Up" [ref=e11] [cursor=pointer]
    - generic [ref=e12]:
      - generic [ref=e13]:
        - generic [ref=e14]: Enter your email to reset your password
        - textbox "Enter your email to reset your password" [ref=e15]:
          - /placeholder: your@email.com
          - text: racecarslazersarrowplanes@gmail.com
      - paragraph [ref=e16]: email rate limit exceeded
      - button "Send Reset Link 📧" [active] [ref=e17] [cursor=pointer]
      - paragraph [ref=e18]:
        - button "Back to sign in" [ref=e19] [cursor=pointer]
```

# Test source

```ts
  1   | /**
  2   |  * Password reset flow — UI verification
  3   |  *
  4   |  * What this covers:
  5   |  *  1. "Forgot password?" button reveals the email form on LoginPage
  6   |  *  2. Submitting an invalid (non-email) value is blocked by the browser
  7   |  *  3. Submitting a well-formed email shows the success message
  8   |  *  4. /reset-password renders the new-password form
  9   |  *  5. Client-side validation errors on /reset-password (too short, mismatch)
  10  |  *
  11  |  * What this cannot cover:
  12  |  *  - Clicking the actual link Supabase emails (requires inbox access)
  13  |  *  - supabase.auth.updateUser succeeding with a real token
  14  |  *
  15  |  * Phase 3 (email submission) requires a real Supabase-registered email so the
  16  |  * API accepts the request and the success message appears.
  17  |  * Set TEST_EMAIL before running:
  18  |  *   TEST_EMAIL=you@example.com npm test tests/password-reset.spec.js
  19  |  * Without it, Phase 3 is skipped.
  20  |  */
  21  | 
  22  | import { test, expect } from '@playwright/test'
  23  | 
  24  | const TEST_EMAIL = process.env.TEST_EMAIL
  25  | const hasEmail   = Boolean(TEST_EMAIL)
  26  | 
  27  | // ─── Phase 1: Forgot-password form appears ──────────────────────────────────
  28  | 
  29  | test.describe('Phase 1 — Forgot password form', () => {
  30  |   test('clicking "Forgot password?" reveals the email input', async ({ page }) => {
  31  |     await page.goto('/login')
  32  | 
  33  |     // Form should be hidden to start
  34  |     await expect(page.locator('.forgot-form')).not.toBeVisible()
  35  | 
  36  |     // Click the toggle link
  37  |     await page.locator('text=Forgot password?').click()
  38  | 
  39  |     // Form and email input should now be visible
  40  |     await expect(page.locator('.forgot-form')).toBeVisible()
  41  |     await expect(page.locator('#forgot-email')).toBeVisible()
  42  |   })
  43  | })
  44  | 
  45  | // ─── Phase 2: Empty / malformed email is blocked ────────────────────────────
  46  | 
  47  | test.describe('Phase 2 — Email field validation', () => {
  48  |   test('submitting without an email does not call the API', async ({ page }) => {
  49  |     await page.goto('/login')
  50  |     await page.locator('text=Forgot password?').click()
  51  |     await expect(page.locator('.forgot-form')).toBeVisible()
  52  | 
  53  |     // Leave field empty and submit
  54  |     await page.locator('.forgot-form button[type="submit"]').click()
  55  | 
  56  |     // No success message — form is still there
  57  |     await expect(page.locator('#forgot-email')).toBeVisible()
  58  |     await expect(page.locator('text=Check your email')).not.toBeVisible()
  59  |   })
  60  | 
  61  |   test('submitting a non-email string does not proceed', async ({ page }) => {
  62  |     await page.goto('/login')
  63  |     await page.locator('text=Forgot password?').click()
  64  |     await page.locator('#forgot-email').fill('notanemail')
  65  |     await page.locator('.forgot-form button[type="submit"]').click()
  66  | 
  67  |     // Still on the form — no success message
  68  |     await expect(page.locator('text=Check your email')).not.toBeVisible()
  69  |   })
  70  | })
  71  | 
  72  | // ─── Phase 3: Valid email shows success message ──────────────────────────────
  73  | 
  74  | test.describe('Phase 3 — Reset email sent', () => {
  75  |   test.skip(!hasEmail, 'Set TEST_EMAIL=you@example.com to run this phase')
  76  | 
  77  |   test('submitting a registered email shows the confirmation message', async ({ page }) => {
  78  |     await page.goto('/login')
  79  |     await page.locator('text=Forgot password?').click()
  80  |     await page.locator('#forgot-email').fill(TEST_EMAIL)
  81  |     await page.locator('.forgot-form button[type="submit"]').click()
  82  | 
  83  |     // Wait for either success or error to appear so we can report what happened
  84  |     const success = page.locator('.form-success')
  85  |     const error   = page.locator('.forgot-form .form-error')
  86  | 
  87  |     await Promise.race([
  88  |       success.waitFor({ state: 'visible', timeout: 10000 }).catch(() => null),
  89  |       error.waitFor({ state: 'visible', timeout: 10000 }).catch(() => null),
  90  |     ])
  91  | 
  92  |     const errorText   = await error.isVisible()   ? await error.textContent()   : null
  93  |     const successText = await success.isVisible() ? await success.textContent() : null
  94  | 
  95  |     if (errorText) {
> 96  |       throw new Error(`Reset password returned an error: "${errorText.trim()}"`)
      |             ^ Error: Reset password returned an error: "email rate limit exceeded"
  97  |     }
  98  |     if (!successText) {
  99  |       throw new Error('Neither a success nor an error message appeared — check the form submission.')
  100 |     }
  101 | 
  102 |     expect(successText).toContain('Check your email for a password reset link')
  103 |   })
  104 | })
  105 | 
  106 | // ─── Phase 4: /reset-password page renders ──────────────────────────────────
  107 | 
  108 | test.describe('Phase 4 — Reset password page', () => {
  109 |   test('page loads and shows the new-password form', async ({ page }) => {
  110 |     await page.goto('/reset-password')
  111 | 
  112 |     await expect(page.locator('h1', { hasText: 'Set New Password' })).toBeVisible()
  113 |     await expect(page.locator('#rp-pw')).toBeVisible()
  114 |     await expect(page.locator('#rp-cpw')).toBeVisible()
  115 |     await expect(page.locator('button[type="submit"]')).toBeVisible()
  116 |   })
  117 | })
  118 | 
  119 | // ─── Phase 5: /reset-password client-side validation ────────────────────────
  120 | 
  121 | test.describe('Phase 5 — New password validation', () => {
  122 |   test('password shorter than 6 characters shows an error', async ({ page }) => {
  123 |     await page.goto('/reset-password')
  124 |     await page.locator('#rp-pw').fill('abc')
  125 |     await page.locator('#rp-cpw').fill('abc')
  126 |     await page.locator('button[type="submit"]').click()
  127 | 
  128 |     await expect(
  129 |       page.locator('text=Password must be at least 6 characters')
  130 |     ).toBeVisible()
  131 |   })
  132 | 
  133 |   test('mismatched passwords shows an error', async ({ page }) => {
  134 |     await page.goto('/reset-password')
  135 |     await page.locator('#rp-pw').fill('correctpassword')
  136 |     await page.locator('#rp-cpw').fill('differentpassword')
  137 |     await page.locator('button[type="submit"]').click()
  138 | 
  139 |     await expect(
  140 |       page.locator('text=Passwords do not match')
  141 |     ).toBeVisible()
  142 |   })
  143 | })
  144 | 
```