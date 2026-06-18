import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import { useAuth } from '../context/AuthContext'
import { Input } from '../components/ui/Input'
import { Button } from '../components/ui/Button'
import { PawPrint } from 'lucide-react'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const { login } = useAuth()
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await login(email, password)
      navigate('/animals')
    } catch (err) {
      toast.error(err.response?.data?.error || 'Login failed.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex">
      <div className="hidden lg:flex lg:w-1/2 bg-pasture-600 dark:bg-pasture-600/80 items-center justify-center relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-10 left-10 w-40 h-40 rounded-full bg-white" />
          <div className="absolute bottom-20 right-20 w-60 h-60 rounded-full bg-white" />
          <div className="absolute top-1/2 right-1/3 w-20 h-20 rounded-full bg-white" />
        </div>
        <div className="relative text-center text-white px-8">
          <PawPrint className="w-16 h-16 mx-auto mb-4 opacity-80" />
          <h1 className="text-3xl font-bold tracking-tight mb-2">EOLMS</h1>
          <p className="text-lg opacity-80">Enterprise Livestock Management System</p>
          <p className="text-sm opacity-60 mt-2">Professional field ledger for modern farming</p>
        </div>
      </div>

      <div className="flex-1 flex items-center justify-center px-6 bg-mist-50 dark:bg-mist-900">
        <div className="w-full max-w-sm">
          <div className="lg:hidden text-center mb-8">
            <PawPrint className="w-10 h-10 mx-auto mb-2 text-pasture-600 dark:text-pasture-400" />
            <h1 className="text-2xl font-bold text-ink-900 dark:text-ink-100">EOLMS</h1>
          </div>

          <div className="bg-white dark:bg-[#16201A] rounded-md border border-slate2-400/20 dark:border-slate2-600/20 p-6">
            <h2 className="text-lg font-semibold text-ink-900 dark:text-ink-100 mb-4">Sign In</h2>

            {error && (
              <div className="mb-4 p-3 bg-clay-100 dark:bg-clay-600/20 border border-clay-400/30 dark:border-clay-400/20 text-clay-600 dark:text-clay-400 rounded-sm text-sm">{error}</div>
            )}

            <form onSubmit={handleSubmit} className="space-y-3">
              <Input id="email" label="Email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="admin@eolms.local" required />
              <Input id="password" label="Password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Enter password" required />
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? 'Signing in...' : 'Sign In'}
              </Button>
            </form>

            <p className="mt-4 text-center text-xs text-slate2-400">Demo: admin@eolms.local / admin123</p>
          </div>
        </div>
      </div>
    </div>
  )
}
