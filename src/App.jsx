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
import MoodTracker from './pages/MoodTracker'
import SleepTracker from './pages/SleepTracker'
import HowAreYouFeeling from './pages/HowAreYouFeeling'
import Goals from './pages/Goals'
import GratitudeJournal from './pages/GratitudeJournal'
import SecretDiary from './pages/SecretDiary'
import Profile from './pages/Profile'
import SelfCareChallenge from './pages/SelfCareChallenge'
import Recipes from './pages/Recipes'
import FitnessTracker from './pages/FitnessTracker'
import GroceryList from './pages/GroceryList'
import NotebooksList from './pages/NotebooksList'
import NotebookDetail from './pages/NotebookDetail'

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
      <Route path="/mood" element={<RequireAuth><MoodTracker /></RequireAuth>} />
      <Route path="/sleep" element={<RequireAuth><SleepTracker /></RequireAuth>} />
      <Route path="/feeling" element={<RequireAuth><HowAreYouFeeling /></RequireAuth>} />
      <Route path="/goals" element={<RequireAuth><Goals /></RequireAuth>} />
      <Route path="/gratitude" element={<RequireAuth><GratitudeJournal /></RequireAuth>} />
      <Route path="/secret-diary" element={<RequireAuth><SecretDiary /></RequireAuth>} />
      <Route path="/profile" element={<RequireAuth requireOnboarded={false}><Profile /></RequireAuth>} />
      <Route path="/selfcare" element={<RequireAuth><SelfCareChallenge /></RequireAuth>} />
      <Route path="/recipes" element={<RequireAuth><Recipes /></RequireAuth>} />
      <Route path="/fitness" element={<RequireAuth><FitnessTracker /></RequireAuth>} />
      <Route path="/grocery" element={<RequireAuth><GroceryList /></RequireAuth>} />
      <Route path="/notebooks" element={<RequireAuth><NotebooksList /></RequireAuth>} />
      <Route path="/notebooks/:slot" element={<RequireAuth><NotebookDetail /></RequireAuth>} />
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
