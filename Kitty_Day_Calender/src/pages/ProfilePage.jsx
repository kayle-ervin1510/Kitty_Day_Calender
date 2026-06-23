import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useApp } from '../context/AppContext'

const CAT_PICS = ['🐱','😸','😺','😻','🙀','😼','😽','🐈','🐈‍⬛','🦁','🐯','🐅']

const THEMES = [
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
    name: 'Rainbow Mode',
    desc: 'Bright, playful colors — bold purples, electric teals, and vivid pinks.',
    swatch: ['#5c1fa8','#e040fb','#00bcd4','#ffeb3b'],
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
]

export default function ProfilePage() {
  const { user, userEvents, updateProfile, updatePrefs, prefs } = useApp()
  const navigate = useNavigate()

  const [tab, setTab] = useState('profile')

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
        <span className="profile-pic-lg">{user?.profilePic ?? '🐱'}</span>
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
            <div className="theme-grid">
              {THEMES.map(t => (
                <button
                  key={t.id}
                  type="button"
                  className={`theme-card${prefs.theme === t.id ? ' active' : ''}`}
                  onClick={() => handleTheme(t.id)}
                >
                  <div className="theme-swatches">
                    {t.swatch.map((c, i) => (
                      <span key={i} className="theme-swatch" style={{ background: c }} />
                    ))}
                  </div>
                  <span className="theme-name">{t.name}</span>
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
              Save Preferences 🐾
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

    </div>
  )
}
