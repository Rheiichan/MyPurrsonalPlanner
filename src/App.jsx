import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './context/AuthContext'
import { getAccessTier } from './access'
import Login from './pages/Login'
import Signup from './pages/Signup'
import Setup from './pages/Setup'
import Hub from './pages/Hub'
import CalendarPage from './pages/CalendarPage'
import ComingSoon from './pages/ComingSoon'
import PendingActivation from './pages/PendingActivation'
import LockedPage from './pages/LockedPage'
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
import ProjectPlanner from './pages/ProjectPlanner'
import ProjectDetail from './pages/ProjectDetail'
import TravelPlanner from './pages/TravelPlanner'
import TripDetail from './pages/TripDetail'
import Budgeting from './pages/Budgeting'
import OfflineBanner from './components/OfflineBanner'

function FullScreenLoader() {
  return (
    <div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--cream)' }}>
      <div className="display" style={{ fontSize: 22, color: 'var(--teal-500)' }}>loading your planner…</div>
    </div>
  )
}

// Gate that requires: logged in -> has at least "locked" access -> (if
// allowWhenLocked is false) has "full" access -> (optionally) onboarding done.
// allowWhenLocked lets a route stay reachable even after the trial ends
// (Hub, Calendar, My Profile).
function RequireAuth({ children, requireOnboarded = true, allowWhenLocked = false }) {
  const { loading, user, profile, profileLoading, isAdmin } = useAuth()
  if (loading || (user && profileLoading)) return <FullScreenLoader />
  if (!user) return <Navigate to="/login" replace />

  const tier = getAccessTier(profile, isAdmin)
  if (tier === 'blocked') return <Navigate to="/pending" replace />
  if (tier === 'locked' && !allowWhenLocked) return <Navigate to="/locked" replace />

  if (requireOnboarded && profile && !profile.onboarding_complete) {
    return <Navigate to="/setup" replace />
  }
  return children
}

function RedirectIfAuthed({ children }) {
  const { loading, user, profile, profileLoading, isAdmin } = useAuth()
  if (loading || (user && profileLoading)) return <FullScreenLoader />
  if (user) {
    const tier = getAccessTier(profile, isAdmin)
    if (tier === 'blocked') return <Navigate to="/pending" replace />
    if (tier === 'locked') return <Navigate to="/hub" replace />
    return <Navigate to={profile?.onboarding_complete ? '/hub' : '/setup'} replace />
  }
  return children
}

function PendingRoute({ children }) {
  const { loading, user, profile, profileLoading, isAdmin } = useAuth()
  if (loading || (user && profileLoading)) return <FullScreenLoader />
  if (!user) return <Navigate to="/login" replace />
  const tier = getAccessTier(profile, isAdmin)
  if (tier !== 'blocked') return <Navigate to="/hub" replace />
  return children
}

function LockedRoute({ children }) {
  const { loading, user, profile, profileLoading, isAdmin } = useAuth()
  if (loading || (user && profileLoading)) return <FullScreenLoader />
  if (!user) return <Navigate to="/login" replace />
  const tier = getAccessTier(profile, isAdmin)
  if (tier === 'blocked') return <Navigate to="/pending" replace />
  if (tier === 'full') return <Navigate to="/hub" replace />
  return children
}

function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/hub" replace />} />
      <Route path="/login" element={<RedirectIfAuthed><Login /></RedirectIfAuthed>} />
      <Route path="/signup" element={<RedirectIfAuthed><Signup /></RedirectIfAuthed>} />
      <Route path="/pending" element={<PendingRoute><PendingActivation /></PendingRoute>} />
      <Route path="/locked" element={<LockedRoute><LockedPage /></LockedRoute>} />
      <Route
        path="/setup"
        element={
          <RequireAuth requireOnboarded={false}>
            <Setup />
          </RequireAuth>
        }
      />
      <Route path="/hub" element={<RequireAuth allowWhenLocked><Hub /></RequireAuth>} />
      <Route path="/calendar" element={<RequireAuth allowWhenLocked><CalendarPage /></RequireAuth>} />
      <Route path="/mood" element={<RequireAuth><MoodTracker /></RequireAuth>} />
      <Route path="/sleep" element={<RequireAuth><SleepTracker /></RequireAuth>} />
      <Route path="/feeling" element={<RequireAuth><HowAreYouFeeling /></RequireAuth>} />
      <Route path="/goals" element={<RequireAuth><Goals /></RequireAuth>} />
      <Route path="/gratitude" element={<RequireAuth><GratitudeJournal /></RequireAuth>} />
      <Route path="/secret-diary" element={<RequireAuth><SecretDiary /></RequireAuth>} />
      <Route path="/profile" element={<RequireAuth requireOnboarded={false} allowWhenLocked><Profile /></RequireAuth>} />
      <Route path="/selfcare" element={<RequireAuth><SelfCareChallenge /></RequireAuth>} />
      <Route path="/recipes" element={<RequireAuth><Recipes /></RequireAuth>} />
      <Route path="/fitness" element={<RequireAuth><FitnessTracker /></RequireAuth>} />
      <Route path="/grocery" element={<RequireAuth><GroceryList /></RequireAuth>} />
      <Route path="/notebooks" element={<RequireAuth><NotebooksList /></RequireAuth>} />
      <Route path="/notebooks/:slot" element={<RequireAuth><NotebookDetail /></RequireAuth>} />
      <Route path="/projects" element={<RequireAuth><ProjectPlanner /></RequireAuth>} />
      <Route path="/projects/:id" element={<RequireAuth><ProjectDetail /></RequireAuth>} />
      <Route path="/travel" element={<RequireAuth><TravelPlanner /></RequireAuth>} />
      <Route path="/travel/:id" element={<RequireAuth><TripDetail /></RequireAuth>} />
      <Route path="/budget" element={<RequireAuth><Budgeting /></RequireAuth>} />
      <Route path="/admin" element={<RequireAuth requireOnboarded={false} allowWhenLocked><AdminPanel /></RequireAuth>} />
      <Route path="/:moduleName" element={<RequireAuth><ComingSoon /></RequireAuth>} />
    </Routes>
  )
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <OfflineBanner />
        <AppRoutes />
      </BrowserRouter>
    </AuthProvider>
  )
}
