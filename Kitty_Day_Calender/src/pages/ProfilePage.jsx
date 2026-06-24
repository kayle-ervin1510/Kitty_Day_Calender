import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useApp } from '../context/AppContext'
import { useLocation } from 'react-router-dom'

const CAT_PICS = ['🐱','😸','😺','😻','🙀','😼','😽','🐈','🐈‍⬛','🦁','🐯','🐅']
const isUrl = str => typeof str === 'string' && str.startsWith('http')

const ALL_THEMES = [
  {
    id: 'light',
    name: 'Light Mode',
    desc: 'Soft pastels — warm creams, sage green, and gentle mauve. The default.',
    swatch: ['#f7f2ea','#8db89a','#c9a0b4','#e8b87a'],
  },
  {
    id: 'dark',
    name: 'Dark Mode',
    desc: 'Deep, cozy backgrounds with pastel accents for dates and text.',
    swatch: ['#1a1410','#8db89a','#c9a0b4','#e8b87a'],
  },
  {
    id: 'rainbow',
    name: 'Yarnbow Swirl',
    desc: 'Bright, playful colors — bold purples, electric teals, and vivid pinks.',
    swatch: ['#5c1fa8','#e040fb','#00bcd4','#ffeb3b'],
  },
  {
    id: 'ode-to-catnip',
    name: 'Ode to Catnip',
    desc: 'Olive greens, sea green, pastel yellow, and pale gray — fresh and herbaceous.',
    swatch: ['#6b7c3a','#a8c8a0','#1a5c1a','#e8f0a0'],
  },
  {
    id: 'meow-mixer',
    name: 'Meow Mixer',
    desc: 'Rich orange, dark green, tanned brown, and deep earthy tones.',
    swatch: ['#c85a00','#2d5a27','#b8864e','#3b2314'],
  },
  {
    id: 'mewture',
    name: 'Mewture Style',
    desc: 'Muted natural tones — soft earth, cat-fur warm beige, and quiet greens.',
    swatch: ['#e8dfd0','#7a9a60','#a87850','#c8a870'],
  },
  {
    id: 'year-of-cat',
    name: '🐱 Year of the Cat',
    desc: 'Limited edition — Vietnamese Tết red, gold, silver, and black. Only available during the Year of the Cat.',
    swatch: ['#8b0000','#ffd700','#c0c0c0','#0d0000'],
    limited: true,
  },
]

export default function ProfilePage() {
  const { user, userEvents, updateProfile, updatePrefs, prefs, changePassword, isYearOfCat } = useApp()
  const navigate = useNavigate()
  const location = useLocation()

  const [tab, setTab] = useState(location.state?.tab ?? 'profile')

  // Profile edit state
  const [name,        setName]        = useState(user?.name        ?? '')
  const [prefName,    setPrefName]    = useState(user?.preferredName ?? '')
  const [username,    setUsername]    = useState(user?.username     ?? '')
  const [email,       setEmail]       = useState(user?.email        ?? '')
  const [phone,       setPhone]       = useState(user?.phoneNumber  ?? '')
  const [profilePic,  setProfilePic]  = useState(user?.profilePic  ?? '🐱')
  const [profileMsg,  setProfileMsg]  = useState('')

  // Prefs state
  const [notifEnabled, setNotifEnabled] = useState(user?.notificationsEnabled ?? false)
  const [notifMethod,  setNotifMethod]  = useState(user?.notificationMethod   ?? 'email')
  const [prefsMsg,     setPrefsMsg]     = useState('')

  // Profile pic picker mode
  const [picMode,      setPicMode]      = useState('emoji')   // 'emoji' | 'feline'
  const [felineUrl,    setFelineUrl]    = useState(null)
  const [felineLoading,setFelineLoading]= useState(false)

  async function fetchFeline() {
    setFelineLoading(true)
    try {
      const res  = await fetch('https://api.thecatapi.com/v1/images/search', {
        headers: { 'x-api-key': import.meta.env.VITE_CAT_API_KEY },
      })
      const data = await res.json()
      setFelineUrl(data[0]?.url || null)
    } catch { /* leave current image */ }
    finally { setFelineLoading(false) }
  }

  // Security state
  const [newPw,      setNewPw]      = useState('')
  const [confirmPw,  setConfirmPw]  = useState('')
  const [securityMsg,   setSecurityMsg]   = useState('')
  const [securityError, setSecurityError] = useState('')

  async function handleChangePassword(e) {
    e.preventDefault()
    setSecurityMsg('')
    setSecurityError('')
    if (newPw.length < 6) { setSecurityError('Password must be at least 6 characters.'); return }
    if (newPw !== confirmPw) { setSecurityError('Passwords do not match.'); return }
    const result = await changePassword(newPw)
    if (result.success) {
      setSecurityMsg('Password updated! 🐾')
      setNewPw(''); setConfirmPw('')
    } else {
      setSecurityError(result.error)
    }
  }

  function handleSaveProfile(e) {
    e.preventDefault()
    updateProfile({
      name: name.trim(),
      preferredName: prefName.trim() || name.trim().split(' ')[0],
      username: username.trim(),
      email: email.trim(),
      phoneNumber: phone.trim(),
      profilePic,
    })
    setProfileMsg('Profile saved! 🐾')
    setTimeout(() => setProfileMsg(''), 2500)
  }

  function handleSavePrefs() {
    updateProfile({ notificationsEnabled: notifEnabled, notificationMethod: notifMethod })
    setPrefsMsg('Preferences saved! 🐾')
    setTimeout(() => setPrefsMsg(''), 2500)
  }

  function handleTheme(id) {
    updatePrefs({ theme: id })
  }

  return (
    <div className="profile-page">

      {/* ── Header ──────────────────────────────────────────────────────── */}
      <div className="profile-hero">
        {isUrl(user?.profilePic)
          ? <img src={user.profilePic} alt="Profile" className="profile-pic-lg-img" />
          : <span className="profile-pic-lg">{user?.profilePic ?? '🐱'}</span>
        }
        <div>
          <h1>{user?.preferredName ?? user?.name ?? 'My Profile'}</h1>
          <p className="profile-hero-sub">@{user?.username}</p>
        </div>
      </div>

      {/* ── Tabs ────────────────────────────────────────────────────────── */}
      <div className="profile-tabs">
        {[
          { id: 'profile',  label: 'Profile' },
          { id: 'prefs',    label: 'Preferences' },
          { id: 'events',   label: `My Events (${userEvents.length})` },
          { id: 'security', label: 'Security' },
        ].map(t => (
          <button
            key={t.id}
            className={`profile-tab${tab === t.id ? ' active' : ''}`}
            onClick={() => setTab(t.id)}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* ── Profile tab ─────────────────────────────────────────────────── */}
      {tab === 'profile' && (
        <form className="card profile-form" onSubmit={handleSaveProfile}>

          {/* Profile pic picker */}
          <div className="form-group">
            <label className="form-label">Profile Picture</label>

            {/* Mode toggle */}
            <div className="pic-mode-toggle">
              <button
                type="button"
                className={`chip${picMode === 'emoji' ? ' chip-on' : ''}`}
                onClick={() => setPicMode('emoji')}
              >
                EmotiCat 🐱
              </button>
              <button
                type="button"
                className={`chip${picMode === 'feline' ? ' chip-on' : ''}`}
                onClick={() => { setPicMode('feline'); if (!felineUrl) fetchFeline() }}
              >
                Find me a Feline 📷
              </button>
            </div>

            {/* EmotiCat picker */}
            {picMode === 'emoji' && (
              <div className="pic-picker">
                {CAT_PICS.map(p => (
                  <button
                    key={p}
                    type="button"
                    className={`pic-option${profilePic === p ? ' selected' : ''}`}
                    onClick={() => setProfilePic(p)}
                  >
                    {p}
                  </button>
                ))}
              </div>
            )}

            {/* Find me a Feline picker */}
            {picMode === 'feline' && (
              <div className="feline-picker">
                {felineLoading && <p className="feline-loading">🐱 Fetching a feline…</p>}
                {felineUrl && !felineLoading && (
                  <>
                    <img
                      src={felineUrl}
                      alt="Cat"
                      className={`feline-preview${profilePic === felineUrl ? ' feline-selected' : ''}`}
                    />
                    <div className="feline-actions">
                      {profilePic === felineUrl
                        ? <span className="cat-image-check">✓ Selected</span>
                        : <button type="button" className="btn btn-primary btn-sm" onClick={() => setProfilePic(felineUrl)}>
                            Select this cat 🐾
                          </button>
                      }
                      <button type="button" className="btn btn-secondary btn-sm" onClick={fetchFeline}>
                        Next cat →
                      </button>
                    </div>
                  </>
                )}
              </div>
            )}
          </div>

          <hr className="divider" />

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="p-name">Full Name</label>
              <input id="p-name" type="text" className="form-input" value={name} onChange={e => setName(e.target.value)} />
            </div>
            <div className="form-group">
              <label htmlFor="p-pref">Preferred Name</label>
              <input id="p-pref" type="text" className="form-input" value={prefName} onChange={e => setPrefName(e.target.value)} />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="p-user">Username</label>
            <input id="p-user" type="text" className="form-input" value={username} onChange={e => setUsername(e.target.value)} />
          </div>

          <div className="form-group">
            <label htmlFor="p-email">Email</label>
            <input id="p-email" type="email" className="form-input" value={email} onChange={e => setEmail(e.target.value)} />
          </div>

          <div className="form-group">
            <label htmlFor="p-phone">Phone Number</label>
            <input id="p-phone" type="tel" className="form-input" placeholder="e.g. +1 555-123-4567" value={phone} onChange={e => setPhone(e.target.value)} />
          </div>

          {profileMsg && <p className="form-success">{profileMsg}</p>}

          <div className="profile-form-actions">
            <button type="submit" className="btn btn-primary">Save Profile 🐾</button>
          </div>

          <hr className="divider" />

          <div className="profile-family-link">
            <p>
              Want to share your calendar with your household?{' '}
              <button type="button" className="link-btn" onClick={() => navigate('/family')}>
                Manage Family Account →
              </button>
            </p>
          </div>

        </form>
      )}

      {/* ── Preferences tab ─────────────────────────────────────────────── */}
      {tab === 'prefs' && (
        <div className="card profile-form">

          {/* Theme picker */}
          <div className="form-group">
            <label className="form-label">Calendar Theme</label>
            {isYearOfCat && (
              <p className="year-of-cat-notice">
                🐱 It&apos;s the Vietnamese <strong>Year of the Cat</strong>! A limited-edition theme is available for this lunar year.
              </p>
            )}
            <div className="theme-grid">
              {ALL_THEMES.filter(t => !t.limited || isYearOfCat).map(t => (
                <button
                  key={t.id}
                  type="button"
                  className={`theme-card${prefs.theme === t.id ? ' active' : ''}${t.limited ? ' theme-card-limited' : ''}`}
                  onClick={() => handleTheme(t.id)}
                >
                  <div className="theme-swatches">
                    {t.swatch.map((c, i) => (
                      <span key={i} className="theme-swatch" style={{ background: c }} />
                    ))}
                  </div>
                  <span className="theme-name">{t.name}</span>
                  {t.limited && <span className="theme-limited-badge">Limited 🐱</span>}
                  <span className="theme-desc">{t.desc}</span>
                  {prefs.theme === t.id && <span className="theme-check">✓</span>}
                </button>
              ))}
            </div>
          </div>

          <hr className="divider" />

          {/* Notifications */}
          <div className="form-group">
            <label className="toggle-label">
              <span className="form-label" style={{ textTransform: 'uppercase', letterSpacing: '0.04em', fontSize: '0.88rem' }}>
                Allow Notifications
              </span>
              <button
                type="button"
                role="switch"
                aria-checked={notifEnabled}
                className={`toggle-switch${notifEnabled ? ' on' : ''}`}
                onClick={() => setNotifEnabled(v => !v)}
              >
                <span className="toggle-thumb" />
              </button>
            </label>
          </div>

          {notifEnabled && (
            <div className="form-group">
              <label className="form-label">Notification Method</label>
              <div className="notif-method-row">
                {['email', 'sms'].map(m => (
                  <button
                    key={m}
                    type="button"
                    className={`event-type-btn${notifMethod === m ? ' active' : ''}`}
                    onClick={() => setNotifMethod(m)}
                  >
                    <span>{m === 'email' ? '📧' : '📱'}</span>
                    <span>{m === 'email' ? 'Email' : 'SMS'}</span>
                  </button>
                ))}
              </div>
              {notifMethod === 'sms' && !user?.phoneNumber && (
                <p className="form-error" style={{ marginTop: '0.35rem' }}>
                  Add a phone number in the Profile tab to receive SMS notifications.
                </p>
              )}
            </div>
          )}

          {prefsMsg && <p className="form-success">{prefsMsg}</p>}

          <div className="profile-form-actions">
            <button type="button" className="btn btn-primary" onClick={handleSavePrefs}>
              Save Preferences
              <svg viewBox="0 0 32 32" width="1em" height="1em" aria-hidden="true"
                style={{ display: 'inline-block', verticalAlign: 'middle', marginLeft: '0.35em', flexShrink: 0 }}>
                <ellipse cx="16" cy="22.5" rx="7" ry="5.5" fill="currentColor" />
                <ellipse cx="7"  cy="14.5" rx="2.8" ry="3.5" fill="currentColor" />
                <ellipse cx="12" cy="10.5" rx="2.8" ry="3.5" fill="currentColor" />
                <ellipse cx="20" cy="10.5" rx="2.8" ry="3.5" fill="currentColor" />
                <ellipse cx="25" cy="14.5" rx="2.8" ry="3.5" fill="currentColor" />
              </svg>
            </button>
          </div>

        </div>
      )}

      {/* ── My Events tab ───────────────────────────────────────────────── */}
      {tab === 'events' && (
        <div className="profile-events">
          {userEvents.length === 0 ? (
            <div className="card profile-events-empty">
              <span style={{ fontSize: '2.5rem' }}>🗓️</span>
              <p>No events yet!</p>
              <button className="btn btn-primary" onClick={() => navigate('/events/new')}>
                Add Your First Event 🐾
              </button>
            </div>
          ) : (
            <div className="profile-events-list">
              {[...userEvents]
                .sort((a, b) => (a.date ?? '').localeCompare(b.date ?? ''))
                .map(e => (
                  <div key={e.id} className="profile-event-row card">
                    <div className="profile-event-info">
                      <span className="profile-event-name">{e.name}</span>
                      {e.date && (
                        <span className="profile-event-date">
                          {new Date(e.date + 'T00:00:00').toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                          {e.startTime ? `  ·  ${e.startTime}` : ''}
                        </span>
                      )}
                    </div>
                    {e.eventType && e.eventType !== 'other' && (
                      <span className={`badge badge-${e.eventType}`}>{e.eventType}</span>
                    )}
                    <button
                      className="btn btn-sm btn-secondary"
                      onClick={() => navigate(`/events/${e.id}/edit`)}
                    >
                      Edit
                    </button>
                  </div>
                ))}
            </div>
          )}
          <div style={{ marginTop: '1rem' }}>
            <button className="btn btn-primary btn-sm" onClick={() => navigate('/events/new')}>
              + Add Event
            </button>
          </div>
        </div>
      )}

      {/* ── Security tab ────────────────────────────────────────────────── */}
      {tab === 'security' && (
        <form className="card profile-form" onSubmit={handleChangePassword}>
          <h2 style={{ marginBottom: '1rem' }}>Change Password</h2>

          <div className="form-group">
            <label htmlFor="sec-new">New Password</label>
            <input
              id="sec-new"
              type="password"
              placeholder="At least 6 characters"
              value={newPw}
              onChange={e => setNewPw(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="sec-cnew">Confirm New Password</label>
            <input
              id="sec-cnew"
              type="password"
              placeholder="Re-enter your new password"
              value={confirmPw}
              onChange={e => setConfirmPw(e.target.value)}
              required
            />
          </div>

          {securityError && <p className="form-error">{securityError}</p>}
          {securityMsg   && <p className="form-success">{securityMsg}</p>}

          <div className="profile-form-actions">
            <button type="submit" className="btn btn-primary">Update Password 🔐</button>
          </div>
        </form>
      )}

    </div>
  )
}
