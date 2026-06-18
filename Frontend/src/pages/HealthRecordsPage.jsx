import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Plus, Paperclip } from 'lucide-react'
import healthService from '../services/healthService'
import animalService from '../services/animalService'
import SearchableSelect from '../components/SearchableSelect'
import { Button } from '../components/ui/Button'
import { TagBadge } from '../components/ui/TagBadge'
import { DataTable } from '../components/ui/DataTable'
import { StatusPill } from '../components/ui/Badge'
import { DatePicker } from '../components/ui/DatePicker'

export default function HealthRecordsPage() {
  const [records, setRecords] = useState([])
  const [animals, setAnimals] = useState([])
  const [pagination, setPagination] = useState({ page: 1, total: 0, totalPages: 0 })
  const [loading, setLoading] = useState(true)
  const [filters, setFilters] = useState({ animal_id: null, date_from: '', date_to: '' })
  const navigate = useNavigate()

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
    animalService.list({ limit: 200 }).then(res => setAnimals(res.data.data.map(a => ({ id: a.id, label: `${a.tag_number}`, sub: `${a.species} \u00B7 ${a.breed || ''}` }))))
  }, [])

  const isSuspected = (diagnosis) => {
    return diagnosis?.toLowerCase().includes('suspected') || diagnosis?.toLowerCase().includes('anthrax')
  }

  const columns = [
    { key: 'record_date', label: 'Date', render: (val) => val?.split('T')[0] },
    {
      key: 'animal_tag', label: 'Animal',
      render: (val, row) => <TagBadge tag={val} species={row.animal_species} to={`/animals/${row.animal_id}`} />,
    },
    { key: 'vet_name', label: 'Vet' },
    {
      key: 'diagnosis', label: 'Diagnosis / Vaccination',
      render: (val, row) => {
        const display = row.vaccination_schedule_name || val || '\u2014'
        if (isSuspected(val)) {
          return <span className="flex items-center gap-2">{display} <StatusPill status="Suspected" /></span>
        }
        return display
      },
    },
    {
      key: 'medication_given', label: 'Medication',
      render: (val, row) => val ? `${val} \u2014 ${row.medication_quantity} ${row.medication_unit}` : '\u2014',
    },
    {
      key: 'withdrawal_days', label: 'Withdrawal',
      render: (val) => val > 0 ? (
        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-wheat-100 text-wheat-500 dark:bg-wheat-500/20 dark:text-wheat-400">{val} days remaining</span>
      ) : '\u2014',
    },
    {
      key: 'attachment_count', label: 'Docs',
      render: (val) => val > 0 ? (
        <span className="inline-flex items-center gap-1 text-xs text-slate2-400"><Paperclip className="w-3 h-3" />{val}</span>
      ) : '\u2014',
    },
  ]

  const renderMobileCard = (r) => (
    <div>
      <div className="flex items-center gap-2">
        <TagBadge tag={r.animal_tag} species={r.animal_species} to={`/animals/${r.animal_id}`} />
        {isSuspected(r.diagnosis) && <StatusPill status="Suspected" />}
      </div>
      <p className="text-xs text-slate2-400 mt-1">
        {r.record_date?.split('T')[0]} {'\u00B7'} {r.vet_name}
        {r.diagnosis ? ` \u00B7 ${r.diagnosis}` : ''}
      </p>
      {r.withdrawal_days > 0 && (
        <span className="inline-flex mt-1 text-xs text-wheat-500 dark:text-wheat-400">{r.withdrawal_days} days withdrawal</span>
      )}
    </div>
  )

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-xl font-semibold text-ink-900 dark:text-ink-100">Health Records</h1>
        <div className="flex gap-2">
          <Button size="sm" onClick={() => navigate('/health/new')}><Plus className="w-4 h-4" /> New Record</Button>
          <Button size="sm" variant="outline" onClick={() => navigate('/health/timeline')}>Timeline View</Button>
        </div>
      </div>

      <div className="flex gap-3 mb-4 flex-wrap items-end">
        <div className="w-64">
          <SearchableSelect label="Animal" value={filters.animal_id} onChange={(v) => setFilters({ ...filters, animal_id: v })} options={animals} placeholder="All animals..." />
        </div>
        <DatePicker label="From" value={filters.date_from} onChange={(e) => setFilters({ ...filters, date_from: e.target.value })} className="w-40" />
        <DatePicker label="To" value={filters.date_to} onChange={(e) => setFilters({ ...filters, date_to: e.target.value })} className="w-40" />
        <Button size="sm" variant="secondary" onClick={() => fetchRecords(1)}>Filter</Button>
      </div>

      <DataTable
        columns={columns}
        data={records}
        loading={loading}
        emptyTitle="No health records yet"
        emptyDescription="Log the first vet visit to start building your herd's medical history."
        emptyAction={<Button size="sm" onClick={() => navigate('/health/new')}><Plus className="w-4 h-4" /> New Health Record</Button>}
        pagination={pagination}
        onPageChange={fetchRecords}
        renderMobileCard={renderMobileCard}
      />
    </div>
  )
}
