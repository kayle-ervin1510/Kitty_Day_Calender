import { useNavigate } from 'react-router-dom'
import contactCat from '../assets/contact-cat.png'

const GitHubIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="currentColor"
    width="2rem"
    height="2rem"
    style={{ color: 'var(--text-primary)', flexShrink: 0 }}
    aria-label="GitHub"
  >
    <path d="M12 0C5.374 0 0 5.373 0 12c0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23A11.509 11.509 0 0112 5.803c1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576C20.566 21.797 24 17.3 24 12c0-6.627-5.373-12-12-12z" />
  </svg>
)

const CONTACTS = [
  {
    icon: '📧',
    label: 'Email',
    value: 'support@kittydaycalendar.com',
    href: 'mailto:support@kittydaycalendar.com',
    desc: 'Reach our support team directly. We respond within 1–2 business days.',
  },
  {
    icon: '📞',
    label: 'Phone',
    value: '+1 (555) 484-8489',
    href: 'tel:+15554848489',
    desc: 'Available Monday – Friday, 9 am – 5 pm EST.',
  },
  {
    icon: 'github',
    label: 'GitHub',
    value: 'github.com/kittydaycalendar',
    href: 'https://github.com/kittydaycalendar',
    desc: 'Browse our source code, report bugs, or open a feature request.',
  },
  {
    icon: '💼',
    label: 'LinkedIn',
    value: 'linkedin.com/company/kittydaycalendar',
    href: 'https://linkedin.com/company/kittydaycalendar',
    desc: 'Follow us for product updates and team news.',
  },
]

export default function ContactPage() {
  const navigate = useNavigate()

  return (
    <div className="contact-page">
      <div className="contact-hero">
        <img
          src={contactCat}
          alt="Cat with headset"
          className="contact-cat-img"
        />
        <h1>Contact Us</h1>
        <p className="contact-subtitle">
          Our team of kITties is standing by to help. Reach out any way you like!
        </p>
      </div>

      <div className="contact-grid">
        {CONTACTS.map(c => (
          <a
            key={c.label}
            href={c.href}
            className="contact-card card"
            target={c.href.startsWith('http') ? '_blank' : undefined}
            rel={c.href.startsWith('http') ? 'noopener noreferrer' : undefined}
          >
            {c.icon === 'github'
              ? <GitHubIcon />
              : <span className="contact-card-icon">{c.icon}</span>
            }
            <div className="contact-card-body">
              <p className="contact-card-label">{c.label}</p>
              <p className="contact-card-value">{c.value}</p>
              <p className="contact-card-desc">{c.desc}</p>
            </div>
          </a>
        ))}
      </div>

      <div className="card contact-play">
        <div className="contact-play-inner">
          <span className="contact-play-icon">⭐</span>
          <div>
            <h3>Enjoying Kitty Day Calendar?</h3>
            <p>Leave us a review on Google Play and help other cat lovers find us!</p>
          </div>
          <a
            href="https://play.google.com/store"
            target="_blank"
            rel="noopener noreferrer"
            className="btn btn-primary"
          >
            Review on Google Play
          </a>
        </div>
      </div>

      <p className="contact-back">
        <button className="link-btn" onClick={() => navigate('/about')}>
          ← Back to About
        </button>
      </p>
    </div>
  )
}
