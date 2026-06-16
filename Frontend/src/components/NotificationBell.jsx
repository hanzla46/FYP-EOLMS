import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
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
    <Link to="/alerts" className="relative p-1">
      <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
      </svg>
      {count > 0 && (
        <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-4 w-4 flex items-center justify-center font-bold">
          {count > 99 ? '99+' : count}
        </span>
      )}
    </Link>
  )
}
