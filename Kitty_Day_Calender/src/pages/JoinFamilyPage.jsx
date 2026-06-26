import { useState, useEffect } from 'react'
import { useSearchParams, useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { useApp } from '../context/AppContext'
import HttpCatImage from '../components/HttpCatImage'
import { HTTP_CAT_SUPPORTED } from '../lib/httpCat'

export default function JoinFamilyPage() {
  const [searchParams] = useSearchParams()
  const token      = searchParams.get('token')
  const fromLogin  = searchParams.get('from_login') === '1'
  const { user, initializing, acceptInvite } = useApp()
  const navigate   = useNavigate()

  const [details,  setDetails]  = useState(null)
  const [loading,  setLoading]  = useState(true)
  const [joining,  setJoining]  = useState(false)
  const [error,       setError]       = useState('')
  const [errorStatus, setErrorStatus] = useState(null)
  const [done,     setDone]     = useState(false)

  // Step 1: Always sign out and redirect to login — no auto-accepting while
  // already logged in as whoever happened to open the link.
  useEffect(() => {
    if (fromLogin) return          // already went through the login step
    const redirectUrl = new URL(window.location.href)
    redirectUrl.searchParams.set('from_login', '1')
    sessionStorage.setItem('kitty_join_redirect', redirectUrl.toString())
    supabase.auth.signOut().then(() => navigate('/login'))
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  // Step 2: Load invite details once we're back from login
  useEffect(() => {
    if (!fromLogin || !token) { setLoading(false); return }
    supabase.rpc('get_invite_details', { p_token: token })
      .then(({ data }) => { setDetails(data); setLoading(false) })
  }, [token, fromLogin])

  async function handleAccept() {
    setJoining(true)
    setError('')
    const result = await acceptInvite(token)
    setJoining(false)
    if (!result.success) { setError(result.error); setErrorStatus(result.status ?? null); return }
    setDone(true)
  }

  // ── Waiting to be redirected to login ─────────────────────────────────────
  if (!fromLogin) {
    return (
      <div className="page">
        <div className="card" style={{ textAlign: 'center', padding: '2rem' }}>
          <p style={{ fontSize: '2rem' }}>🐱</p>
          <p style={{ color: 'var(--text-secondary)' }}>Redirecting to sign in…</p>
        </div>
      </div>
    )
  }

  // ── Loading invite / session ───────────────────────────────────────────────
  if (initializing || loading) {
    return (
      <div className="page">
        <div className="card" style={{ textAlign: 'center', padding: '2rem' }}>
          <p style={{ fontSize: '2rem' }}>🐱</p>
          <p style={{ color: 'var(--text-secondary)' }}>Loading invite…</p>
        </div>
      </div>
    )
  }

  // ── Not logged in after the login redirect (e.g. they closed the tab) ─────
  if (!user) {
    return (
      <div className="page">
        <div className="card" style={{ maxWidth: '460px', margin: '2rem auto', padding: '2rem', textAlign: 'center' }}>
          <p style={{ fontSize: '2.5rem' }}>🐾</p>
          <h2>Sign in to accept</h2>
          <p style={{ color: 'var(--text-secondary)' }}>You need to be signed in to accept a family invite.</p>
          <button
            className="btn btn-primary"
            style={{ marginTop: '1rem' }}
            onClick={() => {
              sessionStorage.setItem('kitty_join_redirect', window.location.href)
              navigate('/login')
            }}
          >
            Log in
          </button>
        </div>
      </div>
    )
  }

  // ── Invalid token ──────────────────────────────────────────────────────────
  if (!token || !details?.found) {
    return (
      <div className="page">
        <div className="card" style={{ textAlign: 'center', padding: '2rem', maxWidth: '420px', margin: '2rem auto' }}>
          <p style={{ fontSize: '2.5rem' }}>😿</p>
          <h2>Invite not found</h2>
          <p style={{ color: 'var(--text-secondary)' }}>This link may be invalid or expired.</p>
          <button className="btn btn-primary" style={{ marginTop: '1rem' }} onClick={() => navigate('/home')}>
            Go Home
          </button>
        </div>
      </div>
    )
  }

  // ── Owner trying to accept their own invite ────────────────────────────────
  if (details.isOwner) {
    return (
      <div className="page">
        <div className="card" style={{ textAlign: 'center', padding: '2rem', maxWidth: '420px', margin: '2rem auto' }}>
          <p style={{ fontSize: '2.5rem' }}>😹</p>
          <h2>Mew, you own this account!</h2>
          <p style={{ color: 'var(--text-secondary)' }}>
            You can&apos;t link to yourself — this invite was made for someone else to join your calendar.
            Share it with them instead.
          </p>
          <button className="btn btn-primary" style={{ marginTop: '1rem' }} onClick={() => navigate('/family')}>
            Back to Family
          </button>
        </div>
      </div>
    )
  }

  // ── Already accepted ───────────────────────────────────────────────────────
  if (details.accepted && !done) {
    return (
      <div className="page">
        <div className="card" style={{ textAlign: 'center', padding: '2rem', maxWidth: '420px', margin: '2rem auto' }}>
          <p style={{ fontSize: '2.5rem' }}>🐾</p>
          <h2>Already accepted</h2>
          <p style={{ color: 'var(--text-secondary)' }}>This invite has already been used.</p>
          <button className="btn btn-primary" style={{ marginTop: '1rem' }} onClick={() => navigate('/calendar')}>
            Go to Calendar
          </button>
        </div>
      </div>
    )
  }

  // ── Success ────────────────────────────────────────────────────────────────
  if (done) {
    return (
      <div className="page">
        <div className="card" style={{ textAlign: 'center', padding: '2rem', maxWidth: '420px', margin: '2rem auto' }}>
          <p style={{ fontSize: '2.5rem' }}>🎉</p>
          <h2>You&apos;re in the family!</h2>
          <p style={{ color: 'var(--text-secondary)' }}>
            You can now see <strong>{details.ownerName}</strong>&apos;s shared events in your calendar.
            Make sure <strong>View Family Events</strong> is turned on.
          </p>
          <button className="btn btn-primary" style={{ marginTop: '1rem' }} onClick={() => navigate('/calendar')}>
            Go to Calendar
          </button>
        </div>
      </div>
    )
  }

  // ── Accept form ────────────────────────────────────────────────────────────
  return (
    <div className="page">
      <div className="card" style={{ maxWidth: '460px', margin: '2rem auto', padding: '2rem' }}>
        <p style={{ fontSize: '2.5rem', textAlign: 'center' }}>🐾</p>
        <h2 style={{ textAlign: 'center', marginBottom: '0.5rem' }}>Family Invite</h2>
        <p style={{ color: 'var(--text-secondary)', textAlign: 'center' }}>
          <strong>{details.ownerName}</strong> has invited <strong>{details.memberName}</strong> to
          join their family calendar.
        </p>
        <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', textAlign: 'center', marginTop: '0.5rem' }}>
          Accepting lets you see their shared events in your calendar.
        </p>
        {error && (
          <div className="form-error-block">
            {errorStatus && HTTP_CAT_SUPPORTED.has(errorStatus) && (
              <HttpCatImage status={errorStatus} className="form-http-cat" />
            )}
            <p className="form-error" style={{ textAlign: 'center' }}>{error}</p>
          </div>
        )}
        <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center', marginTop: '1.5rem' }}>
          <button className="btn btn-primary" onClick={handleAccept} disabled={joining}>
            {joining ? 'Joining…' : 'Accept Invite 🐾'}
          </button>
          <button className="btn btn-secondary" onClick={() => navigate('/home')}>
            Decline
          </button>
        </div>
      </div>
    </div>
  )
}
