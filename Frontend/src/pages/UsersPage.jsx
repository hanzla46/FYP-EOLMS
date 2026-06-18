import { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import userService from '../services/userService'

export default function UsersPage() {
  const { isAdmin, user: currentUser } = useAuth()
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('')
  const [editModal, setEditModal] = useState({ open: false, user: null })
  const [editForm, setEditForm] = useState({ full_name: '', role: '', email: '' })

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

  const handleToggleStatus = async (userId) => {
    try {
      await userService.toggleStatus(userId)
      fetchUsers()
    } catch (err) { alert(err.response?.data?.error || 'Failed.') }
  }

  const handleEdit = (u) => {
    setEditForm({ full_name: u.full_name, role: u.role, email: u.email })
    setEditModal({ open: true, user: u })
  }

  const handleSaveEdit = async (e) => {
    e.preventDefault()
    try {
      await userService.update(editModal.user.id, editForm)
      setEditModal({ open: false, user: null })
      fetchUsers()
    } catch (err) { alert(err.response?.data?.error || 'Failed.') }
  }

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
                <th className="px-4 py-3 text-left font-medium">Email</th>
                <th className="px-4 py-3 text-left font-medium">Role</th>
                <th className="px-4 py-3 text-left font-medium">Status</th>
                <th className="px-4 py-3 text-left font-medium">Joined</th>
                <th className="px-4 py-3 text-right font-medium">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {users.map((u) => (
                <tr key={u.id}>
                  <td className="px-4 py-3 font-medium">
                    {u.full_name}
                    {u.id === currentUser?.id && <span className="text-xs text-gray-400 ml-2">(you)</span>}
                  </td>
                  <td className="px-4 py-3 text-gray-500">{u.email}</td>
                  <td className="px-4 py-3"><span className={roleBadge(u.role)}>{u.role}</span></td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${u.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                      {u.is_active ? 'Active' : 'Disabled'}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-gray-400 text-xs">{new Date(u.created_at).toLocaleDateString()}</td>
                  <td className="px-4 py-3 text-right">
                    {isAdmin && u.id !== currentUser?.id && (
                      <div className="flex items-center justify-end gap-2">
                        <button onClick={() => handleEdit(u)} className="text-xs text-blue-600 hover:underline">Edit</button>
                        <button onClick={() => handleToggleStatus(u.id)}
                          className={`text-xs ${u.is_active ? 'text-red-600 hover:underline' : 'text-green-600 hover:underline'}`}>
                          {u.is_active ? 'Deactivate' : 'Activate'}
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
              {users.length === 0 && <tr><td colSpan="6" className="px-4 py-8 text-center text-gray-500">No users found.</td></tr>}
            </tbody>
          </table>
        </div>
      )}

      {editModal.open && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-xl p-6 w-full max-w-sm mx-4">
            <h2 className="text-lg font-bold text-gray-800 mb-4">Edit User</h2>
            <form onSubmit={handleSaveEdit} className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Full Name</label>
                <input value={editForm.full_name} onChange={(e) => setEditForm({ ...editForm, full_name: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg text-sm" />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Email</label>
                <input type="email" value={editForm.email} onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg text-sm" />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Role</label>
                <select value={editForm.role} onChange={(e) => setEditForm({ ...editForm, role: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg text-sm">
                  <option value="Admin">Admin</option>
                  <option value="Vet">Vet</option>
                  <option value="Worker">Worker</option>
                </select>
              </div>
              <div className="flex gap-3 pt-2">
                <button type="submit" className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm font-medium">Save</button>
                <button type="button" onClick={() => setEditModal({ open: false, user: null })}
                  className="px-4 py-2 border rounded-lg text-sm hover:bg-gray-50">Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
