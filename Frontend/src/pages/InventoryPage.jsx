import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Plus, AlertTriangle, Package } from 'lucide-react'
import { toast } from 'sonner'
import inventoryService from '../services/inventoryService'
import { Button } from '../components/ui/Button'
import { Badge } from '../components/ui/Badge'
import { FilterBar } from '../components/ui/FilterBar'
import { EmptyState } from '../components/ui/EmptyState'
import { CardSkeleton } from '../components/ui/Skeleton'
import { Drawer } from '../components/ui/Drawer'
import { Input, Textarea } from '../components/ui/Input'
import SearchableSelect from '../components/SearchableSelect'

const categoryOptions = [
  {id:'Medication',label:'Medication'},{id:'Feed',label:'Feed'},
  {id:'Equipment',label:'Equipment'},{id:'Cleaning',label:'Cleaning'},{id:'Other',label:'Other'},
]

export default function InventoryPage() {
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [filters, setFilters] = useState({ category: '' })
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [form, setForm] = useState({
    item_name: '', category: 'Medication', quantity: '0', unit: '',
    reorder_threshold: '0', unit_price: '', supplier: '', notes: ''
  })
  const [saving, setSaving] = useState(false)

  const fetchItems = async () => {
    setLoading(true)
    try {
      const params = {}
      if (filters.category) params.category = filters.category
      if (search) params.search = search
      const res = await inventoryService.list(params)
      setItems(res.data.data)
    } catch (err) { console.error(err) }
    finally { setLoading(false) }
  }

  useEffect(() => { fetchItems() }, [search, filters])

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value })

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.item_name || !form.unit) {
      toast.error('Item name and unit are required.')
      return
    }
    setSaving(true)
    try {
      const payload = {
        ...form,
        quantity: parseFloat(form.quantity) || 0,
        reorder_threshold: parseFloat(form.reorder_threshold) || 0,
        unit_price: form.unit_price ? parseFloat(form.unit_price) : null,
      }
      await inventoryService.addItem(payload)
      toast.success('Item added')
      setForm({ item_name: '', category: 'Medication', quantity: '0', unit: '', reorder_threshold: '0', unit_price: '', supplier: '', notes: '' })
      setDrawerOpen(false)
      fetchItems()
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to add item.')
    } finally { setSaving(false) }
  }

  const isLowStock = (item) => item.reorder_threshold > 0 && parseFloat(item.quantity) <= parseFloat(item.reorder_threshold)

  const categoryVariant = (cat) => {
    const map = { Medication: 'pending', Feed: 'success', Equipment: 'critical', Cleaning: 'neutral', Other: 'neutral' }
    return map[cat] || 'neutral'
  }

  if (loading) {
    return (
      <div>
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-xl font-semibold text-ink-900 dark:text-ink-100">Inventory</h1>
          <Button size="sm"><Plus className="w-4 h-4" /> Add Item</Button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => <CardSkeleton key={i} />)}
        </div>
      </div>
    )
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-xl font-semibold text-ink-900 dark:text-ink-100">Inventory</h1>
        <Button size="sm" onClick={() => setDrawerOpen(true)}><Plus className="w-4 h-4" /> Add Item</Button>
      </div>

      <FilterBar
        onSearch={setSearch}
        onFilter={setFilters}
        className="mb-4"
        filters={[
          { key: 'category', label: 'Category', options: [
            { value: 'Medication', label: 'Medication' },
            { value: 'Feed', label: 'Feed' },
            { value: 'Equipment', label: 'Equipment' },
            { value: 'Cleaning', label: 'Cleaning' },
            { value: 'Other', label: 'Other' },
          ]},
        ]}
      />

      {items.length === 0 ? (
        <EmptyState
          icon={Package}
          title="No inventory items"
          description="Add your first item to start tracking stock."
          action={<Button size="sm" onClick={() => setDrawerOpen(true)}><Plus className="w-4 h-4" /> Add Item</Button>}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {items.map((item) => {
            const low = isLowStock(item)
            return (
              <Link
                key={item.id}
                to={`/inventory/${item.id}`}
                className={`bg-white dark:bg-[#16201A] rounded-md border p-4 hover:border-pasture-400/40 dark:hover:border-pasture-400/40 transition-colors ${low ? 'border-clay-400/40 dark:border-clay-400/30' : 'border-slate2-400/20 dark:border-slate2-600/20'}`}
              >
                <div className="flex items-start justify-between mb-3">
                  <h3 className="font-medium text-ink-900 dark:text-ink-100 truncate">{item.item_name}</h3>
                  <Badge variant={categoryVariant(item.category)}>{item.category}</Badge>
                </div>
                <div className="flex items-end justify-between">
                  <div>
                    <span className={`text-2xl font-semibold ledger-mono ${low ? 'text-clay-600 dark:text-clay-400' : 'text-ink-900 dark:text-ink-100'}`}>
                      {item.quantity}
                    </span>
                    <span className="text-sm text-slate2-400 ml-1">{item.unit}</span>
                  </div>
                  {item.unit_price && (
                    <span className="text-sm text-slate2-400">PKR {parseFloat(item.unit_price).toLocaleString()}/ea</span>
                  )}
                </div>
                {low && (
                  <div className="mt-2 flex items-center gap-1 text-xs text-clay-600 dark:text-clay-400">
                    <AlertTriangle className="w-3 h-3" />
                    Low stock (threshold: {item.reorder_threshold})
                  </div>
                )}
                {item.supplier && <p className="text-xs text-slate2-400 mt-2">{item.supplier}</p>}
              </Link>
            )
          })}
        </div>
      )}

      <Drawer open={drawerOpen} onClose={() => setDrawerOpen(false)} title="Add Inventory Item">
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
            <Button type="submit" disabled={saving}>{saving ? 'Adding...' : 'Add Item'}</Button>
            <Button type="button" variant="ghost" onClick={() => setDrawerOpen(false)}>Cancel</Button>
          </div>
        </form>
      </Drawer>
    </div>
  )
}
