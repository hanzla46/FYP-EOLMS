import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import productionService from '../services/productionService'
import animalService from '../services/animalService'
import SearchableSelect from '../components/SearchableSelect'
import { Button } from '../components/ui/Button'
import { Input, Textarea } from '../components/ui/Input'
import { DatePicker } from '../components/ui/DatePicker'
import { Card, CardContent } from '../components/ui/Card'

const typeOptions = [{id:'Milk',label:'Milk'},{id:'Weight',label:'Weight'},{id:'Wool',label:'Wool'}]

export default function AddProductionPage() {
  const navigate = useNavigate()
  const [animals, setAnimals] = useState([])
  const [form, setForm] = useState({ animal_id: null, log_date: new Date().toISOString().split('T')[0], production_type: 'Milk', quantity: '', unit: 'L', notes: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    animalService.list({ limit: 200, status: 'Active' }).then(res => setAnimals(res.data.data.map(a => ({ id: a.id, label: `${a.tag_number}`, sub: `${a.species} \u00B7 ${a.breed || ''} \u00B7 ${a.gender}` }))))
  }, [])

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value })

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    if (!form.animal_id || !form.quantity) { toast.error('Animal and quantity are required.'); return }
    if (parseFloat(form.quantity) < 0) { toast.error('Quantity cannot be negative.'); return }
    setLoading(true)
    try {
      await productionService.log({ ...form, quantity: parseFloat(form.quantity) })
      toast.success('Production logged')
      navigate('/production')
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to log production.')
    } finally { setLoading(false) }
  }

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-xl font-semibold text-ink-900 dark:text-ink-100 mb-4">Log Production</h1>
      <Card>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-3">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <SearchableSelect label="Animal" value={form.animal_id} onChange={(v) => setForm({ ...form, animal_id: v })} options={animals} placeholder="Search animal..." required />
              </div>
              <DatePicker label="Date *" value={form.log_date} onChange={handleChange} name="log_date" />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <SearchableSelect label="Type" value={form.production_type} onChange={(v) => setForm({...form, production_type: v})} options={[{id:'Milk',label:'Milk'},{id:'Weight',label:'Weight'},{id:'Wool',label:'Wool'}]} />
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
              <Button type="submit" disabled={loading}>{loading ? 'Saving...' : 'Log Production'}</Button>
              <Button type="button" variant="ghost" onClick={() => navigate('/production')}>Cancel</Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
