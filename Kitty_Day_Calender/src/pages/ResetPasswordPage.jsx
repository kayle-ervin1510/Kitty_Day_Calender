import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'

export default function ResetPasswordPage() {
  const navigate = useNavigate()
  const [newPassword, setNewPassword]     = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError]   = useState('')
  const [success, setSuccess] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')

    if (newPassword.length < 6) {
      setError('Password must be at least 6 characters.')
      return
    }
    if (newPassword !== confirmPassword) {
      setError('Passwords do not match.')
      return
    }

    const { error: err } = await supabase.auth.updateUser({ password: newPassword })
    if (err) {
      setError(err.message)
      return
    }

    setSuccess(true)
    setTimeout(() => navigate('/home', { replace: true }), 2500)
  }

  return (
    <div className="login-page">
      <div className="login-brand">
        <div className="brand-cat">🔐</div>
        <h1>Set New Password</h1>
        <p>Choose a new password for your Kitty Day Calendar account.</p>
      </div>

      <div className="login-card">
        {success ? (
          <div style={{ textAlign: 'center', padding: '1.5rem 0' }}>
            <p style={{ fontSize: '2rem' }}>🐾</p>
            <p className="form-success">Password updated! Redirecting you home…</p>
          </div>
        ) : (
          <form className="login-form" onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="rp-pw">New Password</label>
              <input
                id="rp-pw"
                type="password"
                placeholder="At least 6 characters"
                value={newPassword}
                onChange={e => setNewPassword(e.target.value)}
                required
                autoFocus
              />
            </div>
            <div className="form-group">
              <label htmlFor="rp-cpw">Confirm New Password</label>
              <input
                id="rp-cpw"
                type="password"
                placeholder="Re-enter your new password"
                value={confirmPassword}
                onChange={e => setConfirmPassword(e.target.value)}
                required
              />
            </div>
            {error && <p className="form-error">{error}</p>}
            <button type="submit" className="btn btn-primary btn-full btn-lg">
              Update Password 🐾
            </button>
          </form>
        )}
      </div>
    </div>
  )
}
