import { useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useApp } from '../context/AppContext'

export default function ConfirmPage() {
  const { user, pendingUser } = useApp()
  const navigate = useNavigate()
  const location = useLocation()
  const email = location.state?.email || pendingUser?.email || 'your email address'

  useEffect(() => {
    if (user) {
      // Session confirmed (either email link clicked or no confirmation required)
      navigate('/home', { replace: true })
    } else if (!pendingUser) {
      // Landed here without going through registration
      navigate('/login', { replace: true })
    }
  }, [user, pendingUser, navigate])

  if (!pendingUser && !user) return null

  return (
    <div className="confirm-page">
      <div className="confirm-card card">
        <div className="confirm-icon">🐱</div>
        <h1>Check Your Email</h1>
        <p className="confirm-subtitle">A confirmation link has been sent to:</p>
        <p className="confirm-email">{email}</p>
        <p className="confirm-body">
          Please check your inbox — and your spam folder, because sometimes
          our kitties get stuck in there! Click the link in the email to
          activate your account and you&apos;ll be taken right in.
        </p>
      </div>
    </div>
  )
}
