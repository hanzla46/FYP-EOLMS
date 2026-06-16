import { useState, useEffect } from 'react'
import userService from '../services/userService'

export default function UsersPage() {
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('')

  const fetchUsers = async () => {
    try {
      const params = {}
      if (filter) params.role = filter
      const res = await userService.list(params)
      setUsers(res.data.data)
    } catch (err) { console.error(err) }
    finally { setLoading(false) }
  }

  useEffect(() => { fetchUsers() }, [filter])

  const roleBadge = (role) => {
    const colors = { Admin: 'bg-red-100 text-red-800', Vet: 'bg-blue-100 text-blue-800', Worker: 'bg-green-100 text-green-800' }
    return `px-2 py-0.5 rounded-full text-xs font-medium ${colors[role] || 'bg-gray-100'}`
  }

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Users</h1>
        <select value={filter} onChange={(e) => setFilter(e.target.value)}
          className="px-3 py-1.5 border rounded-lg text-sm">
          <option value="">All Roles</option>
          <option value="Admin">Admin</option>
          <option value="Vet">Vet</option>
          <option value="Worker">Worker</option>
        </select>
      </div>

      {loading ? <div className="text-center py-12 text-gray-500">Loading...</div> : (
        <div className="bg-white rounded-xl shadow overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-gray-600">
              <tr>
                <th className="px-4 py-3 text-left font-medium">Name</th>
                <th className="px-4 py-3 text-left font-medium">Username</th>
                <th className="px-4 py-3 text-left font-medium">Email</th>
                <th className="px-4 py-3 text-left font-medium">Role</th>
                <th className="px-4 py-3 text-left font-medium">Status</th>
                <th className="px-4 py-3 text-left font-medium">Joined</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {users.map((u) => (
                <tr key={u.id}>
                  <td className="px-4 py-3 font-medium">{u.full_name}</td>
                  <td className="px-4 py-3 text-gray-500">{u.username}</td>
                  <td className="px-4 py-3 text-gray-500">{u.email}</td>
                  <td className="px-4 py-3"><span className={roleBadge(u.role)}>{u.role}</span></td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${u.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                      {u.is_active ? 'Active' : 'Disabled'}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-gray-400 text-xs">{new Date(u.created_at).toLocaleDateString()}</td>
                </tr>
              ))}
              {users.length === 0 && <tr><td colSpan="6" className="px-4 py-8 text-center text-gray-500">No users found.</td></tr>}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
