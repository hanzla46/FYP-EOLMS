import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import inventoryService from '../services/inventoryService'

export default function InventoryPage() {
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('')
  const [search, setSearch] = useState('')

  const fetchItems = async () => {
    setLoading(true)
    try {
      const params = {}
      if (filter) params.category = filter
      if (search) params.search = search
      const res = await inventoryService.list(params)
      setItems(res.data.data)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchItems() }, [filter])

  const handleSearchSubmit = (e) => {
    e.preventDefault()
    fetchItems()
  }

  const isLowStock = (item) => item.reorder_threshold > 0 && parseFloat(item.quantity) <= parseFloat(item.reorder_threshold)

  const categoryBg = {
    Medication: 'bg-blue-100 text-blue-800',
    Feed: 'bg-green-100 text-green-800',
    Equipment: 'bg-purple-100 text-purple-800',
    Cleaning: 'bg-yellow-100 text-yellow-800',
    Other: 'bg-gray-100 text-gray-800',
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Inventory</h1>
        <Link to="/inventory/add" className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm font-medium">
          + Add Item
        </Link>
      </div>

      <form onSubmit={handleSearchSubmit} className="flex gap-3 mb-6">
        <input value={search} onChange={(e) => setSearch(e.target.value)}
          placeholder="Search item or supplier..." className="px-3 py-2 border rounded-lg text-sm flex-1" />
        <select value={filter} onChange={(e) => setFilter(e.target.value)}
          className="px-3 py-2 border rounded-lg text-sm">
          <option value="">All Categories</option>
          <option value="Medication">Medication</option>
          <option value="Feed">Feed</option>
          <option value="Equipment">Equipment</option>
          <option value="Cleaning">Cleaning</option>
          <option value="Other">Other</option>
        </select>
        <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-medium">
          Filter
        </button>
      </form>

      {loading ? (
        <div className="text-center py-12 text-gray-500">Loading...</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {items.map((item) => (
            <Link key={item.id} to={`/inventory/${item.id}`}
              className={`bg-white rounded-xl shadow p-5 hover:shadow-md transition border ${isLowStock(item) ? 'border-red-300' : 'border-transparent'}`}>
              <div className="flex items-start justify-between mb-3">
                <h3 className="font-semibold text-gray-800">{item.item_name}</h3>
                <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${categoryBg[item.category] || categoryBg.Other}`}>
                  {item.category}
                </span>
              </div>
              <div className="flex items-end justify-between">
                <div>
                  <span className={`text-2xl font-bold ${isLowStock(item) ? 'text-red-600' : 'text-gray-800'}`}>
                    {item.quantity}
                  </span>
                  <span className="text-sm text-gray-500 ml-1">{item.unit}</span>
                </div>
                {item.unit_price && (
                  <span className="text-sm text-gray-500">PKR {parseFloat(item.unit_price).toLocaleString()}/ea</span>
                )}
              </div>
              {isLowStock(item) && (
                <div className="mt-2 flex items-center gap-1 text-xs text-red-600">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                  Low stock (threshold: {item.reorder_threshold})
                </div>
              )}
              {item.supplier && <p className="text-xs text-gray-400 mt-2">{item.supplier}</p>}
            </Link>
          ))}
          {items.length === 0 && (
            <div className="col-span-full text-center py-12 text-gray-500">No inventory items found.</div>
          )}
        </div>
      )}
    </div>
  )
}
