import { useState, useEffect } from 'react'
import { Plus } from 'lucide-react'
import { toast } from 'sonner'
import productionService from '../services/productionService'
import animalService from '../services/animalService'
import { Button } from '../components/ui/Button'
import { StatCard } from '../components/ui/StatCard'
import { ChartWrapper } from '../components/ui/ChartWrapper'
import { Tabs } from '../components/ui/Tabs'
import { DataTable } from '../components/ui/DataTable'
import { TagBadge } from '../components/ui/TagBadge'
import { Card, CardContent } from '../components/ui/Card'
import { CardSkeleton } from '../components/ui/Skeleton'
import { Input, Textarea } from '../components/ui/Input'
import { DatePicker } from '../components/ui/DatePicker'
import { Drawer } from '../components/ui/Drawer'
import SearchableSelect from '../components/SearchableSelect'

const typeOptions = [{id:'Milk',label:'Milk'},{id:'Weight',label:'Weight'},{id:'Wool',label:'Wool'}]

export default function ProductionPage() {
  const [logs, setLogs] = useState([])
  const [dashboard, setDashboard] = useState(null)
  const [loading, setLoading] = useState(true)
  const [tab, setTab] = useState('dashboard')
  const [filters, setFilters] = useState({ date_from: '', date_to: '' })
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [animals, setAnimals] = useState([])
  const [form, setForm] = useState({ animal_id: null, log_date: new Date().toISOString().split('T')[0], production_type: 'Milk', quantity: '', unit: 'L', notes: '' })
  const [saving, setSaving] = useState(false)

  const fetchData = async (filtersOverride) => {
    setLoading(true)
    const f = filtersOverride || filters
    try {
      const params = { limit: 50 }
      if (f.date_from) params.date_from = f.date_from
      if (f.date_to) params.date_to = f.date_to
      const [logRes, dashRes] = await Promise.all([
        productionService.list(params),
        productionService.dashboard(params),
      ])
      setLogs(logRes.data.data)
      setDashboard(dashRes.data.data)
    } catch (err) { console.error(err) }
    finally { setLoading(false) }
  }

  useEffect(() => { fetchData() }, [])

  const openDrawer = () => {
    animalService.list({ limit: 200, status: 'Active' }).then(res => setAnimals(res.data.data.map(a => ({ id: a.id, label: `${a.tag_number}`, sub: `${a.species} \u00B7 ${a.breed || ''} \u00B7 ${a.gender}` }))))
    setForm({ animal_id: null, log_date: new Date().toISOString().split('T')[0], production_type: 'Milk', quantity: '', unit: 'L', notes: '' })
    setDrawerOpen(true)
  }

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value })

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.animal_id || !form.quantity) { toast.error('Animal and quantity are required.'); return }
    if (parseFloat(form.quantity) < 0) { toast.error('Quantity cannot be negative.'); return }
    setSaving(true)
    try {
      await productionService.log({ ...form, quantity: parseFloat(form.quantity) })
      toast.success('Production logged')
      setDrawerOpen(false)
      fetchData()
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to log production.')
    } finally { setSaving(false) }
  }

  const chartData = () => {
    if (!dashboard) return null
    const byType = {}
    dashboard.by_date.forEach(d => {
      if (!byType[d.production_type]) byType[d.production_type] = {}
      byType[d.production_type][d.log_date?.split('T')[0]] = parseFloat(d.daily_total)
    })
    const allDates = [...new Set(dashboard.by_date.map(d => d.log_date?.split('T')[0]))].sort()
    return {
      labels: allDates.slice(-30),
      datasets: Object.entries(byType).map(([type, dateMap]) => ({
        label: `${type}`,
        data: allDates.slice(-30).map(d => dateMap[d] || null),
        tension: 0.3,
      })),
    }
  }

  const summaryData = () => {
    if (!dashboard) return null
    return {
      labels: dashboard.summary.map(s => s.production_type),
      datasets: [{ label: 'Total', data: dashboard.summary.map(s => parseFloat(s.total_quantity)) }],
    }
  }

  const logColumns = [
    { key: 'log_date', label: 'Date', render: (val) => val?.split('T')[0] },
    { key: 'animal_tag', label: 'Animal', render: (val, row) => <TagBadge tag={val} species={row.animal_species} to={`/animals/${row.animal_id}`} /> },
    { key: 'production_type', label: 'Type' },
    { key: 'quantity', label: 'Quantity', render: (val, row) => <span className="font-medium ledger-mono">{val} {row.unit}</span> },
    { key: 'notes', label: 'Notes', render: (val) => val || '\u2014' },
  ]

  const renderMobileCard = (l) => (
    <div>
      <TagBadge tag={l.animal_tag} species={l.animal_species} to={`/animals/${l.animal_id}`} />
      <p className="text-xs text-slate2-400 mt-1">
        {l.log_date?.split('T')[0]} {'\u00B7'} {l.production_type} {'\u00B7'} <span className="font-medium ledger-mono">{l.quantity} {l.unit}</span>
      </p>
    </div>
  )

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-xl font-semibold text-ink-900 dark:text-ink-100">Production</h1>
        <Button size="sm" onClick={openDrawer}><Plus className="w-4 h-4" /> Log Production</Button>
      </div>

      <div className="flex items-center gap-4 mb-4 flex-wrap">
        <Tabs tabs={[{ key: 'dashboard', label: 'Dashboard' }, { key: 'logs', label: 'Logs' }]} activeTab={tab} onChange={setTab} className="flex-1" />
        <div className="flex items-center gap-2">
          <DatePicker value={filters.date_from} onChange={(e) => setFilters({ ...filters, date_from: e.target.value })} className="w-36" />
          <DatePicker value={filters.date_to} onChange={(e) => setFilters({ ...filters, date_to: e.target.value })} className="w-36" />
          <Button size="sm" variant="secondary" onClick={() => { setLoading(true); fetchData(filters) }}>Filter</Button>
          {(filters.date_from || filters.date_to) && (
            <Button variant="ghost" size="sm" onClick={() => { const cleared = { date_from: '', date_to: '' }; setFilters(cleared); fetchData(cleared) }}>Clear</Button>
          )}
        </div>
      </div>

      {tab === 'dashboard' && loading && !dashboard && (
        <div className="space-y-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {Array.from({ length: 4 }).map((_, i) => <CardSkeleton key={i} />)}
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white dark:bg-[#16201A] rounded-md border border-slate2-400/20 dark:border-slate2-600/20 p-4 animate-pulse" style={{ height: 300 }} />
            <div className="bg-white dark:bg-[#16201A] rounded-md border border-slate2-400/20 dark:border-slate2-600/20 p-4 animate-pulse" style={{ height: 300 }} />
          </div>
        </div>
      )}

      {tab === 'dashboard' && !loading && !dashboard && (
        <Card>
          <CardContent className="text-center py-8">
            <p className="text-slate2-400 text-sm">Failed to load production data. Try refreshing.</p>
          </CardContent>
        </Card>
      )}

      {tab === 'dashboard' && dashboard && (
        <div className="space-y-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {dashboard.summary.map((s) => (
              <StatCard
                key={s.production_type}
                title={s.production_type}
                value={`${parseFloat(s.total_quantity).toLocaleString()} ${s.production_type === 'Milk' ? 'L' : 'kg'}`}
                variant={s.production_type === 'Milk' ? 'default' : s.production_type === 'Weight' ? 'pasture' : 'wheat'}
              >
                <p className="text-xs text-slate2-400 mt-2">{s.total_logs} logs {'\u00B7'} {s.animal_count} animals</p>
              </StatCard>
            ))}
          </div>

          {dashboard.by_date.length > 0 && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <ChartWrapper type="line" data={chartData()} height={300} />
              <ChartWrapper type="bar" data={summaryData()} height={300} />
            </div>
          )}

          {dashboard.top_animals.length > 0 && (
            <Card>
              <CardContent>
                <h3 className="text-sm font-medium text-ink-900 dark:text-ink-100 mb-3">Top Producing Animals</h3>
                <div className="space-y-2">
                  {dashboard.top_animals.map((a, i) => (
                    <div key={i} className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-2">
                        <TagBadge tag={a.tag_number} species={a.species} to={`/animals/${a.id}`} />
                        <span className="text-xs text-slate2-400">{a.production_type}</span>
                      </div>
                      <span className="font-medium ledger-mono text-ink-900 dark:text-ink-100">{parseFloat(a.total_production).toLocaleString()}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {tab === 'logs' && (
        <DataTable
          columns={logColumns}
          data={logs}
          loading={loading}
          emptyTitle="No production logs yet"
          emptyDescription="Log the first production entry to start tracking yields."
          emptyAction={<Button size="sm" onClick={openDrawer}><Plus className="w-4 h-4" /> Log Production</Button>}
          renderMobileCard={renderMobileCard}
        />
      )}

      <Drawer open={drawerOpen} onClose={() => setDrawerOpen(false)} title="Log Production">
        <form onSubmit={handleSubmit} className="space-y-3">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <SearchableSelect label="Animal" value={form.animal_id} onChange={(v) => setForm({ ...form, animal_id: v })} options={animals} placeholder="Search animal..." required />
            </div>
            <DatePicker label="Date *" value={form.log_date} onChange={handleChange} name="log_date" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <SearchableSelect label="Type" value={form.production_type} onChange={(v) => setForm({...form, production_type: v})} options={typeOptions} />
            <div className="flex gap-2">
              <div className="flex-1">
                <Input label="Quantity *" type="number" name="quantity" value={form.quantity} onChange={handleChange} step="0.01" min="0" required />
              </div>
              <div className="w-20">
                <Input label="Unit" name="unit" value={form.unit} onChange={handleChange} />
              </div>
            </div>
          </div>
          <Textarea label="Notes" name="notes" value={form.notes} onChange={handleChange} rows={2} />
          <div className="flex gap-3 pt-2">
            <Button type="submit" disabled={saving}>{saving ? 'Saving...' : 'Log Production'}</Button>
            <Button type="button" variant="ghost" onClick={() => setDrawerOpen(false)}>Cancel</Button>
          </div>
        </form>
      </Drawer>
    </div>
  )
}
