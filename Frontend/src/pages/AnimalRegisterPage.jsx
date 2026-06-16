import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import animalService from '../services/animalService'

export default function AnimalRegisterPage() {
  const navigate = useNavigate()
  const [form, setForm] = useState({
    species: 'Cattle', breed: '', gender: 'Female', date_of_birth: '',
    dam_id: '', sire_identity: '', rfid_tag: '', weight_kg: '', color: '', notes: ''
  })
  const [useManualTag, setUseManualTag] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

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
      if (payload.dam_id) payload.dam_id = parseInt(payload.dam_id)
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
          <div className="flex items-center justify-between mb-1">
            <label className="text-sm font-medium text-gray-700">RFID Tag</label>
            <button type="button" onClick={() => setUseManualTag(!useManualTag)}
              className="text-xs text-blue-600 hover:underline">
              {useManualTag ? 'Auto-generate' : 'Enter manually'}
            </button>
          </div>
          {useManualTag ? (
            <input name="rfid_tag" value={form.rfid_tag} onChange={handleChange}
              placeholder="Enter RFID tag" className="w-full px-3 py-2 border rounded-lg text-sm font-mono" />
          ) : (
            <p className="text-sm text-gray-500 italic">Tag will be auto-generated (e.g. LIV-26-XXXXX)</p>
          )}
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Dam (Mother) ID</label>
            <input type="number" name="dam_id" value={form.dam_id} onChange={handleChange}
              placeholder="Animal ID" className="w-full px-3 py-2 border rounded-lg text-sm" />
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
