import { useNavigate } from 'react-router-dom'

export default function ErrorPage() {
  const navigate = useNavigate()

  return (
    <div className="error-page">
      <div className="error-card card">
        <div className="error-cat">😿</div>
        <h1>Oops, something went wrong.</h1>
        <p>
          Stand by while our kITties try to figure out what&apos;s up.
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
