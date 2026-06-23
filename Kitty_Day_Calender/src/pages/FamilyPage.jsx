import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useApp } from '../context/AppContext'

// addStep values: null | 'choose' | 'create' | 'link' | 'link-confirm'

export default function FamilyPage() {
  const { user, familyMembers, updateProfile, addFamilyMember, removeFamilyMember, registerFamilyMember, lookupUser } = useApp()
  const navigate = useNavigate()

  const [removing,  setRemoving]  = useState(null)
  const [addStep,   setAddStep]   = useState(null)
  const [savedMsg,  setSavedMsg]  = useState('')

  // --- Create new account form state ---
  const [newName,     setNewName]     = useState('')
  const [newUsername, setNewUsername] = useState('')
  const [newEmail,    setNewEmail]    = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [newConfirm,  setNewConfirm]  = useState('')
  const [createError, setCreateError] = useState('')

  // --- Link existing account form state ---
  const [linkCred,    setLinkCred]    = useState('')
  const [linkPass,    setLinkPass]    = useState('')
  const [linkError,   setLinkError]   = useState('')
  const [foundUser,   setFoundUser]   = useState(null)  // result of lookupUser

  const isFamily  = user?.isFamilyAccount ?? false
  const myMembers = familyMembers.filter(m => m.ownerId === user?.id)

  function flash(msg) {
    setSavedMsg(msg)
    setTimeout(() => setSavedMsg(''), 2500)
  }

  function resetAdd() {
    setAddStep(null)
    setNewName(''); setNewUsername(''); setNewEmail(''); setNewPassword(''); setNewConfirm(''); setCreateError('')
    setLinkCred(''); setLinkPass(''); setLinkError(''); setFoundUser(null)
  }

  // ── Create new account ────────────────────────────────────────────────────

  function handleCreate(e) {
    e.preventDefault()
    if (!newName.trim())     { setCreateError('Name is required.'); return }
    if (!newUsername.trim()) { setCreateError('Username is required.'); return }
    if (!newEmail.trim())    { setCreateError('Email is required.'); return }
    if (newPassword.length < 6) { setCreateError('Password must be at least 6 characters.'); return }
    if (newPassword !== newConfirm) { setCreateError('Passwords do not match.'); return }

    const result = registerFamilyMember({
      name: newName.trim(),
      username: newUsername.trim(),
      email: newEmail.trim(),
      password: newPassword,
    })
    if (!result.success) { setCreateError(result.error); return }

    addFamilyMember({
      userId:   result.newUser.id,
      name:     result.newUser.name,
      username: result.newUser.username,
      profilePic: result.newUser.profilePic,
    })
    resetAdd()
    flash(`${result.newUser.name} has been added to your family! 🐾`)
  }

  // ── Link existing account ─────────────────────────────────────────────────

  function handleLinkLookup(e) {
    e.preventDefault()
    if (!linkCred.trim() || !linkPass) { setLinkError('Please enter credentials.'); return }

    // Prevent linking own account
    if (linkCred.trim() === user.username || linkCred.trim() === user.email) {
      setLinkError("That's your own account!")
      return
    }
    // Prevent linking an account already in the family
    const found = lookupUser(linkCred.trim(), linkPass)
    if (!found) { setLinkError('No account found with those credentials. Please check and try again.'); return }

    const alreadyLinked = myMembers.some(m => m.userId === found.id)
    if (alreadyLinked) { setLinkError(`${found.name} is already in your family.`); return }

    setLinkError('')
    setFoundUser(found)
    setAddStep('link-confirm')
  }

  function handleLinkConfirm() {
    addFamilyMember({
      userId:   foundUser.id,
      name:     foundUser.name,
      username: foundUser.username,
      profilePic: foundUser.profilePic,
    })
    resetAdd()
    flash(`${foundUser.name} has been added to your family! 🐾`)
  }

  function handleConfirmRemove(id) {
    removeFamilyMember(id)
    setRemoving(null)
  }

  // ── Render ────────────────────────────────────────────────────────────────

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

            {/* Member list */}
            {myMembers.length === 0 ? (
              <div className="card family-empty">
                <span style={{ fontSize: '2.5rem' }}>🐱</span>
                <p>No family members added yet.</p>
              </div>
            ) : (
              <div className="family-list">
                {myMembers.map(m => (
                  <div key={m.id} className="card family-member-row">
                    <span className="family-member-pic">{m.profilePic || '🐱'}</span>
                    <div className="family-member-info">
                      <span className="family-member-name">{m.name}</span>
                      {m.username && (
                        <span className="family-member-detail">@{m.username}</span>
                      )}
                    </div>
                    <button
                      className="btn btn-sm btn-danger"
                      onClick={() => setRemoving(m.id)}
                    >
                      Remove
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* Add member — multi-step */}
            {addStep === null && (
              <button className="btn btn-primary btn-full" onClick={() => setAddStep('choose')}>
                + Add Family Member
              </button>
            )}

            {addStep === 'choose' && (
              <div className="card family-add-form">
                <h3 className="family-add-title">Add a Family Member</h3>
                <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: '1.2rem' }}>
                  Does this family member already have a Kitty Day Calendar account?
                </p>
                <div className="family-choose-btns">
                  <button className="btn btn-primary" onClick={() => setAddStep('link')}>
                    Yes — link their account
                  </button>
                  <button className="btn btn-secondary" onClick={() => setAddStep('create')}>
                    No — create one for them
                  </button>
                </div>
                <button className="link-btn family-cancel-link" onClick={resetAdd}>Cancel</button>
              </div>
            )}

            {addStep === 'create' && (
              <form className="card family-add-form" onSubmit={handleCreate}>
                <h3 className="family-add-title">Create a New Account</h3>
                <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', marginBottom: '1rem' }}>
                  This creates a full Kitty Day Calendar account. They can sign in with these credentials any time.
                </p>

                <div className="form-group">
                  <label htmlFor="fm-name">Full Name <span className="req">*</span></label>
                  <input id="fm-name" type="text" placeholder="e.g. Mochi" value={newName} onChange={e => setNewName(e.target.value)} />
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="fm-username">Username <span className="req">*</span></label>
                    <input id="fm-username" type="text" placeholder="e.g. mochi_cat" value={newUsername} onChange={e => setNewUsername(e.target.value)} />
                  </div>
                  <div className="form-group">
                    <label htmlFor="fm-email">Email <span className="req">*</span></label>
                    <input id="fm-email" type="email" placeholder="e.g. mochi@mail.com" value={newEmail} onChange={e => setNewEmail(e.target.value)} />
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="fm-pw">Password <span className="req">*</span></label>
                    <input id="fm-pw" type="password" placeholder="Min. 6 characters" value={newPassword} onChange={e => setNewPassword(e.target.value)} />
                  </div>
                  <div className="form-group">
                    <label htmlFor="fm-pw2">Confirm Password <span className="req">*</span></label>
                    <input id="fm-pw2" type="password" placeholder="Re-enter password" value={newConfirm} onChange={e => setNewConfirm(e.target.value)} />
                  </div>
                </div>

                {createError && <p className="form-error">{createError}</p>}

                <div className="family-add-actions">
                  <button type="submit" className="btn btn-primary">Create &amp; Add to Family 🐾</button>
                  <button type="button" className="btn btn-secondary" onClick={resetAdd}>Cancel</button>
                </div>
              </form>
            )}

            {addStep === 'link' && (
              <form className="card family-add-form" onSubmit={handleLinkLookup}>
                <h3 className="family-add-title">Link an Existing Account</h3>
                <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', marginBottom: '1rem' }}>
                  Have the family member enter their Kitty Day Calendar credentials below.
                </p>

                <div className="form-group">
                  <label htmlFor="lk-cred">Username or Email <span className="req">*</span></label>
                  <input id="lk-cred" type="text" placeholder="Their username or email" value={linkCred} onChange={e => setLinkCred(e.target.value)} />
                </div>

                <div className="form-group">
                  <label htmlFor="lk-pass">Password <span className="req">*</span></label>
                  <input id="lk-pass" type="password" placeholder="Their password" value={linkPass} onChange={e => setLinkPass(e.target.value)} />
                </div>

                {linkError && <p className="form-error">{linkError}</p>}

                <div className="family-add-actions">
                  <button type="submit" className="btn btn-primary">Find Account</button>
                  <button type="button" className="btn btn-secondary" onClick={resetAdd}>Cancel</button>
                </div>
              </form>
            )}

            {addStep === 'link-confirm' && foundUser && (
              <div className="card family-add-form">
                <h3 className="family-add-title">Add to Family?</h3>
                <div className="family-found-user">
                  <span className="family-member-pic" style={{ fontSize: '2rem' }}>{foundUser.profilePic || '🐱'}</span>
                  <div>
                    <p className="family-member-name">{foundUser.name}</p>
                    <p className="family-member-detail">@{foundUser.username}</p>
                  </div>
                </div>
                <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', margin: '0.75rem 0 1.2rem' }}>
                  They'll be able to see your shared family events.
                </p>
                <div className="family-add-actions">
                  <button className="btn btn-primary" onClick={handleLinkConfirm}>
                    Add @{foundUser.username} to family 🐾
                  </button>
                  <button className="btn btn-secondary" onClick={resetAdd}>Cancel</button>
                </div>
              </div>
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
              Remove {myMembers.find(m => m.id === removing)?.name}?
            </h2>
            <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', margin: 0 }}>
              They'll no longer have access to shared events.
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
