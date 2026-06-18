import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import animalService from '../services/animalService'
import breedService from '../services/breedService'
import SearchableSelect from '../components/SearchableSelect'
import { Button } from '../components/ui/Button'
import { Input, Textarea } from '../components/ui/Input'
import { DatePicker } from '../components/ui/DatePicker'
import { Card, CardContent } from '../components/ui/Card'

const speciesOptions = [{id:'Cattle',label:'Cattle'},{id:'Sheep',label:'Sheep'},{id:'Goat',label:'Goat'}]
const genderOptions = [{id:'Female',label:'Female'},{id:'Male',label:'Male'}]

export default function AnimalRegisterPage() {
  const navigate = useNavigate()
  const [animals, setAnimals] = useState([])
  const [breeds, setBreeds] = useState([])
  const [form, setForm] = useState({
    species: 'Cattle', breed: '', gender: 'Female', date_of_birth: '',
    dam_id: null, sire_identity: '', rfid_tag: '', weight_kg: '', color: '', notes: ''
  })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    animalService.list({ limit: 200, gender: 'Female' }).then(res => setAnimals(res.data.data.map(a => ({ id: a.id, label: `${a.tag_number}`, sub: `${a.species} \u00B7 ${a.breed || 'Unknown'}` }))))
    breedService.list(form.species).then(res => setBreeds(res.data.data))
  }, [form.species])

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
      toast.success('Animal registered')
      navigate(`/animals/${res.data.id}`)
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to register animal.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-xl font-semibold text-ink-900 dark:text-ink-100 mb-4">Register New Animal</h1>

      {error && <div className="mb-4 p-3 bg-clay-100 dark:bg-clay-600/20 border border-clay-400/30 dark:border-clay-400/20 text-clay-600 dark:text-clay-400 rounded-sm text-sm">{error}</div>}

      <Card>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-3">
            <div className="grid grid-cols-2 gap-4">
              <SearchableSelect label="Species *" value={form.species} onChange={(v) => setForm({...form, species: v})} options={speciesOptions} required />
              <SearchableSelect label="Gender *" value={form.gender} onChange={(v) => setForm({...form, gender: v})} options={genderOptions} required />
            </div>

            <Input label="Breed" name="breed" value={form.breed} onChange={handleChange} placeholder="e.g. Holstein, Beetal" list="breed-list" />
            <datalist id="breed-list">{breeds.map(b => <option key={b} value={b} />)}</datalist>

            <div className="grid grid-cols-2 gap-4">
              <DatePicker label="Date of Birth" value={form.date_of_birth} onChange={handleChange} name="date_of_birth" />
              <Input label="Weight (kg)" type="number" name="weight_kg" value={form.weight_kg} onChange={handleChange} step="0.1" min="0" placeholder="e.g. 450" />
            </div>

            <Input label="RFID Tag" name="rfid_tag" value={form.rfid_tag} onChange={handleChange} placeholder="Leave blank for auto-generated tag" />
            <p className="!mt-0 text-xs text-slate2-400">Leave blank to auto-generate tag (e.g. LIV-26-XXXXX)</p>

            <div className="grid grid-cols-2 gap-4">
              <div>
                {animals.length > 0 ? (
                  <SearchableSelect label="Dam (Mother)" value={form.dam_id} onChange={(v) => setForm({ ...form, dam_id: v })} options={animals} placeholder="Search female animal..." />
                ) : (
                  <Input label="Dam (Mother) ID" type="number" value={form.dam_id || ''} onChange={(e) => setForm({ ...form, dam_id: e.target.value ? parseInt(e.target.value) : null })} placeholder="No females registered yet" />
                )}
              </div>
              <Input label="Sire Identity" name="sire_identity" value={form.sire_identity} onChange={handleChange} placeholder="Tag or external ID" />
            </div>

            <Input label="Color" name="color" value={form.color} onChange={handleChange} placeholder="e.g. Black and White" />

            <Textarea label="Notes" name="notes" value={form.notes} onChange={handleChange} rows={2} placeholder="Additional notes..." />

            <div className="flex gap-3 pt-2">
              <Button type="submit" disabled={loading}>
                {loading ? 'Registering...' : 'Register Animal'}
              </Button>
              <Button type="button" variant="ghost" onClick={() => navigate('/animals')}>Cancel</Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
