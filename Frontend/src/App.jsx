import { BrowserRouter as Router, Routes, Route, Link, useLocation, useNavigate } from 'react-router-dom'
import AnimalsPage from './pages/AnimalsPage'
import AnimalDetailPage from './pages/AnimalDetailPage'
import AnimalRegisterPage from './pages/AnimalRegisterPage'
import InventoryPage from './pages/InventoryPage'
import AddInventoryPage from './pages/AddInventoryPage'
import InventoryDetailPage from './pages/InventoryDetailPage'

function Layout() {
  const location = useLocation()
  const navigate = useNavigate()
  const token = localStorage.getItem('token')

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
          </div>
          <div>
            {token ? (
              <button onClick={() => { localStorage.removeItem('token'); navigate('/login') }}
                className="text-sm text-red-600 hover:underline">Logout</button>
            ) : (
              <Link to="/login" className="text-sm text-blue-600 hover:underline">Login</Link>
            )}
          </div>
        </div>
      </nav>
      <main>
        <Routes>
          <Route path="/" element={
            <div className="flex items-center justify-center min-h-[80vh]">
              <div className="text-center">
                <h1 className="text-3xl font-bold text-gray-800 mb-2">EOLMS</h1>
                <p className="text-gray-500">Enterprise Online Livestock Management System</p>
                <div className="mt-6 flex gap-3 justify-center">
                  <Link to="/animals" className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-medium">View Animals</Link>
                  <Link to="/animals/register" className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm font-medium">Register Animal</Link>
                </div>
              </div>
            </div>
          } />
          <Route path="/animals" element={<AnimalsPage />} />
          <Route path="/animals/register" element={<AnimalRegisterPage />} />
          <Route path="/animals/:id" element={<AnimalDetailPage />} />
          <Route path="/inventory" element={<InventoryPage />} />
          <Route path="/inventory/add" element={<AddInventoryPage />} />
          <Route path="/inventory/:id" element={<InventoryDetailPage />} />
        </Routes>
      </main>
    </div>
  )
}

function App() {
  return (
    <Router>
      <Layout />
    </Router>
  )
}

export default App
