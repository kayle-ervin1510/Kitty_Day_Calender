import { useState, useEffect } from 'react'
import { useSearchParams, useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { useApp } from '../context/AppContext'

export default function JoinFamilyPage() {
  const [searchParams] = useSearchParams()
  const token = searchParams.get('token')
  const { user, initializing, acceptInvite } = useApp()
  const navigate = useNavigate()

  const [details,  setDetails]  = useState(null)
  const [loading,  setLoading]  = useState(true)
  const [joining,  setJoining]  = useState(false)
  const [error,    setError]    = useState('')
  const [done,     setDone]     = useState(false)

  useEffect(() => {
    if (!token) { setLoading(false); return }
    supabase.rpc('get_invite_details', { p_token: token })
      .then(({ data }) => { setDetails(data); setLoading(false) })
  }, [token])

  async function handleAccept() {
    setJoining(true)
    setError('')
    const result = await acceptInvite(token)
    setJoining(false)
    if (!result.success) { setError(result.error); return }
    setDone(true)
  }

  if (initializing || loading) {
    return (
      <div className="page">
        <div className="card" style={{ textAlign: 'center', padding: '2rem' }}>
          <p style={{ fontSize: '2rem' }}>🐱</p>
          <p style={{ color: 'var(--text-secondary)' }}>Loading invite...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="page">
        <div className="card" style={{ maxWidth: '460px', margin: '2rem auto', padding: '2rem', textAlign: 'center' }}>
          <p style={{ fontSize: '2.5rem' }}>🐾</p>
          <h2>Family Invite</h2>
          {details?.found && (
            <p style={{ color: 'var(--text-secondary)' }}>
              <strong>{details.ownerName}</strong> has invited <strong>{details.memberName}</strong> to
              join their family calendar.
            </p>
          )}
          <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '0.5rem' }}>
            Log in or sign up to accept this invite.
          </p>
          <button
            className="btn btn-primary"
            style={{ marginTop: '1rem' }}
            onClick={() => {
              sessionStorage.setItem('kitty_join_redirect', window.location.href)
              navigate('/login')
            }}
          >
            Log in to Accept
          </button>
        </div>
      </div>
    )
  }

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

  if (done) {
    return (
      <div className="page">
        <div className="card" style={{ textAlign: 'center', padding: '2rem', maxWidth: '420px', margin: '2rem auto' }}>
          <p style={{ fontSize: '2.5rem' }}>🎉</p>
          <h2>You&apos;re in the family!</h2>
          <p style={{ color: 'var(--text-secondary)' }}>
            You can now see <strong>{details.ownerName}</strong>&apos;s shared events in your calendar.
            Make sure <strong>View Family Events</strong> is turned on in the calendar.
          </p>
          <button className="btn btn-primary" style={{ marginTop: '1rem' }} onClick={() => navigate('/calendar')}>
            Go to Calendar
          </button>
        </div>
      </div>
    )
  }

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
        {error && <p className="form-error" style={{ textAlign: 'center' }}>{error}</p>}
        <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center', marginTop: '1.5rem' }}>
          <button className="btn btn-primary" onClick={handleAccept} disabled={joining}>
            {joining ? 'Joining...' : 'Accept Invite 🐾'}
          </button>
          <button className="btn btn-secondary" onClick={() => navigate('/home')}>
            Decline
          </button>
        </div>
      </div>
    </div>
  )
}
