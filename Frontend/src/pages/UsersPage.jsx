import { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import { toast } from 'sonner'
import userService from '../services/userService'
import { Button } from '../components/ui/Button'
import { StatusPill } from '../components/ui/Badge'
import { DataTable } from '../components/ui/DataTable'
import { Dialog } from '../components/ui/Dialog'
import { Input } from '../components/ui/Input'
import SearchableSelect from '../components/SearchableSelect'

const roleOpts = [{id:'Admin',label:'Admin'},{id:'Vet',label:'Vet'},{id:'Worker',label:'Worker'}]

export default function UsersPage() {
  const { user: currentUser } = useAuth()
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('')
  const [editing, setEditing] = useState(null)
  const [editForm, setEditForm] = useState({ full_name: '', email: '', role: '' })
  const [error, setError] = useState('')

  const fetchUsers = async () => {
    setLoading(true)
    try {
      const params = {}
      if (filter) params.role = filter
      const res = await userService.list(params)
      setUsers(res.data.data)
    } catch (err) { console.error(err) }
    finally { setLoading(false) }
  }

  useEffect(() => { fetchUsers() }, [filter])

  const handleEdit = (u) => {
    setEditForm({ full_name: u.full_name, email: u.email, role: u.role })
    setEditing(u)
    setError('')
  }

  const handleUpdate = async (e) => {
    e.preventDefault()
    setError('')
    try {
      await userService.update(editing.id, editForm)
      setEditing(null)
      toast.success('User updated')
      fetchUsers()
    } catch (err) {
      toast.error(err.response?.data?.error || 'Update failed.')
    }
  }

  const handleDeactivate = async (id) => {
    if (!window.confirm('Deactivate this user?')) return
    try {
      await userService.updateStatus(id, 'Disabled')
      toast.success('User deactivated')
      fetchUsers()
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed.')
    }
  }

  const columns = [
    {
      key: 'full_name', label: 'Name',
      render: (val, row) => (
        <span>
          {val}
          {row.id === currentUser?.id && <span className="text-xs text-slate2-400 ml-1">(you)</span>}
        </span>
      ),
    },
    { key: 'email', label: 'Email' },
    {
      key: 'role', label: 'Role',
      render: (val) => <StatusPill status={val} />,
    },
    {
      key: 'status', label: 'Status',
      render: (val) => <StatusPill status={val === 'Disabled' ? 'Disabled' : 'Active'} />,
    },
    { key: 'created_at', label: 'Joined', render: (val) => val?.split('T')[0] },
    {
      key: 'id', label: 'Actions',
      render: (val, row) => {
        if (row.id === currentUser?.id) return <span className="text-xs text-slate2-400">{'\u2014'}</span>
        return (
          <div className="flex gap-2">
            <Button variant="ghost" size="sm" onClick={(e) => { e.stopPropagation(); handleEdit(row) }}>Edit</Button>
            <Button variant="ghost" size="sm" className="text-clay-600 dark:text-clay-400 hover:bg-clay-100/30" onClick={(e) => { e.stopPropagation(); handleDeactivate(val) }}>Deactivate</Button>
          </div>
        )
      },
    },
  ]

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-xl font-semibold text-ink-900 dark:text-ink-100">Users</h1>
        <SearchableSelect
          value={filter}
          onChange={setFilter}
          options={[{id:'',label:'All Roles'},{id:'Admin',label:'Admin'},{id:'Vet',label:'Vet'},{id:'Worker',label:'Worker'}]}
          className="w-40"
        />
      </div>

      <DataTable
        columns={columns}
        data={users}
        loading={loading}
        emptyTitle="No users found"
        emptyDescription="No users match the selected filter."
      />

      <Dialog
        open={!!editing}
        onClose={() => setEditing(null)}
        title="Edit User"
      >
        <form onSubmit={handleUpdate} className="space-y-3">
          {error && <p className="text-sm text-clay-600 dark:text-clay-400">{error}</p>}
          <Input label="Full Name" value={editForm.full_name} onChange={(e) => setEditForm({ ...editForm, full_name: e.target.value })} required />
          <Input label="Email" type="email" value={editForm.email} onChange={(e) => setEditForm({ ...editForm, email: e.target.value })} required />
          <SearchableSelect label="Role" value={editForm.role} onChange={(v) => setEditForm({ ...editForm, role: v })} options={roleOpts} />
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="ghost" size="sm" onClick={() => setEditing(null)}>Cancel</Button>
            <Button type="submit" size="sm">Save</Button>
          </div>
        </form>
      </Dialog>
    </div>
  )
}
