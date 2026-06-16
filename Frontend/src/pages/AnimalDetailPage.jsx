import { useState, useEffect } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import QRCode from 'react-qr-code'
import animalService from '../services/animalService'
import breedService from '../services/breedService'
import uploadService from '../services/uploadService'
import FileUpload from '../components/FileUpload'

export default function AnimalDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [animal, setAnimal] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [editing, setEditing] = useState(false)
  const [editForm, setEditForm] = useState({})
  const [breeds, setBreeds] = useState([])
  const [statusForm, setStatusForm] = useState('')

  const fetchAnimal = async () => {
    try {
      const res = await animalService.getById(id)
      setAnimal(res.data.data)
    } catch (err) {
      setError('Animal not found.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchAnimal() }, [id])

  const statusBadge = (status) => {
    const colors = {
      Active: 'bg-green-100 text-green-800',
      Quarantined: 'bg-yellow-100 text-yellow-800',
      Deceased: 'bg-red-100 text-red-800',
      Sold: 'bg-gray-100 text-gray-800',
      Pregnant: 'bg-purple-100 text-purple-800',
      Dry: 'bg-blue-100 text-blue-800',
    }
    return `px-3 py-1 rounded-full text-xs font-semibold ${colors[status] || 'bg-gray-100 text-gray-800'}`
  }

  const handleEdit = () => {
    setEditForm({
      breed: animal.breed || '',
      date_of_birth: animal.date_of_birth ? animal.date_of_birth.split('T')[0] : '',
      dam_id: animal.dam_id || '',
      sire_identity: animal.sire_identity || '',
      weight_kg: animal.weight_kg || '',
      color: animal.color || '',
      notes: animal.notes || '',
    })
    breedService.list(animal.species).then(res => setBreeds(res.data.data))
    setEditing(true)
  }

  const handleUpdate = async (e) => {
    e.preventDefault()
    try {
      const payload = {}
      Object.entries(editForm).forEach(([k, v]) => { if (v !== undefined && v !== '') payload[k] = v })
      if (payload.dam_id) payload.dam_id = parseInt(payload.dam_id)
      if (payload.weight_kg) payload.weight_kg = parseFloat(payload.weight_kg)
      await animalService.update(id, payload)
      setEditing(false)
      fetchAnimal()
    } catch (err) {
      setError(err.response?.data?.error || 'Update failed.')
    }
  }

  const handleStatusChange = async () => {
    if (!statusForm) return
    try {
      await animalService.updateStatus(id, statusForm)
      setStatusForm('')
      fetchAnimal()
    } catch (err) {
      setError(err.response?.data?.error || 'Status change failed.')
    }
  }

  if (loading) return <div className="p-6 text-center text-gray-500">Loading...</div>
  if (error && !animal) return <div className="p-6 text-center text-red-600">{error}</div>

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="flex items-center gap-2 mb-6">
        <Link to="/animals" className="text-blue-600 hover:underline text-sm">&larr; Back to Animals</Link>
      </div>

      {error && <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">{error}</div>}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white rounded-xl shadow p-6">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-800">{animal.tag_number}</h1>
              <p className="text-gray-500 text-sm">{animal.species} &middot; {animal.breed || 'Unknown breed'}</p>
            </div>
            <span className={statusBadge(animal.status)}>{animal.status}</span>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
            <div><span className="text-xs text-gray-500 block">Gender</span><span className="font-medium">{animal.gender}</span></div>
            <div><span className="text-xs text-gray-500 block">Date of Birth</span><span className="font-medium">{animal.date_of_birth ? animal.date_of_birth.split('T')[0] : '—'}</span></div>
            <div><span className="text-xs text-gray-500 block">Weight</span><span className="font-medium">{animal.weight_kg ? `${animal.weight_kg} kg` : '—'}</span></div>
            <div><span className="text-xs text-gray-500 block">Color</span><span className="font-medium">{animal.color || '—'}</span></div>
            <div><span className="text-xs text-gray-500 block">Dam</span><span className="font-medium">{animal.dam_tag || animal.dam_id || '—'}</span></div>
            <div><span className="text-xs text-gray-500 block">Sire</span><span className="font-medium">{animal.sire_identity || '—'}</span></div>
            <div><span className="text-xs text-gray-500 block">RFID</span><span className="font-mono text-sm">{animal.rfid_tag || '—'}</span></div>
            <div><span className="text-xs text-gray-500 block">Registered by</span><span className="font-medium">{animal.created_by_name}</span></div>
          </div>

          <div className="grid grid-cols-3 gap-3 mb-6">
            <div className="bg-blue-50 rounded-lg p-3 text-center">
              <div className="text-2xl font-bold text-blue-700">{animal.health_record_count}</div>
              <div className="text-xs text-blue-600">Health Records</div>
            </div>
            <div className="bg-purple-50 rounded-lg p-3 text-center">
              <div className="text-2xl font-bold text-purple-700">{animal.breeding_record_count}</div>
              <div className="text-xs text-purple-600">Breedings</div>
            </div>
            <div className="bg-green-50 rounded-lg p-3 text-center">
              <div className="text-2xl font-bold text-green-700">{animal.production_log_count}</div>
              <div className="text-xs text-green-600">Production Logs</div>
            </div>
          </div>

          {animal.notes && (
            <div className="border-t pt-4">
              <span className="text-xs text-gray-500 block mb-1">Notes</span>
              <p className="text-sm text-gray-700">{animal.notes}</p>
            </div>
          )}

          <div className="border-t pt-4 mt-4 flex gap-3">
            <button onClick={handleEdit} className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-medium">
              Edit Details
            </button>
            <select value={statusForm} onChange={(e) => setStatusForm(e.target.value)}
              className="px-3 py-2 border rounded-lg text-sm">
              <option value="">Change Status...</option>
              {['Active', 'Quarantined', 'Pregnant', 'Dry', 'Deceased', 'Sold'].filter(s => s !== animal.status).map(s => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
            <button onClick={handleStatusChange} disabled={!statusForm}
              className="px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 disabled:opacity-50 text-sm font-medium">
              Update Status
            </button>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow p-6 flex flex-col items-center">
          {animal.profile_photo_path ? (
            <div className="mb-4">
              <img src={uploadService.getFileUrl(animal.profile_photo_path)} alt={animal.tag_number}
                className="w-48 h-48 object-cover rounded-lg border" />
            </div>
          ) : (
            <div className="mb-4 w-48 h-48 bg-gray-100 rounded-lg border flex items-center justify-center text-gray-400 text-sm">
              No photo
            </div>
          )}
          <FileUpload
            onUpload={(file) => uploadService.uploadAnimalPhoto(animal.id, file).then(() => fetchAnimal())}
            accept="image/jpeg,image/png,image/webp"
            label="Upload Photo"
            preview={false}
          />
          <div className="w-full border-t my-4" />
          <h3 className="text-sm font-medium text-gray-700 mb-4">QR Code</h3>
          <div className="bg-white p-4 rounded-lg border">
            <QRCode value={animal.tag_number} size={180} level="M" />
          </div>
          <p className="mt-3 text-xs text-gray-500 text-center font-mono break-all">{animal.tag_number}</p>
          <p className="mt-1 text-xs text-gray-400">Scan for animal profile</p>
        </div>
      </div>

      {editing && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-xl p-6 w-full max-w-lg mx-4 max-h-[80vh] overflow-y-auto">
            <h2 className="text-lg font-bold text-gray-800 mb-4">Edit Animal</h2>
            <form onSubmit={handleUpdate} className="space-y-3">
              {Object.entries(editForm).map(([key, val]) => (
                <div key={key}>
                  <label className="block text-xs font-medium text-gray-600 mb-1 capitalize">{key.replace('_', ' ')}</label>
                  {key === 'notes' ? (
                    <textarea value={val} onChange={(e) => setEditForm({ ...editForm, [key]: e.target.value })} rows={2} className="w-full px-3 py-2 border rounded-lg text-sm" />
                  ) : key === 'date_of_birth' ? (
                    <input type="date" value={val} onChange={(e) => setEditForm({ ...editForm, [key]: e.target.value })} className="w-full px-3 py-2 border rounded-lg text-sm" />
                  ) : key === 'breed' ? (
                    <>
                      <input value={val} onChange={(e) => setEditForm({ ...editForm, [key]: e.target.value })} list="breed-edit-list" className="w-full px-3 py-2 border rounded-lg text-sm" />
                      <datalist id="breed-edit-list">
                        {breeds.map(b => <option key={b} value={b} />)}
                      </datalist>
                    </>
                  ) : (
                    <input value={val} onChange={(e) => setEditForm({ ...editForm, [key]: e.target.value })} className="w-full px-3 py-2 border rounded-lg text-sm" />
                  )}
                </div>
              ))}
              <div className="flex gap-3 pt-2">
                <button type="submit" className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm font-medium">Save</button>
                <button type="button" onClick={() => setEditing(false)} className="px-4 py-2 border rounded-lg text-sm hover:bg-gray-50">Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
