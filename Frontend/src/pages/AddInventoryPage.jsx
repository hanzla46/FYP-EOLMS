import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import inventoryService from '../services/inventoryService'
import SearchableSelect from '../components/SearchableSelect'
import { Button } from '../components/ui/Button'
import { Input, Textarea } from '../components/ui/Input'
import { Card, CardContent } from '../components/ui/Card'

const categoryOptions = [
  {id:'Medication',label:'Medication'},{id:'Feed',label:'Feed'},
  {id:'Equipment',label:'Equipment'},{id:'Cleaning',label:'Cleaning'},{id:'Other',label:'Other'},
]

export default function AddInventoryPage() {
  const navigate = useNavigate()
  const [form, setForm] = useState({
    item_name: '', category: 'Medication', quantity: '0', unit: '',
    reorder_threshold: '0', unit_price: '', supplier: '', notes: ''
  })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value })

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    if (!form.item_name || !form.unit) {
      toast.error('Item name and unit are required.')
      return
    }
    setLoading(true)
    try {
      const payload = {
        ...form,
        quantity: parseFloat(form.quantity) || 0,
        reorder_threshold: parseFloat(form.reorder_threshold) || 0,
        unit_price: form.unit_price ? parseFloat(form.unit_price) : null,
      }
      await inventoryService.addItem(payload)
      toast.success('Item added')
      navigate('/inventory')
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to add item.')
    } finally { setLoading(false) }
  }

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-xl font-semibold text-ink-900 dark:text-ink-100 mb-4">Add Inventory Item</h1>
      <Card>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-3">
            <div className="grid grid-cols-2 gap-4">
              <Input label="Item Name *" name="item_name" value={form.item_name} onChange={handleChange} placeholder="e.g. Ivermectin 1%" required />
              <SearchableSelect label="Category" value={form.category} onChange={(v) => setForm({...form, category: v})} options={categoryOptions} />
            </div>
            <div className="grid grid-cols-3 gap-4">
              <Input label="Quantity" type="number" name="quantity" value={form.quantity} onChange={handleChange} step="0.01" min="0" />
              <Input label="Unit *" name="unit" value={form.unit} onChange={handleChange} placeholder="e.g. ml, kg, pcs" required />
              <Input label="Reorder Threshold" type="number" name="reorder_threshold" value={form.reorder_threshold} onChange={handleChange} step="0.01" min="0" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <Input label="Unit Price (PKR)" type="number" name="unit_price" value={form.unit_price} onChange={handleChange} step="0.01" min="0" placeholder="e.g. 250.00" />
              <Input label="Supplier" name="supplier" value={form.supplier} onChange={handleChange} placeholder="Supplier name" />
            </div>
            <Textarea label="Notes" name="notes" value={form.notes} onChange={handleChange} rows={2} />
            <div className="flex gap-3 pt-2">
              <Button type="submit" disabled={loading}>{loading ? 'Adding...' : 'Add Item'}</Button>
              <Button type="button" variant="ghost" onClick={() => navigate('/inventory')}>Cancel</Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
