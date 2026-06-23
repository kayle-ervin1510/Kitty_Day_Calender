import { useState, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useApp } from '../context/AppContext'

export default function ConfirmPage() {
  const { user, pendingUser, confirmRegistration } = useApp()
  const navigate = useNavigate()
  const location = useLocation()
  const email = location.state?.email || pendingUser?.email || 'your email address'

  // confirming: true once the user has clicked Continue.
  // Prevents the "no session" guard from bouncing to /login right after
  // confirmRegistration() clears pendingUser but before user state settles.
  const [confirming, setConfirming] = useState(false)

  useEffect(() => {
    if (confirming && user) {
      // State has settled with the new user — safe to navigate
      navigate('/home', { replace: true })
    } else if (!confirming && !pendingUser && !user) {
      // Someone landed here without going through registration
      navigate('/login', { replace: true })
    }
  }, [confirming, pendingUser, user, navigate])

  // Don't render until we know whether to show the page or redirect
  if (!pendingUser && !user && !confirming) return null

  function handleContinue() {
    setConfirming(true)
    confirmRegistration()
  }

  return (
    <div className="confirm-page">
      <div className="confirm-card card">
        <div className="confirm-icon">🐱</div>
        <h1>Confirm Your Email</h1>
        <p className="confirm-subtitle">A confirmation note has been sent to:</p>
        <p className="confirm-email">{email}</p>
        <p className="confirm-body">
          Please check your inbox — and your spam folder, because sometimes
          our kitties get stuck in there! Once you&apos;re ready, click Continue.
        </p>
        <button className="btn btn-primary btn-lg" onClick={handleContinue}>
          Continue 🐾
        </button>
      </div>
    </div>
  )
}
