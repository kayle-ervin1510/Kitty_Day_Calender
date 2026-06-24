import { BrowserRouter, Routes, Route, Navigate, Outlet } from 'react-router-dom'
import { AppProvider, useApp } from './context/AppContext'
import Navbar from './components/Navbar'
import LoginPage from './pages/LoginPage'
import ConfirmPage from './pages/ConfirmPage'
import AuthCallbackPage from './pages/AuthCallbackPage'
import HomePage from './pages/HomePage'
import CalendarPage from './pages/CalendarPage'
import AddEventPage from './pages/AddEventPage'
import EditEventPage from './pages/EditEventPage'
import ProfilePage from './pages/ProfilePage'
import FamilyPage from './pages/FamilyPage'
import AboutPage from './pages/AboutPage'
import ContactPage from './pages/ContactPage'
import LitterBoxPage from './pages/LitterBoxPage'
import ErrorPage from './pages/ErrorPage'
import './App.css'

function ProtectedLayout() {
  const { user, initializing } = useApp()
  if (initializing) return null
  if (!user) return <Navigate to="/login" replace />
  return (
    <div className="app-layout">
      <Navbar />
      <main className="main-content">
        <Outlet />
      </main>
    </div>
  )
}

// Redirect already-logged-in users away from public pages.
// pendingUser (mid-registration) is NOT considered logged in here,
// so /confirm remains accessible after register().
function PublicLayout() {
  const { user, initializing } = useApp()
  if (initializing) return null
  if (user) return <Navigate to="/home" replace />
  return <Outlet />
}

function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/login" replace />} />

      {/* /auth/callback must NOT be inside PublicLayout — the session isn't
          set yet when the code arrives, so user==null. PublicLayout would
          pass through fine, but any initializing guard would block it. */}
      <Route path="/auth/callback" element={<AuthCallbackPage />} />

      <Route element={<PublicLayout />}>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/confirm" element={<ConfirmPage />} />
      </Route>

      <Route element={<ProtectedLayout />}>
        <Route path="/home" element={<HomePage />} />
        <Route path="/calendar" element={<CalendarPage />} />
        <Route path="/events/new" element={<AddEventPage />} />
        <Route path="/events/:id/edit" element={<EditEventPage />} />
        <Route path="/profile" element={<ProfilePage />} />
        <Route path="/family" element={<FamilyPage />} />
        <Route path="/about" element={<AboutPage />} />
        <Route path="/contact" element={<ContactPage />} />
        <Route path="/litter-box" element={<LitterBoxPage />} />
      </Route>

      <Route path="*" element={<ErrorPage />} />
    </Routes>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <AppProvider>
        <AppRoutes />
      </AppProvider>
    </BrowserRouter>
  )
}
