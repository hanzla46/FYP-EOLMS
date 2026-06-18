import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { PawPrint, DollarSign, Heart, TrendingUp, GitMerge, Package } from 'lucide-react'
import api from '../services/api'
import { Card, CardContent } from '../components/ui/Card'
import { StatCard } from '../components/ui/StatCard'
import { ChartWrapper } from '../components/ui/ChartWrapper'
import { StatusPill } from '../components/ui/Badge'
import { CardSkeleton } from '../components/ui/Skeleton'

export default function DashboardPage() {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.get('/dashboard').then(res => setData(res.data.data)).catch(console.error).finally(() => setLoading(false))
  }, [])

  if (loading) {
    return (
      <div>
        <h1 className="text-xl font-semibold text-ink-900 dark:text-ink-100 mb-4">Dashboard</h1>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          {Array.from({ length: 4 }).map((_, i) => <CardSkeleton key={i} />)}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
          <div className="lg:col-span-2"><CardSkeleton /></div>
          <CardSkeleton />
        </div>
      </div>
    )
  }

  if (!data) {
    return (
      <div>
        <h1 className="text-xl font-semibold text-ink-900 dark:text-ink-100 mb-4">Dashboard</h1>
        <Card>
          <CardContent className="text-center py-8">
            <p className="text-clay-600 dark:text-clay-400">Failed to load dashboard data. Please try again.</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  const speciesChart = {
    labels: data.species_breakdown.map(s => s.species),
    datasets: [{ data: data.species_breakdown.map(s => parseInt(s.count)) }],
  }

  const productionChart = {
    labels: data.production_30d.map(p => p.production_type),
    datasets: [{ label: '30-Day Total', data: data.production_30d.map(p => parseFloat(p.total)) }],
  }

  const severityColors = {
    Critical: 'border-l-clay-400 dark:border-l-clay-400 bg-clay-100/30 dark:bg-clay-600/5',
    Warning: 'border-l-wheat-400 dark:border-l-wheat-400 bg-wheat-100/30 dark:bg-wheat-500/5',
    Info: 'border-l-pasture-400 dark:border-l-pasture-400 bg-pasture-100/30 dark:bg-pasture-600/5',
  }

  return (
    <div>
      <h1 className="text-xl font-semibold text-ink-900 dark:text-ink-100 mb-4">Dashboard</h1>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <Link to="/animals">
          <StatCard title="Animals" value={data.animals.total} icon={PawPrint} variant="pasture">
            <div className="flex gap-3 mt-2 text-xs">
              <span className="text-pasture-600 dark:text-pasture-400">{data.animals.active} active</span>
              {data.animals.quarantined > 0 && <span className="text-wheat-500">{data.animals.quarantined} quarantined</span>}
              {data.animals.pregnant > 0 && <span className="text-wheat-500">{data.animals.pregnant} pregnant</span>}
            </div>
          </StatCard>
        </Link>

        <Link to="/breeding">
          <StatCard title="Pregnancies" value={data.breeding.active_pregnancies} icon={GitMerge} variant="wheat">
            <p className="text-xs text-slate2-400 mt-2">
              {data.breeding.calving_due > 0 ? `${data.breeding.calving_due} due within 14 days` : 'None due soon'}
            </p>
          </StatCard>
        </Link>

        <Link to="/inventory">
          <StatCard title="Inventory" value={data.inventory.total} icon={Package} variant="default">
            <p className={`text-xs mt-2 ${data.inventory.low_stock > 0 ? 'text-clay-600 dark:text-clay-400 font-medium' : 'text-slate2-400'}`}>
              {data.inventory.low_stock > 0 ? `${data.inventory.low_stock} low stock` : 'All stocked'}
            </p>
          </StatCard>
        </Link>

        <Link to="/finance">
          <StatCard
            title="Revenue (30d)"
            value={`PKR ${parseFloat(data.finance_30d.net).toLocaleString()}`}
            icon={DollarSign}
            variant={data.finance_30d.net >= 0 ? 'pasture' : 'clay'}
          >
            <div className="flex gap-3 mt-2 text-xs">
              <span className="text-pasture-600 dark:text-pasture-400">+PKR {parseFloat(data.finance_30d.income).toLocaleString()}</span>
              <span className="text-clay-600 dark:text-clay-400">-PKR {parseFloat(data.finance_30d.expenses).toLocaleString()}</span>
            </div>
          </StatCard>
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        <div className="lg:col-span-2 grid grid-cols-2 gap-6">
          <ChartWrapper type="doughnut" data={speciesChart} height={250} />
          <ChartWrapper type="bar" data={productionChart} height={250} />
        </div>

        <Card>
          <CardContent>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-medium text-ink-900 dark:text-ink-100">Critical Alerts</h3>
              <Link to="/alerts" className="text-xs text-pasture-600 dark:text-pasture-400 hover:underline">View all</Link>
            </div>
            {data.alerts.recent.length > 0 ? (
              <div className="space-y-2">
                {data.alerts.recent.map(a => (
                  <div key={a.id} className={`border-l-4 rounded-r-sm p-3 ${severityColors[a.severity] || 'border-l-slate2-400'}`}>
                    <div className="flex items-center gap-2 mb-1">
                      <StatusPill status={a.severity} />
                      <span className="text-xs text-slate2-400">{a.alert_type}</span>
                    </div>
                    <p className="text-sm text-ink-900 dark:text-ink-100">{a.message}</p>
                    <p className="text-xs text-slate2-400 mt-1">{new Date(a.created_at).toLocaleString()}</p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-center text-sm text-slate2-400 py-4">No alerts</p>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <Link to="/health/new" className="bg-white dark:bg-[#16201A] rounded-md border border-slate2-400/20 dark:border-slate2-600/20 p-4 hover:border-pasture-400/30 dark:hover:border-pasture-400/30 transition-colors flex items-center gap-3">
          <div className="w-10 h-10 rounded-md bg-pasture-100 dark:bg-pasture-600/10 flex items-center justify-center text-pasture-600 dark:text-pasture-400">
            <Heart className="w-5 h-5" />
          </div>
          <div><p className="font-medium text-sm text-ink-900 dark:text-ink-100">New Health Record</p><p className="text-xs text-slate2-400">Clinical entry</p></div>
        </Link>
        <Link to="/production/add" className="bg-white dark:bg-[#16201A] rounded-md border border-slate2-400/20 dark:border-slate2-600/20 p-4 hover:border-pasture-400/30 dark:hover:border-pasture-400/30 transition-colors flex items-center gap-3">
          <div className="w-10 h-10 rounded-md bg-wheat-100 dark:bg-wheat-500/10 flex items-center justify-center text-wheat-500">
            <TrendingUp className="w-5 h-5" />
          </div>
          <div><p className="font-medium text-sm text-ink-900 dark:text-ink-100">Log Production</p><p className="text-xs text-slate2-400">Milk/Weight/Wool</p></div>
        </Link>
        <Link to="/animals/register" className="bg-white dark:bg-[#16201A] rounded-md border border-slate2-400/20 dark:border-slate2-600/20 p-4 hover:border-pasture-400/30 dark:hover:border-pasture-400/30 transition-colors flex items-center gap-3">
          <div className="w-10 h-10 rounded-md bg-clay-100 dark:bg-clay-600/10 flex items-center justify-center text-clay-600 dark:text-clay-400">
            <PawPrint className="w-5 h-5" />
          </div>
          <div><p className="font-medium text-sm text-ink-900 dark:text-ink-100">Register Animal</p><p className="text-xs text-slate2-400">New livestock</p></div>
        </Link>
        <Link to="/finance" className="bg-white dark:bg-[#16201A] rounded-md border border-slate2-400/20 dark:border-slate2-600/20 p-4 hover:border-pasture-400/30 dark:hover:border-pasture-400/30 transition-colors flex items-center gap-3">
          <div className="w-10 h-10 rounded-md bg-slate2-400/10 dark:bg-slate2-600/10 flex items-center justify-center text-slate2-400">
            <DollarSign className="w-5 h-5" />
          </div>
          <div><p className="font-medium text-sm text-ink-900 dark:text-ink-100">Finance</p><p className="text-xs text-slate2-400">P&L summary</p></div>
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Link to="/animals" className="bg-white dark:bg-[#16201A] rounded-md border border-slate2-400/20 dark:border-slate2-600/20 p-4 text-center hover:border-pasture-400/30 transition-colors">
          <p className="text-lg font-bold text-ink-900 dark:text-ink-100">{data.health.total}</p>
          <p className="text-sm text-slate2-400">Total Health Records</p>
        </Link>
        <Link to="/users" className="bg-white dark:bg-[#16201A] rounded-md border border-slate2-400/20 dark:border-slate2-600/20 p-4 text-center hover:border-pasture-400/30 transition-colors">
          <p className="text-lg font-bold text-ink-900 dark:text-ink-100">{data.users.total}</p>
          <p className="text-sm text-slate2-400">System Users</p>
        </Link>
        <Link to="/alerts" className="bg-white dark:bg-[#16201A] rounded-md border border-slate2-400/20 dark:border-slate2-600/20 p-4 text-center hover:border-pasture-400/30 transition-colors">
          <p className="text-lg font-bold text-clay-600 dark:text-clay-400">{data.alerts.unread}</p>
          <p className="text-sm text-slate2-400">Unread Notifications</p>
        </Link>
      </div>
    </div>
  )
}
