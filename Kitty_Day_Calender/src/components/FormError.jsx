import HttpCatImage from './HttpCatImage'
import { HTTP_CAT_SUPPORTED } from '../lib/httpCat'

export default function FormError({ message, status, centered }) {
  if (!message) return null
  return (
    <div className="form-error-block">
      {status && HTTP_CAT_SUPPORTED.has(status) && (
        <HttpCatImage status={status} className="form-http-cat" />
      )}
      <p className="form-error" style={centered ? { textAlign: 'center' } : undefined}>
        {message}
      </p>
    </div>
  )
}
