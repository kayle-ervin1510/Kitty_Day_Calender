import { useNavigate, useLocation } from 'react-router-dom'
import HttpCatImage from '../components/HttpCatImage'
import { HTTP_STATUS_MESSAGES } from '../lib/httpCat'

export default function ErrorPage() {
  const navigate  = useNavigate()
  const location  = useLocation()
  const status    = location.state?.status ?? 404
  const message   = location.state?.message ?? HTTP_STATUS_MESSAGES[status] ?? 'Something went wrong'

  return (
    <div className="error-page">
      <div className="error-card card">
        <HttpCatImage status={status} className="error-http-cat" />
        <div className="error-status-row">
          <span className="error-status-code">{status}</span>
          <span className="error-status-msg">{message}</span>
        </div>
        <p className="error-body">
          Stand by while our kITties figure out what&apos;s up. 🐾
        </p>
        <div className="error-actions">
          <button className="btn btn-secondary" onClick={() => navigate(-1)}>
            Go Back
          </button>
          <button className="btn btn-primary" onClick={() => navigate('/home')}>
            Go Home
          </button>
        </div>
      </div>
    </div>
  )
}
