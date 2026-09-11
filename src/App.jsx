import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './context/AuthContext'
import Login from './pages/Login'
import Signup from './pages/Signup'
import Setup from './pages/Setup'
import Hub from './pages/Hub'
import CalendarPage from './pages/CalendarPage'
import ComingSoon from './pages/ComingSoon'
import PendingActivation from './pages/PendingActivation'
import AdminPanel from './pages/AdminPanel'

function FullScreenLoader() {
  return (
    <div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--cream)' }}>
      <div className="display" style={{ fontSize: 22, color: 'var(--teal-500)' }}>loading your planner…</div>
    </div>
  )
}

// Gate that requires: logged in -> account activated by admin -> (optionally) onboarding complete
function RequireAuth({ children, requireOnboarded = true }) {
  const { loading, user, profile, profileLoading, isAdmin } = useAuth()
  if (loading || (user && profileLoading)) return <FullScreenLoader />
  if (!user) return <Navigate to="/login" replace />
  if (profile && profile.account_status !== 'active' && !isAdmin) {
    return <Navigate to="/pending" replace />
  }
  if (requireOnboarded && profile && !profile.onboarding_complete) {
    return <Navigate to="/setup" replace />
  }
  return children
}

function RedirectIfAuthed({ children }) {
  const { loading, user, profile, profileLoading, isAdmin } = useAuth()
  if (loading || (user && profileLoading)) return <FullScreenLoader />
  if (user) {
    if (profile && profile.account_status !== 'active' && !isAdmin) {
      return <Navigate to="/pending" replace />
    }
    return <Navigate to={profile?.onboarding_complete ? '/hub' : '/setup'} replace />
  }
  return children
}

function PendingRoute({ children }) {
  const { loading, user, profile, profileLoading, isAdmin } = useAuth()
  if (loading || (user && profileLoading)) return <FullScreenLoader />
  if (!user) return <Navigate to="/login" replace />
  if (isAdmin || (profile && profile.account_status === 'active')) {
    return <Navigate to="/hub" replace />
  }
  return children
}

function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/hub" replace />} />
      <Route path="/login" element={<RedirectIfAuthed><Login /></RedirectIfAuthed>} />
      <Route path="/signup" element={<RedirectIfAuthed><Signup /></RedirectIfAuthed>} />
      <Route path="/pending" element={<PendingRoute><PendingActivation /></PendingRoute>} />
      <Route
        path="/setup"
        element={
          <RequireAuth requireOnboarded={false}>
            <Setup />
          </RequireAuth>
        }
      />
      <Route path="/hub" element={<RequireAuth><Hub /></RequireAuth>} />
      <Route path="/calendar" element={<RequireAuth><CalendarPage /></RequireAuth>} />
      <Route path="/admin" element={<RequireAuth requireOnboarded={false}><AdminPanel /></RequireAuth>} />
      <Route path="/:moduleName" element={<RequireAuth><ComingSoon /></RequireAuth>} />
    </Routes>
  )
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
    </AuthProvider>
  )
}
