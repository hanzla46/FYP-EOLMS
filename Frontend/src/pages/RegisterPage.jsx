import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function RegisterPage() {
  const [form, setForm] = useState({ username: '', email: '', password: '', full_name: '', role: 'Worker' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState('')
  const { register, isAdmin } = useAuth()
  const navigate = useNavigate()

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value })

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setSuccess('')
    setLoading(true)
    try {
      await register(form)
      setSuccess('User created successfully!')
      setTimeout(() => navigate('/animals'), 1500)
    } catch (err) {
      setError(err.response?.data?.error || 'Registration failed.')
    } finally {
      setLoading(false)
    }
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-gray-800 mb-2">Access Denied</h2>
          <p className="text-gray-500">Only administrators can register new users.</p>
          <Link to="/" className="text-blue-600 hover:underline text-sm mt-4 inline-block">Go Home</Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-800">Register User</h1>
          <p className="mt-1 text-sm text-gray-500">Admin only</p>
        </div>
        <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-lg p-8 space-y-4">
          {error && <div className="p-3 bg-red-50 border border-red-200 text-red-600 rounded-lg text-sm">{error}</div>}
          {success && <div className="p-3 bg-green-50 border border-green-200 text-green-600 rounded-lg text-sm">{success}</div>}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Full Name *</label>
            <input name="full_name" value={form.full_name} onChange={handleChange} required
              className="w-full px-4 py-2.5 border rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Username *</label>
              <input name="username" value={form.username} onChange={handleChange} required
                className="w-full px-4 py-2.5 border rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
              <select name="role" value={form.role} onChange={handleChange}
                className="w-full px-4 py-2.5 border rounded-lg text-sm">
                <option value="Admin">Admin</option>
                <option value="Vet">Vet</option>
                <option value="Worker">Worker</option>
              </select>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email *</label>
            <input type="email" name="email" value={form.email} onChange={handleChange} required
              className="w-full px-4 py-2.5 border rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Password *</label>
            <input type="password" name="password" value={form.password} onChange={handleChange} required
              className="w-full px-4 py-2.5 border rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none" />
          </div>
          <button type="submit" disabled={loading}
            className="w-full py-2.5 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 text-sm font-medium transition">
            {loading ? 'Creating...' : 'Create User'}
          </button>
          <Link to="/animals" className="block text-center text-sm text-blue-600 hover:underline">Back to Animals</Link>
        </form>
      </div>
    </div>
  )
}
