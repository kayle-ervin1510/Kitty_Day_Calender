import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useApp } from '../context/AppContext'

export default function LoginPage() {
  const { login, register, resetPassword } = useApp()
  const navigate = useNavigate()
  const [tab, setTab] = useState('signin')
  const [error, setError] = useState('')

  const [showForgot, setShowForgot] = useState(false)
  const [forgotEmail, setForgotEmail] = useState('')
  const [forgotMsg, setForgotMsg] = useState('')
  const [forgotError, setForgotError] = useState('')

  async function handleForgot(e) {
    e.preventDefault()
    setForgotMsg('')
    setForgotError('')
    const result = await resetPassword(forgotEmail.trim())
    if (result.success) {
      setForgotMsg('Check your email for a password reset link! 🐾')
      setForgotEmail('')
    } else {
      setForgotError(result.error)
    }
  }

  const [signInForm, setSignInForm] = useState({ usernameOrEmail: '', password: '' })
  const [signUpForm, setSignUpForm] = useState({
    name: '', preferredName: '', username: '',
    email: '', confirmEmail: '',
    password: '', confirmPassword: '',
  })

  async function handleSignIn(e) {
    e.preventDefault()
    setError('')
    const result = await login(signInForm.usernameOrEmail, signInForm.password)
    if (result.success) {
      navigate('/home')
    } else {
      setError(result.error)
    }
  }

  async function handleSignUp(e) {
    e.preventDefault()
    setError('')
    if (signUpForm.email !== signUpForm.confirmEmail) {
      setError('Email addresses do not match.')
      return
    }
    if (signUpForm.password !== signUpForm.confirmPassword) {
      setError('Passwords do not match.')
      return
    }
    if (signUpForm.password.length < 6) {
      setError('Password must be at least 6 characters.')
      return
    }
    const result = await register(signUpForm)
    if (result.success) {
      navigate('/confirm', { state: { email: signUpForm.email } })
    } else {
      setError(result.error || 'Registration failed.')
    }
  }

  function siField(field, value) {
    setSignInForm(prev => ({ ...prev, [field]: value }))
    setError('')
  }

  function suField(field, value) {
    setSignUpForm(prev => ({ ...prev, [field]: value }))
    setError('')
  }

  function switchTab(next) {
    setTab(next)
    setError('')
  }

  return (
    <div className="login-page">
      <div className="login-brand">
        <div className="brand-cat">🐱</div>
        <h1>Kitty Day Calendar</h1>
        <p>
          {tab === 'signin'
            ? 'To log in, enter your username or email and password. New here? Please sign up!'
            : 'Create your account and start tracking your schedule with daily cat facts!'}
        </p>
      </div>

      <div className="login-card">
        <div className="login-tabs">
          <button
            className={`login-tab${tab === 'signin' ? ' active' : ''}`}
            onClick={() => switchTab('signin')}
          >
            Sign In
          </button>
          <button
            className={`login-tab${tab === 'signup' ? ' active' : ''}`}
            onClick={() => switchTab('signup')}
          >
            Sign Up
          </button>
        </div>

        {tab === 'signin' ? (
          <form className="login-form" onSubmit={handleSignIn}>
            <div className="form-group">
              <label htmlFor="si-id">Username or Email</label>
              <input
                id="si-id"
                type="text"
                placeholder="Enter your username or email"
                value={signInForm.usernameOrEmail}
                onChange={e => siField('usernameOrEmail', e.target.value)}
                required
                autoFocus
              />
            </div>
            <div className="form-group">
              <label htmlFor="si-pw">Password</label>
              <input
                id="si-pw"
                type="password"
                placeholder="Enter your password"
                value={signInForm.password}
                onChange={e => siField('password', e.target.value)}
                required
              />
            </div>
            <p style={{ textAlign: 'right', margin: '-0.25rem 0 0.5rem' }}>
              <button
                type="button"
                className="link-btn"
                onClick={() => { setShowForgot(v => !v); setForgotMsg(''); setForgotError('') }}
              >
                Forgot password?
              </button>
            </p>

            {showForgot && (
              <form className="forgot-form" onSubmit={handleForgot}>
                <div className="form-group">
                  <label htmlFor="forgot-email">Enter your email to reset your password</label>
                  <input
                    id="forgot-email"
                    type="email"
                    placeholder="your@email.com"
                    value={forgotEmail}
                    onChange={e => setForgotEmail(e.target.value)}
                    required
                  />
                </div>
                {forgotError && <p className="form-error">{forgotError}</p>}
                {forgotMsg   && <p className="form-success">{forgotMsg}</p>}
                <button type="submit" className="btn btn-secondary btn-full">
                  Send Reset Link 📧
                </button>
              </form>
            )}

            {error && <p className="form-error">{error}</p>}
            <button type="submit" className="btn btn-primary btn-full btn-lg">
              Sign In 🐾
            </button>
            <p className="login-switch">
              Don&apos;t have an account?{' '}
              <button type="button" className="link-btn" onClick={() => switchTab('signup')}>
                Sign up here
              </button>
            </p>
          </form>
        ) : (
          <form className="login-form" onSubmit={handleSignUp}>
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="su-name">Full Name</label>
                <input
                  id="su-name"
                  type="text"
                  placeholder="Your full name"
                  value={signUpForm.name}
                  onChange={e => suField('name', e.target.value)}
                  required
                  autoFocus
                />
              </div>
              <div className="form-group">
                <label htmlFor="su-pref">Preferred Name</label>
                <input
                  id="su-pref"
                  type="text"
                  placeholder="e.g. Kitty (optional)"
                  value={signUpForm.preferredName}
                  onChange={e => suField('preferredName', e.target.value)}
                />
              </div>
            </div>
            <div className="form-group">
              <label htmlFor="su-user">Username</label>
              <input
                id="su-user"
                type="text"
                placeholder="Choose a username"
                value={signUpForm.username}
                onChange={e => suField('username', e.target.value)}
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor="su-email">Email</label>
              <input
                id="su-email"
                type="email"
                placeholder="your@email.com"
                value={signUpForm.email}
                onChange={e => suField('email', e.target.value)}
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor="su-cemail">Confirm Email</label>
              <input
                id="su-cemail"
                type="email"
                placeholder="Re-enter your email"
                value={signUpForm.confirmEmail}
                onChange={e => suField('confirmEmail', e.target.value)}
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor="su-pw">Password</label>
              <input
                id="su-pw"
                type="password"
                placeholder="At least 6 characters"
                value={signUpForm.password}
                onChange={e => suField('password', e.target.value)}
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor="su-cpw">Confirm Password</label>
              <input
                id="su-cpw"
                type="password"
                placeholder="Re-enter your password"
                value={signUpForm.confirmPassword}
                onChange={e => suField('confirmPassword', e.target.value)}
                required
              />
            </div>
            {error && <p className="form-error">{error}</p>}
            <button type="submit" className="btn btn-primary btn-full btn-lg">
              Create Account 🐱
            </button>
            <p className="login-switch">
              Already have an account?{' '}
              <button type="button" className="link-btn" onClick={() => switchTab('signin')}>
                Sign in here
              </button>
            </p>
          </form>
        )}
      </div>
    </div>
  )
}
