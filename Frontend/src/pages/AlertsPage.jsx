import { useState, useEffect } from 'react'
import { Bell, Check } from 'lucide-react'
import alertService from '../services/alertService'
import { StatusPill } from '../components/ui/Badge'
import { Button } from '../components/ui/Button'
import { EmptyState } from '../components/ui/EmptyState'
import SearchableSelect from '../components/SearchableSelect'

const severityIcons = {
  Critical: <Bell className="w-4 h-4 text-clay-400" />,
  Warning: <Bell className="w-4 h-4 text-wheat-400" />,
  Info: <Bell className="w-4 h-4 text-slate2-400" />,
}

const severityBorder = {
  Critical: 'border-l-clay-400 dark:border-l-clay-400',
  Warning: 'border-l-wheat-400 dark:border-l-wheat-400',
  Info: 'border-l-pasture-400 dark:border-l-pasture-400',
}

export default function AlertsPage() {
  const [alerts, setAlerts] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('')

  const fetchAlerts = async () => {
    setLoading(true)
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

  if (loading) {
    return (
      <div>
        <h1 className="text-xl font-semibold text-ink-900 dark:text-ink-100 mb-4">Notifications</h1>
        <div className="space-y-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="p-4 rounded-md bg-white dark:bg-[#16201A] border border-slate2-400/20 dark:border-slate2-600/20 animate-pulse">
              <div className="h-4 w-1/4 bg-slate2-400/20 dark:bg-slate2-600/20 rounded mb-2" />
              <div className="h-3 w-3/4 bg-slate2-400/20 dark:bg-slate2-600/20 rounded" />
            </div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-xl font-semibold text-ink-900 dark:text-ink-100">Notifications</h1>
        <SearchableSelect
          value={filter}
          onChange={setFilter}
          options={[{id:'',label:'All'},{id:'unread',label:'Unread'}]}
          className="w-36"
        />
      </div>

      {alerts.length === 0 ? (
        <EmptyState
          icon={Bell}
          title="No notifications"
          description="You're all caught up. Notifications will appear here when there are updates."
        />
      ) : (
        <div className="space-y-2">
          {alerts.map((a) => (
            <div
              key={a.id}
              className={`bg-white dark:bg-[#16201A] rounded-md border border-slate2-400/20 dark:border-slate2-600/20 p-4 border-l-4 ${a.is_read ? 'border-l-transparent' : severityBorder[a.severity] || 'border-l-pasture-400'}`}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-2 mb-1">
                  {severityIcons[a.severity] || severityIcons.Info}
                  <StatusPill status={a.severity} />
                  <span className="text-xs text-slate2-400">{a.alert_type}</span>
                  <span className="text-xs text-slate2-400">{new Date(a.created_at).toLocaleString()}</span>
                </div>
                {!a.is_read && (
                  <Button variant="ghost" size="sm" onClick={() => markRead(a.id)} className="shrink-0">
                    <Check className="w-3 h-3" /> Mark read
                  </Button>
                )}
              </div>
              <p className="text-sm text-ink-900 dark:text-ink-100 mt-1">{a.message}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
