import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import healthService from '../services/healthService'
import inventoryService from '../services/inventoryService'
import userService from '../services/userService'
import animalService from '../services/animalService'
import uploadService from '../services/uploadService'
import vaccinationService from '../services/vaccinationService'
import SearchableSelect from '../components/SearchableSelect'
import FileUpload from '../components/FileUpload'
import { toast } from 'sonner'
import { Button } from '../components/ui/Button'
import { Input, Textarea } from '../components/ui/Input'
import { DatePicker } from '../components/ui/DatePicker'
import { Card, CardContent } from '../components/ui/Card'

export default function NewHealthRecordPage() {
  const navigate = useNavigate()
  const [animals, setAnimals] = useState([])
  const [vets, setVets] = useState([])
  const [inventory, setInventory] = useState([])
  const [vaccinationSchedules, setVaccinationSchedules] = useState([])
  const [form, setForm] = useState({
    animal_id: null, vet_id: null, record_date: new Date().toISOString().split('T')[0],
    diagnosis: '', treatment: '', medication_given: '', medication_quantity: '',
    medication_unit: '', inventory_item_id: null, vaccination_schedule_id: null, withdrawal_days: '0', notes: ''
  })
  const [selectedMedication, setSelectedMedication] = useState(null)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState('')
  const [createdRecordId, setCreatedRecordId] = useState(null)

  useEffect(() => {
    animalService.list({ limit: 200 }).then(res => setAnimals(res.data.data.map(a => ({ id: a.id, label: `${a.tag_number}`, sub: `${a.species} \u00B7 ${a.breed || 'Unknown'} \u00B7 ${a.gender}` }))))
    userService.list({ role: 'Vet' }).then(res => setVets(res.data.data.map(u => ({ id: u.id, label: u.full_name, sub: u.role }))))
    inventoryService.list({}).then(res => {
      const meds = res.data.data.filter(i => i.category === 'Medication')
      setInventoryData(meds)
      setInventory(meds.map(i => ({ id: i.id, label: i.item_name, sub: `${i.quantity} ${i.unit} in stock`, unit: i.unit })))
    })
    vaccinationService.list({}).then(res => {
      setVaccinationSchedules(res.data.data.map(v => ({
        id: v.id, label: v.vaccine_name,
        sub: `${v.target_species} \u00B7 ${v.inventory_item_id ? `${v.inventory_stock} ${v.inventory_unit} in stock` : 'No stock linked'}`,
        inventory_item_id: v.inventory_item_id,
        inventory_item_name: v.inventory_item_name,
      })))
    })
  }, [])

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  const handleSelect = (field, value) => {
    if (field === 'vaccination_schedule_id' && value) {
      const schedule = vaccinationSchedules.find(s => s.id === value)
      if (schedule && schedule.inventory_item_id) {
        const opt = inventory.find(i => i.id === schedule.inventory_item_id)
        setSelectedMedication(opt || null)
        setForm(f => ({
          ...f,
          vaccination_schedule_id: value,
          inventory_item_id: schedule.inventory_item_id,
          medication_given: opt ? opt.label : '',
          medication_unit: opt ? (opt.unit || '') : '',
        }))
        return
      }
      setForm(f => ({ ...f, vaccination_schedule_id: value }))
      return
    }
    if (field === 'inventory_item_id' && value) {
      const opt = inventory.find(i => i.id === value)
      if (opt) {
        setSelectedMedication(opt)
        setForm(f => ({ ...f, inventory_item_id: value, medication_given: opt.label, medication_unit: opt.unit || '' }))
        return
      }
    }
    if (field === 'inventory_item_id' && !value) {
      setSelectedMedication(null)
      setForm(f => ({ ...f, inventory_item_id: null, medication_given: '', medication_unit: '' }))
      return
    }
    setForm(f => ({ ...f, [field]: value }))
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
      toast.success('Health record created')
      setCreatedRecordId(res.data.id)
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to create record.')
    } finally { setLoading(false) }
  }

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-xl font-semibold text-ink-900 dark:text-ink-100 mb-4">New Health Record</h1>
      {error && <div className="mb-4 p-3 bg-clay-100 dark:bg-clay-600/20 border border-clay-400/30 dark:border-clay-400/20 text-clay-600 dark:text-clay-400 rounded-sm text-sm">{error}</div>}
      {success && <div className="mb-4 p-3 bg-pasture-100 dark:bg-pasture-600/20 border border-pasture-400/30 dark:border-pasture-400/20 text-pasture-600 dark:text-pasture-400 rounded-sm text-sm">{success}</div>}

      <Card>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-3">
            <div className="grid grid-cols-3 gap-4">
              <div className="col-span-1">
                <SearchableSelect label="Animal" value={form.animal_id} onChange={(v) => handleSelect('animal_id', v)} options={animals} placeholder="Search animal tag..." required />
              </div>
              <div className="col-span-1">
                <SearchableSelect label="Vet" value={form.vet_id} onChange={(v) => handleSelect('vet_id', v)} options={vets} placeholder="Search vet..." required />
              </div>
              <div>
                <DatePicker label="Date *" value={form.record_date} onChange={handleChange} name="record_date" />
              </div>
            </div>

            <Input label="Diagnosis" name="diagnosis" value={form.diagnosis} onChange={handleChange} placeholder="e.g. Mastitis" />

            <Textarea label="Treatment" name="treatment" value={form.treatment} onChange={handleChange} rows={2} placeholder="Treatment administered..." />

            <div className="border-t border-slate2-400/20 dark:border-slate2-600/20 pt-4">
              <h3 className="text-sm font-medium text-ink-900 dark:text-ink-100 mb-3">Vaccination (optional)</h3>
              <SearchableSelect label="Vaccination Schedule" value={form.vaccination_schedule_id} onChange={(v) => handleSelect('vaccination_schedule_id', v)} options={vaccinationSchedules} placeholder="Select vaccination given..." />
              <p className="text-xs text-slate2-400 mt-1">Selecting a vaccination schedule will auto-fill the linked medication below.</p>
            </div>

            <div className="border-t border-slate2-400/20 dark:border-slate2-600/20 pt-4">
              <h3 className="text-sm font-medium text-ink-900 dark:text-ink-100 mb-3">Medication</h3>
              <div className="space-y-3">
                <div>
                  <SearchableSelect label="Inventory Item" value={form.inventory_item_id} onChange={(v) => handleSelect('inventory_item_id', v)} options={inventory} placeholder="Search medication to deduct stock..." />
                  <p className="text-xs text-slate2-400 mt-1">Selecting a medication will deduct stock when this record is saved.</p>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Input label="Medication Name" name="medication_given" value={form.medication_given} onChange={handleChange}
                      readOnly={!!form.inventory_item_id}
                      placeholder="e.g. Ivermectin"
                      className={form.inventory_item_id ? 'opacity-60' : ''} />
                    {form.inventory_item_id && <p className="text-xs text-slate2-400 mt-1">Auto-filled from selected item.</p>}
                  </div>
                  <div className="flex gap-2">
                    <div className="flex-1">
                      <Input label="Quantity *" type="number" name="medication_quantity" value={form.medication_quantity} onChange={handleChange} step="0.01" min="0" placeholder="e.g. 10" />
                    </div>
                    <div className="w-24">
                      <Input label="Unit" name="medication_unit" value={form.medication_unit} onChange={handleChange}
                        readOnly={!!form.inventory_item_id}
                        className={form.inventory_item_id ? 'opacity-60' : ''}
                        placeholder="ml" />
                    </div>
                  </div>
                </div>
                {selectedMedication && form.medication_quantity > 0 && (
                  <div className={`p-3 rounded-sm text-sm ${parseFloat(form.medication_quantity) > parseFloat(selectedMedication.sub?.split(' ')[0] || 0) ? 'bg-clay-100 dark:bg-clay-600/20 text-clay-600 dark:text-clay-400 border border-clay-400/30' : 'bg-pasture-100 dark:bg-pasture-600/20 text-pasture-600 dark:text-pasture-400 border border-pasture-400/30'}`}>
                    {parseFloat(form.medication_quantity) > parseFloat(selectedMedication.sub?.split(' ')[0] || 0)
                      ? `Insufficient stock! Only ${selectedMedication.sub} available.`
                      : `Will deduct ${form.medication_quantity} ${form.medication_unit} from ${selectedMedication.label} (${selectedMedication.sub} available).`
                    }
                  </div>
                )}
              </div>
            </div>

            <div>
              <div className="flex items-center gap-2 mb-1">
                <label className="text-sm font-medium text-ink-900 dark:text-ink-100">Withdrawal Days</label>
              </div>
              <Input type="number" name="withdrawal_days" value={form.withdrawal_days} onChange={handleChange} min="0" placeholder="e.g. 7" />
              {parseInt(form.withdrawal_days) > 0 && (
                <p className="text-xs text-wheat-500 dark:text-wheat-400 mt-1">
                  Animal will be Quarantined for {form.withdrawal_days} days. Withdrawal ends: {
                    (() => { const d = new Date(form.record_date); d.setDate(d.getDate() + parseInt(form.withdrawal_days)); return d.toLocaleDateString() })()
                  }
                </p>
              )}
            </div>

            <Textarea label="Notes" name="notes" value={form.notes} onChange={handleChange} rows={2} />

            <div className="flex gap-3 pt-2">
              <Button type="submit" disabled={loading}>
                {loading ? 'Creating...' : 'Create Record'}
              </Button>
              <Button type="button" variant="ghost" onClick={() => navigate('/health')}>Cancel</Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {createdRecordId && (
        <Card className="mt-6">
          <CardContent>
            <h3 className="text-base font-semibold text-ink-900 dark:text-ink-100 mb-4">Attach Documents</h3>
            <div className="space-y-3">
              <FileUpload
                  onUpload={(file) => uploadService.uploadHealthDocument(createdRecordId, file).then(() => toast.success('Document uploaded'))}
                accept="application/pdf,image/jpeg,image/png"
                label="Add Document (PDF/Image)"
                preview={true}
              />
              <p className="text-xs text-slate2-400">Upload lab reports, prescriptions, or photos.</p>
            </div>
            <div className="mt-4 flex gap-3">
              <Button onClick={() => navigate('/health')}>Done — Go to Records</Button>
              <Button variant="ghost" onClick={() => setCreatedRecordId(null)}>Skip</Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
