import { useState } from 'react'
import HttpCatImage from './HttpCatImage'
import { HTTP_CAT_SUPPORTED } from '../lib/httpCat'

const CAT_API_KEY      = import.meta.env.VITE_CAT_API_KEY
const UNSPLASH_KEY     = import.meta.env.VITE_UNSPLASH_ACCESS_KEY
const API_NINJAS_KEY   = import.meta.env.VITE_API_NINJAS_KEY

const WILD_CATS = [
  'cheetah', 'tiger', 'leopard', 'lion', 'jaguar',
  'cougar', 'snow leopard', 'sand cat', 'lynx', 'ocelot',
]

function randomWildCat() {
  return WILD_CATS[Math.floor(Math.random() * WILD_CATS.length)]
}

function buildFact(animal, name) {
  const c = animal?.characteristics || {}
  if (c.fun_fact)                 return `Fun fact: ${c.fun_fact}`
  if (c.slogan)                   return `${name}: "${c.slogan}"`
  if (c.top_speed)                return `${name}s can reach speeds of ${c.top_speed}!`
  if (c.most_distinctive_feature) return `${name}s are known for: ${c.most_distinctive_feature}.`
  if (c.prey)                     return `${name}s prey on: ${c.prey}.`
  if (c.diet)                     return `${name}s are ${c.diet}.`
  if (c.lifespan)                 return `${name}s live up to ${c.lifespan} in the wild.`
  if (c.lifestyle)                return `${name}s are ${c.lifestyle}.`
  if (c.biggest_threat)           return `The biggest threat to the ${name}: ${c.biggest_threat}.`
  if (c.habitat)                  return `${name}s are found in: ${c.habitat}.`
  return `${name}s are magnificent wild cats.`
}

export default function CatImagePicker({ eventType, value, onChange }) {
  const isWild = eventType === 'holiday' || eventType === 'birthday'

  const [imageUrl,   setImageUrl]   = useState(value || null)
  const [wildFact,   setWildFact]   = useState('')
  const [wildName,   setWildName]   = useState('')
  const [loading,      setLoading]      = useState(false)
  const [error,        setError]        = useState('')
  const [errorStatus,  setErrorStatus]  = useState(null)
  const [selected,     setSelected]     = useState(!!value)

  async function fetchCatImage() {
    setLoading(true)
    setError('')
    setErrorStatus(null)
    setSelected(false)

    try {
      if (!isWild) {
        // ── Regular event: The Cat API ──────────────────────────────────────
        const res  = await fetch('https://api.thecatapi.com/v1/images/search', {
          headers: { 'x-api-key': CAT_API_KEY },
        })
        if (!res.ok) throw Object.assign(new Error('The Cat API error.'), { status: res.status })
        const data = await res.json()
        const url  = data[0]?.url
        if (!url) throw new Error('No image returned.')
        setImageUrl(url)
        setWildFact('')
        setWildName('')
      } else {
        // ── Holiday / Birthday: Unsplash photo + API Ninjas fact ────────────
        const cat  = randomWildCat()
        const searchTerm = `${cat} wild cat`

        const [imgRes, factRes] = await Promise.all([
          fetch(
            `https://api.unsplash.com/photos/random?query=${encodeURIComponent(searchTerm)}&orientation=landscape`,
            { headers: { Authorization: `Client-ID ${UNSPLASH_KEY}` } }
          ),
          fetch(
            `https://api.api-ninjas.com/v1/animals?name=${encodeURIComponent(cat)}`,
            { headers: { 'X-Api-Key': API_NINJAS_KEY } }
          ),
        ])

        if (!imgRes.ok) throw Object.assign(new Error('Unsplash error.'), { status: imgRes.status })

        const imgData  = await imgRes.json()
        const factData = factRes.ok ? await factRes.json() : []

        const url    = imgData?.urls?.regular
        const animal = factData?.[0]
        const name   = animal?.name || cat.charAt(0).toUpperCase() + cat.slice(1)

        if (!url) throw new Error('No image returned from Unsplash.')
        setImageUrl(url)
        setWildName(name)
        setWildFact(animal ? buildFact(animal, name) : `${name}s are magnificent wild cats.`)
      }
    } catch (err) {
      setError('Couldn\'t fetch an image right now. Try again!')
      setErrorStatus(err.status ?? null)
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  function handleSelect() {
    setSelected(true)
    onChange(imageUrl, wildFact)
  }

  function handleClear() {
    setSelected(false)
    setImageUrl(null)
    setWildFact('')
    setWildName('')
    onChange(null, '')
  }

  const btnLabel = isWild ? 'Find me a Wild Cat 🐆' : 'Find me a Feline 🐾'
  const tryLabel = isWild ? 'Try another wild cat 🔄' : 'Try another cat 🔄'

  return (
    <div className="cat-image-picker">
      {!imageUrl && !loading && (
        <button type="button" className="btn btn-secondary" onClick={fetchCatImage}>
          {btnLabel}
        </button>
      )}

      {loading && (
        <div className="cat-image-loading">
          <span className="cat-image-spinner">🐱</span>
          <span>Fetching a feline…</span>
        </div>
      )}

      {imageUrl && !loading && (
        <div className="cat-image-result">
          <img
            src={imageUrl}
            alt={wildName || 'Cat'}
            className={`cat-image-preview${selected ? ' cat-image-selected' : ''}`}
          />

          {wildFact && (
            <p className="cat-image-fact">
              <span>🐆</span> {wildFact}
            </p>
          )}

          {selected ? (
            <div className="cat-image-actions">
              <span className="cat-image-check">✓ Image selected</span>
              <button type="button" className="link-btn" onClick={handleClear}>
                Remove image
              </button>
            </div>
          ) : (
            <div className="cat-image-actions">
              <button type="button" className="btn btn-primary btn-sm" onClick={handleSelect}>
                Select this one! 🐾
              </button>
              <button type="button" className="btn btn-secondary btn-sm" onClick={fetchCatImage}>
                {tryLabel}
              </button>
              <button type="button" className="link-btn" onClick={handleClear}>
                Cancel
              </button>
            </div>
          )}
        </div>
      )}

      {error && (
        <div className="form-error-block">
          {errorStatus && HTTP_CAT_SUPPORTED.has(errorStatus) && (
            <HttpCatImage status={errorStatus} className="form-http-cat" />
          )}
          <p className="form-error">{error}</p>
        </div>
      )}
    </div>
  )
}
