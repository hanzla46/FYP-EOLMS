import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import inventoryService from '../services/inventoryService'

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
      fetchItem()
    } catch (err) {
      setAdjustError(err.response?.data?.error || 'Stock adjustment failed.')
    }
  }

  const handleUpdate = async (e) => {
    e.preventDefault()
    try {
      const payload = {}
      Object.entries(editForm).forEach(([k, v]) => { if (v !== '') payload[k] = v })
      await inventoryService.update(id, payload)
      setEditing(false)
      fetchItem()
    } catch (err) {
      setError(err.response?.data?.error || 'Update failed.')
    }
  }

  const isLowStock = () => item && item.reorder_threshold > 0 && parseFloat(item.quantity) <= parseFloat(item.reorder_threshold)

  if (loading) return <div className="p-6 text-center text-gray-500">Loading...</div>
  if (error && !item) return <div className="p-6 text-center text-red-600">{error}</div>

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <Link to="/inventory" className="text-blue-600 hover:underline text-sm">&larr; Back to Inventory</Link>

      <div className="mt-4 bg-white rounded-xl shadow p-6">
        <div className="flex items-start justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">{item.item_name}</h1>
            <p className="text-gray-500 text-sm">{item.category}</p>
          </div>
          <div className="text-right">
            <div className={`text-3xl font-bold ${isLowStock() ? 'text-red-600' : 'text-gray-800'}`}>
              {item.quantity} <span className="text-lg font-normal text-gray-500">{item.unit}</span>
            </div>
            {isLowStock() && (
              <span className="text-xs text-red-600 font-medium">Low stock (threshold: {item.reorder_threshold})</span>
            )}
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div><span className="text-xs text-gray-500 block">Reorder Threshold</span><span className="font-medium">{item.reorder_threshold} {item.unit}</span></div>
          <div><span className="text-xs text-gray-500 block">Unit Price</span><span className="font-medium">{item.unit_price ? `PKR ${parseFloat(item.unit_price).toLocaleString()}` : '—'}</span></div>
          <div><span className="text-xs text-gray-500 block">Supplier</span><span className="font-medium">{item.supplier || '—'}</span></div>
          <div><span className="text-xs text-gray-500 block">Last Updated</span><span className="font-medium">{new Date(item.updated_at).toLocaleDateString()}</span></div>
        </div>

        {item.notes && (
          <div className="border-t pt-4 mb-4">
            <span className="text-xs text-gray-500 block">Notes</span>
            <p className="text-sm text-gray-700">{item.notes}</p>
          </div>
        )}

        <div className="border-t pt-4 grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h3 className="font-medium text-gray-700 mb-3">Stock Adjustment</h3>
            {adjustError && <p className="text-sm text-red-600 mb-2">{adjustError}</p>}
            <form onSubmit={handleStockAdjust} className="space-y-2">
              <div className="flex gap-2">
                <input type="number" step="0.01" placeholder="e.g. +10 or -5"
                  value={stockAdjust.adjustment} onChange={(e) => setStockAdjust({ ...stockAdjust, adjustment: e.target.value })}
                  className="flex-1 px-3 py-2 border rounded-lg text-sm" />
                <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-medium">
                  Adjust
                </button>
              </div>
              <input placeholder="Audit note (reason for change)"
                value={stockAdjust.note} onChange={(e) => setStockAdjust({ ...stockAdjust, note: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg text-sm" />
            </form>
          </div>

          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-medium text-gray-700">Usage History</h3>
              <button onClick={() => { setEditForm({ item_name: item.item_name, category: item.category, unit: item.unit, reorder_threshold: item.reorder_threshold, unit_price: item.unit_price || '', supplier: item.supplier || '', notes: item.notes || '' }); setEditing(true) }}
                className="text-xs text-blue-600 hover:underline">Edit Details</button>
            </div>
            {usage.length > 0 ? (
              <div className="max-h-64 overflow-y-auto space-y-2">
                {usage.map((u) => (
                  <div key={u.id} className="text-xs bg-gray-50 rounded p-2">
                    <div className="flex justify-between">
                      <span className="font-medium">{u.medication_given}</span>
                      <span className="text-gray-500">{u.record_date?.split('T')[0]}</span>
                    </div>
                    <div className="text-gray-500">
                      {u.medication_quantity} {u.medication_unit} &middot; Animal: {u.animal_tag} &middot; Vet: {u.vet_name}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-gray-400">No usage records yet.</p>
            )}
          </div>
        </div>
      </div>

      {editing && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-xl p-6 w-full max-w-md mx-4">
            <h2 className="text-lg font-bold text-gray-800 mb-4">Edit Item</h2>
            <form onSubmit={handleUpdate} className="space-y-3">
              {Object.entries(editForm).map(([key, val]) => (
                <div key={key}>
                  <label className="block text-xs font-medium text-gray-600 mb-1 capitalize">{key.replace('_', ' ')}</label>
                  <input value={val} onChange={(e) => setEditForm({ ...editForm, [key]: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg text-sm" />
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
