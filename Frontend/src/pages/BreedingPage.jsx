import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import breedingService from '../services/breedingService'
import animalService from '../services/animalService'
import SearchableSelect from '../components/SearchableSelect'

export default function BreedingPage() {
  const [records, setRecords] = useState([])
  const [animals, setAnimals] = useState([])
  const [pagination, setPagination] = useState({ page: 1, total: 0, totalPages: 0 })
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ dam_id: null, sire_identity: '', insemination_date: new Date().toISOString().split('T')[0], insemination_type: 'Natural', notes: '' })
  const [formError, setFormError] = useState('')

  useEffect(() => {
    animalService.list({ limit: 200, gender: 'Female' }).then(res => setAnimals(res.data.data.map(a => ({ id: a.id, label: `${a.tag_number}`, sub: `${a.species} · ${a.breed || ''}` }))))
  }, [])

  const fetchRecords = async (page = 1) => {
    setLoading(true)
    try {
      const res = await breedingService.list({ page, limit: 20 })
      setRecords(res.data.data)
      setPagination(res.data.pagination)
    } catch (err) { console.error(err) }
    finally { setLoading(false) }
  }

  useEffect(() => { fetchRecords() }, [])

  const handleInsemination = async (e) => {
    e.preventDefault()
    setFormError('')
    if (!form.dam_id || !form.sire_identity || !form.insemination_date) {
      setFormError('Dam, sire identity, and date are required.')
      return
    }
    try {
      await breedingService.logInsemination({ ...form })
      setForm({ dam_id: null, sire_identity: '', insemination_date: new Date().toISOString().split('T')[0], insemination_type: 'Natural', notes: '' })
      setShowForm(false)
      fetchRecords()
    } catch (err) {
      setFormError(err.response?.data?.error || 'Failed to log insemination.')
    }
  }

  const handlePregnancyCheck = async (recordId) => {
    try {
      await breedingService.pregnancyCheck(recordId, { pregnancy_confirmed: true, pregnancy_check_date: new Date().toISOString().split('T')[0] })
      fetchRecords()
    } catch (err) {
      alert(err.response?.data?.error || 'Failed.')
    }
  }

  const getStatusBadge = (r) => {
    if (r.pregnancy_confirmed && r.actual_calving_date) return <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">Calved ({r.offspring_count})</span>
    if (r.pregnancy_confirmed) return <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">Pregnant</span>
    if (r.pregnancy_check_date && !r.pregnancy_confirmed) return <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">Not Pregnant</span>
    return <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">Pending Check</span>
  }

  const today = new Date().toISOString().split('T')[0]

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Breeding Records</h1>
        <button onClick={() => setShowForm(!showForm)}
          className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm font-medium">
          + Log Insemination
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleInsemination} className="bg-white rounded-xl shadow p-6 mb-6 space-y-3">
          {formError && <p className="text-sm text-red-600">{formError}</p>}
          <div className="grid grid-cols-3 gap-4">
            <div>
              <SearchableSelect label="Dam (Female)" value={form.dam_id} onChange={(v) => setForm({ ...form, dam_id: v })} options={animals} placeholder="Search female..." />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Sire Identity *</label>
              <input value={form.sire_identity} onChange={(e) => setForm({ ...form, sire_identity: e.target.value })}
                placeholder="Tag or external ID" className="w-full px-3 py-2 border rounded-lg text-sm" />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Date *</label>
              <input type="date" value={form.insemination_date} onChange={(e) => setForm({ ...form, insemination_date: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg text-sm" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Type</label>
              <select value={form.insemination_type} onChange={(e) => setForm({ ...form, insemination_type: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg text-sm">
                <option value="Natural">Natural</option>
                <option value="AI">AI</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Notes</label>
              <input value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg text-sm" />
            </div>
          </div>
          <div className="flex gap-3 pt-1">
            <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-medium">Save</button>
            <button type="button" onClick={() => setShowForm(false)} className="px-4 py-2 border rounded-lg text-sm hover:bg-gray-50">Cancel</button>
          </div>
        </form>
      )}

      {loading ? <div className="text-center py-12 text-gray-500">Loading...</div> : (
        <div className="bg-white rounded-xl shadow overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-gray-600">
              <tr>
                <th className="px-4 py-3 text-left font-medium">Dam</th>
                <th className="px-4 py-3 text-left font-medium">Sire</th>
                <th className="px-4 py-3 text-left font-medium">Insemination</th>
                <th className="px-4 py-3 text-left font-medium">Type</th>
                <th className="px-4 py-3 text-left font-medium">Status</th>
                <th className="px-4 py-3 text-left font-medium">Expected Calving</th>
                <th className="px-4 py-3 text-left font-medium">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {records.map((r) => (
                <tr key={r.id} className={r.estimated_calving_date && r.estimated_calving_date <= today && !r.actual_calving_date ? 'bg-yellow-50' : ''}>
                  <td className="px-4 py-3">
                    <Link to={`/animals/${r.dam_id}`} className="text-blue-600 hover:underline font-medium">{r.dam_tag}</Link>
                    <span className="text-gray-400 text-xs ml-1">({r.dam_species})</span>
                  </td>
                  <td className="px-4 py-3 font-mono text-xs">{r.sire_identity}</td>
                  <td className="px-4 py-3">{r.insemination_date?.split('T')[0]}</td>
                  <td className="px-4 py-3">{r.insemination_type}</td>
                  <td className="px-4 py-3">{getStatusBadge(r)}</td>
                  <td className="px-4 py-3">
                    {r.estimated_calving_date ? (
                      <span className={r.estimated_calving_date <= today ? 'text-orange-600 font-medium' : ''}>
                        {r.estimated_calving_date.split('T')[0]}
                        {r.estimated_calving_date <= today && !r.actual_calving_date && ' (Due!)'}
                      </span>
                    ) : '—'}
                  </td>
                  <td className="px-4 py-3">
                    {!r.pregnancy_confirmed && !r.actual_calving_date && (
                      <button onClick={() => handlePregnancyCheck(r.id)}
                        className="text-xs px-3 py-1 bg-purple-600 text-white rounded hover:bg-purple-700">
                        Confirm Pregnant
                      </button>
                    )}
                  </td>
                </tr>
              ))}
              {records.length === 0 && <tr><td colSpan="7" className="px-4 py-8 text-center text-gray-500">No breeding records.</td></tr>}
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
