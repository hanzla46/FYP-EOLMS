import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Bell } from 'lucide-react'
import alertService from '../services/alertService'

export default function NotificationBell() {
  const [count, setCount] = useState(0)

  useEffect(() => {
    const token = localStorage.getItem('token')
    if (!token) return
    alertService.unreadCount().then(res => setCount(res.data.unread_count)).catch(() => {})
    const interval = setInterval(() => {
      alertService.unreadCount().then(res => setCount(res.data.unread_count)).catch(() => {})
    }, 30000)
    return () => clearInterval(interval)
  }, [])

  return (
    <Link to="/alerts" className="relative p-1.5 rounded-sm text-slate2-400 hover:text-ink-900 dark:hover:text-ink-100 hover:bg-mist-50 dark:hover:bg-mist-900" aria-label={`Notifications${count > 0 ? ` (${count} unread)` : ''}`}>
      <Bell className="w-4 h-4" />
      {count > 0 && (
        <span className="absolute -top-0.5 -right-0.5 bg-clay-600 text-white text-[10px] rounded-full min-w-[16px] h-4 flex items-center justify-center font-bold px-0.5">
          {count > 99 ? '99+' : count}
        </span>
      )}
    </Link>
  )
}
