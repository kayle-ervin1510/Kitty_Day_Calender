import { createContext, useContext, useState } from 'react'

const CAT_FACTS = [
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
  'A cat can rotate its ears 180 degrees.',
  'Cats have five toes on their front paws but only four on their back.',
  'The technical term for a hairball is a "bezoar."',
  'Cats are nearsighted but have excellent night vision.',
  "A cat's heart beats 110–140 times per minute.",
  'A cat always lands on its feet thanks to its flexible spine.',
  'Ancient Egyptians worshipped a cat goddess named Bastet.',
  'Cats rarely meow at other cats — meowing is mostly for humans.',
  'A cat can sprint up to 30 mph over short distances.',
  'Indoor cats live 12–17 years on average.',
]

const AppContext = createContext(null)

export function AppProvider({ children }) {
  const [users, setUsers] = useState([])
  const [user, setUser] = useState(null)
  // pendingUser: registered but not yet past the confirm screen
  const [pendingUser, setPendingUser] = useState(null)
  const [events, setEvents] = useState([])
  const [deletedEvents, setDeletedEvents] = useState([])
  const [familyMembers, setFamilyMembers] = useState([])
  const [prefs, setPrefs] = useState({
    theme: 'light',
    showFederalHolidays: false,
    showInternationalHolidays: false,
    showFamilyEvents: false,
    showCatHolidays: false,
  })
  // Cat fact: locked to one per calendar day (resets on page refresh since no persistence)
  const [catFactDate, setCatFactDate] = useState(null)
  const [catFact, setCatFact] = useState(null)

  function getDailyCatFact() {
    const today = new Date().toDateString()
    if (catFactDate === today && catFact) return catFact
    const idx = Math.floor(Math.random() * CAT_FACTS.length)
    const fact = CAT_FACTS[idx]
    setCatFactDate(today)
    setCatFact(fact)
    return fact
  }

  function register(userData) {
    const dup = users.find(
      u => u.username === userData.username || u.email === userData.email
    )
    if (dup) {
      return {
        success: false,
        error: dup.username === userData.username
          ? 'Username already taken.'
          : 'Email already in use.',
      }
    }
    const newUser = {
      id: crypto.randomUUID(),
      name: userData.name,
      preferredName: userData.preferredName || userData.name.split(' ')[0],
      username: userData.username,
      email: userData.email,
      password: userData.password,
      phoneNumber: userData.phoneNumber || '',
      profilePic: '🐱',
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      notificationsEnabled: false,
      notificationMethod: 'email',
      isFamilyAccount: false,
    }
    setUsers(prev => [...prev, newUser])
    setPendingUser(newUser)
    return { success: true }
  }

  function confirmRegistration() {
    if (pendingUser) {
      setUser(pendingUser)
      setPendingUser(null)
    }
  }

  function login(usernameOrEmail, password) {
    const found = users.find(
      u =>
        (u.username === usernameOrEmail || u.email === usernameOrEmail) &&
        u.password === password
    )
    if (!found) return { success: false, error: 'Invalid username/email or password.' }
    setUser(found)
    return { success: true }
  }

  function logout() {
    setUser(null)
    setPendingUser(null)
  }

  function updateProfile(updates) {
    const updated = { ...user, ...updates }
    setUser(updated)
    setUsers(prev => prev.map(u => (u.id === updated.id ? updated : u)))
  }

  function addEvent(eventData) {
    const newEvent = {
      id: crypto.randomUUID(),
      userId: user.id,
      createdAt: new Date().toISOString(),
      ...eventData,
    }
    setEvents(prev => [...prev, newEvent])
    return newEvent
  }

  function updateEvent(id, updates) {
    setEvents(prev => prev.map(e => (e.id === id ? { ...e, ...updates } : e)))
  }

  function deleteEvent(id) {
    const target = events.find(e => e.id === id)
    if (target) {
      setDeletedEvents(prev => [...prev, { ...target, deletedAt: new Date().toISOString() }])
      setEvents(prev => prev.filter(e => e.id !== id))
    }
  }

  function restoreEvent(id) {
    const target = deletedEvents.find(e => e.id === id)
    if (target) {
      const { deletedAt, ...restored } = target
      setEvents(prev => [...prev, restored])
      setDeletedEvents(prev => prev.filter(e => e.id !== id))
    }
  }

  function emptyLitterBox() {
    setDeletedEvents(prev => prev.filter(e => e.userId !== user?.id))
  }

  function updatePrefs(updates) {
    const next = { ...prefs, ...updates }
    setPrefs(next)
    if (updates.theme) {
      document.documentElement.setAttribute('data-theme', updates.theme)
    }
  }

  // Creates a full user account without setting pendingUser/user — used for family member creation
  function registerFamilyMember(userData) {
    const dup = users.find(
      u => u.username === userData.username || u.email === userData.email
    )
    if (dup) {
      return {
        success: false,
        error: dup.username === userData.username ? 'Username already taken.' : 'Email already in use.',
      }
    }
    const newUser = {
      id: crypto.randomUUID(),
      name: userData.name,
      preferredName: userData.name.split(' ')[0],
      username: userData.username,
      email: userData.email,
      password: userData.password,
      phoneNumber: '',
      profilePic: '🐱',
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      notificationsEnabled: false,
      notificationMethod: 'email',
      isFamilyAccount: false,
    }
    setUsers(prev => [...prev, newUser])
    return { success: true, newUser }
  }

  // Looks up a user by credentials without changing auth state — used to link an existing account
  function lookupUser(usernameOrEmail, password) {
    return users.find(
      u => (u.username === usernameOrEmail || u.email === usernameOrEmail) && u.password === password
    ) || null
  }

  function addFamilyMember(memberData) {
    const member = { id: crypto.randomUUID(), ownerId: user.id, ...memberData }
    setFamilyMembers(prev => [...prev, member])
    return member
  }

  function removeFamilyMember(id) {
    setFamilyMembers(prev => prev.filter(m => m.id !== id))
  }

  const userEvents        = user ? events.filter(e => e.userId === user.id)        : []
  const userDeletedEvents = user ? deletedEvents.filter(e => e.userId === user.id) : []

  return (
    <AppContext.Provider value={{
      user, pendingUser, events, userEvents, familyMembers, prefs,
      deletedEvents: userDeletedEvents,
      catFact, catFactDate,
      getDailyCatFact,
      register, confirmRegistration, login, logout, updateProfile,
      addEvent, updateEvent, deleteEvent, restoreEvent, emptyLitterBox, updatePrefs,
      addFamilyMember, removeFamilyMember, registerFamilyMember, lookupUser,
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
