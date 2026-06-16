import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import animalService from '../services/animalService'
import SearchableSelect from '../components/SearchableSelect'

export default function AnimalRegisterPage() {
  const navigate = useNavigate()
  const [animals, setAnimals] = useState([])
  const [form, setForm] = useState({
    species: 'Cattle', breed: '', gender: 'Female', date_of_birth: '',
    dam_id: null, sire_identity: '', rfid_tag: '', weight_kg: '', color: '', notes: ''
  })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    animalService.list({ limit: 200, gender: 'Female' }).then(res => setAnimals(res.data.data.map(a => ({ id: a.id, label: `${a.tag_number}`, sub: `${a.species} · ${a.breed || 'Unknown'}` }))))
  }, [])

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value })

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const payload = { ...form }
      if (!payload.dam_id) delete payload.dam_id
      if (!payload.sire_identity) delete payload.sire_identity
      if (!payload.rfid_tag) delete payload.rfid_tag
      if (!payload.date_of_birth) delete payload.date_of_birth
      if (!payload.weight_kg) delete payload.weight_kg
      if (!payload.color) delete payload.color
      if (!payload.notes) delete payload.notes
      if (payload.weight_kg) payload.weight_kg = parseFloat(payload.weight_kg)

      const res = await animalService.register(payload)
      navigate(`/animals/${res.data.id}`)
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to register animal.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Register New Animal</h1>

      {error && <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">{error}</div>}

      <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow p-6 space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Species *</label>
            <select name="species" value={form.species} onChange={handleChange}
              className="w-full px-3 py-2 border rounded-lg text-sm" required>
              <option value="Cattle">Cattle</option>
              <option value="Sheep">Sheep</option>
              <option value="Goat">Goat</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Gender *</label>
            <select name="gender" value={form.gender} onChange={handleChange}
              className="w-full px-3 py-2 border rounded-lg text-sm" required>
              <option value="Female">Female</option>
              <option value="Male">Male</option>
            </select>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Breed</label>
          <input name="breed" value={form.breed} onChange={handleChange}
            placeholder="e.g. Holstein, Beetal" className="w-full px-3 py-2 border rounded-lg text-sm" />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Date of Birth</label>
            <input type="date" name="date_of_birth" value={form.date_of_birth} onChange={handleChange}
              className="w-full px-3 py-2 border rounded-lg text-sm" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Weight (kg)</label>
            <input type="number" name="weight_kg" value={form.weight_kg} onChange={handleChange}
              step="0.1" min="0" placeholder="e.g. 450" className="w-full px-3 py-2 border rounded-lg text-sm" />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">RFID Tag</label>
          <input name="rfid_tag" value={form.rfid_tag} onChange={handleChange}
            placeholder="Enter RFID tag (or leave blank for auto)" className="w-full px-3 py-2 border rounded-lg text-sm font-mono" />
          <p className="text-xs text-gray-400 mt-1">Leave blank to auto-generate tag (e.g. LIV-26-XXXXX)</p>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            {animals.length > 0 ? (
              <SearchableSelect label="Dam (Mother)" value={form.dam_id} onChange={(v) => setForm({ ...form, dam_id: v })} options={animals} placeholder="Search female animal..." />
            ) : (
              <>
                <label className="block text-sm font-medium text-gray-700 mb-1">Dam (Mother) ID</label>
                <input type="number" name="dam_id" value={form.dam_id || ''} onChange={(e) => setForm({ ...form, dam_id: e.target.value ? parseInt(e.target.value) : null })}
                  placeholder="No females registered yet" className="w-full px-3 py-2 border rounded-lg text-sm" />
                <p className="text-xs text-gray-400 mt-1">Enter animal ID if known (optional).</p>
              </>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Sire Identity</label>
            <input name="sire_identity" value={form.sire_identity} onChange={handleChange}
              placeholder="Tag or external ID" className="w-full px-3 py-2 border rounded-lg text-sm" />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Color</label>
            <input name="color" value={form.color} onChange={handleChange}
              placeholder="e.g. Black and White" className="w-full px-3 py-2 border rounded-lg text-sm" />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
          <textarea name="notes" value={form.notes} onChange={handleChange} rows={2}
            placeholder="Additional notes..." className="w-full px-3 py-2 border rounded-lg text-sm" />
        </div>

        <div className="flex gap-3 pt-2">
          <button type="submit" disabled={loading}
            className="px-6 py-2.5 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 text-sm font-medium">
            {loading ? 'Registering...' : 'Register Animal'}
          </button>
          <button type="button" onClick={() => navigate('/animals')}
            className="px-6 py-2.5 border rounded-lg text-sm font-medium hover:bg-gray-50">
            Cancel
          </button>
        </div>
      </form>
    </div>
  )
}
