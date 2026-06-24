import { useState } from 'react'
import { HTTP_STATUS_MESSAGES, HTTP_CAT_SUPPORTED } from '../lib/httpCat'

export default function HttpCatImage({ status = 404, className = '' }) {
  const code = HTTP_CAT_SUPPORTED.has(Number(status)) ? Number(status) : 404
  const [src, setSrc] = useState(`https://http.cat/${code}`)

  return (
    <img
      src={src}
      alt={`HTTP ${status} — ${HTTP_STATUS_MESSAGES[status] ?? 'Unknown'}`}
      className={`http-cat-img ${className}`.trim()}
      onError={() => {
        if (src !== 'https://http.cat/404') setSrc('https://http.cat/404')
      }}
    />
  )
}
