import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'

export default function AuthCallbackPage() {
  const navigate = useNavigate()
  const [error, setError] = useState(null)

  useEffect(() => {
    const code = new URLSearchParams(window.location.search).get('code')

    if (!code) {
      navigate('/login', { replace: true })
      return
    }

    supabase.auth.exchangeCodeForSession(code).then(({ error: err }) => {
      if (err) {
        setError(err.message)
      }
      // On success, onAuthStateChange fires in AppContext, sets user,
      // and ProtectedLayout redirects to /home automatically.
    })
  }, [navigate])

  if (error) {
    return (
      <div className="confirm-page">
        <div className="confirm-card card">
          <div className="confirm-icon">😿</div>
          <h1>Confirmation Failed</h1>
          <p className="confirm-body">
            This link has expired or was already used. Please request a new one.
          </p>
          <p className="confirm-body" style={{ fontSize: '0.85rem', opacity: 0.6 }}>{error}</p>
          <button className="btn btn-primary btn-full" onClick={() => navigate('/login', { replace: true })}>
            Back to Login
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="confirm-page">
      <div className="confirm-card card">
        <div className="confirm-icon">🐱</div>
        <h1>Confirming your account…</h1>
        <p className="confirm-body">Hang tight while we verify your email!</p>
      </div>
    </div>
  )
}
