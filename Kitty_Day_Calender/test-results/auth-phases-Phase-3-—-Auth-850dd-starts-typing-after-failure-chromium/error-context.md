# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: auth-phases.spec.js >> Phase 3 — Auth failure >> error is cleared when user starts typing after failure
- Location: tests/auth-phases.spec.js:156:3

# Error details

```
Test timeout of 30000ms exceeded.
```

```
Error: locator.fill: Test timeout of 30000ms exceeded.
Call log:
  - waiting for locator('#si-id')

```

# Page snapshot

```yaml
- generic [ref=e3]:
  - generic [ref=e4]:
    - generic [ref=e5]: 🐱
    - heading "Kitty Day Calendar" [level=1] [ref=e6]
    - paragraph [ref=e7]: Create your account and start tracking your schedule with daily cat facts!
  - generic [ref=e8]:
    - generic [ref=e9]:
      - button "Sign In" [ref=e10] [cursor=pointer]
      - button "Sign Up" [ref=e11] [cursor=pointer]
    - generic [ref=e12]:
      - generic [ref=e13]:
        - generic [ref=e14]:
          - generic [ref=e15]: Full Name
          - textbox "Full Name" [active] [ref=e16]:
            - /placeholder: Your full name
        - generic [ref=e17]:
          - generic [ref=e18]: Preferred Name
          - textbox "Preferred Name" [ref=e19]:
            - /placeholder: e.g. Kitty (optional)
      - generic [ref=e20]:
        - generic [ref=e21]: Username
        - textbox "Username" [ref=e22]:
          - /placeholder: Choose a username
      - generic [ref=e23]:
        - generic [ref=e24]: Email
        - textbox "Email" [ref=e25]:
          - /placeholder: your@email.com
      - generic [ref=e26]:
        - generic [ref=e27]: Confirm Email
        - textbox "Confirm Email" [ref=e28]:
          - /placeholder: Re-enter your email
      - generic [ref=e29]:
        - generic [ref=e30]: Password
        - textbox "Password" [ref=e31]:
          - /placeholder: At least 6 characters
      - generic [ref=e32]:
        - generic [ref=e33]: Confirm Password
        - textbox "Confirm Password" [ref=e34]:
          - /placeholder: Re-enter your password
      - paragraph [ref=e36]: No account found — create one below!
      - button "Create Account 🐱" [ref=e37] [cursor=pointer]
      - paragraph [ref=e38]:
        - text: Already have an account?
        - button "Sign in here" [ref=e39] [cursor=pointer]
```

# Test source

```ts
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
  134 |     await expect(page).toHaveURL('/home', { timeout: 15000 })
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
> 165 |     await page.locator('#si-id').fill('corrected_user')
      |                                  ^ Error: locator.fill: Test timeout of 30000ms exceeded.
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
  235 |   test('page reload keeps user authenticated — stays on /home', async ({ page }) => {
  236 |     await signIn(page)
  237 | 
  238 |     // Reload the page from /home
  239 |     await page.reload()
  240 | 
  241 |     // ProtectedLayout restores the session; should stay on /home, not redirect to /login
  242 |     await expect(page).not.toHaveURL('/login', { timeout: 10000 })
  243 |     await expect(page).toHaveURL('/home')
  244 |     await expect(page.locator('nav')).toBeVisible()
  245 |   })
  246 | 
  247 |   test('page reload on /calendar keeps user authenticated', async ({ page }) => {
  248 |     await signIn(page)
  249 |     await page.goto('/calendar')
  250 |     await expect(page).toHaveURL('/calendar')
  251 | 
  252 |     await page.reload()
  253 |     // Session restored — should stay on /calendar, not flash to /login
  254 |     await expect(page).not.toHaveURL('/login', { timeout: 10000 })
  255 |     await expect(page).toHaveURL('/calendar')
  256 |   })
  257 | 
  258 |   test('navigating directly to /profile while authenticated works', async ({ page }) => {
  259 |     await signIn(page)
  260 |     // Simulate navigating directly (a new tab / shared link scenario)
  261 |     await page.goto('/profile')
  262 |     await expect(page).toHaveURL('/profile', { timeout: 10000 })
  263 |     await expect(page.locator('nav')).toBeVisible()
  264 |   })
  265 | })
```