import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import productionService from '../services/productionService'
import animalService from '../services/animalService'
import SearchableSelect from '../components/SearchableSelect'

export default function AddProductionPage() {
  const navigate = useNavigate()
  const [animals, setAnimals] = useState([])
  const [form, setForm] = useState({ animal_id: null, log_date: new Date().toISOString().split('T')[0], production_type: 'Milk', quantity: '', unit: 'L', notes: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    animalService.list({ limit: 200, status: 'Active' }).then(res => setAnimals(res.data.data.map(a => ({ id: a.id, label: `${a.tag_number}`, sub: `${a.species} · ${a.breed || ''} · ${a.gender}` }))))
  }, [])

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value })

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    if (!form.animal_id || !form.quantity) { setError('Animal and quantity are required.'); return }
    if (parseFloat(form.quantity) < 0) { setError('Quantity cannot be negative.'); return }
    setLoading(true)
    try {
      await productionService.log({ ...form, quantity: parseFloat(form.quantity) })
      navigate('/production')
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to log production.')
    } finally { setLoading(false) }
  }

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Log Production</h1>
      {error && <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">{error}</div>}

      <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow p-6 space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <SearchableSelect label="Animal" value={form.animal_id} onChange={(v) => setForm({ ...form, animal_id: v })} options={animals} placeholder="Search animal..." required />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Date *</label>
            <input type="date" name="log_date" value={form.log_date} onChange={handleChange}
              className="w-full px-3 py-2 border rounded-lg text-sm" required />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
            <select name="production_type" value={form.production_type} onChange={handleChange}
              className="w-full px-3 py-2 border rounded-lg text-sm">
              <option value="Milk">Milk</option>
              <option value="Weight">Weight</option>
              <option value="Wool">Wool</option>
            </select>
          </div>
          <div className="flex gap-2">
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-1">Quantity *</label>
              <input type="number" name="quantity" value={form.quantity} onChange={handleChange}
                step="0.01" min="0" className="w-full px-3 py-2 border rounded-lg text-sm" required />
            </div>
            <div className="w-20">
              <label className="block text-sm font-medium text-gray-700 mb-1">Unit</label>
              <input name="unit" value={form.unit} onChange={handleChange}
                className="w-full px-3 py-2 border rounded-lg text-sm" />
            </div>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
          <textarea name="notes" value={form.notes} onChange={handleChange} rows={2}
            className="w-full px-3 py-2 border rounded-lg text-sm" />
        </div>

        <div className="flex gap-3 pt-2">
          <button type="submit" disabled={loading}
            className="px-6 py-2.5 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 text-sm font-medium">
            {loading ? 'Saving...' : 'Log Production'}
          </button>
          <button type="button" onClick={() => navigate('/production')}
            className="px-6 py-2.5 border rounded-lg text-sm font-medium hover:bg-gray-50">Cancel</button>
        </div>
      </form>
    </div>
  )
}
