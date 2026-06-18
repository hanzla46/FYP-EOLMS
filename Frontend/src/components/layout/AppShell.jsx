import { useState } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import { Sidebar } from './Sidebar'
import { Topbar } from './Topbar'

const breadcrumbMap = {
  '/': 'Dashboard',
  '/animals': 'Animals',
  '/animals/register': 'Animals / Register',
  '/inventory': 'Inventory',
  '/health': 'Health Records',
  '/health/new': 'Health / New Record',
  '/health/timeline': 'Health Timeline',
  '/vaccination-schedules': 'Vaccination Schedules',
  '/vaccination-schedules/calendar': 'Vaccination Calendar',
  '/breeding': 'Breeding',
  '/breeding/kanban': 'Breeding / Kanban',
  '/production': 'Production',
  '/finance': 'Finance',
  '/alerts': 'Alerts',
  '/register': 'Register User',
  '/users': 'Users',
  '/styleguide': 'Style Guide',
}

function getBreadcrumb(pathname) {
  for (const [path, label] of Object.entries(breadcrumbMap)) {
    if (pathname === path) return label
  }
  if (pathname.startsWith('/animals/') && pathname !== '/animals/register') return 'Animals / Detail'
  if (pathname.startsWith('/inventory/') && pathname !== '/inventory/add') return 'Inventory / Detail'
  return ''
}

export function AppShell() {
  const [collapsed, setCollapsed] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const location = useLocation()
  const breadcrumb = getBreadcrumb(location.pathname)

  return (
    <div className="flex h-screen overflow-hidden bg-mist-50 dark:bg-mist-900">
      <Sidebar
        collapsed={collapsed}
        onToggle={() => setCollapsed(!collapsed)}
        mobileOpen={mobileOpen}
        onMobileClose={() => setMobileOpen(false)}
      />

      <div className="flex flex-col flex-1 min-w-0">
        <Topbar
          onMenuClick={() => setMobileOpen(true)}
          breadcrumb={breadcrumb}
        />
        <main className="flex-1 overflow-y-auto p-4 md:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
