import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { ArrowLeft, ChevronLeft, ChevronRight } from 'lucide-react'
import vaccinationService from '../services/vaccinationService'
import { Card, CardContent } from '../components/ui/Card'
import { Badge } from '../components/ui/Badge'
import { Button } from '../components/ui/Button'

export default function VaccinationCalendarPage() {
  const [schedules, setSchedules] = useState([])
  const [loading, setLoading] = useState(true)
  const [currentDate, setCurrentDate] = useState(new Date())

  useEffect(() => {
    vaccinationService.list({}).then(res => setSchedules(res.data.data)).catch(console.error).finally(() => setLoading(false))
  }, [])

  const daysInMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).getDate()
  const firstDayOfWeek = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1).getDay()
  const monthLabel = currentDate.toLocaleString('default', { month: 'long', year: 'numeric' })

  const navMonth = (delta) => {
    const d = new Date(currentDate)
    d.setMonth(d.getMonth() + delta)
    setCurrentDate(d)
  }

  const scheduleItems = schedules.filter(s => {
    if (!s.age_days) return false
    const dueDate = new Date()
    dueDate.setDate(dueDate.getDate() + s.age_days)
    return dueDate.getMonth() === currentDate.getMonth() && dueDate.getFullYear() === currentDate.getFullYear()
  })

  const days = []
  for (let i = 0; i < firstDayOfWeek; i++) days.push(null)
  for (let d = 1; d <= daysInMonth; d++) days.push(d)

  if (loading) {
    return (
      <div>
        <div className="h-6 w-48 bg-slate2-400/20 animate-pulse rounded mb-4" />
        <div className="h-96 bg-white dark:bg-[#16201A] rounded-md border border-slate2-400/20 animate-pulse" />
      </div>
    )
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Link to="/vaccination-schedules" className="text-slate2-400 hover:text-ink-900 dark:hover:text-ink-100">
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <h1 className="text-xl font-semibold text-ink-900 dark:text-ink-100">Vaccination Calendar</h1>
        </div>
      </div>

      <Card>
        <CardContent>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-medium text-ink-900 dark:text-ink-100">{monthLabel}</h2>
            <div className="flex gap-1">
              <Button variant="ghost" size="sm" onClick={() => navMonth(-1)}><ChevronLeft className="w-4 h-4" /></Button>
              <Button variant="ghost" size="sm" onClick={() => setCurrentDate(new Date())}>Today</Button>
              <Button variant="ghost" size="sm" onClick={() => navMonth(1)}><ChevronRight className="w-4 h-4" /></Button>
            </div>
          </div>

          <div className="grid grid-cols-7 gap-px bg-slate2-400/10 dark:bg-slate2-600/10 rounded-sm overflow-hidden">
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(d => (
              <div key={d} className="bg-mist-50 dark:bg-mist-900 p-2 text-center text-xs font-medium text-slate2-400 uppercase">{d}</div>
            ))}
            {days.map((day, i) => (
              <div key={i} className={`bg-white dark:bg-[#16201A] p-2 min-h-[80px] ${day ? '' : 'opacity-30'}`}>
                {day && <span className="text-xs text-ink-900 dark:text-ink-100">{day}</span>}
                {day && schedules.filter(s => s.age_days).filter(s => {
                  const dueDate = new Date()
                  dueDate.setDate(dueDate.getDate() + s.age_days)
                  return dueDate.getDate() === day && dueDate.getMonth() === currentDate.getMonth() && dueDate.getFullYear() === currentDate.getFullYear()
                }).map((s, j) => (
                  <div key={j} className="mt-1 px-1 py-0.5 rounded-sm text-[10px] bg-pasture-100 dark:bg-pasture-600/20 text-pasture-600 dark:text-pasture-400 truncate" title={`${s.vaccine_name} (${s.target_species})`}>
                    {s.vaccine_name}
                  </div>
                ))}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card className="mt-6">
        <CardContent>
          <h3 className="text-sm font-medium text-ink-900 dark:text-ink-100 mb-3">All Schedules</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {schedules.map(s => (
              <div key={s.id} className="flex items-center justify-between p-3 bg-mist-50 dark:bg-mist-900 rounded-sm">
                <div>
                  <p className="text-sm font-medium text-ink-900 dark:text-ink-100">{s.vaccine_name}</p>
                  <p className="text-xs text-slate2-400">
                    {s.target_species} {s.age_days ? `· ${s.age_days} days old` : ''}
                    {s.booster_interval_days ? ` · Booster: ${s.booster_interval_days}d` : ''}
                  </p>
                </div>
                <Badge variant="pending">{s.target_species}</Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
