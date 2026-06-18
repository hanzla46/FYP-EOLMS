import { useState, useEffect } from 'react'
import { Plus } from 'lucide-react'
import { toast } from 'sonner'
import financeService from '../services/financeService'
import { Button } from '../components/ui/Button'
import { StatusPill } from '../components/ui/Badge'
import { StatCard } from '../components/ui/StatCard'
import { ChartWrapper } from '../components/ui/ChartWrapper'
import { DataTable } from '../components/ui/DataTable'
import { Card, CardContent } from '../components/ui/Card'
import { Input } from '../components/ui/Input'
import { DatePicker } from '../components/ui/DatePicker'
import { CardSkeleton } from '../components/ui/Skeleton'
import SearchableSelect from '../components/SearchableSelect'

const txnTypeOpts = [{id:'Expense',label:'Expense'},{id:'Income',label:'Income'}]
const txnCategoryOpts = [
  {id:'Feed',label:'Feed'},{id:'Medication',label:'Medication'},{id:'Breeding',label:'Breeding'},
  {id:'Equipment',label:'Equipment'},{id:'Labor',label:'Labor'},{id:'Sales',label:'Sales'},{id:'Other',label:'Other'},
]
const refEntityOpts = [{id:'',label:'None'},{id:'animal',label:'Animal'},{id:'inventory',label:'Inventory'}]

export default function FinancePage() {
  const [transactions, setTransactions] = useState([])
  const [summary, setSummary] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ transaction_date: new Date().toISOString().split('T')[0], transaction_type: 'Expense', category: 'Feed', amount: '', description: '', reference_entity_type: 'animal', reference_entity_id: '' })
  const [filters, setFilters] = useState({ date_from: '', date_to: '' })

  const fetchData = async (filtersOverride) => {
    setError('')
    setLoading(true)
    const f = filtersOverride || filters
    try {
      const params = { limit: 50 }
      if (f.date_from) params.date_from = f.date_from
      if (f.date_to) params.date_to = f.date_to
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

  useEffect(() => { fetchData() }, [])

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
      toast.success('Transaction recorded')
      fetchData()
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed.')
    }
  }

  const doughnutData = () => {
    if (!summary) return null
    const expenseData = summary.by_category.filter(c => c.total_raw > 0)
    return {
      labels: expenseData.map(c => c.category),
      datasets: [{
        data: expenseData.map(c => c.total_raw),
      }],
    }
  }

  const columns = [
    { key: 'transaction_date', label: 'Date', render: (val) => val?.split('T')[0] },
    {
      key: 'transaction_type', label: 'Type',
      render: (val) => <StatusPill status={val} />,
    },
    { key: 'category', label: 'Category' },
    { key: 'description', label: 'Description', render: (val) => val || '\u2014' },
    {
      key: 'amount', label: 'Amount',
      render: (val, row) => (
        <span className={`font-medium ledger-mono ${row.transaction_type === 'Income' ? 'text-pasture-600 dark:text-pasture-400' : 'text-clay-600 dark:text-clay-400'}`}>
          {row.transaction_type === 'Income' ? '+' : '-'}{val}
        </span>
      ),
    },
  ]

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-xl font-semibold text-ink-900 dark:text-ink-100">Finance</h1>
        <Button size="sm" onClick={() => setShowForm(!showForm)}><Plus className="w-4 h-4" /> Add Transaction</Button>
      </div>

      {error && <div className="mb-4 p-3 bg-clay-100 dark:bg-clay-600/20 border border-clay-400/30 dark:border-clay-400/20 text-clay-600 dark:text-clay-400 rounded-sm text-sm">{error}</div>}

      <div className="flex items-center gap-3 mb-4 flex-wrap">
        <DatePicker value={filters.date_from} onChange={(e) => setFilters({ ...filters, date_from: e.target.value })} className="w-40" />
        <DatePicker value={filters.date_to} onChange={(e) => setFilters({ ...filters, date_to: e.target.value })} className="w-40" />
        <Button size="sm" variant="secondary" onClick={() => fetchData(filters)}>Filter</Button>
        {(filters.date_from || filters.date_to) && (
          <Button variant="ghost" size="sm" onClick={() => { const cleared = { date_from: '', date_to: '' }; setFilters(cleared); fetchData(cleared) }}>Clear</Button>
        )}
      </div>

      {showForm && (
        <Card className="mb-4">
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-3">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <DatePicker label="Date *" value={form.transaction_date} onChange={(e) => setForm({ ...form, transaction_date: e.target.value })} />
                <SearchableSelect label="Type *" value={form.transaction_type} onChange={(v) => setForm({...form, transaction_type: v})} options={txnTypeOpts} />
                <SearchableSelect label="Category *" value={form.category} onChange={(v) => setForm({...form, category: v})} options={txnCategoryOpts} />
                <Input label="Amount (PKR) *" type="number" step="0.01" min="0.01" value={form.amount} onChange={(e) => setForm({ ...form, amount: e.target.value })} required />
              </div>
              <div className="grid grid-cols-3 gap-4">
                <Input label="Description" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
                <SearchableSelect label="Ref Entity" value={form.reference_entity_type} onChange={(v) => setForm({...form, reference_entity_type: v})} options={refEntityOpts} />
                <Input label="Ref ID" type="number" value={form.reference_entity_id} onChange={(e) => setForm({ ...form, reference_entity_id: e.target.value })} />
              </div>
              <div className="flex gap-3 pt-1">
                <Button type="submit" size="sm">Save</Button>
                <Button type="button" variant="ghost" size="sm" onClick={() => setShowForm(false)}>Cancel</Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {loading && !summary && (
        <div className="space-y-6">
          <div className="grid grid-cols-3 gap-4">
            {Array.from({ length: 3 }).map((_, i) => <CardSkeleton key={i} />)}
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white dark:bg-[#16201A] rounded-md border border-slate2-400/20 dark:border-slate2-600/20 p-4 animate-pulse" style={{ height: 280 }} />
            <div className="bg-white dark:bg-[#16201A] rounded-md border border-slate2-400/20 dark:border-slate2-600/20 p-4 animate-pulse" style={{ height: 280 }} />
          </div>
        </div>
      )}

      {!loading && !summary && (
        <Card>
          <CardContent className="text-center py-8">
            <p className="text-slate2-400 text-sm">{error || 'No financial data available.'}</p>
          </CardContent>
        </Card>
      )}

      {summary && (
        <>
          <div className="grid grid-cols-3 gap-4 mb-6">
            <StatCard title="Income" value={summary.income} variant="pasture" />
            <StatCard title="Expenses" value={summary.expenses} variant="clay" />
            <StatCard
              title="Net P&L"
              value={summary.net}
              variant={summary.net_raw >= 0 ? 'pasture' : 'clay'}
            />
          </div>

          {doughnutData() && doughnutData().datasets[0].data.length > 0 && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
              <ChartWrapper type="doughnut" data={doughnutData()} height={280} />
              <Card>
                <CardContent>
                  <h3 className="text-sm font-medium text-ink-900 dark:text-ink-100 mb-4">By Category</h3>
                  <div className="space-y-2">
                    {summary.by_category.map((c, i) => (
                      <div key={i} className="flex items-center justify-between text-sm">
                        <div className="flex items-center gap-2">
                          <span className="w-2.5 h-2.5 rounded-full inline-block" style={{ backgroundColor: ['#B23A2E', '#E2675A', '#C8862B', '#4CAE82', '#1F4D3A', '#6B7770', '#9AA79E'][i % 7] }} />
                          <span className="text-ink-900 dark:text-ink-100">{c.category}</span>
                        </div>
                        <span className={`font-medium ledger-mono ${c.transaction_type === 'Income' ? 'text-pasture-600 dark:text-pasture-400' : 'text-clay-600 dark:text-clay-400'}`}>
                          {c.transaction_type === 'Income' ? '+' : '-'}{c.total}
                        </span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          <DataTable
            columns={columns}
            data={transactions}
            loading={loading}
            emptyTitle="No transactions"
            emptyDescription="Record your first financial transaction."
            emptyAction={<Button size="sm" onClick={() => setShowForm(true)}><Plus className="w-4 h-4" /> Add Transaction</Button>}
          />
        </>
      )}
    </div>
  )
}
