# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: auth-phases.spec.js >> Phase 2 — Returning user login >> login works with username (not just email)
- Location: tests/auth-phases.spec.js:126:3

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
  133 |     // Success → /home regardless of whether TEST_USER was a username or email
> 134 |     await expect(page).toHaveURL('/home', { timeout: 15000 })
      |                        ^ Error: expect(page).toHaveURL(expected) failed
  135 |   })
  136 | })
  137 | 
  138 | // ─── Phase 3: Auth failure handling ─────────────────────────────────────────
  139 | 
  140 | test.describe('Phase 3 — Auth failure', () => {
  141 |   test('wrong password → error message is shown', async ({ page }) => {
  142 |     await page.goto('/login')
  143 |     await page.locator('#si-id').fill('nonexistent_user_xyz')
  144 |     await page.locator('#si-pw').fill('WrongPass999!')
  145 |     await page.locator('button[type="submit"]').click()
  146 | 
  147 |     // Should NOT navigate away — stays on /login
  148 |     await expect(page).toHaveURL('/login', { timeout: 10000 })
  149 | 
  150 |     // Error message is visible
  151 |     const errorBlock = page.locator('.form-error')
  152 |     await expect(errorBlock).toBeVisible({ timeout: 8000 })
  153 |     await expect(errorBlock).not.toBeEmpty()
  154 |   })
  155 | 
  156 |   test('error is cleared when user starts typing after failure', async ({ page }) => {
  157 |     await page.goto('/login')
  158 |     await page.locator('#si-id').fill('nobody')
  159 |     await page.locator('#si-pw').fill('badpass')
  160 |     await page.locator('button[type="submit"]').click()
  161 | 
  162 |     await expect(page.locator('.form-error')).toBeVisible({ timeout: 8000 })
  163 | 
  164 |     // User edits the username field → error should clear
  165 |     await page.locator('#si-id').fill('corrected_user')
  166 |     await expect(page.locator('.form-error')).not.toBeVisible()
  167 |   })
  168 | 
  169 |   test('sign-in form is still interactive after a failure', async ({ page }) => {
  170 |     await page.goto('/login')
  171 |     await page.locator('#si-id').fill('fail_user')
  172 |     await page.locator('#si-pw').fill('fail_pass')
  173 |     await page.locator('button[type="submit"]').click()
  174 | 
  175 |     await expect(page.locator('.form-error')).toBeVisible({ timeout: 8000 })
  176 | 
  177 |     // Form inputs and submit button must still be enabled
  178 |     await expect(page.locator('#si-id')).toBeEnabled()
  179 |     await expect(page.locator('#si-pw')).toBeEnabled()
  180 |     await expect(page.locator('button[type="submit"]')).toBeEnabled()
  181 |   })
  182 | 
  183 |   test('empty username → HTML5 required validation prevents submission', async ({ page }) => {
  184 |     await page.goto('/login')
  185 |     // Leave username empty, fill only password
  186 |     await page.locator('#si-pw').fill('somepassword')
  187 |     await page.locator('button[type="submit"]').click()
  188 | 
  189 |     // The native required attribute should prevent form submission
  190 |     await expect(page).toHaveURL('/login')
  191 |   })
  192 | })
  193 | 
  194 | // ─── Phase 4: Authenticated user sees only their own events (RLS) ────────────
  195 | 
  196 | test.describe('Phase 4 — RLS: user sees only their own events', () => {
  197 |   test.skip(!hasCredentials, 'Set TEST_USER and TEST_PASS env vars to run')
  198 | 
  199 |   test('calendar page loads events without a permission error', async ({ page }) => {
  200 |     await signIn(page)
  201 |     await page.goto('/calendar')
  202 | 
  203 |     // Must not show any generic error / "unauthorized" text
  204 |     await expect(page.getByText(/unauthorized|permission denied|403/i)).not.toBeVisible({ timeout: 8000 })
  205 | 
  206 |     // Calendar UI itself should render
  207 |     await expect(page.locator('.calendar-grid, [class*="calendar"]')).toBeVisible({ timeout: 10000 })
  208 |   })
  209 | 
  210 |   test('litter box is accessible and does not expose other users data', async ({ page }) => {
  211 |     await signIn(page)
  212 |     await page.goto('/litter-box')
  213 | 
  214 |     // Page should load — if RLS is broken this would error or show foreign events
  215 |     await expect(page).toHaveURL('/litter-box')
  216 |     await expect(page.getByText(/unauthorized|permission denied/i)).not.toBeVisible()
  217 |   })
  218 | 
  219 |   test('add-event page is reachable and pre-fills for current user', async ({ page }) => {
  220 |     await signIn(page)
  221 |     await page.goto('/events/new?date=2026-07-04')
  222 | 
  223 |     await expect(page).toHaveURL(/\/events\/new/, { timeout: 10000 })
  224 |     // Date should be pre-filled from query param
  225 |     const dateInput = page.locator('input[type="date"]')
  226 |     await expect(dateInput).toHaveValue('2026-07-04')
  227 |   })
  228 | })
  229 | 
  230 | // ─── Phase 5: Session persists on refresh ────────────────────────────────────
  231 | 
  232 | test.describe('Phase 5 — Session persistence on refresh', () => {
  233 |   test.skip(!hasCredentials, 'Set TEST_USER and TEST_PASS env vars to run')
  234 | 
```