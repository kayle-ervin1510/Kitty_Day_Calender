import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useApp } from '../context/AppContext'
import HttpCatImage from '../components/HttpCatImage'
import { HTTP_CAT_SUPPORTED } from '../lib/httpCat'

export default function FamilyPage() {
  const { user, familyMembers, updateProfile, addFamilyMember, removeFamilyMember, refreshFamilyMembers, generateInvite } = useApp()
  const navigate = useNavigate()

  const [removing, setRemoving]   = useState(null)
  const [adding, setAdding]       = useState(false)
  const [savedMsg, setSavedMsg]   = useState('')

  const [newName,       setNewName]       = useState('')
  const [newEmail,      setNewEmail]      = useState('')
  const [newPhone,      setNewPhone]      = useState('')
  const [addError,      setAddError]      = useState('')
  const [addErrorStatus,setAddErrorStatus]= useState(null)

  const [inviteLinks,   setInviteLinks]   = useState({})
  const [inviteLoading, setInviteLoading] = useState(null)
  const [copiedId,      setCopiedId]      = useState(null)

  const isFamily = user?.isFamilyAccount ?? false

  function flash(msg) {
    setSavedMsg(msg)
    setTimeout(() => setSavedMsg(''), 2500)
  }

  function resetAdd() {
    setAdding(false)
    setNewName(''); setNewEmail(''); setNewPhone(''); setAddError(''); setAddErrorStatus(null)
  }

  async function handleAdd(e) {
    e.preventDefault()
    if (!newName.trim()) { setAddError('Name is required.'); return }

    const emailTrimmed = newEmail.trim().toLowerCase()

    if (emailTrimmed) {
      if (emailTrimmed === user.email.toLowerCase()) {
        setAddError("You can't add yourself as a family member.")
        return
      }
      const duplicate = familyMembers.some(
        m => m.email && m.email.toLowerCase() === emailTrimmed
      )
      if (duplicate) {
        setAddError('A family member with that email has already been added.')
        return
      }
    }

    const result = await addFamilyMember({
      name:  newName.trim(),
      email: newEmail.trim() || null,
      phone: newPhone.trim() || null,
    })

    if (!result.success) { setAddError(result.error); setAddErrorStatus(result.status ?? null); return }

    const addedName = newName.trim()
    const addedEmail = newEmail.trim()
    resetAdd()
    flash(`${addedName} has been added to your family! 🐾`)

    if (addedEmail && result.member?.id) {
      const inviteResult = await generateInvite(result.member.id, addedEmail)
      if (inviteResult.success && inviteResult.url) {
        const subject = encodeURIComponent('You have been invited to Kitty Day Calendar!')
        const body = encodeURIComponent(
          `Hi ${addedName},\n\n${user.preferredName ?? user.name} has invited you to join their Kitty Day Calendar family account.\n\nClick the link below to accept:\n${inviteResult.url}\n\nSee you there! 🐾`
        )
        window.open(`mailto:${addedEmail}?subject=${subject}&body=${body}`, '_blank')
      }
    }
  }

  async function handleConfirmRemove(id) {
    const result = await removeFamilyMember(id)
    setRemoving(null)
    if (!result.success) flash(`Could not remove member: ${result.error}`)
  }

  async function handleGetInviteLink(m) {
    setInviteLoading(m.id)
    const result = await generateInvite(m.id, m.email)
    setInviteLoading(null)
    if (!result.success) { flash('Could not generate invite link.'); return }
    setInviteLinks(prev => ({ ...prev, [m.id]: result.url }))
  }

  function handleCopy(id, url) {
    navigator.clipboard.writeText(url)
    setCopiedId(id)
    setTimeout(() => setCopiedId(null), 2000)
  }

  return (
    <>
      <div className="family-page">

        <div className="family-hero">
          <span className="family-hero-icon">
            <span style={{ fontSize: '2.2rem' }}>🐱</span>
            <span style={{ fontSize: '1.1rem', lineHeight: 1, color: 'var(--text-secondary)' }}>+</span>
            <span style={{ fontSize: '2.2rem' }}>🐱</span>
          </span>
          <div>
            <h1>Family Account</h1>
            <p className="family-hero-sub">Share your calendar with your whole household.</p>
          </div>
        </div>

        {/* Enable / disable family account */}
        <div className="card family-toggle-card">
          <div className="family-toggle-row">
            <div>
              <p className="family-toggle-title">Family Account</p>
              <p className="family-toggle-desc">
                {isFamily
                  ? 'Active — family members can see your shared events.'
                  : 'Enable to add household members and share events.'}
              </p>
            </div>
            <button
              type="button"
              role="switch"
              aria-checked={isFamily}
              className={`toggle-switch${isFamily ? ' on' : ''}`}
              onClick={() => updateProfile({ isFamilyAccount: !isFamily })}
            >
              <span className="toggle-thumb" />
            </button>
          </div>
        </div>

        {isFamily && (
          <>
            {savedMsg && <div className="litterbox-clean-msg">{savedMsg}</div>}

            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
              <button className="btn btn-sm btn-secondary" onClick={refreshFamilyMembers}>
                ↻ Refresh Members
              </button>
            </div>

            {/* Member list */}
            {familyMembers.length === 0 ? (
              <div className="card family-empty">
                <span style={{ fontSize: '2.5rem' }}>🐱</span>
                <p>No family members added yet.</p>
              </div>
            ) : (
              <div className="family-list">
                {familyMembers.map(m => (
                  <div key={m.id} className="card family-member-row">
                    <span className="family-member-pic">🐱</span>
                    <div className="family-member-info">
                      <span className="family-member-name">
                        {m.name}
                        {m.linkedUserId && (
                          <span className="family-member-linked">✓ Linked</span>
                        )}
                      </span>
                      {m.email && (
                        <span className="family-member-detail">{m.email}</span>
                      )}
                      {inviteLinks[m.id] && (
                        <div className="family-invite-link-row">
                          <input
                            className="family-invite-link-input"
                            readOnly
                            value={inviteLinks[m.id]}
                          />
                          <button
                            className="btn btn-sm btn-secondary"
                            onClick={() => handleCopy(m.id, inviteLinks[m.id])}
                          >
                            {copiedId === m.id ? 'Copied!' : 'Copy'}
                          </button>
                        </div>
                      )}
                    </div>
                    <div className="family-member-actions">
                      {!m.linkedUserId && (
                        <button
                          className="btn btn-sm btn-secondary"
                          disabled={inviteLoading === m.id}
                          onClick={() => handleGetInviteLink(m)}
                        >
                          {inviteLoading === m.id ? '...' : 'Invite Link'}
                        </button>
                      )}
                      <button
                        className="btn btn-sm btn-danger"
                        onClick={() => setRemoving(m.id)}
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Add member form */}
            {!adding ? (
              <button className="btn btn-primary btn-full" onClick={() => setAdding(true)}>
                + Add Family Member
              </button>
            ) : (
              <form className="card family-add-form" onSubmit={handleAdd}>
                <h3 className="family-add-title">Add a Family Member</h3>

                <div className="form-group">
                  <label htmlFor="fm-name">Full Name <span className="req">*</span></label>
                  <input
                    id="fm-name"
                    type="text"
                    placeholder="e.g. Mochi"
                    value={newName}
                    onChange={e => { setNewName(e.target.value); setAddError('') }}
                    autoFocus
                  />
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="fm-email">Email</label>
                    <input
                      id="fm-email"
                      type="email"
                      placeholder="optional"
                      value={newEmail}
                      onChange={e => setNewEmail(e.target.value)}
                    />
                  </div>
                  <div className="form-group">
                    <label htmlFor="fm-phone">Phone</label>
                    <input
                      id="fm-phone"
                      type="tel"
                      placeholder="optional"
                      value={newPhone}
                      onChange={e => setNewPhone(e.target.value)}
                    />
                  </div>
                </div>

                {addError && (
                  <div className="form-error-block">
                    {addErrorStatus && HTTP_CAT_SUPPORTED.has(addErrorStatus) && (
                      <HttpCatImage status={addErrorStatus} className="form-http-cat" />
                    )}
                    <p className="form-error">{addError}</p>
                  </div>
                )}

                <div className="family-add-actions">
                  <button type="submit" className="btn btn-primary">Add to Family 🐾</button>
                  <button type="button" className="btn btn-secondary" onClick={resetAdd}>Cancel</button>
                </div>
              </form>
            )}
          </>
        )}

        <p className="family-back">
          <button className="link-btn" onClick={() => navigate('/profile')}>
            ← Back to Profile
          </button>
        </p>

      </div>

      {/* Remove confirmation modal */}
      {removing && (
        <div className="logout-overlay" onClick={() => setRemoving(null)}>
          <div className="logout-modal" onClick={e => e.stopPropagation()}>
            <p className="logout-modal-emoji">😿</p>
            <h2 className="logout-modal-title">
              Remove {familyMembers.find(m => m.id === removing)?.name}?
            </h2>
            <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', margin: 0 }}>
              They&apos;ll no longer have access to shared events.
            </p>
            <div className="logout-modal-actions">
              <button className="btn btn-danger" onClick={() => handleConfirmRemove(removing)}>
                Yes, remove
              </button>
              <button className="btn btn-secondary" onClick={() => setRemoving(null)}>
                Keep them
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
