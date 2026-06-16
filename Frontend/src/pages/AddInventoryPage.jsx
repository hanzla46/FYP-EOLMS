import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import inventoryService from '../services/inventoryService'

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
      setError('Item name and unit are required.')
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
      navigate('/inventory')
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to add item.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Add Inventory Item</h1>

      {error && <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">{error}</div>}

      <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow p-6 space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Item Name *</label>
            <input name="item_name" value={form.item_name} onChange={handleChange}
              placeholder="e.g. Ivermectin 1%" className="w-full px-3 py-2 border rounded-lg text-sm" required />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
            <select name="category" value={form.category} onChange={handleChange}
              className="w-full px-3 py-2 border rounded-lg text-sm">
              <option value="Medication">Medication</option>
              <option value="Feed">Feed</option>
              <option value="Equipment">Equipment</option>
              <option value="Cleaning">Cleaning</option>
              <option value="Other">Other</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Quantity</label>
            <input type="number" name="quantity" value={form.quantity} onChange={handleChange}
              step="0.01" min="0" className="w-full px-3 py-2 border rounded-lg text-sm" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Unit *</label>
            <input name="unit" value={form.unit} onChange={handleChange}
              placeholder="e.g. ml, kg, pcs" className="w-full px-3 py-2 border rounded-lg text-sm" required />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Reorder Threshold</label>
            <input type="number" name="reorder_threshold" value={form.reorder_threshold} onChange={handleChange}
              step="0.01" min="0" className="w-full px-3 py-2 border rounded-lg text-sm" />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Unit Price (PKR)</label>
            <input type="number" name="unit_price" value={form.unit_price} onChange={handleChange}
              step="0.01" min="0" placeholder="e.g. 250.00" className="w-full px-3 py-2 border rounded-lg text-sm" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Supplier</label>
            <input name="supplier" value={form.supplier} onChange={handleChange}
              placeholder="Supplier name" className="w-full px-3 py-2 border rounded-lg text-sm" />
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
            {loading ? 'Adding...' : 'Add Item'}
          </button>
          <button type="button" onClick={() => navigate('/inventory')}
            className="px-6 py-2.5 border rounded-lg text-sm font-medium hover:bg-gray-50">
            Cancel
          </button>
        </div>
      </form>
    </div>
  )
}
