import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { AuthProvider, useAuth } from './context/AuthContext'
import { ThemeProvider } from './context/ThemeContext'
import { Toaster } from 'sonner'
import { AppShell } from './components/layout/AppShell'
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'
import AnimalsPage from './pages/AnimalsPage'
import AnimalDetailPage from './pages/AnimalDetailPage'
import AnimalRegisterPage from './pages/AnimalRegisterPage'
import InventoryPage from './pages/InventoryPage'
import InventoryDetailPage from './pages/InventoryDetailPage'
import HealthRecordsPage from './pages/HealthRecordsPage'
import NewHealthRecordPage from './pages/NewHealthRecordPage'
import VaccinationSchedulesPage from './pages/VaccinationSchedulesPage'
import BreedingPage from './pages/BreedingPage'
import ProductionPage from './pages/ProductionPage'
import FinancePage from './pages/FinancePage'
import AlertsPage from './pages/AlertsPage'
import UsersPage from './pages/UsersPage'
import DashboardPage from './pages/DashboardPage'
import BreedingKanbanPage from './pages/BreedingKanbanPage'
import VaccinationCalendarPage from './pages/VaccinationCalendarPage'
import HealthTimelinePage from './pages/HealthTimelinePage'
import StyleguidePage from './pages/StyleguidePage'

function Layout() {
  const { user, loading } = useAuth()

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-mist-50 dark:bg-mist-900">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-2 border-pasture-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-sm text-slate2-400">Loading EOLMS...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return (
      <Routes>
        <Route path="*" element={<LoginPage />} />
      </Routes>
    )
  }

  return (
    <Routes>
      <Route element={<AppShell />}>
        <Route path="/" element={<DashboardPage />} />
        <Route path="/animals" element={<AnimalsPage />} />
        <Route path="/animals/register" element={<AnimalRegisterPage />} />
        <Route path="/animals/:id" element={<AnimalDetailPage />} />
        <Route path="/inventory" element={<InventoryPage />} />
        <Route path="/inventory/:id" element={<InventoryDetailPage />} />
        <Route path="/health" element={<HealthRecordsPage />} />
        <Route path="/health/new" element={<NewHealthRecordPage />} />
        <Route path="/vaccination-schedules" element={<VaccinationSchedulesPage />} />
        <Route path="/breeding" element={<BreedingPage />} />
        <Route path="/production" element={<ProductionPage />} />
        <Route path="/finance" element={<FinancePage />} />
        <Route path="/alerts" element={<AlertsPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/users" element={<UsersPage />} />
        <Route path="/breeding/kanban" element={<BreedingKanbanPage />} />
        <Route path="/vaccination-schedules/calendar" element={<VaccinationCalendarPage />} />
        <Route path="/health/timeline" element={<HealthTimelinePage />} />
        <Route path="/styleguide" element={<StyleguidePage />} />
      </Route>
    </Routes>
  )
}

function App() {
  return (
    <Router>
      <ThemeProvider>
        <AuthProvider>
          <Layout />
          <Toaster
            position="bottom-right"
            toastOptions={{
              style: {
                background: 'var(--color-ink-900)',
                color: 'var(--color-ink-100)',
                border: '1px solid var(--color-slate2-400)',
              },
            }}
          />
        </AuthProvider>
      </ThemeProvider>
    </Router>
  )
}

export default App
