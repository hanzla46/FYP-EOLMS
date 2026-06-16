import { createContext, useContext, useState, useEffect } from 'react'
import authService from '../services/authService'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const token = localStorage.getItem('token')
    if (token) {
      authService.me()
        .then(res => setUser(res.data.data))
        .catch(() => { localStorage.removeItem('token'); setUser(null) })
        .finally(() => setLoading(false))
    } else {
      setLoading(false)
    }
  }, [])

  const login = async (email, password) => {
    const res = await authService.login(email, password)
    localStorage.setItem('token', res.data.token)
    setUser(res.data.data)
    return res.data
  }

  const register = async (data) => {
    const res = await authService.register(data)
    return res.data
  }

  const logout = () => {
    localStorage.removeItem('token')
    setUser(null)
  }

  const isAdmin = user?.role === 'Admin'
  const isVet = user?.role === 'Vet' || user?.role === 'Admin'
  const isWorker = user?.role === 'Worker'

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, isAdmin, isVet, isWorker }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
