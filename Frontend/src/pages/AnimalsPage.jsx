import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import animalService from '../services/animalService'

export default function AnimalsPage() {
  const [animals, setAnimals] = useState([])
  const [pagination, setPagination] = useState({ page: 1, limit: 20, total: 0, totalPages: 0 })
  const [filters, setFilters] = useState({ status: '', species: '', breed: '', gender: '', search: '' })
  const [loading, setLoading] = useState(true)

  const fetchAnimals = async (page = 1) => {
    setLoading(true)
    try {
      const params = { page, limit: 20, ...filters }
      Object.keys(params).forEach(k => { if (!params[k]) delete params[k] })
      const res = await animalService.list(params)
      setAnimals(res.data.data)
      setPagination(res.data.pagination)
    } catch (err) {
      console.error('Failed to fetch animals:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchAnimals(1) }, [])

  const handleFilter = (e) => {
    setFilters({ ...filters, [e.target.name]: e.target.value })
  }

  const handleSearch = (e) => {
    e.preventDefault()
    fetchAnimals(1)
  }

  const statusBadge = (status) => {
    const colors = {
      Active: 'bg-green-100 text-green-800',
      Quarantined: 'bg-yellow-100 text-yellow-800',
      Deceased: 'bg-red-100 text-red-800',
      Sold: 'bg-gray-100 text-gray-800',
      Pregnant: 'bg-purple-100 text-purple-800',
      Dry: 'bg-blue-100 text-blue-800',
    }
    return `px-2 py-0.5 rounded-full text-xs font-medium ${colors[status] || 'bg-gray-100 text-gray-800'}`
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Animals</h1>
        <Link to="/animals/register" className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm font-medium">
          + Register Animal
        </Link>
      </div>

      <form onSubmit={handleSearch} className="grid grid-cols-2 md:grid-cols-6 gap-3 mb-6">
        <input name="search" value={filters.search} onChange={handleFilter} placeholder="Search tag/breed/color..."
          className="px-3 py-2 border rounded-lg text-sm col-span-2" />
        <select name="species" value={filters.species} onChange={handleFilter}
          className="px-3 py-2 border rounded-lg text-sm">
          <option value="">All Species</option>
          <option value="Cattle">Cattle</option>
          <option value="Sheep">Sheep</option>
          <option value="Goat">Goat</option>
        </select>
        <select name="status" value={filters.status} onChange={handleFilter}
          className="px-3 py-2 border rounded-lg text-sm">
          <option value="">All Status</option>
          <option value="Active">Active</option>
          <option value="Quarantined">Quarantined</option>
          <option value="Pregnant">Pregnant</option>
          <option value="Dry">Dry</option>
          <option value="Deceased">Deceased</option>
          <option value="Sold">Sold</option>
        </select>
        <select name="gender" value={filters.gender} onChange={handleFilter}
          className="px-3 py-2 border rounded-lg text-sm">
          <option value="">All Gender</option>
          <option value="Male">Male</option>
          <option value="Female">Female</option>
        </select>
        <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-medium">
          Filter
        </button>
      </form>

      {loading ? (
        <div className="text-center py-12 text-gray-500">Loading...</div>
      ) : (
        <>
          <div className="bg-white rounded-xl shadow overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 text-gray-600">
                <tr>
                  <th className="px-4 py-3 text-left font-medium">Tag</th>
                  <th className="px-4 py-3 text-left font-medium">Species</th>
                  <th className="px-4 py-3 text-left font-medium">Breed</th>
                  <th className="px-4 py-3 text-left font-medium">Gender</th>
                  <th className="px-4 py-3 text-left font-medium">Status</th>
                  <th className="px-4 py-3 text-left font-medium">Weight</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {animals.map((a) => (
                  <tr key={a.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <Link to={`/animals/${a.id}`} className="text-blue-600 hover:underline font-medium">{a.tag_number}</Link>
                    </td>
                    <td className="px-4 py-3">{a.species}</td>
                    <td className="px-4 py-3">{a.breed || '—'}</td>
                    <td className="px-4 py-3">{a.gender}</td>
                    <td className="px-4 py-3"><span className={statusBadge(a.status)}>{a.status}</span></td>
                    <td className="px-4 py-3">{a.weight_kg ? `${a.weight_kg} kg` : '—'}</td>
                  </tr>
                ))}
                {animals.length === 0 && (
                  <tr><td colSpan="6" className="px-4 py-8 text-center text-gray-500">No animals found.</td></tr>
                )}
              </tbody>
            </table>
          </div>

          {pagination.totalPages > 1 && (
            <div className="flex items-center justify-between mt-4">
              <span className="text-sm text-gray-600">
                Showing {(pagination.page - 1) * pagination.limit + 1}–{Math.min(pagination.page * pagination.limit, pagination.total)} of {pagination.total}
              </span>
              <div className="flex gap-2">
                <button disabled={pagination.page <= 1} onClick={() => fetchAnimals(pagination.page - 1)}
                  className="px-3 py-1 border rounded text-sm disabled:opacity-50">Prev</button>
                <button disabled={pagination.page >= pagination.totalPages} onClick={() => fetchAnimals(pagination.page + 1)}
                  className="px-3 py-1 border rounded text-sm disabled:opacity-50">Next</button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  )
}
