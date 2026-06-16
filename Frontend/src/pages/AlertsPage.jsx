import { useState, useEffect } from 'react'
import alertService from '../services/alertService'

export default function AlertsPage() {
  const [alerts, setAlerts] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('')

  const fetchAlerts = async () => {
    try {
      const params = {}
      if (filter === 'unread') params.is_read = 'false'
      const res = await alertService.list(params)
      setAlerts(res.data.data)
    } catch (err) { console.error(err) }
    finally { setLoading(false) }
  }

  useEffect(() => { fetchAlerts() }, [filter])

  const markRead = async (id) => {
    await alertService.markRead(id)
    fetchAlerts()
  }

  const severityBadge = (s) => {
    const colors = {
      Info: 'bg-blue-100 text-blue-800',
      Warning: 'bg-yellow-100 text-yellow-800',
      Critical: 'bg-red-100 text-red-800',
    }
    return `px-2 py-0.5 rounded-full text-xs font-medium ${colors[s] || 'bg-gray-100 text-gray-800'}`
  }

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Notifications</h1>
        <select value={filter} onChange={(e) => setFilter(e.target.value)}
          className="px-3 py-1.5 border rounded-lg text-sm">
          <option value="">All</option>
          <option value="unread">Unread</option>
        </select>
      </div>

      {loading ? <div className="text-center py-12 text-gray-500">Loading...</div> : (
        <div className="space-y-3">
          {alerts.map((a) => (
            <div key={a.id} className={`bg-white rounded-xl shadow p-4 border-l-4 ${a.is_read ? 'border-transparent' : 'border-blue-500'}`}>
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className={severityBadge(a.severity)}>{a.severity}</span>
                    <span className="text-xs text-gray-400">{a.alert_type}</span>
                    <span className="text-xs text-gray-400">{new Date(a.created_at).toLocaleString()}</span>
                  </div>
                  <p className="text-sm text-gray-700">{a.message}</p>
                </div>
                {!a.is_read && (
                  <button onClick={() => markRead(a.id)}
                    className="ml-3 text-xs text-blue-600 hover:underline whitespace-nowrap">
                    Mark read
                  </button>
                )}
              </div>
            </div>
          ))}
          {alerts.length === 0 && <div className="text-center py-12 text-gray-500">No notifications.</div>}
        </div>
      )}
    </div>
  )
}
