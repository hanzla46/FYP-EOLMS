import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { ArrowLeft, AlertTriangle } from 'lucide-react'
import { toast } from 'sonner'
import inventoryService from '../services/inventoryService'
import { Button } from '../components/ui/Button'
import { Input } from '../components/ui/Input'
import { Card, CardContent } from '../components/ui/Card'
import { Dialog } from '../components/ui/Dialog'
import { Badge } from '../components/ui/Badge'

export default function InventoryDetailPage() {
  const { id } = useParams()
  const [item, setItem] = useState(null)
  const [usage, setUsage] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [stockAdjust, setStockAdjust] = useState({ adjustment: '', note: '' })
  const [adjustError, setAdjustError] = useState('')
  const [editing, setEditing] = useState(false)
  const [editForm, setEditForm] = useState({})

  const fetchItem = async () => {
    try {
      const res = await inventoryService.getById(id)
      setItem(res.data.data)
      setUsage(res.data.usage || [])
    } catch (err) {
      setError('Item not found.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchItem() }, [id])

  const handleStockAdjust = async (e) => {
    e.preventDefault()
    if (!stockAdjust.adjustment) return
    try {
      await inventoryService.adjustStock(id, parseFloat(stockAdjust.adjustment), stockAdjust.note)
      setStockAdjust({ adjustment: '', note: '' })
      toast.success('Stock adjusted')
      fetchItem()
    } catch (err) {
      toast.error(err.response?.data?.error || 'Stock adjustment failed.')
    }
  }

  const handleUpdate = async (e) => {
    e.preventDefault()
    try {
      const payload = {}
      Object.entries(editForm).forEach(([k, v]) => { if (v !== '') payload[k] = v })
      await inventoryService.update(id, payload)
      setEditing(false)
      toast.success('Item updated')
      fetchItem()
    } catch (err) {
      toast.error(err.response?.data?.error || 'Update failed.')
    }
  }

  const isLowStock = () => item && item.reorder_threshold > 0 && parseFloat(item.quantity) <= parseFloat(item.reorder_threshold)

  if (loading) return <div className="p-4 text-center text-slate2-400">Loading...</div>
  if (error && !item) return <div className="p-4 text-center text-clay-600 dark:text-clay-400">{error}</div>

  const categoryVariant = (cat) => {
    const map = { Medication: 'pending', Feed: 'success', Equipment: 'critical', Cleaning: 'neutral', Other: 'neutral' }
    return map[cat] || 'neutral'
  }

  return (
    <div className="max-w-4xl mx-auto">
      <Link to="/inventory" className="inline-flex items-center gap-1 text-sm text-slate2-400 hover:text-ink-900 dark:hover:text-ink-100 mb-4">
        <ArrowLeft className="w-3 h-3" /> Back to Inventory
      </Link>

      <Card>
        <CardContent>
          <div className="flex items-start justify-between mb-6">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <h1 className="text-xl font-semibold text-ink-900 dark:text-ink-100">{item.item_name}</h1>
                <Badge variant={categoryVariant(item.category)}>{item.category}</Badge>
              </div>
              {isLowStock() && (
                <span className="inline-flex items-center gap-1 text-xs text-clay-600 dark:text-clay-400 font-medium">
                  <AlertTriangle className="w-3 h-3" /> Low stock (threshold: {item.reorder_threshold})
                </span>
              )}
            </div>
            <div className="text-right">
              <div className={`text-3xl font-bold ledger-mono ${isLowStock() ? 'text-clay-600 dark:text-clay-400' : 'text-ink-900 dark:text-ink-100'}`}>
                {item.quantity} <span className="text-lg font-normal text-slate2-400">{item.unit}</span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <div><span className="text-xs text-slate2-400 block">Reorder Threshold</span><span className="font-medium text-ink-900 dark:text-ink-100">{item.reorder_threshold} {item.unit}</span></div>
            <div><span className="text-xs text-slate2-400 block">Unit Price</span><span className="font-medium text-ink-900 dark:text-ink-100">{item.unit_price ? `PKR ${parseFloat(item.unit_price).toLocaleString()}` : '\u2014'}</span></div>
            <div><span className="text-xs text-slate2-400 block">Supplier</span><span className="font-medium text-ink-900 dark:text-ink-100">{item.supplier || '\u2014'}</span></div>
            <div><span className="text-xs text-slate2-400 block">Last Updated</span><span className="font-medium text-ink-900 dark:text-ink-100">{new Date(item.updated_at).toLocaleDateString()}</span></div>
          </div>

          {item.notes && (
            <div className="border-t border-slate2-400/20 dark:border-slate2-600/20 pt-4 mb-4">
              <span className="text-xs text-slate2-400 block">Notes</span>
              <p className="text-sm text-ink-900 dark:text-ink-100 mt-1">{item.notes}</p>
            </div>
          )}

          <div className="border-t border-slate2-400/20 dark:border-slate2-600/20 pt-4 grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="text-sm font-medium text-ink-900 dark:text-ink-100 mb-3">Stock Adjustment</h3>
              {adjustError && <p className="text-sm text-clay-600 dark:text-clay-400 mb-2">{adjustError}</p>}
              <form onSubmit={handleStockAdjust} className="space-y-2">
                <div className="flex gap-2">
                  <Input type="number" step="0.01" placeholder="e.g. +10 or -5" value={stockAdjust.adjustment} onChange={(e) => setStockAdjust({ ...stockAdjust, adjustment: e.target.value })} className="flex-1" />
                  <Button type="submit" size="sm">Adjust</Button>
                </div>
                <Input placeholder="Audit note (reason for change)" value={stockAdjust.note} onChange={(e) => setStockAdjust({ ...stockAdjust, note: e.target.value })} />
              </form>
            </div>

            <div>
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-medium text-ink-900 dark:text-ink-100">Usage History</h3>
                <Button variant="ghost" size="sm" onClick={() => { setEditForm({ item_name: item.item_name, category: item.category, unit: item.unit, reorder_threshold: item.reorder_threshold, unit_price: item.unit_price || '', supplier: item.supplier || '', notes: item.notes || '' }); setEditing(true) }}>Edit Details</Button>
              </div>
              {usage.length > 0 ? (
                <div className="max-h-64 overflow-y-auto space-y-2">
                  {usage.map((u) => (
                    <div key={u.id} className="text-xs bg-mist-50 dark:bg-mist-900 rounded-sm p-2">
                      <div className="flex justify-between">
                        <span className="font-medium text-ink-900 dark:text-ink-100">{u.medication_given}</span>
                        <span className="text-slate2-400">{u.record_date?.split('T')[0]}</span>
                      </div>
                      <div className="text-slate2-400 mt-0.5">
                        {u.medication_quantity} {u.medication_unit} {'\u00B7'} Animal: {u.animal_tag} {'\u00B7'} Vet: {u.vet_name}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-slate2-400">No usage records yet.</p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      <Dialog open={editing} onClose={() => setEditing(false)} title="Edit Item">
        <form onSubmit={handleUpdate} className="space-y-3">
          {Object.entries(editForm).map(([key, val]) => (
            <Input key={key} label={key.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())} value={val} onChange={(e) => setEditForm({ ...editForm, [key]: e.target.value })} />
          ))}
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="ghost" size="sm" onClick={() => setEditing(false)}>Cancel</Button>
            <Button type="submit" size="sm">Save</Button>
          </div>
        </form>
      </Dialog>
    </div>
  )
}
