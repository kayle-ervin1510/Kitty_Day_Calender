import { createContext, useContext, useState, useEffect } from 'react'
import axios from 'axios'
import { supabase } from '../lib/supabase'
import { isCurrentlyYearOfCat } from '../lib/yearOfCat'

const CAT_FACTS_FALLBACK = [
  'Cats sleep 12–16 hours per day!',
  'A group of cats is called a "clowder."',
  'Cats can make over 100 different sounds.',
  "A cat's nose print is unique, like a human fingerprint.",
  'Cats have a third eyelid called a "nictitating membrane."',
  'The oldest cat ever lived to 38 years — her name was Creme Puff.',
  'Cats can jump up to six times their own body length.',
  "A cat's purr vibrates at 25–150 Hz, which can promote healing.",
  'Cats spend about 30% of their waking hours grooming.',
  'Cats have 32 muscles in each ear.',
]

// Normalize DB snake_case rows to camelCase so pages don't need to change.
function normalizeProfile(row) {
  return {
    id:                   row.id,
    authId:               row.auth_id,
    username:             row.username,
    name:                 row.name,
    preferredName:        row.preferred_name,
    email:                row.email,
    phoneNumber:          row.phone_number,
    profilePic:           row.profile_pic,
    timezone:             row.timezone,
    notificationsEnabled: row.notifications_enabled,
    notificationMethod:   row.notification_method,
    isFamilyAccount:      row.is_family_account,
    theme:                row.theme           ?? 'light',
    dailyCatFact:         row.daily_cat_fact  ?? null,
    calendarPrefs:        row.calendar_prefs  ?? null,
    createdAt:            row.created_at,
  }
}

function normalizeEvent(row) {
  return {
    id:            row.id,
    userId:        row.user_id,
    name:          row.name,
    date:          row.date,
    startTime:     row.start_time,
    endTime:       row.end_time,
    eventType:     row.event_type,
    notifyOptions: row.notify_options,
    familyVisible: row.family_visible,
    note:          row.note,
    imageUrl:      row.image_url      ?? null,
    imageCaption:  row.image_caption  ?? null,
    deletedAt:     row.deleted_at,
    createdAt:     row.created_at,
  }
}

function normalizeMember(row) {
  return {
    id:                   row.id,
    familyAccountId:      row.family_account_id,
    name:                 row.name,
    email:                row.email,
    phone:                row.phone,
    notificationsEnabled: row.notifications_enabled,
    linkedUserId:         row.linked_user_id ?? null,
    createdAt:            row.created_at,
  }
}

const AppContext = createContext(null)

export function AppProvider({ children }) {
  const [user, setUser]                       = useState(null)
  const [pendingUser, setPendingUser]         = useState(null)
  const [initializing, setInitializing]       = useState(true)
  const [events, setEvents]                   = useState([])
  const [familyMembers, setFamilyMembers]     = useState([])
  const [familyAccountId, setFamilyAccountId] = useState(null)
  const [sharedEvents, setSharedEvents]       = useState([])
  const [prefs, setPrefs] = useState({
    theme: 'light',
    showFederalHolidays: false,
    showInternationalHolidays: false,
    showFamilyEvents: false,
    showCatHolidays: false,
    showUsPopularHolidays: false,
  })
  const [catFactDate, setCatFactDate] = useState(null)
  const [catFact, setCatFact]         = useState(null)

  // ── Session bootstrap ──────────────────────────────────────────────────────

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        loadUserData(session.user)
      } else {
        setInitializing(false)
      }
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session) {
        loadUserData(session.user)
      } else {
        setUser(null)
        setPendingUser(null)
        setEvents([])
        setFamilyMembers([])
        setFamilyAccountId(null)
        setSharedEvents([])
        setInitializing(false)
      }
    })

    return () => subscription.unsubscribe()
  }, [])

  async function loadUserData(authUser) {
    let { data: profile } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('auth_id', authUser.id)
      .single()

    // Profile row missing — can happen if the trigger fired before migration 7
    // (first signup had RLS error). Re-create it from auth metadata now that
    // the user has a valid session and RLS allows the insert.
    if (!profile) {
      const meta = authUser.user_metadata || {}
      const { data: created } = await supabase
        .from('user_profiles')
        .insert({
          auth_id:        authUser.id,
          username:       meta.username       || authUser.email.split('@')[0],
          name:           meta.name           || authUser.email.split('@')[0],
          preferred_name: meta.preferred_name || meta.name?.split(' ')[0] || authUser.email.split('@')[0],
          email:          authUser.email,
          phone_number:   meta.phone_number   || '',
          timezone:       meta.timezone       || 'UTC',
        })
        .select()
        .single()
      profile = created
    }

    if (!profile) {
      setInitializing(false)
      return
    }

    const normalized = normalizeProfile(profile)
    // Year of the Cat theme is only valid during that lunar year — fall back to light otherwise.
    const savedTheme = normalized.theme
    const activeTheme = (savedTheme === 'year-of-cat' && !isCurrentlyYearOfCat()) ? 'light' : savedTheme
    setUser({ ...normalized, theme: activeTheme })
    setPendingUser(null)
    setPrefs(prev => ({
      ...prev,
      ...(normalized.calendarPrefs ?? {}),
      theme: activeTheme,
    }))
    document.documentElement.setAttribute('data-theme', activeTheme)

    const [eventsResult, faResult] = await Promise.all([
      supabase.from('user_events').select('*').eq('user_id', profile.id).order('date'),
      supabase.from('family_accounts').select('id').eq('owner_id', profile.id).maybeSingle(),
    ])

    setEvents((eventsResult.data || []).map(normalizeEvent))

    if (faResult.data) {
      const faId = faResult.data.id
      setFamilyAccountId(faId)
      const { data: members } = await supabase
        .from('family_members')
        .select('*')
        .eq('family_account_id', faId)
      setFamilyMembers((members || []).map(normalizeMember))
    }

    // Fetch family-visible events shared WITH this user by accounts they've been linked to.
    // Uses a security-definer RPC to bypass the RLS chain issue where family_accounts
    // blocks non-owners, causing the direct query to silently return nothing.
    const { data: sharedEvData } = await supabase.rpc('get_shared_events_for_user')
    setSharedEvents((sharedEvData || []).map(normalizeEvent))

    setInitializing(false)
  }

  // ── Auth ───────────────────────────────────────────────────────────────────

  async function register(userData) {
    const { data: existing } = await supabase
      .from('user_profiles')
      .select('id')
      .eq('username', userData.username)
      .maybeSingle()

    if (existing) return { success: false, error: 'Username already taken.' }

    // Profile data is passed as metadata so the DB trigger can create the
    // user_profiles row server-side (bypassing RLS) on auth.users insert.
    const { error } = await supabase.auth.signUp({
      email:    userData.email,
      password: userData.password,
      options: {
        data: {
          username:       userData.username,
          name:           userData.name,
          preferred_name: userData.preferredName || userData.name.split(' ')[0],
          phone_number:   userData.phoneNumber || '',
          timezone:       Intl.DateTimeFormat().resolvedOptions().timeZone,
        },
      },
    })

    if (error) return { success: false, error: error.message, status: error.status ?? 422 }

    // Keep pendingUser so ConfirmPage has the email to display.
    // onAuthStateChange clears it once the session is confirmed.
    setPendingUser({ email: userData.email })

    return { success: true }
  }

  async function resetPassword(email) {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/callback`,
    })
    if (error) return { success: false, error: error.message, status: error.status ?? 429 }
    localStorage.setItem('kitty_reset_pending', '1')
    return { success: true }
  }

  async function changePassword(newPassword) {
    const { error } = await supabase.auth.updateUser({ password: newPassword })
    if (error) return { success: false, error: error.message, status: error.status ?? 400 }
    return { success: true }
  }

  async function login(usernameOrEmail, password) {
    let email = usernameOrEmail

    if (!usernameOrEmail.includes('@')) {
      const { data: resolvedEmail } = await supabase
        .rpc('get_email_by_username', { p_username: usernameOrEmail })

      if (!resolvedEmail) return { success: false, error: 'No account found with that username.', notFound: true }
      email = resolvedEmail
    }

    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) return { success: false, error: error.message, status: error.status ?? 401 }
    return { success: true }
  }

  async function logout() {
    await supabase.auth.signOut()
    document.documentElement.setAttribute('data-theme', 'light')
    // State cleared by onAuthStateChange
  }

  async function updateProfile(updates) {
    const dbUpdates = {}
    if (updates.name                 !== undefined) dbUpdates.name                  = updates.name
    if (updates.preferredName        !== undefined) dbUpdates.preferred_name        = updates.preferredName
    if (updates.username             !== undefined) dbUpdates.username              = updates.username
    if (updates.phoneNumber          !== undefined) dbUpdates.phone_number          = updates.phoneNumber
    if (updates.profilePic           !== undefined) dbUpdates.profile_pic           = updates.profilePic
    if (updates.timezone             !== undefined) dbUpdates.timezone              = updates.timezone
    if (updates.notificationsEnabled !== undefined) dbUpdates.notifications_enabled = updates.notificationsEnabled
    if (updates.notificationMethod   !== undefined) dbUpdates.notification_method   = updates.notificationMethod
    if (updates.isFamilyAccount      !== undefined) dbUpdates.is_family_account     = updates.isFamilyAccount

    if (updates.email && updates.email !== user.email) {
      const { error: authError } = await supabase.auth.updateUser({ email: updates.email })
      if (authError) return { success: false, error: authError.message }
      dbUpdates.email = updates.email
    }

    if (Object.keys(dbUpdates).length === 0) return { success: true }

    const { data, error } = await supabase
      .from('user_profiles')
      .update(dbUpdates)
      .eq('id', user.id)
      .select()
      .single()

    if (error) return { success: false, error: error.message, status: error.status ?? 400 }
    setUser(normalizeProfile(data))
    return { success: true }
  }

  // ── Events ─────────────────────────────────────────────────────────────────

  async function addEvent(eventData) {
    const { data, error } = await supabase
      .from('user_events')
      .insert({
        user_id:        user.id,
        name:           eventData.name,
        date:           eventData.date,
        start_time:     eventData.startTime    || null,
        end_time:       eventData.endTime      || null,
        event_type:     eventData.eventType    || 'other',
        notify_options: eventData.notifyOptions || null,
        family_visible: eventData.familyVisible || false,
        note:           eventData.note         || null,
        image_url:      eventData.imageUrl     || null,
        image_caption:  eventData.imageCaption ?? null,
      })
      .select()
      .single()

    if (error) return { success: false, error: error.message, status: error.status ?? null }
    const normalized = normalizeEvent(data)
    setEvents(prev => [...prev, normalized])
    return { success: true, event: normalized }
  }

  async function updateEvent(id, updates) {
    const dbUpdates = {}
    if (updates.name          !== undefined) dbUpdates.name           = updates.name
    if (updates.date          !== undefined) dbUpdates.date           = updates.date
    if (updates.startTime     !== undefined) dbUpdates.start_time     = updates.startTime
    if (updates.endTime       !== undefined) dbUpdates.end_time       = updates.endTime
    if (updates.eventType     !== undefined) dbUpdates.event_type     = updates.eventType
    if (updates.notifyOptions !== undefined) dbUpdates.notify_options = updates.notifyOptions
    if (updates.familyVisible !== undefined) dbUpdates.family_visible = updates.familyVisible
    if (updates.note          !== undefined) dbUpdates.note           = updates.note
    if (updates.imageUrl      !== undefined) dbUpdates.image_url      = updates.imageUrl
    if (updates.imageCaption  !== undefined) dbUpdates.image_caption  = updates.imageCaption

    const { data, error } = await supabase
      .from('user_events')
      .update(dbUpdates)
      .eq('id', id)
      .select()
      .single()

    if (error) return { success: false, error: error.message, status: error.status ?? null }
    const normalized = normalizeEvent(data)
    setEvents(prev => prev.map(e => e.id === id ? normalized : e))
    return { success: true }
  }

  async function deleteEvent(id) {
    const { data, error } = await supabase
      .from('user_events')
      .update({ deleted_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single()

    if (error) return { success: false, error: error.message }
    setEvents(prev => prev.map(e => e.id === id ? normalizeEvent(data) : e))
    return { success: true }
  }

  async function restoreEvent(id) {
    const { data, error } = await supabase
      .from('user_events')
      .update({ deleted_at: null })
      .eq('id', id)
      .select()
      .single()

    if (error) return { success: false, error: error.message }
    setEvents(prev => prev.map(e => e.id === id ? normalizeEvent(data) : e))
    return { success: true }
  }

  async function emptyLitterBox() {
    const { error } = await supabase
      .from('user_events')
      .delete()
      .eq('user_id', user.id)
      .not('deleted_at', 'is', null)

    if (error) return { success: false, error: error.message }
    setEvents(prev => prev.filter(e => !e.deletedAt))
    return { success: true }
  }

  // ── Family ─────────────────────────────────────────────────────────────────

  async function refreshFamilyMembers() {
    if (!familyAccountId) return
    const { data } = await supabase
      .from('family_members')
      .select('*')
      .eq('family_account_id', familyAccountId)
    setFamilyMembers((data || []).map(normalizeMember))
  }

  async function ensureFamilyAccount() {
    if (familyAccountId) return familyAccountId

    const { data, error } = await supabase
      .from('family_accounts')
      .insert({ owner_id: user.id })
      .select('id')
      .single()

    if (error) return null
    setFamilyAccountId(data.id)
    return data.id
  }

  async function addFamilyMember(memberData) {
    const faId = await ensureFamilyAccount()
    if (!faId) return { success: false, error: 'Could not create family account.' }

    const { data, error } = await supabase
      .from('family_members')
      .insert({
        family_account_id:     faId,
        name:                  memberData.name,
        email:                 memberData.email  || null,
        phone:                 memberData.phone  || null,
        notifications_enabled: memberData.notificationsEnabled || false,
      })
      .select()
      .single()

    if (error) return { success: false, error: error.message, status: error.status ?? null }
    const normalized = normalizeMember(data)
    setFamilyMembers(prev => [...prev, normalized])
    return { success: true, member: normalized }
  }

  async function removeFamilyMember(id) {
    const { data, error } = await supabase.rpc('remove_family_member_and_cleanup', { p_member_id: id })
    if (error) return { success: false, error: error.message }
    if (!data?.success) return { success: false, error: data?.error }
    setFamilyMembers(prev => prev.filter(m => m.id !== id))
    // Re-fetch shared events so removed member's events disappear immediately
    const { data: sharedEvData } = await supabase.rpc('get_shared_events_for_user')
    setSharedEvents((sharedEvData || []).map(normalizeEvent))
    return { success: true }
  }

  async function generateInvite(memberId, email) {
    const faId = await ensureFamilyAccount()
    if (!faId) return { success: false, error: 'Could not find family account.' }

    // Reuse an existing pending invite for this member if one exists
    const { data: existing } = await supabase
      .from('family_invites')
      .select('token')
      .eq('family_member_id', memberId)
      .is('accepted_at', null)
      .maybeSingle()

    const token = existing?.token ?? null
    if (token) {
      return { success: true, url: `${import.meta.env.VITE_APP_URL || window.location.origin}/family/join?token=${token}` }
    }

    const { data, error } = await supabase
      .from('family_invites')
      .insert({ family_account_id: faId, family_member_id: memberId, invited_email: email || null })
      .select('token')
      .single()

    if (error) return { success: false, error: error.message }
    return { success: true, url: `${import.meta.env.VITE_APP_URL || window.location.origin}/family/join?token=${data.token}` }
  }

  async function acceptInvite(token) {
    const { data, error } = await supabase.rpc('accept_family_invite', { p_token: token })
    if (error) return { success: false, error: error.message, status: error.status ?? null }
    if (!data.success) return { success: false, error: data.error }

    // Refresh shared events now that the link is established
    const { data: sharedEvData } = await supabase.rpc('get_shared_events_for_user')
    setSharedEvents((sharedEvData || []).map(normalizeEvent))
    return { success: true }
  }

  // ── Prefs & cat fact ───────────────────────────────────────────────────────

  async function refreshProfile() {
    if (!user) return
    const { data } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('id', user.id)
      .single()
    if (data) setUser(normalizeProfile(data))
  }

  async function saveDailyCatFact(date, fact, img) {
    const payload = { date, fact, img: img || null }
    setUser(prev => prev ? { ...prev, dailyCatFact: payload } : prev)
    if (user) {
      await supabase
        .from('user_profiles')
        .update({ daily_cat_fact: payload })
        .eq('id', user.id)
    }
  }

  async function updatePrefs(updates) {
    const next = { ...prefs, ...updates }
    setPrefs(next)

    if (updates.theme) {
      document.documentElement.setAttribute('data-theme', updates.theme)
    }

    if (!user) return

    const dbUpdates = {}
    if (updates.theme) dbUpdates.theme = updates.theme

    // Persist all toggle flags together in calendar_prefs
    const { theme: _ignored, ...flags } = next
    dbUpdates.calendar_prefs = flags

    await supabase
      .from('user_profiles')
      .update(dbUpdates)
      .eq('id', user.id)
  }

  async function getDailyCatFact() {
    const today = new Date().toDateString()

    // Return in-memory fact if it's still today's
    if (catFactDate === today && catFact) return catFact

    // Check localStorage so the same fact survives logout/login within the same day
    try {
      const stored = JSON.parse(localStorage.getItem('kitty_daily_fact') || 'null')
      if (stored?.date === today && stored?.fact) {
        setCatFactDate(today)
        setCatFact(stored.fact)
        return stored.fact
      }
    } catch { /* ignore parse errors */ }

    // Fetch a fresh fact for today and persist it
    const persist = (fact) => {
      setCatFactDate(today)
      setCatFact(fact)
      localStorage.setItem('kitty_daily_fact', JSON.stringify({ date: today, fact }))
      return fact
    }

    try {
      const { data } = await axios.get('https://cat-fact.herokuapp.com/facts/random?animal_type=cat')
      return persist(data?.text || CAT_FACTS_FALLBACK[Math.floor(Math.random() * CAT_FACTS_FALLBACK.length)])
    } catch {
      return persist(CAT_FACTS_FALLBACK[Math.floor(Math.random() * CAT_FACTS_FALLBACK.length)])
    }
  }

  // ── Derived state ──────────────────────────────────────────────────────────

  const userEvents    = events.filter(e => !e.deletedAt)
  const deletedEvents = events.filter(e => !!e.deletedAt)

  return (
    <AppContext.Provider value={{
      user, pendingUser, initializing,
      isYearOfCat: isCurrentlyYearOfCat(),
      userEvents, deletedEvents, familyMembers, sharedEvents,
      prefs, catFact, catFactDate,
      getDailyCatFact,
      register, login, logout, resetPassword, changePassword, updateProfile, saveDailyCatFact, refreshProfile,
      addEvent, updateEvent, deleteEvent, restoreEvent, emptyLitterBox,
      updatePrefs,
      addFamilyMember, removeFamilyMember, refreshFamilyMembers, generateInvite, acceptInvite,
    }}>
      {children}
    </AppContext.Provider>
  )
}

export function useApp() {
  const ctx = useContext(AppContext)
  if (!ctx) throw new Error('useApp must be used within AppProvider')
  return ctx
}
