import { useNavigate } from 'react-router-dom'
import { useApp } from '../context/AppContext'

export default function HomePage() {
  const { user } = useApp()
  const navigate = useNavigate()
  const name = user?.preferredName || user?.name || 'Friend'

  return (
    <div className="home-page">
      <div className="home-hero">
        <span className="home-cat">🐱</span>
        <h1>Welcome to Kitty Day Calendar, {name}!</h1>
        <p className="home-hero-sub">Your purr-fectly fun way to track your schedule.</p>
      </div>

      <div className="card home-about">
        <h2>About Kitty Day Calendar</h2>
        <p>
          Everyone can have a calendar app, but can everyone have a <em>Kitty Day Calendar</em>?
          With Kitty Day Calendar you can manage your schedule and receive a unique cat fact every
          single day — plus an assortment of cute kitty images to keep things fun!
        </p>
        <p>
          Mark a day as a <strong>Holiday</strong> or a <strong>Birthday</strong> and the app will
          show you a special cat image for that occasion. You can also set up notifications so we
          remind you of upcoming events — two days before and again on the day — via email or SMS.
        </p>
        <p>
          Create events, view National and International Holidays, edit or remove anything you
          like, and even set up a Family Account so your whole household can stay in sync. 🐾
        </p>

        <div className="home-actions">
          <button
            className="btn btn-primary btn-lg"
            onClick={() => navigate('/events/new')}
          >
            Add Event 🗓️
          </button>
          <button
            className="btn btn-secondary btn-lg"
            onClick={() => navigate('/calendar')}
          >
            Go to My Calendar 📅
          </button>
          <button
            className="btn btn-secondary btn-lg"
            onClick={() => navigate('/profile')}
          >
            Allow Permissions for Kitty Day 🔔
          </button>
        </div>

        <p className="home-contact">
          Questions?{' '}
          <button className="link-btn" onClick={() => navigate('/contact')}>
            Contact Us
          </button>
        </p>
      </div>
    </div>
  )
}
