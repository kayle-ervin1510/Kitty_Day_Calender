import { useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useApp } from '../context/AppContext'
import CatImagePicker from '../components/CatImagePicker'
import FormError from '../components/FormError'

const NOTIFY_OPTIONS = [
  { value: '15min',  label: '15 minutes before' },
  { value: '30min',  label: '30 minutes before' },
  { value: '1hr',    label: '1 hour before' },
  { value: '1day',   label: '1 day before' },
  { value: '1week',  label: '1 week before' },
  { value: 'custom', label: 'Custom ✏️' },
]

export default function AddEventPage() {
  const { addEvent } = useApp()
  const navigate     = useNavigate()
  const [params]     = useSearchParams()

  const prefillDate  = params.get('date') || ''

  const [name,       setName]       = useState('')
  const [date,       setDate]       = useState(prefillDate)
  const [startTime,  setStartTime]  = useState('')
  const [endTime,    setEndTime]    = useState('')
  const [notify,       setNotify]       = useState(false)
  const [notifyWhen,   setNotifyWhen]   = useState([])
  const [customMode,   setCustomMode]   = useState('interval') // 'interval' | 'date'
  const [customAmount, setCustomAmount] = useState('30')
  const [customUnit,   setCustomUnit]   = useState('minutes')
  const [customDate,   setCustomDate]   = useState('')
  const [customTime,   setCustomTime]   = useState('')
  const [eventType,  setEventType]  = useState('other')   // 'other' | 'holiday' | 'birthday'
  const [imageUrl,      setImageUrl]      = useState(null)
  const [imageCaption,  setImageCaption]  = useState('')
  const [isPublic,   setIsPublic]   = useState(false)
  const [error,       setError]       = useState('')
  const [errorStatus, setErrorStatus] = useState(null)
  const [saved,       setSaved]       = useState(false)

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

    const result = await addEvent({
      name:      name.trim(),
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
      imageCaption,
      familyVisible: isPublic,
    })

    if (!result.success) { setError(result.error || 'Failed to save event.'); setErrorStatus(result.status ?? null); return }

    setSaved(true)
    setTimeout(() => navigate('/calendar'), 1800)
  }

  if (saved) {
    return (
      <div className="event-saved-screen">
        <p className="event-saved-emoji">🐾</p>
        <h2>Event saved!</h2>
        <p>Taking you back to your calendar…</p>
      </div>
    )
  }

  return (
    <div className="event-form-page">
      <div className="event-form-header">
        <button className="link-btn" onClick={() => navigate(-1)}>← Back</button>
        <h1>Add Event</h1>
      </div>

      <form className="event-form card" onSubmit={handleSubmit} noValidate>

        {/* Event name */}
        <div className="form-group">
          <label htmlFor="ev-name">Event Name <span className="req">*</span></label>
          <input
            id="ev-name"
            type="text"
            className="form-input"
            placeholder="e.g. Vet appointment"
            value={name}
            onChange={e => setName(e.target.value)}
          />
        </div>

        {/* Date */}
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

        {/* Time range */}
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

        {/* Notifications */}
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

        {/* Mark as holiday / birthday */}
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

        {/* Cat image picker */}
        <div className="form-group">
          <label className="form-label">
            {eventType === 'other' ? 'Add Image 🐱' : 'Add Image 🐆'}
          </label>
          <CatImagePicker
            eventType={eventType}
            value={imageUrl}
            onChange={(url, fact) => { setImageUrl(url); setImageCaption(fact || '') }}
          />
        </div>

        {/* Public to family */}
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

        <FormError message={error} status={errorStatus} />

        <div className="event-form-actions">
          <button type="submit" className="btn btn-primary btn-lg">
            Create Event! 🐾
          </button>
          <button type="button" className="btn btn-secondary" onClick={() => navigate(-1)}>
            Cancel
          </button>
        </div>

      </form>
    </div>
  )
}
