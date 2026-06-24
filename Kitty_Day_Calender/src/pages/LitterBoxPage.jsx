import { useState } from 'react'
import { useApp } from '../context/AppContext'
import litterBoxPhoto from '../assets/litter-box-photo.png'

function PawPrintIcon({ className }) {
  return (
    <svg viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg" className={className} aria-hidden="true">
      {/* Main central pad */}
      <ellipse cx="16" cy="22.5" rx="7" ry="5.5" fill="currentColor" />
      {/* Four toe beans */}
      <ellipse cx="7"  cy="14.5" rx="2.8" ry="3.5" fill="currentColor" />
      <ellipse cx="12" cy="10.5" rx="2.8" ry="3.5" fill="currentColor" />
      <ellipse cx="20" cy="10.5" rx="2.8" ry="3.5" fill="currentColor" />
      <ellipse cx="25" cy="14.5" rx="2.8" ry="3.5" fill="currentColor" />
    </svg>
  )
}

const MONTH_NAMES = [
  'Jan','Feb','Mar','Apr','May','Jun',
  'Jul','Aug','Sep','Oct','Nov','Dec',
]

function formatDate(iso) {
  if (!iso) return ''
  const d = new Date(iso + 'T00:00:00')
  return `${MONTH_NAMES[d.getMonth()]} ${d.getDate()}, ${d.getFullYear()}`
}

function formatDeletedAt(iso) {
  if (!iso) return ''
  const d = new Date(iso)
  return `${MONTH_NAMES[d.getMonth()]} ${d.getDate()} at ${d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`
}

function LitterBoxImg({ size = 90 }) {
  return (
    <img
      src={litterBoxPhoto}
      alt="Cat litter box"
      width={size}
      height={size}
      className="litterbox-photo"
      style={{ objectFit: 'contain', display: 'block' }}
    />
  )
}

export default function LitterBoxPage() {
  const { deletedEvents, emptyLitterBox, restoreEvent } = useApp()
  const [confirmClean, setConfirmClean]   = useState(false)
  const [cleaned, setCleaned]             = useState(false)

  function handleClean() {
    emptyLitterBox()
    setConfirmClean(false)
    setCleaned(true)
    setTimeout(() => setCleaned(false), 2500)
  }

  return (
    <>
      <div className="litterbox-page">

        <div className="litterbox-hero">
          <LitterBoxImg size={100} />
          <div>
            <h1>The Litter Box</h1>
            <p className="litterbox-subtitle">
              Deleted events rest here. Clean the litter box to remove them for good.
            </p>
          </div>
        </div>

        {cleaned && (
          <div className="litterbox-clean-msg">
            ✨ Your litter box has been scooped – it smells purrrr-fectly clean now!
          </div>
        )}

        {deletedEvents.length === 0 && !cleaned ? (
          <div className="card litterbox-empty">
            <span style={{ fontSize: '2.5rem' }}>😸</span>
            <p>Nothing here — your litter box is spotless!</p>
          </div>
        ) : (
          <>
            <div className="litterbox-list">
              {deletedEvents.map(e => (
                <div key={e.id} className="litterbox-item card">
                  <div className="litterbox-item-info">
                    <span className="litterbox-item-name">{e.name}</span>
                    {e.date && (
                      <span className="litterbox-item-date">📅 {formatDate(e.date)}</span>
                    )}
                    {(e.startTime || e.endTime) && (
                      <span className="litterbox-item-time">
                        🕐 {e.startTime}{e.endTime ? ` – ${e.endTime}` : ''}
                      </span>
                    )}
                  </div>
                  <div className="litterbox-item-actions">
                    <span className="litterbox-item-deleted">
                      Shredded {formatDeletedAt(e.deletedAt)}
                    </span>
                    <button
                      className="save-it-btn"
                      title="Save it — restore this event"
                      aria-label="Save it — restore this event"
                      onClick={() => restoreEvent(e.id)}
                    >
                      <PawPrintIcon className="save-it-icon" />
                      <span className="save-it-label">Save it!</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <div className="litterbox-actions">
              <button
                className="btn btn-danger"
                onClick={() => setConfirmClean(true)}
              >
                <svg
                  viewBox="0 0 22 22"
                  width="15" height="15"
                  aria-hidden="true"
                  style={{ display: 'inline-block', verticalAlign: 'middle', marginRight: '0.4em', flexShrink: 0 }}
                >
                  <line x1="18" y1="2" x2="13" y2="9"
                    stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
                  <path
                    fillRule="evenodd"
                    fill="currentColor"
                    d="M3,9 L14,9 L13,18 L4,18 Z
                       M5.5,11 L7,11 L7,17 L5.5,17 Z
                       M8,11 L9.5,11 L9.5,17 L8,17 Z
                       M10.5,11 L12,11 L12,17 L10.5,17 Z"
                  />
                </svg>
                Clean Litter Box
              </button>
            </div>
          </>
        )}
      </div>

      {/* Confirm clean modal */}
      {confirmClean && (
        <div className="logout-overlay" onClick={() => setConfirmClean(false)}>
          <div className="logout-modal" onClick={e => e.stopPropagation()}>
            <LitterBoxImg size={80} />
            <h2 className="logout-modal-title">Clean the litter box?</h2>
            <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', margin: 0 }}>
              This permanently removes all {deletedEvents.length} shredded event{deletedEvents.length !== 1 ? 's' : ''}.
            </p>
            <div className="logout-modal-actions">
              <button className="btn btn-danger" onClick={handleClean}>
                <svg
                  viewBox="0 0 22 22"
                  width="15" height="15"
                  aria-hidden="true"
                  style={{ display: 'inline-block', verticalAlign: 'middle', marginRight: '0.4em', flexShrink: 0 }}
                >
                  <line x1="18" y1="2" x2="13" y2="9"
                    stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
                  <path
                    fillRule="evenodd"
                    fill="currentColor"
                    d="M3,9 L14,9 L13,18 L4,18 Z
                       M5.5,11 L7,11 L7,17 L5.5,17 Z
                       M8,11 L9.5,11 L9.5,17 L8,17 Z
                       M10.5,11 L12,11 L12,17 L10.5,17 Z"
                  />
                </svg>
                Yes, clean it!
              </button>
              <button className="btn btn-secondary" onClick={() => setConfirmClean(false)}>
                Not yet
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
