import { BrowserRouter as Router, Routes, Route, Link, useLocation, useNavigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './context/AuthContext'
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'
import AnimalsPage from './pages/AnimalsPage'
import AnimalDetailPage from './pages/AnimalDetailPage'
import AnimalRegisterPage from './pages/AnimalRegisterPage'
import InventoryPage from './pages/InventoryPage'
import AddInventoryPage from './pages/AddInventoryPage'
import InventoryDetailPage from './pages/InventoryDetailPage'
import HealthRecordsPage from './pages/HealthRecordsPage'
import NewHealthRecordPage from './pages/NewHealthRecordPage'
import VaccinationSchedulesPage from './pages/VaccinationSchedulesPage'
import BreedingPage from './pages/BreedingPage'
import ProductionPage from './pages/ProductionPage'
import AddProductionPage from './pages/AddProductionPage'
import FinancePage from './pages/FinancePage'
import AlertsPage from './pages/AlertsPage'
import UsersPage from './pages/UsersPage'
import DashboardPage from './pages/DashboardPage'
import NotificationBell from './components/NotificationBell'

function Layout() {
  const location = useLocation()
  const navigate = useNavigate()
  const { user, loading, logout, isAdmin } = useAuth()

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center bg-gray-50"><p className="text-gray-500">Loading...</p></div>
  }

  if (!user) {
    return (
      <Routes>
        <Route path="*" element={<LoginPage />} />
      </Routes>
    )
  }

  const isActive = (path) => location.pathname.startsWith(path)
    ? 'text-blue-600 border-b-2 border-blue-600'
    : 'text-gray-600 hover:text-gray-900 border-b-2 border-transparent'

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-6 flex items-center justify-between h-14">
          <div className="flex items-center gap-6">
            <Link to="/" className="font-bold text-lg text-gray-800">EOLMS</Link>
            <Link to="/animals" className={`px-2 py-4 text-sm font-medium ${isActive('/animals')}`}>Animals</Link>
            <Link to="/inventory" className={`px-2 py-4 text-sm font-medium ${isActive('/inventory')}`}>Inventory</Link>
            <Link to="/health" className={`px-2 py-4 text-sm font-medium ${isActive('/health')}`}>Health</Link>
            <Link to="/vaccination-schedules" className={`px-2 py-4 text-sm font-medium ${isActive('/vaccination-schedules')}`}>Vaccinations</Link>
            <Link to="/breeding" className={`px-2 py-4 text-sm font-medium ${isActive('/breeding')}`}>Breeding</Link>
            <Link to="/production" className={`px-2 py-4 text-sm font-medium ${isActive('/production')}`}>Production</Link>
            <Link to="/finance" className={`px-2 py-4 text-sm font-medium ${isActive('/finance')}`}>Finance</Link>
          </div>
          <div className="flex items-center gap-4">
            <NotificationBell />
            <span className="text-sm text-gray-500">{user.full_name} <span className="text-xs text-gray-400">({user.role})</span></span>
            {isAdmin && <Link to="/users" className="text-xs text-blue-600 hover:underline">Users</Link>}
            {isAdmin && <Link to="/register" className="text-xs text-blue-600 hover:underline">Register User</Link>}
            <button onClick={() => { logout(); navigate('/') }}
              className="text-sm text-red-600 hover:underline">Logout</button>
          </div>
        </div>
      </nav>
      <main>
        <Routes>
          <Route path="/" element={<DashboardPage />} />
          <Route path="/animals" element={<AnimalsPage />} />
          <Route path="/animals/register" element={<AnimalRegisterPage />} />
          <Route path="/animals/:id" element={<AnimalDetailPage />} />
          <Route path="/inventory" element={<InventoryPage />} />
          <Route path="/inventory/add" element={<AddInventoryPage />} />
          <Route path="/inventory/:id" element={<InventoryDetailPage />} />
          <Route path="/health" element={<HealthRecordsPage />} />
          <Route path="/health/new" element={<NewHealthRecordPage />} />
          <Route path="/vaccination-schedules" element={<VaccinationSchedulesPage />} />
          <Route path="/breeding" element={<BreedingPage />} />
          <Route path="/production" element={<ProductionPage />} />
          <Route path="/production/add" element={<AddProductionPage />} />
          <Route path="/finance" element={<FinancePage />} />
          <Route path="/alerts" element={<AlertsPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/users" element={<UsersPage />} />
        </Routes>
      </main>
    </div>
  )
}

function App() {
  return (
    <Router>
      <AuthProvider>
        <Layout />
      </AuthProvider>
    </Router>
  )
}

export default App
