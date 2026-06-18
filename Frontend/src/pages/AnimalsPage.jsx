import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Plus } from 'lucide-react'
import animalService from '../services/animalService'
import { Button } from '../components/ui/Button'
import { StatusPill } from '../components/ui/Badge'
import { TagBadge } from '../components/ui/TagBadge'
import { DataTable } from '../components/ui/DataTable'
import { FilterBar } from '../components/ui/FilterBar'
import { SpeciesIcon } from '../components/icons/SpeciesIcons'

export default function AnimalsPage() {
  const [animals, setAnimals] = useState([])
  const [pagination, setPagination] = useState({ page: 1, limit: 20, total: 0, totalPages: 0 })
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [filters, setFilters] = useState({ species: '', status: '', gender: '' })
  const navigate = useNavigate()

  const fetchAnimals = async (page = 1) => {
    setLoading(true)
    try {
      const params = { page, limit: 20, search, ...filters }
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

  useEffect(() => { fetchAnimals(1) }, [search, filters])

  const columns = [
    {
      key: 'tag_number', label: 'Tag',
      render: (val, row) => (
        <div className="flex items-center gap-2">
          <SpeciesIcon species={row.species} />
          <TagBadge tag={val} species={row.species} to={`/animals/${row.id}`} />
        </div>
      ),
    },
    { key: 'species', label: 'Species' },
    { key: 'breed', label: 'Breed', render: (val) => val || '\u2014' },
    { key: 'gender', label: 'Gender' },
    {
      key: 'status', label: 'Status',
      render: (val) => <StatusPill status={val} />,
    },
    {
      key: 'weight_kg', label: 'Weight',
      render: (val) => val ? `${val} kg` : '\u2014',
    },
  ]

  const renderMobileCard = (a) => (
    <div className="flex items-center gap-3">
      <SpeciesIcon species={a.species} />
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <TagBadge tag={a.tag_number} species={a.species} to={`/animals/${a.id}`} />
          <StatusPill status={a.status} />
        </div>
        <p className="text-xs text-slate2-400 mt-1">{a.species} {a.breed ? `\u00B7 ${a.breed}` : ''} {a.gender} {a.weight_kg ? `\u00B7 ${a.weight_kg}kg` : ''}</p>
      </div>
    </div>
  )

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-xl font-semibold text-ink-900 dark:text-ink-100">Animals</h1>
        <Button size="sm" onClick={() => navigate('/animals/register')}>
          <Plus className="w-4 h-4" /> Register Animal
        </Button>
      </div>

      <FilterBar
        onSearch={setSearch}
        onFilter={setFilters}
        className="mb-4"
        filters={[
          { key: 'species', label: 'Species', options: [
            { value: 'Cattle', label: 'Cattle' },
            { value: 'Sheep', label: 'Sheep' },
            { value: 'Goat', label: 'Goat' },
          ]},
          { key: 'status', label: 'Status', options: [
            { value: 'Active', label: 'Active' },
            { value: 'Quarantined', label: 'Quarantined' },
            { value: 'Pregnant', label: 'Pregnant' },
            { value: 'Dry', label: 'Dry' },
            { value: 'Deceased', label: 'Deceased' },
            { value: 'Sold', label: 'Sold' },
          ]},
          { key: 'gender', label: 'Gender', options: [
            { value: 'Male', label: 'Male' },
            { value: 'Female', label: 'Female' },
          ]},
        ]}
      />

      <DataTable
        columns={columns}
        data={animals}
        loading={loading}
        emptyTitle="No animals found"
        emptyDescription="Register your first animal to get started."
        emptyAction={<Button size="sm" onClick={() => navigate('/animals/register')}><Plus className="w-4 h-4" /> Register Animal</Button>}
        pagination={pagination}
        onPageChange={fetchAnimals}
        renderMobileCard={renderMobileCard}
        onRowClick={(row) => navigate(`/animals/${row.id}`)}
      />
    </div>
  )
}
