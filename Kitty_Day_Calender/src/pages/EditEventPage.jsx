import { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useApp } from '../context/AppContext'
import oopsCat from '../assets/oops-cat.png'
import CatImagePicker from '../components/CatImagePicker'
import HttpCatImage from '../components/HttpCatImage'
import { HTTP_CAT_SUPPORTED } from '../lib/httpCat'

function LitterBox() {
  return (
    <svg
      viewBox="0 0 140 110"
      width="110"
      height="110"
      xmlns="http://www.w3.org/2000/svg"
      aria-label="Cat litter box with scoop"
    >
      {/* Box body */}
      <rect x="8" y="52" width="90" height="50" rx="6" fill="#d6c9a8" stroke="#b0a07a" strokeWidth="2" />
      {/* Box rim / opening */}
      <rect x="8" y="44" width="90" height="14" rx="4" fill="#c4b48e" stroke="#b0a07a" strokeWidth="2" />
      {/* Litter surface */}
      <ellipse cx="53" cy="57" rx="36" ry="6" fill="#e8dfc0" />
      {/* Litter dots */}
      <circle cx="38" cy="56" r="2.2" fill="#c4b48e" />
      <circle cx="50" cy="60" r="1.8" fill="#b8a87a" />
      <circle cx="62" cy="55" r="2"   fill="#c4b48e" />
      <circle cx="44" cy="61" r="1.5" fill="#b8a87a" />
      <circle cx="68" cy="59" r="1.8" fill="#c4b48e" />
      <circle cx="55" cy="54" r="1.4" fill="#b8a87a" />
      <circle cx="33" cy="60" r="1.6" fill="#c4b48e" />

      {/* Scoop handle */}
      <rect x="106" y="14" width="10" height="52" rx="5" fill="#a08860" stroke="#7a6040" strokeWidth="1.5" />
      {/* Scoop head */}
      <rect x="90" y="60" width="36" height="22" rx="5" fill="#c4a870" stroke="#7a6040" strokeWidth="1.5" />
      {/* Scoop slots */}
      <rect x="96" y="64" width="3" height="14" rx="1.5" fill="#7a6040" opacity="0.5" />
      <rect x="103" y="64" width="3" height="14" rx="1.5" fill="#7a6040" opacity="0.5" />
      <rect x="110" y="64" width="3" height="14" rx="1.5" fill="#7a6040" opacity="0.5" />
      <rect x="117" y="64" width="3" height="14" rx="1.5" fill="#7a6040" opacity="0.5" />

      {/* Tiny paw print beside box */}
      <circle cx="20" cy="100" r="3.5" fill="#b0a07a" opacity="0.6" />
      <circle cx="15" cy="95"  r="2"   fill="#b0a07a" opacity="0.6" />
      <circle cx="20" cy="93"  r="2"   fill="#b0a07a" opacity="0.6" />
      <circle cx="25" cy="95"  r="2"   fill="#b0a07a" opacity="0.6" />
    </svg>
  )
}

const NOTIFY_OPTIONS = [
  { value: '15min',  label: '15 minutes before' },
  { value: '30min',  label: '30 minutes before' },
  { value: '1hr',    label: '1 hour before' },
  { value: '1day',   label: '1 day before' },
  { value: '1week',  label: '1 week before' },
  { value: 'custom', label: 'Custom ✏️' },
]

export default function EditEventPage() {
  const { id }                    = useParams()
  const { userEvents, updateEvent, deleteEvent } = useApp()
  const navigate                  = useNavigate()

  const event = userEvents.find(e => e.id === id)

  // Pre-fill from existing event
  const [name,       setName]       = useState(event?.name       ?? '')
  const [date,       setDate]       = useState(event?.date       ?? '')
  const [startTime,  setStartTime]  = useState(event?.startTime  ?? '')
  const [endTime,    setEndTime]    = useState(event?.endTime    ?? '')
  const [notify,       setNotify]       = useState(event?.notify     ?? false)
  const [notifyWhen,   setNotifyWhen]   = useState(event?.notifyWhen ?? [])
  const [customMode,   setCustomMode]   = useState(event?.customNotify?.mode ?? 'interval')
  const [customAmount, setCustomAmount] = useState(event?.customNotify?.amount ?? '30')
  const [customUnit,   setCustomUnit]   = useState(event?.customNotify?.unit   ?? 'minutes')
  const [customDate,   setCustomDate]   = useState(event?.customNotify?.date   ?? '')
  const [customTime,   setCustomTime]   = useState(event?.customNotify?.time   ?? '')
  const [eventType,  setEventType]  = useState(event?.eventType  ?? 'other')
  const [imageUrl,   setImageUrl]   = useState(event?.imageUrl   ?? null)
  const [isPublic,   setIsPublic]   = useState(event?.familyVisible ?? false)
  const [error,       setError]       = useState('')
  const [errorStatus, setErrorStatus] = useState(null)

  // Delete confirmation flow: 'idle' | 'confirming' | 'deleted'
  const [deleteState, setDeleteState] = useState('idle')

  function toggleNotifyWhen(val) {
    setNotifyWhen(prev =>
      prev.includes(val) ? prev.filter(v => v !== val) : [...prev, val]
    )
  }

  async function handleSubmit(e) {
    e.preventDefault()
    if (!name.trim()) { setError('Please give your event a name.'); return }
    if (!date)        { setError('Please pick a date for your event.'); return }
    setError('')
    setErrorStatus(null)

    const result = await updateEvent(id, {
      name: name.trim(),
      date,
      startTime: startTime || null,
      endTime:   endTime   || null,
      notify,
      notifyWhen: notify ? notifyWhen : [],
      customNotify: notify && notifyWhen.includes('custom') ? {
        mode: customMode,
        ...(customMode === 'interval'
          ? { amount: customAmount, unit: customUnit }
          : { date: customDate, time: customTime }),
      } : null,
      eventType,
      imageUrl,
      familyVisible: isPublic,
    })

    if (!result?.success) { setError(result?.error || 'Failed to save event.'); setErrorStatus(result?.status ?? null); return }

    navigate('/calendar')
  }

  function handleDeleteConfirm() {
    deleteEvent(id)
    setDeleteState('deleted')
    setTimeout(() => navigate('/calendar'), 1800)
  }

  if (deleteState === 'deleted') {
    return (
      <div className="event-saved-screen">
        <img src={oopsCat} alt="Cat knocking something off a table" className="oops-cat-img" />
        <h2>Whelp, there goess that event.</h2>
        <p>Taking you back to your calendar…</p>
      </div>
    )
  }

  // Event not found (checked after delete state so the goodbye screen isn't skipped)
  if (!event) {
    return (
      <div className="event-form-page">
        <div className="event-form-header">
          <button className="link-btn" onClick={() => navigate('/calendar')}>← Back to Calendar</button>
          <h1>Event Not Found</h1>
        </div>
        <div className="card" style={{ textAlign: 'center', padding: '2rem' }}>
          <HttpCatImage status={404} className="error-http-cat" />
          <p style={{ marginTop: '1rem' }}>We couldn&apos;t find that event. It may have already been deleted.</p>
        </div>
      </div>
    )
  }

  return (
    <>
      <div className="event-form-page">
        <div className="event-form-header">
          <button className="link-btn" onClick={() => navigate(-1)}>← Back</button>
          <h1>Edit Event</h1>
        </div>

        <form className="event-form card" onSubmit={handleSubmit} noValidate>

          <div className="form-group">
            <label htmlFor="ev-name">Event Name <span className="req">*</span></label>
            <input
              id="ev-name"
              type="text"
              className="form-input"
              value={name}
              onChange={e => setName(e.target.value)}
            />
          </div>

          <div className="form-group">
            <label htmlFor="ev-date">Date <span className="req">*</span></label>
            <input
              id="ev-date"
              type="date"
              className="form-input"
              value={date}
              onChange={e => setDate(e.target.value)}
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="ev-start">Start Time</label>
              <input
                id="ev-start"
                type="time"
                className="form-input"
                value={startTime}
                onChange={e => setStartTime(e.target.value)}
              />
            </div>
            <div className="form-group">
              <label htmlFor="ev-end">End Time</label>
              <input
                id="ev-end"
                type="time"
                className="form-input"
                value={endTime}
                onChange={e => setEndTime(e.target.value)}
              />
            </div>
          </div>

          <div className="form-group">
            <label className="toggle-label">
              <span>Receive Notifications?</span>
              <button
                type="button"
                role="switch"
                aria-checked={notify}
                className={`toggle-switch${notify ? ' on' : ''}`}
                onClick={() => setNotify(v => !v)}
              >
                <span className="toggle-thumb" />
              </button>
            </label>

            {notify && (
              <div className="notify-options">
                <p className="notify-prompt">When do you want to be notified?</p>
                <div className="notify-chips">
                  {NOTIFY_OPTIONS.map(opt => (
                    <button
                      key={opt.value}
                      type="button"
                      className={`chip${notifyWhen.includes(opt.value) ? ' chip-on' : ''}`}
                      onClick={() => toggleNotifyWhen(opt.value)}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>

                {notifyWhen.includes('custom') && (
                  <div className="custom-notify-panel">
                    <div className="custom-notify-tabs">
                      <button
                        type="button"
                        className={`chip${customMode === 'interval' ? ' chip-on' : ''}`}
                        onClick={() => setCustomMode('interval')}
                      >
                        Set an interval
                      </button>
                      <button
                        type="button"
                        className={`chip${customMode === 'date' ? ' chip-on' : ''}`}
                        onClick={() => setCustomMode('date')}
                      >
                        Pick a date &amp; time
                      </button>
                    </div>

                    {customMode === 'interval' && (
                      <div className="custom-interval-row">
                        <span className="custom-interval-label">Remind me</span>
                        <input
                          type="number"
                          min="1"
                          max="999"
                          className="custom-interval-num"
                          value={customAmount}
                          onChange={e => setCustomAmount(e.target.value)}
                        />
                        <select
                          className="custom-interval-unit"
                          value={customUnit}
                          onChange={e => setCustomUnit(e.target.value)}
                        >
                          <option value="minutes">minutes before</option>
                          <option value="hours">hours before</option>
                          <option value="days">days before</option>
                          <option value="weeks">weeks before</option>
                        </select>
                      </div>
                    )}

                    {customMode === 'date' && (
                      <div className="custom-date-row">
                        <span className="custom-interval-label">Remind me on</span>
                        <div className="form-row" style={{ flex: 1 }}>
                          <div className="form-group">
                            <label>Date</label>
                            <input
                              type="date"
                              value={customDate}
                              onChange={e => setCustomDate(e.target.value)}
                            />
                          </div>
                          <div className="form-group">
                            <label>Time (optional)</label>
                            <input
                              type="time"
                              value={customTime}
                              onChange={e => setCustomTime(e.target.value)}
                            />
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="form-group">
            <label className="form-label">Mark as Holiday or Birthday?</label>
            <div className="event-type-row">
              {[
                { val: 'other',    icon: '🗓️', text: 'Regular event' },
                { val: 'holiday',  icon: '🎉', text: 'Holiday' },
                { val: 'birthday', icon: '🎂', text: 'Birthday' },
              ].map(opt => (
                <button
                  key={opt.val}
                  type="button"
                  className={`event-type-btn${eventType === opt.val ? ' active' : ''}`}
                  onClick={() => setEventType(opt.val)}
                >
                  <span>{opt.icon}</span>
                  <span>{opt.text}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">
              {eventType === 'other' ? 'Add Image 🐱' : 'Add Image 🐆'}
            </label>
            <CatImagePicker
              eventType={eventType}
              value={imageUrl}
              onChange={setImageUrl}
            />
          </div>

          <div className="form-group">
            <label className="toggle-label">
              <span>Make event public to family?</span>
              <button
                type="button"
                role="switch"
                aria-checked={isPublic}
                className={`toggle-switch${isPublic ? ' on' : ''}`}
                onClick={() => setIsPublic(v => !v)}
              >
                <span className="toggle-thumb" />
              </button>
            </label>
          </div>

          {error && (
            <div className="form-error-block">
              {errorStatus && HTTP_CAT_SUPPORTED.has(errorStatus) && (
                <HttpCatImage status={errorStatus} className="form-http-cat" />
              )}
              <p className="form-error">{error}</p>
            </div>
          )}

          <div className="event-form-actions">
            <button type="submit" className="btn btn-primary btn-lg">
              Save Changes 🐾
            </button>
            <button
              type="button"
              className="btn btn-danger"
              onClick={() => setDeleteState('confirming')}
            >
              Delete Event
            </button>
            <button type="button" className="btn btn-secondary" onClick={() => navigate(-1)}>
              Cancel
            </button>
          </div>

        </form>
      </div>

      {/* ── Delete confirmation modal ─────────────────────────────────────── */}
      {deleteState === 'confirming' && (
        <div className="logout-overlay" onClick={() => setDeleteState('idle')}>
          <div className="logout-modal" onClick={e => e.stopPropagation()}>
            <p className="logout-modal-emoji">😿</p>
            <h2 className="logout-modal-title">Delete &ldquo;{event.name}&rdquo;?</h2>
            <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', margin: 0 }}>
              This can&apos;t be undone.
            </p>
            <div className="logout-modal-actions">
              <button className="btn btn-danger" onClick={handleDeleteConfirm}>
                Yes, delete it
              </button>
              <button className="btn btn-secondary" onClick={() => setDeleteState('idle')}>
                Keep it
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
