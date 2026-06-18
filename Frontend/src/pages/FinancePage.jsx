import { useState, useEffect } from 'react'
import { Doughnut } from 'react-chartjs-2'
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js'
import financeService from '../services/financeService'

ChartJS.register(ArcElement, Tooltip, Legend)

export default function FinancePage() {
  const [transactions, setTransactions] = useState([])
  const [summary, setSummary] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ transaction_date: new Date().toISOString().split('T')[0], transaction_type: 'Expense', category: 'Feed', amount: '', description: '', reference_entity_type: 'animal', reference_entity_id: '' })
  const [filters, setFilters] = useState({ date_from: '', date_to: '' })

  const fetchData = async () => {
    setError('')
    try {
      const params = { limit: 50 }
      if (filters.date_from) params.date_from = filters.date_from
      if (filters.date_to) params.date_to = filters.date_to
      const [txnRes, sumRes] = await Promise.all([
        financeService.list(params),
        financeService.summary(params),
      ])
      setTransactions(txnRes.data.data)
      setSummary(sumRes.data.data)
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to load. Admin access required.')
    } finally { setLoading(false) }
  }

  useEffect(() => { fetchData() }, [filters])

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.amount || parseFloat(form.amount) <= 0) return
    try {
      await financeService.createTransaction({
        ...form,
        amount: parseFloat(form.amount),
        reference_entity_id: form.reference_entity_id ? parseInt(form.reference_entity_id) : null,
        reference_entity_type: form.reference_entity_type || null,
      })
      setForm({ transaction_date: new Date().toISOString().split('T')[0], transaction_type: 'Expense', category: 'Feed', amount: '', description: '', reference_entity_type: 'animal', reference_entity_id: '' })
      setShowForm(false)
      fetchData()
    } catch (err) {
      alert(err.response?.data?.error || 'Failed.')
    }
  }

  const doughnutData = () => {
    if (!summary) return null
    const expenseData = summary.by_category.filter(c => c.total_raw > 0)
    return {
      labels: expenseData.map(c => c.category),
      datasets: [{
        data: expenseData.map(c => c.total_raw),
        backgroundColor: ['#ef4444', '#f97316', '#eab308', '#22c55e', '#3b82f6', '#8b5cf6', '#ec4899'],
      }],
    }
  }

  if (loading) return <div className="p-6 text-center text-gray-500">Loading...</div>

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Finance (Admin)</h1>
        <button onClick={() => setShowForm(!showForm)}
          className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm font-medium">
          + Add Transaction
        </button>
      </div>

      {error && <div className="mb-4 p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">{error}</div>}

      <div className="flex items-center gap-3 mb-4 flex-wrap">
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">From</label>
          <input type="date" value={filters.date_from} onChange={(e) => setFilters({ ...filters, date_from: e.target.value })}
            className="px-3 py-2 border rounded-lg text-sm" />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">To</label>
          <input type="date" value={filters.date_to} onChange={(e) => setFilters({ ...filters, date_to: e.target.value })}
            className="px-3 py-2 border rounded-lg text-sm" />
        </div>
        <button onClick={() => fetchData()} className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-medium self-end">Filter</button>
        {(filters.date_from || filters.date_to) && (
          <button onClick={() => { setFilters({ date_from: '', date_to: '' }) }}
            className="px-3 py-2 text-sm text-gray-500 hover:underline self-end">Clear</button>
        )}
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow p-6 mb-6 space-y-3">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Date *</label>
              <input type="date" value={form.transaction_date} onChange={(e) => setForm({ ...form, transaction_date: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg text-sm" required />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Type *</label>
              <select value={form.transaction_type} onChange={(e) => setForm({ ...form, transaction_type: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg text-sm" required>
                <option value="Expense">Expense</option>
                <option value="Income">Income</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Category *</label>
              <select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg text-sm" required>
                <option value="Feed">Feed</option>
                <option value="Medication">Medication</option>
                <option value="Breeding">Breeding</option>
                <option value="Equipment">Equipment</option>
                <option value="Labor">Labor</option>
                <option value="Sales">Sales</option>
                <option value="Other">Other</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Amount (PKR) *</label>
              <input type="number" step="0.01" min="0.01" value={form.amount}
                onChange={(e) => setForm({ ...form, amount: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg text-sm" required />
            </div>
          </div>
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Description</label>
              <input value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg text-sm" />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Ref Entity</label>
              <select value={form.reference_entity_type} onChange={(e) => setForm({ ...form, reference_entity_type: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg text-sm">
                <option value="">None</option>
                <option value="animal">Animal</option>
                <option value="inventory">Inventory</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Ref ID</label>
              <input type="number" value={form.reference_entity_id} onChange={(e) => setForm({ ...form, reference_entity_id: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg text-sm" />
            </div>
          </div>
          <div className="flex gap-3 pt-1">
            <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-medium">Save</button>
            <button type="button" onClick={() => setShowForm(false)} className="px-4 py-2 border rounded-lg text-sm hover:bg-gray-50">Cancel</button>
          </div>
        </form>
      )}

      {summary && (
        <>
          <div className="grid grid-cols-3 gap-4 mb-6">
            <div className="bg-white rounded-xl shadow p-5">
              <p className="text-sm text-gray-500">Income</p>
              <p className="text-2xl font-bold text-green-600">{summary.income}</p>
            </div>
            <div className="bg-white rounded-xl shadow p-5">
              <p className="text-sm text-gray-500">Expenses</p>
              <p className="text-2xl font-bold text-red-600">{summary.expenses}</p>
            </div>
            <div className="bg-white rounded-xl shadow p-5">
              <p className="text-sm text-gray-500">Net P&L</p>
              <p className={`text-2xl font-bold ${summary.net_raw >= 0 ? 'text-green-600' : 'text-red-600'}`}>{summary.net}</p>
            </div>
          </div>

          {doughnutData() && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
              <div className="bg-white rounded-xl shadow p-6 flex flex-col items-center">
                <h3 className="font-medium text-gray-700 mb-4">Expenses by Category</h3>
                <div className="w-64">
                  <Doughnut data={doughnutData()} options={{ responsive: true }} />
                </div>
              </div>
              <div className="bg-white rounded-xl shadow p-6">
                <h3 className="font-medium text-gray-700 mb-4">By Category</h3>
                <div className="space-y-2">
                  {summary.by_category.map((c, i) => (
                    <div key={i} className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-2">
                        <span className="w-3 h-3 rounded-full inline-block" style={{ backgroundColor: ['#ef4444', '#f97316', '#eab308', '#22c55e', '#3b82f6', '#8b5cf6', '#ec4899'][i % 7] }}></span>
                        <span>{c.category}</span>
                      </div>
                      <span className={`font-medium ${c.transaction_type === 'Income' ? 'text-green-600' : 'text-red-600'}`}>
                        {c.transaction_type === 'Income' ? '+' : '-'}{c.total}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          <div className="bg-white rounded-xl shadow overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 text-gray-600">
                <tr>
                  <th className="px-4 py-3 text-left font-medium">Date</th>
                  <th className="px-4 py-3 text-left font-medium">Type</th>
                  <th className="px-4 py-3 text-left font-medium">Category</th>
                  <th className="px-4 py-3 text-left font-medium">Description</th>
                  <th className="px-4 py-3 text-right font-medium">Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {transactions.map((t) => (
                  <tr key={t.id}>
                    <td className="px-4 py-3">{t.transaction_date?.split('T')[0]}</td>
                    <td className="px-4 py-3"><span className={`px-2 py-0.5 rounded-full text-xs font-medium ${t.transaction_type === 'Income' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>{t.transaction_type}</span></td>
                    <td className="px-4 py-3">{t.category}</td>
                    <td className="px-4 py-3 text-gray-500 max-w-xs truncate">{t.description || '—'}</td>
                    <td className="px-4 py-3 text-right font-medium">{t.amount}</td>
                  </tr>
                ))}
                {transactions.length === 0 && <tr><td colSpan="5" className="px-4 py-8 text-center text-gray-500">No transactions.</td></tr>}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  )
}
