import { Link, useLocation } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  LayoutDashboard, PawPrint, Package, Heart, Syringe, GitMerge, BarChart3,
  DollarSign, Bell, Users, ChevronLeft, Menu
} from 'lucide-react'
import { cn } from '../../lib/utils'
import { useAuth } from '../../context/AuthContext'

const navItems = [
  { path: '/', label: 'Dashboard', icon: LayoutDashboard },
  { path: '/animals', label: 'Animals', icon: PawPrint },
  { path: '/inventory', label: 'Inventory', icon: Package },
  { path: '/health', label: 'Health', icon: Heart },
  { path: '/vaccination-schedules', label: 'Vaccinations', icon: Syringe },
  { path: '/breeding', label: 'Breeding', icon: GitMerge },
  { path: '/production', label: 'Production', icon: BarChart3 },
  { path: '/finance', label: 'Finance', icon: DollarSign },
  { path: '/alerts', label: 'Alerts', icon: Bell },
]

const adminItems = [
  { path: '/users', label: 'Users', icon: Users },
]

export function Sidebar({ collapsed, onToggle, mobileOpen, onMobileClose }) {
  const location = useLocation()
  const { isAdmin } = useAuth()

  const isActive = (path) => {
    if (path === '/') return location.pathname === '/'
    return location.pathname.startsWith(path)
  }

  const sidebarContent = (
    <div className="flex flex-col h-full bg-white dark:bg-[#16201A] border-r border-slate2-400/20 dark:border-slate2-600/20">
      <div className="flex items-center justify-between h-14 px-4 border-b border-slate2-400/20 dark:border-slate2-600/20 flex-shrink-0">
        {!collapsed && (
          <Link to="/" className="font-semibold text-base text-ink-900 dark:text-ink-100 tracking-tight">
            EOLMS
          </Link>
        )}
        <button
          onClick={onToggle}
          className="p-1.5 rounded-sm text-slate2-400 hover:text-ink-900 dark:hover:text-ink-100 hover:bg-mist-50 dark:hover:bg-mist-900 hidden md:flex"
        >
          <ChevronLeft className={cn('w-4 h-4 transition-transform', collapsed && 'rotate-180')} />
        </button>
        <button
          onClick={onMobileClose}
          className="p-1.5 rounded-sm text-slate2-400 hover:text-ink-900 dark:hover:text-ink-100 md:hidden"
        >
          <Menu className="w-4 h-4" />
        </button>
      </div>

      <nav className="flex-1 overflow-y-auto py-2 px-2" aria-label="Main navigation">
        {navItems.map((item) => {
          const active = isActive(item.path)
          const Icon = item.icon
          return (
            <Link
              key={item.path}
              to={item.path}
              onClick={onMobileClose}
              className={cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-sm text-sm font-medium transition-colors mb-0.5',
                active
                  ? 'bg-pasture-100 dark:bg-pasture-600/20 text-pasture-600 dark:text-pasture-400 border-l-2 border-pasture-500 dark:border-pasture-400'
                  : 'text-slate2-400 hover:text-ink-900 dark:hover:text-ink-100 hover:bg-mist-50 dark:hover:bg-mist-900 border-l-2 border-transparent'
              )}
            >
              <Icon className="w-4 h-4 flex-shrink-0" />
              {!collapsed && <span>{item.label}</span>}
            </Link>
          )
        })}

        {isAdmin && (
          <>
            <div className={cn('mx-3 my-2 border-t border-slate2-400/20 dark:border-slate2-600/20', collapsed && 'mx-2')} />
            {adminItems.map((item) => {
              const active = isActive(item.path)
              const Icon = item.icon
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={onMobileClose}
                  className={cn(
                    'flex items-center gap-3 px-3 py-2.5 rounded-sm text-sm font-medium transition-colors mb-0.5',
                    active
                      ? 'bg-pasture-100 dark:bg-pasture-600/20 text-pasture-600 dark:text-pasture-400 border-l-2 border-pasture-500 dark:border-pasture-400'
                      : 'text-slate2-400 hover:text-ink-900 dark:hover:text-ink-100 hover:bg-mist-50 dark:hover:bg-mist-900 border-l-2 border-transparent'
                  )}
                >
                  <Icon className="w-4 h-4 flex-shrink-0" />
                  {!collapsed && <span>{item.label}</span>}
                </Link>
              )
            })}
          </>
        )}
      </nav>

      {!collapsed && (
        <div className="px-4 py-3 border-t border-slate2-400/20 dark:border-slate2-600/20">
          <p className="text-[10px] uppercase tracking-widest text-slate2-400">Enterprise Livestock</p>
        </div>
      )}
    </div>
  )

  return (
    <>
      {/* Desktop sidebar */}
      <aside
        className={cn(
          'hidden md:flex flex-col flex-shrink-0 transition-all duration-200',
          collapsed ? 'w-[60px]' : 'w-[220px]'
        )}
      >
        {sidebarContent}
      </aside>

      {/* Mobile overlay */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              className="fixed inset-0 z-40 bg-ink-900/30 dark:bg-black/50 md:hidden"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={onMobileClose}
            />
            <motion.aside
              className="fixed top-0 left-0 bottom-0 z-50 w-[260px] md:hidden"
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            >
              {sidebarContent}
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  )
}
