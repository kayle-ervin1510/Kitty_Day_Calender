import { useState } from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import { useApp } from '../context/AppContext'

export default function Navbar() {
  const { logout, deletedEvents } = useApp()
  const deletedCount = deletedEvents?.length ?? 0
  const navigate   = useNavigate()

  const [logoutState, setLogoutState] = useState('idle')
  const [menuOpen,    setMenuOpen]    = useState(false)

  function closeMenu() { setMenuOpen(false) }

  function handleLogoutClick() {
    closeMenu()
    setLogoutState('confirming')
  }

  function handleConfirmYes() {
    setLogoutState('goodbye')
    setTimeout(() => {
      logout()
      setLogoutState('idle')
      navigate('/login')
    }, 2500)
  }

  function handleConfirmNo() {
    setLogoutState('staying')
    setTimeout(() => setLogoutState('idle'), 2200)
  }

  return (
    <>
      <nav className="navbar">
        <div className="navbar-inner">
          <NavLink to="/home" className="navbar-brand" onClick={closeMenu}>
            <span className="brand-icon">🐱</span>
            Kitty Day Calendar
          </NavLink>

          <button
            className="navbar-hamburger"
            aria-label={menuOpen ? 'Close menu' : 'Open menu'}
            aria-expanded={menuOpen}
            onClick={() => setMenuOpen(v => !v)}
          >
            {menuOpen ? '✕' : '☰'}
          </button>

          <div className={`navbar-links${menuOpen ? ' open' : ''}`}>
            <NavLink
              to="/calendar"
              className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`}
              onClick={closeMenu}
            >
              Calendar
            </NavLink>
            <NavLink
              to="/profile"
              className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`}
              onClick={closeMenu}
            >
              My Profile
            </NavLink>
            <NavLink
              to="/about"
              className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`}
              onClick={closeMenu}
            >
              About
            </NavLink>
            <NavLink
              to="/litter-box"
              className={({ isActive }) => `nav-link nav-litterbox${isActive ? ' active' : ''}`}
              onClick={closeMenu}
            >
              <svg
                viewBox="0 0 22 22"
                width="15" height="15"
                aria-hidden="true"
                style={{ display: 'inline-block', verticalAlign: 'middle', marginRight: '0.3em', flexShrink: 0 }}
              >
                {/* Handle */}
                <line x1="18" y1="2" x2="13" y2="9"
                  stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
                {/* Scoop body with vertical slot cutouts via evenodd */}
                <path
                  fillRule="evenodd"
                  fill="currentColor"
                  d="M3,9 L14,9 L13,18 L4,18 Z
                     M5.5,11 L7,11 L7,17 L5.5,17 Z
                     M8,11 L9.5,11 L9.5,17 L8,17 Z
                     M10.5,11 L12,11 L12,17 L10.5,17 Z"
                />
              </svg>
              Litter Box
              {deletedCount > 0 && (
                <span className="nav-litter-badge">{deletedCount}</span>
              )}
            </NavLink>
            <button onClick={handleLogoutClick} className="nav-link nav-logout">
              Sign Out
            </button>
          </div>
        </div>
      </nav>

      {/* ── Logout modal overlay ──────────────────────────────────────────── */}
      {logoutState !== 'idle' && (
        <div className="logout-overlay" onClick={logoutState === 'confirming' ? handleConfirmNo : undefined}>
          <div className="logout-modal" onClick={e => e.stopPropagation()}>

            {logoutState === 'confirming' && (
              <>
                <p className="logout-modal-emoji">😿</p>
                <h2 className="logout-modal-title">Do you really want to leave?</h2>
                <div className="logout-modal-actions">
                  <button className="btn btn-danger" onClick={handleConfirmYes}>
                    Yes, log out
                  </button>
                  <button className="btn btn-primary" onClick={handleConfirmNo}>
                    No, keep me logged in
                  </button>
                </div>
              </>
            )}

            {logoutState === 'goodbye' && (
              <>
                <p className="logout-modal-emoji">🐾</p>
                <p className="logout-modal-msg">All right...see you soon!</p>
              </>
            )}

            {logoutState === 'staying' && (
              <>
                <p className="logout-modal-emoji">😸</p>
                <p className="logout-modal-msg">Furrtastic! Let&apos;s get planning!</p>
              </>
            )}

          </div>
        </div>
      )}
    </>
  )
}
