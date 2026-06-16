import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import healthService from '../services/healthService'
import inventoryService from '../services/inventoryService'
import userService from '../services/userService'
import animalService from '../services/animalService'
import uploadService from '../services/uploadService'
import SearchableSelect from '../components/SearchableSelect'
import FileUpload from '../components/FileUpload'

export default function NewHealthRecordPage() {
  const navigate = useNavigate()
  const [animals, setAnimals] = useState([])
  const [vets, setVets] = useState([])
  const [inventory, setInventory] = useState([])
  const [inventoryData, setInventoryData] = useState([])
  const [form, setForm] = useState({
    animal_id: null, vet_id: null, record_date: new Date().toISOString().split('T')[0],
    diagnosis: '', treatment: '', medication_given: '', medication_quantity: '',
    medication_unit: '', inventory_item_id: null, withdrawal_days: '0', notes: ''
  })
  const [selectedMedication, setSelectedMedication] = useState(null)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState('')
  const [createdRecordId, setCreatedRecordId] = useState(null)

  useEffect(() => {
    animalService.list({ limit: 200 }).then(res => setAnimals(res.data.data.map(a => ({ id: a.id, label: `${a.tag_number}`, sub: `${a.species} · ${a.breed || 'Unknown'} · ${a.gender}` }))))
    userService.list({ role: 'Vet' }).then(res => setVets(res.data.data.map(u => ({ id: u.id, label: u.full_name, sub: u.role }))))
    inventoryService.list({}).then(res => {
      const meds = res.data.data.filter(i => i.category === 'Medication')
      setInventoryData(meds)
      setInventory(meds.map(i => ({ id: i.id, label: i.item_name, sub: `${i.quantity} ${i.unit} in stock`, unit: i.unit })))
    })
  }, [])

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  const handleSelect = (field, value) => {
    setForm({ ...form, [field]: value })
    if (field === 'inventory_item_id' && value) {
      const opt = inventory.find(i => i.id === value)
      if (opt) {
        setSelectedMedication(opt)
        setForm(f => ({ ...f, medication_given: opt.label, medication_unit: opt.unit || '' }))
      }
    }
    if (field === 'inventory_item_id' && !value) {
      setSelectedMedication(null)
      setForm(f => ({ ...f, medication_given: '', medication_unit: '' }))
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setSuccess('')
    if (!form.animal_id || !form.vet_id || !form.record_date) {
      setError('Animal, Vet, and Record Date are required.')
      return
    }
    setLoading(true)
    try {
      const payload = {
        ...form,
        medication_quantity: form.medication_quantity ? parseFloat(form.medication_quantity) : 0,
        withdrawal_days: parseInt(form.withdrawal_days) || 0,
        inventory_item_id: form.inventory_item_id || null,
      }
      if (!payload.medication_given) delete payload.medication_given
      const res = await healthService.createRecord(payload)
      setSuccess('Health record created! You can now attach documents below.')
      setCreatedRecordId(res.data.id)
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to create record.')
    } finally { setLoading(false) }
  }

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">New Health Record</h1>
      {error && <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">{error}</div>}
      {success && <div className="mb-4 p-3 bg-green-50 border border-green-200 text-green-700 rounded-lg text-sm">{success}</div>}

      <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow p-6 space-y-4">
        <div className="grid grid-cols-3 gap-4">
          <div className="col-span-1">
            <SearchableSelect label="Animal" value={form.animal_id} onChange={(v) => handleSelect('animal_id', v)} options={animals} placeholder="Search animal tag..." required />
          </div>
          <div className="col-span-1">
            <SearchableSelect label="Vet" value={form.vet_id} onChange={(v) => handleSelect('vet_id', v)} options={vets} placeholder="Search vet..." required />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Date *</label>
            <input type="date" name="record_date" value={form.record_date} onChange={handleChange}
              className="w-full px-3 py-2 border rounded-lg text-sm" required />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Diagnosis</label>
          <input name="diagnosis" value={form.diagnosis} onChange={handleChange}
            placeholder="e.g. Mastitis" className="w-full px-3 py-2 border rounded-lg text-sm" />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Treatment</label>
          <textarea name="treatment" value={form.treatment} onChange={handleChange} rows={2}
            placeholder="Treatment administered..." className="w-full px-3 py-2 border rounded-lg text-sm" />
        </div>

        <div className="border-t pt-4">
          <h3 className="font-medium text-gray-700 mb-3">Medication</h3>
          <div className="space-y-3">
            <div>
              <SearchableSelect label="Inventory Item" value={form.inventory_item_id} onChange={(v) => handleSelect('inventory_item_id', v)} options={inventory} placeholder="Search medication to deduct stock..." />
              <p className="text-xs text-gray-400 mt-1">Selecting a medication will deduct stock when this record is saved.</p>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Medication Name</label>
                <input name="medication_given" value={form.medication_given} onChange={handleChange}
                  readOnly={!!form.inventory_item_id}
                  placeholder="e.g. Ivermectin" className={`w-full px-3 py-2 border rounded-lg text-sm ${form.inventory_item_id ? 'bg-gray-50 text-gray-600' : ''}`} />
                {form.inventory_item_id && <p className="text-xs text-gray-400 mt-1">Auto-filled from selected item.</p>}
              </div>
              <div className="flex gap-2">
                <div className="flex-1">
                  <label className="block text-xs font-medium text-gray-600 mb-1">Quantity *</label>
                  <input type="number" name="medication_quantity" value={form.medication_quantity} onChange={handleChange}
                    step="0.01" min="0" placeholder="e.g. 10"
                    className="w-full px-3 py-2 border rounded-lg text-sm" />
                </div>
                <div className="w-24">
                  <label className="block text-xs font-medium text-gray-600 mb-1">Unit</label>
                  <input name="medication_unit" value={form.medication_unit} onChange={handleChange}
                    readOnly={!!form.inventory_item_id}
                    placeholder="ml" className={`w-full px-3 py-2 border rounded-lg text-sm ${form.inventory_item_id ? 'bg-gray-50 text-gray-600' : ''}`} />
                </div>
              </div>
            </div>
            {selectedMedication && form.medication_quantity > 0 && (
              <div className={`p-3 rounded-lg text-sm ${parseFloat(form.medication_quantity) > parseFloat(selectedMedication.sub?.split(' ')[0] || 0) ? 'bg-red-50 text-red-700' : 'bg-blue-50 text-blue-700'}`}>
                {parseFloat(form.medication_quantity) > parseFloat(selectedMedication.sub?.split(' ')[0] || 0)
                  ? `Insufficient stock! Only ${selectedMedication.sub} available.`
                  : `Will deduct ${form.medication_quantity} ${form.medication_unit} from ${selectedMedication.label} (${selectedMedication.sub} available).`
                }
              </div>
            )}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <label className="block text-sm font-medium text-gray-700">Withdrawal Days</label>
              <span className="text-gray-400 cursor-help" title="Days the animal's products (milk/meat) cannot be sold after medication. Sets animal to Quarantined during this period.">&#9432;</span>
            </div>
            <input type="number" name="withdrawal_days" value={form.withdrawal_days} onChange={handleChange}
              min="0" placeholder="e.g. 7" className="w-full px-3 py-2 border rounded-lg text-sm" />
            {parseInt(form.withdrawal_days) > 0 && (
              <p className="text-xs text-amber-600 mt-1">
                Animal will be Quarantined for {form.withdrawal_days} days. Withdrawal ends: {
                  (() => { const d = new Date(form.record_date); d.setDate(d.getDate() + parseInt(form.withdrawal_days)); return d.toLocaleDateString() })()
                }
              </p>
            )}
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
            {loading ? 'Creating...' : 'Create Record'}
          </button>
          <button type="button" onClick={() => navigate('/health')}
            className="px-6 py-2.5 border rounded-lg text-sm font-medium hover:bg-gray-50">Cancel</button>
        </div>
      </form>

      {createdRecordId && (
        <div className="mt-6 bg-white rounded-xl shadow p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Attach Documents</h3>
          <div className="space-y-3">
            <FileUpload
              onUpload={(file) => uploadService.uploadHealthDocument(createdRecordId, file).then(() => setSuccess('Document uploaded!'))}
              accept="application/pdf,image/jpeg,image/png"
              label="Add Document (PDF/Image)"
              preview={true}
            />
            <p className="text-xs text-gray-400">Upload lab reports, prescriptions, or photos.</p>
          </div>
          <div className="mt-4 flex gap-3">
            <button onClick={() => navigate('/health')}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-medium">
              Done — Go to Records
            </button>
            <button onClick={() => setCreatedRecordId(null)}
              className="px-4 py-2 border rounded-lg text-sm hover:bg-gray-50">
              Skip
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
