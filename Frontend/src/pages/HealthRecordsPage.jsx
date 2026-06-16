import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import healthService from '../services/healthService'
import animalService from '../services/animalService'
import SearchableSelect from '../components/SearchableSelect'

export default function HealthRecordsPage() {
  const [records, setRecords] = useState([])
  const [animals, setAnimals] = useState([])
  const [pagination, setPagination] = useState({ page: 1, total: 0, totalPages: 0 })
  const [loading, setLoading] = useState(true)
  const [filters, setFilters] = useState({ animal_id: null, date_from: '', date_to: '' })

  const fetchRecords = async (page = 1) => {
    setLoading(true)
    try {
      const params = { page, limit: 20 }
      Object.entries(filters).forEach(([k, v]) => { if (v) params[k] = v })
      const res = await healthService.list(params)
      setRecords(res.data.data)
      setPagination(res.data.pagination)
    } catch (err) { console.error(err) }
    finally { setLoading(false) }
  }

  useEffect(() => { 
    fetchRecords()
    animalService.list({ limit: 200 }).then(res => setAnimals(res.data.data.map(a => ({ id: a.id, label: `${a.tag_number}`, sub: `${a.species} · ${a.breed || ''}` }))))
  }, [])

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Health Records</h1>
        <Link to="/health/new" className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm font-medium">
          + New Record
        </Link>
      </div>

      <div className="flex gap-3 mb-6 flex-wrap items-end">
        <div className="w-64">
          <SearchableSelect label="Animal" value={filters.animal_id} onChange={(v) => setFilters({ ...filters, animal_id: v })} options={animals} placeholder="All animals..." />
        </div>
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
        <button onClick={() => fetchRecords(1)} className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-medium">Filter</button>
      </div>

      {loading ? <div className="text-center py-12 text-gray-500">Loading...</div> : (
        <div className="bg-white rounded-xl shadow overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-gray-600">
              <tr>
                <th className="px-4 py-3 text-left font-medium">Date</th>
                <th className="px-4 py-3 text-left font-medium">Animal</th>
                <th className="px-4 py-3 text-left font-medium">Vet</th>
                <th className="px-4 py-3 text-left font-medium">Diagnosis / Vaccination</th>
                <th className="px-4 py-3 text-left font-medium">Medication</th>
                <th className="px-4 py-3 text-left font-medium">Withdrawal</th>
                <th className="px-4 py-3 text-center font-medium">Docs</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {records.map((r) => (
                <tr key={r.id}>
                  <td className="px-4 py-3">{r.record_date?.split('T')[0]}</td>
                  <td className="px-4 py-3"><Link to={`/animals/${r.animal_id}`} className="text-blue-600 hover:underline">{r.animal_tag}</Link></td>
                  <td className="px-4 py-3">{r.vet_name}</td>
                  <td className="px-4 py-3">{r.vaccination_schedule_name || r.diagnosis || '—'}</td>
                  <td className="px-4 py-3">{r.medication_given ? `${r.medication_given} — ${r.medication_quantity} ${r.medication_unit}` : '—'}</td>
                  <td className="px-4 py-3">{r.withdrawal_days > 0 ? `${r.withdrawal_days} days` : '—'}</td>
                  <td className="px-4 py-3 text-center">
                    {r.attachment_count > 0 ? (
                      <span className="inline-flex items-center gap-1 text-xs text-blue-600 font-medium">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" /></svg>
                        {r.attachment_count}
                      </span>
                    ) : '—'}
                  </td>
                </tr>
              ))}
              {records.length === 0 && <tr><td colSpan="7" className="px-4 py-8 text-center text-gray-500">No records found.</td></tr>}
            </tbody>
          </table>
        </div>
      )}

      {pagination.totalPages > 1 && (
        <div className="flex items-center justify-between mt-4">
          <span className="text-sm text-gray-600">Page {pagination.page} of {pagination.totalPages}</span>
          <div className="flex gap-2">
            <button disabled={pagination.page <= 1} onClick={() => fetchRecords(pagination.page - 1)}
              className="px-3 py-1 border rounded text-sm disabled:opacity-50">Prev</button>
            <button disabled={pagination.page >= pagination.totalPages} onClick={() => fetchRecords(pagination.page + 1)}
              className="px-3 py-1 border rounded text-sm disabled:opacity-50">Next</button>
          </div>
        </div>
      )}
    </div>
  )
}
