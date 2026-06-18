import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import { useAuth } from '../context/AuthContext'
import { Button } from '../components/ui/Button'
import { Input } from '../components/ui/Input'
import SearchableSelect from '../components/SearchableSelect'
import { Card, CardContent } from '../components/ui/Card'

const roleOpts = [{id:'Admin',label:'Admin'},{id:'Vet',label:'Vet'},{id:'Worker',label:'Worker'}]

export default function RegisterPage() {
  const navigate = useNavigate()
  const { register, isAdmin } = useAuth()
  const [form, setForm] = useState({ full_name: '', username: '', role: 'Worker', email: '', password: '' })
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [loading, setLoading] = useState(false)

  if (!isAdmin) {
    return (
      <div className="max-w-md mx-auto mt-12">
        <Card>
          <CardContent className="text-center py-8">
            <p className="text-clay-600 dark:text-clay-400 font-medium">Access Denied</p>
            <p className="text-sm text-slate2-400 mt-1">Admin access required to register users.</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value })

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await register(form)
      toast.success('User registered')
      setTimeout(() => navigate('/users'), 500)
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to register.')
    } finally { setLoading(false) }
  }

  return (
    <div className="max-w-lg mx-auto">
      <h1 className="text-xl font-semibold text-ink-900 dark:text-ink-100 mb-4">Register User</h1>

      {error && <div className="mb-4 p-3 bg-clay-100 dark:bg-clay-600/20 border border-clay-400/30 dark:border-clay-400/20 text-clay-600 dark:text-clay-400 rounded-sm text-sm">{error}</div>}
      {success && <div className="mb-4 p-3 bg-pasture-100 dark:bg-pasture-600/20 border border-pasture-400/30 dark:border-pasture-400/20 text-pasture-600 dark:text-pasture-400 rounded-sm text-sm">{success}</div>}

      <Card>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-3">
            <Input label="Full Name" name="full_name" value={form.full_name} onChange={handleChange} required />
            <Input label="Username" name="username" value={form.username} onChange={handleChange} required />
            <SearchableSelect label="Role" value={form.role} onChange={(v) => setForm({...form, role: v})} options={roleOpts} />
            <Input label="Email" type="email" name="email" value={form.email} onChange={handleChange} required />
            <Input label="Password" type="password" name="password" value={form.password} onChange={handleChange} required />
            <div className="flex gap-3 pt-2">
              <Button type="submit" disabled={loading}>
                {loading ? 'Creating...' : 'Create User'}
              </Button>
              <Button type="button" variant="ghost" onClick={() => navigate('/users')}>Cancel</Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
