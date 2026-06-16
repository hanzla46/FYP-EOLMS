import { useState, useEffect } from 'react'
import vaccinationService from '../services/vaccinationService'
import inventoryService from '../services/inventoryService'
import SearchableSelect from '../components/SearchableSelect'

export default function VaccinationSchedulesPage() {
  const [schedules, setSchedules] = useState([])
  const [inventory, setInventory] = useState([])
  const [loading, setLoading] = useState(true)
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
      fetchSchedules()
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to create schedule.')
    }
  }

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Vaccination Schedules</h1>
        <button onClick={() => setShowForm(!showForm)} className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm font-medium">
          + Add Schedule
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow p-6 mb-6 space-y-3">
          {error && <p className="text-sm text-red-600">{error}</p>}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Vaccine Name *</label>
              <input value={form.vaccine_name} onChange={(e) => setForm({ ...form, vaccine_name: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg text-sm" required />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Target Species</label>
              <select value={form.target_species} onChange={(e) => setForm({ ...form, target_species: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg text-sm">
                <option value="All">All</option>
                <option value="Cattle">Cattle</option>
                <option value="Sheep">Sheep</option>
                <option value="Goat">Goat</option>
              </select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Age (days)</label>
              <input type="number" value={form.age_days} onChange={(e) => setForm({ ...form, age_days: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg text-sm" />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Booster Interval (days)</label>
              <input type="number" value={form.booster_interval_days} onChange={(e) => setForm({ ...form, booster_interval_days: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg text-sm" />
            </div>
          </div>
          <div>
            <SearchableSelect label="Linked Inventory Item (optional)" value={form.inventory_item_id} onChange={(v) => setForm({ ...form, inventory_item_id: v })} options={inventory} placeholder="Link to stock item..." />
            <p className="text-xs text-gray-400 mt-1">Linking shows stock levels and enables deduction when vaccine is administered.</p>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Notes</label>
            <textarea value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} rows={2}
              className="w-full px-3 py-2 border rounded-lg text-sm" />
          </div>
          <div className="flex gap-3">
            <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-medium">Save</button>
            <button type="button" onClick={() => setShowForm(false)} className="px-4 py-2 border rounded-lg text-sm hover:bg-gray-50">Cancel</button>
          </div>
        </form>
      )}

      {loading ? <div className="text-center py-12 text-gray-500">Loading...</div> : (
        <div className="bg-white rounded-xl shadow overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-gray-600">
              <tr>
                <th className="px-4 py-3 text-left font-medium">Vaccine</th>
                <th className="px-4 py-3 text-left font-medium">Species</th>
                <th className="px-4 py-3 text-left font-medium">Age (days)</th>
                <th className="px-4 py-3 text-left font-medium">Booster</th>
                <th className="px-4 py-3 text-left font-medium">Stock</th>
                <th className="px-4 py-3 text-left font-medium">Notes</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {schedules.map((s) => (
                <tr key={s.id}>
                  <td className="px-4 py-3 font-medium">{s.vaccine_name}</td>
                  <td className="px-4 py-3">{s.target_species}</td>
                  <td className="px-4 py-3">{s.age_days || '—'}</td>
                  <td className="px-4 py-3">{s.booster_interval_days ? `${s.booster_interval_days} days` : '—'}</td>
                  <td className="px-4 py-3">
                    {s.inventory_item_name ? (
                      <span className={parseFloat(s.inventory_stock) <= 0 ? 'text-red-600' : 'text-gray-700'}>
                        {s.inventory_stock} {s.inventory_unit}
                        <span className="text-xs text-gray-400 ml-1">({s.inventory_item_name})</span>
                      </span>
                    ) : (
                      <span className="text-gray-400 text-xs">No stock linked</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-gray-500 max-w-xs truncate">{s.notes || '—'}</td>
                </tr>
              ))}
              {schedules.length === 0 && <tr><td colSpan="6" className="px-4 py-8 text-center text-gray-500">No schedules defined.</td></tr>}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
