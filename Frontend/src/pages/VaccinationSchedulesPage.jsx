import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Plus } from 'lucide-react'
import { toast } from 'sonner'
import vaccinationService from '../services/vaccinationService'
import inventoryService from '../services/inventoryService'
import SearchableSelect from '../components/SearchableSelect'
import { Button } from '../components/ui/Button'
import { Input, Textarea } from '../components/ui/Input'
import { Card, CardContent } from '../components/ui/Card'
import { DataTable } from '../components/ui/DataTable'

const speciesOpts = [{id:'All',label:'All'},{id:'Cattle',label:'Cattle'},{id:'Sheep',label:'Sheep'},{id:'Goat',label:'Goat'}]

export default function VaccinationSchedulesPage() {
  const [schedules, setSchedules] = useState([])
  const [inventory, setInventory] = useState([])
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ vaccine_name: '', target_species: 'All', age_days: '', booster_interval_days: '', inventory_item_id: null, notes: '' })
  const [error, setError] = useState('')

  const fetchSchedules = async () => {
    try {
      const res = await vaccinationService.list({})
      setSchedules(res.data.data)
    } catch (err) { console.error(err) }
    finally { setLoading(false) }
  }

  useEffect(() => {
    fetchSchedules()
    inventoryService.list({}).then(res => setInventory(res.data.data.filter(i => i.category === 'Medication').map(i => ({ id: i.id, label: i.item_name, sub: `${i.quantity} ${i.unit} in stock` }))))
  }, [])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    try {
      const payload = { ...form, age_days: form.age_days ? parseInt(form.age_days) : null, booster_interval_days: form.booster_interval_days ? parseInt(form.booster_interval_days) : null, inventory_item_id: form.inventory_item_id || null }
      await vaccinationService.create(payload)
      setForm({ vaccine_name: '', target_species: 'All', age_days: '', booster_interval_days: '', inventory_item_id: null, notes: '' })
      setShowForm(false)
      toast.success('Schedule created')
      fetchSchedules()
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to create schedule.')
    }
  }

  const columns = [
    { key: 'vaccine_name', label: 'Vaccine', render: (val) => <span className="font-medium">{val}</span> },
    { key: 'target_species', label: 'Species' },
    { key: 'age_days', label: 'Age (days)', render: (val) => val || '\u2014' },
    { key: 'booster_interval_days', label: 'Booster', render: (val) => val ? `${val} days` : '\u2014' },
    {
      key: 'inventory_stock', label: 'Stock',
      render: (val, row) => row.inventory_item_name ? (
        <span className={parseFloat(val) <= 0 ? 'text-clay-600 dark:text-clay-400 font-medium' : ''}>
          {val} {row.inventory_unit}
          <span className="text-xs text-slate2-400 ml-1">({row.inventory_item_name})</span>
        </span>
      ) : <span className="text-slate2-400 text-xs">No stock linked</span>,
    },
    { key: 'notes', label: 'Notes', render: (val) => val || '\u2014' },
  ]

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-xl font-semibold text-ink-900 dark:text-ink-100">Vaccination Schedules</h1>
        <div className="flex gap-2">
          <Button size="sm" variant="secondary" onClick={() => navigate('/vaccination-schedules/calendar')}>
            Calendar
          </Button>
          <Button size="sm" onClick={() => setShowForm(!showForm)}><Plus className="w-4 h-4" /> Add Schedule</Button>
        </div>
      </div>

      {showForm && (
        <Card className="mb-4">
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-3">
              {error && <p className="text-sm text-clay-600 dark:text-clay-400">{error}</p>}
              <div className="grid grid-cols-2 gap-4">
                <Input label="Vaccine Name *" value={form.vaccine_name} onChange={(e) => setForm({ ...form, vaccine_name: e.target.value })} required />
                <SearchableSelect label="Target Species" value={form.target_species} onChange={(v) => setForm({ ...form, target_species: v })} options={speciesOpts} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <Input label="Age (days)" type="number" value={form.age_days} onChange={(e) => setForm({ ...form, age_days: e.target.value })} />
                <Input label="Booster Interval (days)" type="number" value={form.booster_interval_days} onChange={(e) => setForm({ ...form, booster_interval_days: e.target.value })} />
              </div>
              <SearchableSelect label="Linked Inventory Item" value={form.inventory_item_id} onChange={(v) => setForm({ ...form, inventory_item_id: v })} options={inventory} placeholder="Link to stock item..." />
              <Textarea label="Notes" value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} rows={2} />
              <div className="flex gap-3">
                <Button type="submit" size="sm">Save</Button>
                <Button type="button" variant="ghost" size="sm" onClick={() => setShowForm(false)}>Cancel</Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      <DataTable
        columns={columns}
        data={schedules}
        loading={loading}
        emptyTitle="No vaccination schedules defined"
        emptyDescription="Create the first schedule to track vaccinations for your livestock."
        emptyAction={<Button size="sm" onClick={() => setShowForm(true)}><Plus className="w-4 h-4" /> Add Schedule</Button>}
      />
    </div>
  )
}
