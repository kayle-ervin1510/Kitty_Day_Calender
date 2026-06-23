import { useNavigate } from 'react-router-dom'

export default function AboutPage() {
  const navigate = useNavigate()

  return (
    <div className="about-page">
      <div className="about-hero">
        <span className="about-cat">🐱</span>
        <h1>About Kitty Day Calendar</h1>
      </div>

      <div className="card about-card">
        <p>
          Everyone can have a calendar app — but can everyone have a <em>Kitty Day Calendar</em> app?
          With Kitty Day Calendar, you can create an account and manage your schedule with unique cat
          facts delivered fresh every single day, plus an assortment of adorable kitty profile
          pictures to make it your own!
        </p>

        <p>
          Any HTTP status codes that appear in the app will have a cat-coordinated image to match.
          Even when things go wrong, you still get your daily dose of kitty cat. 🐾
        </p>

        <p>
          You can assign any calendar day a <strong>Holiday</strong> or <strong>Birthday</strong> notice,
          which tells Kitty Day Calendar that something special is happening. A special cat image will
          appear on those days to celebrate with you.
        </p>

        <hr className="divider" />

        <h2>What You Can Do</h2>
        <ul className="about-features">
          <li>
            <span className="feature-icon">🗓️</span>
            <div>
              <strong>Create Events</strong>
              <p>Add events to your calendar with a name, date, time range, and optional cat image.</p>
            </div>
          </li>
          <li>
            <span className="feature-icon">🌍</span>
            <div>
              <strong>View Holidays</strong>
              <p>Toggle National and International Holidays directly on your calendar.</p>
            </div>
          </li>
          <li>
            <span className="feature-icon">✏️</span>
            <div>
              <strong>Edit &amp; Delete</strong>
              <p>Update any event at any time, or remove it when it&apos;s no longer needed.</p>
            </div>
          </li>
          <li>
            <span className="feature-icon">🔔</span>
            <div>
              <strong>Notifications</strong>
              <p>Choose when you get reminded — 15 minutes, 30 minutes, 1 hour, 1 day, or 1 week before an event — delivered via email or SMS.</p>
            </div>
          </li>
          <li>
            <span className="feature-icon family-tree-icon">
              <span className="family-row">
                <span className="family-parent">🐱</span>
                <span className="family-plus">+</span>
                <span className="family-parent">🐱</span>
              </span>
              <span className="family-line">│</span>
              <span className="family-row">
                <span className="family-kitten">🐱</span>
                <span className="family-kitten">🐱</span>
                <span className="family-kitten">🐱</span>
              </span>
            </span>
            <div>
              <strong>Family Accounts</strong>
              <p>Add multiple profiles under one account so the whole household can stay in sync.</p>
            </div>
          </li>
          <li>
            <span className="feature-icon">🐈</span>
            <div>
              <strong>Daily Cat Fact</strong>
              <p>Get a brand-new cat fact every day — one per day, always a surprise!</p>
            </div>
          </li>
        </ul>

        <hr className="divider" />

        <p className="about-contact">
          Have questions or feedback?{' '}
          <button className="link-btn" onClick={() => navigate('/contact')}>
            Contact Us
          </button>
        </p>
      </div>
    </div>
  )
}
