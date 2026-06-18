import { useState, useRef, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Menu, Sun, Moon, ChevronDown, User, LogOut, UserPlus } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import { useTheme } from '../../context/ThemeContext'
import NotificationBell from '../NotificationBell'
import { Users } from 'lucide-react'

export function Topbar({ onMenuClick, breadcrumb }) {
  const { user, logout, isAdmin } = useAuth()
  const { theme, toggle } = useTheme()
  const navigate = useNavigate()
  const [avatarOpen, setAvatarOpen] = useState(false)
  const avatarRef = useRef(null)

  useEffect(() => {
    const handleClick = (e) => {
      if (avatarRef.current && !avatarRef.current.contains(e.target)) {
        setAvatarOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  const handleLogout = () => {
    setAvatarOpen(false)
    logout()
    navigate('/')
  }

  return (
    <header className="h-14 bg-white dark:bg-[#16201A] border-b border-slate2-400/20 dark:border-slate2-600/20 flex items-center justify-between px-4 flex-shrink-0">
      <div className="flex items-center gap-3">
        <button
          onClick={onMenuClick}
          className="p-1.5 rounded-sm text-slate2-400 hover:text-ink-900 dark:hover:text-ink-100 md:hidden"
          aria-label="Open menu"
        >
          <Menu className="w-5 h-5" />
        </button>
        <div className="hidden sm:block">
          {breadcrumb && (
            <nav className="text-sm" aria-label="Breadcrumb">
              <span className="text-slate2-400">{breadcrumb}</span>
            </nav>
          )}
        </div>
      </div>

      <div className="flex items-center gap-2">
        <NotificationBell />

        <button
          onClick={toggle}
          className="p-1.5 rounded-sm text-slate2-400 hover:text-ink-900 dark:hover:text-ink-100 hover:bg-mist-50 dark:hover:bg-mist-900"
          aria-label="Toggle theme"
        >
          {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
        </button>

        <div className="relative" ref={avatarRef}>
          <button
            onClick={() => setAvatarOpen(!avatarOpen)}
            className="flex items-center gap-2 px-2 py-1 rounded-sm hover:bg-mist-50 dark:hover:bg-mist-900 text-sm"
          >
            <div className="w-7 h-7 rounded-full bg-pasture-100 dark:bg-pasture-600/20 flex items-center justify-center flex-shrink-0">
              <User className="w-3.5 h-3.5 text-pasture-600 dark:text-pasture-400" />
            </div>
            <span className="text-ink-900 dark:text-ink-100 text-sm font-medium hidden sm:inline">{user?.full_name}</span>
            <span className="text-xs text-slate2-400 hidden sm:inline">({user?.role})</span>
            <ChevronDown className="w-3 h-3 text-slate2-400 hidden sm:block" />
          </button>

          {avatarOpen && (
            <div className="absolute right-0 top-full mt-1 w-48 bg-white dark:bg-[#16201A] rounded-md border border-slate2-400/20 dark:border-slate2-600/20 shadow-lg z-50 py-1">
              <div className="px-3 py-2 border-b border-slate2-400/20 dark:border-slate2-600/20">
                <p className="text-sm font-medium text-ink-900 dark:text-ink-100">{user?.full_name}</p>
                <p className="text-xs text-slate2-400">{user?.email}</p>
              </div>
              {isAdmin && (
                <>
                  <Link
                    to="/users"
                    onClick={() => setAvatarOpen(false)}
                    className="flex items-center gap-2 px-3 py-2 text-sm text-slate2-400 hover:text-ink-900 dark:hover:text-ink-100 hover:bg-mist-50 dark:hover:bg-mist-900"
                  >
                    <Users className="w-4 h-4" /> Manage Users
                  </Link>
                  <Link
                    to="/register"
                    onClick={() => setAvatarOpen(false)}
                    className="flex items-center gap-2 px-3 py-2 text-sm text-slate2-400 hover:text-ink-900 dark:hover:text-ink-100 hover:bg-mist-50 dark:hover:bg-mist-900"
                  >
                    <UserPlus className="w-4 h-4" /> Register User
                  </Link>
                </>
              )}
              <button
                onClick={toggle}
                className="w-full flex items-center gap-2 px-3 py-2 text-sm text-slate2-400 hover:text-ink-900 dark:hover:text-ink-100 hover:bg-mist-50 dark:hover:bg-mist-900"
              >
                {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
                {theme === 'dark' ? 'Light Mode' : 'Dark Mode'}
              </button>
              <div className="border-t border-slate2-400/20 dark:border-slate2-600/20 mt-1 pt-1">
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-2 px-3 py-2 text-sm text-clay-600 dark:text-clay-400 hover:bg-clay-100/30 dark:hover:bg-clay-600/10"
                >
                  <LogOut className="w-4 h-4" /> Logout
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}
