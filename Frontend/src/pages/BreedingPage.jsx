import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Plus, AlertTriangle } from 'lucide-react'
import { toast } from 'sonner'
import breedingService from '../services/breedingService'
import animalService from '../services/animalService'
import SearchableSelect from '../components/SearchableSelect'
import { Button } from '../components/ui/Button'
import { StatusPill } from '../components/ui/Badge'
import { TagBadge } from '../components/ui/TagBadge'
import { DataTable } from '../components/ui/DataTable'
import { Drawer } from '../components/ui/Drawer'
import { Input } from '../components/ui/Input'
import { DatePicker } from '../components/ui/DatePicker'
import { Card, CardContent } from '../components/ui/Card'

const inseminationTypeOpts = [{id:'Natural',label:'Natural'},{id:'AI',label:'AI'}]
const genderOpts = [{id:'Female',label:'Female'},{id:'Male',label:'Male'}]

export default function BreedingPage() {
  const [records, setRecords] = useState([])
  const [animals, setAnimals] = useState([])
  const [pagination, setPagination] = useState({ page: 1, total: 0, totalPages: 0 })
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ dam_id: null, sire_identity: '', insemination_date: new Date().toISOString().split('T')[0], insemination_type: 'Natural', notes: '' })
  const [formError, setFormError] = useState('')
  const navigate = useNavigate()
  const [calvingDrawer, setCalvingDrawer] = useState({ open: false, recordId: null })
  const [calvingForm, setCalvingForm] = useState({ actual_calving_date: new Date().toISOString().split('T')[0], offspring_count: '1', calving_genders: ['Female'], calving_breed: '', register_offspring: true })

  useEffect(() => {
    animalService.list({ limit: 200, gender: 'Female' }).then(res => setAnimals(res.data.data.map(a => ({ id: a.id, label: `${a.tag_number}`, sub: `${a.species} \u00B7 ${a.breed || ''}` }))))
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
      toast.success('Insemination logged')
      fetchRecords()
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed.')
    }
  }

  const handlePregnancyCheck = async (recordId) => {
    try {
      await breedingService.pregnancyCheck(recordId, { pregnancy_confirmed: true, pregnancy_check_date: new Date().toISOString().split('T')[0] })
      fetchRecords()
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed.')
    }
  }

  const handleRecordCalving = async (e) => {
    e.preventDefault()
    try {
      await breedingService.recordCalving(calvingDrawer.recordId, calvingForm)
      setCalvingDrawer({ open: false, recordId: null })
      toast.success('Calving recorded')
      fetchRecords()
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed.')
    }
  }

  const updateOffspringCount = (count) => {
    const n = parseInt(count) || 1
    const genders = [...calvingForm.calving_genders]
    while (genders.length < n) genders.push('Female')
    while (genders.length > n) genders.pop()
    setCalvingForm({ ...calvingForm, offspring_count: count, calving_genders: genders })
  }

  const getBreedingStatus = (r) => {
    if (r.pregnancy_confirmed && r.actual_calving_date) return `Calved (${r.offspring_count})`
    if (r.pregnancy_confirmed) return 'Pregnant'
    if (r.pregnancy_check_date && !r.pregnancy_confirmed) return 'Not Pregnant'
    return 'Pending'
  }

  const today = new Date().toISOString().split('T')[0]

  const columns = [
    {
      key: 'dam_tag', label: 'Dam',
      render: (val, row) => (
        <div className="flex items-center gap-2">
          <TagBadge tag={val} species={row.dam_species} to={`/animals/${row.dam_id}`} />
        </div>
      ),
    },
    { key: 'sire_identity', label: 'Sire', render: (val) => <span className="font-mono text-xs">{val}</span> },
    { key: 'insemination_date', label: 'Insemination', render: (val) => val?.split('T')[0] },
    { key: 'insemination_type', label: 'Type' },
    {
      key: 'status', label: 'Status',
      render: (val, row) => <StatusPill status={getBreedingStatus(row)} />,
    },
    {
      key: 'estimated_calving_date', label: 'Expected Calving',
      render: (val, row) => {
        if (!val) return '\u2014'
        const isDue = val <= today && !row.actual_calving_date
        return (
          <span className={isDue ? 'text-wheat-500 dark:text-wheat-400 font-medium flex items-center gap-1' : ''}>
            {val.split('T')[0]}
            {isDue && <AlertTriangle className="w-3 h-3" />}
          </span>
        )
      },
    },
    {
      key: 'id', label: 'Action',
      render: (val, row) => (
        <div className="flex gap-1">
          {!row.pregnancy_confirmed && !row.actual_calving_date && (
            <Button size="sm" onClick={(e) => { e.stopPropagation(); handlePregnancyCheck(val) }}>Confirm Pregnant</Button>
          )}
          {row.pregnancy_confirmed && !row.actual_calving_date && (
            <Button size="sm" variant="secondary" onClick={(e) => { e.stopPropagation(); setCalvingForm({ actual_calving_date: new Date().toISOString().split('T')[0], offspring_count: '1', calving_genders: ['Female'], calving_breed: row.dam_breed || '', register_offspring: true }); setCalvingDrawer({ open: true, recordId: val }) }}>
              Record Calving
            </Button>
          )}
        </div>
      ),
    },
  ]

  const renderMobileCard = (r) => (
    <div>
      <div className="flex items-center gap-2">
        <TagBadge tag={r.dam_tag} species={r.dam_species} to={`/animals/${r.dam_id}`} />
        <StatusPill status={getBreedingStatus(r)} />
      </div>
      <p className="text-xs text-slate2-400 mt-1">
        Sire: {r.sire_identity} {'\u00B7'} {r.insemination_date?.split('T')[0]}
        {r.estimated_calving_date ? ` \u00B7 Due ${r.estimated_calving_date.split('T')[0]}` : ''}
      </p>
    </div>
  )

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-xl font-semibold text-ink-900 dark:text-ink-100">Breeding Records</h1>
        <div className="flex gap-2">
          <Button size="sm" variant="outline" onClick={() => navigate('/breeding/kanban')}>Kanban View</Button>
          <Button size="sm" onClick={() => setShowForm(!showForm)}><Plus className="w-4 h-4" /> Log Insemination</Button>
        </div>
      </div>

      {showForm && (
        <Card className="mb-4">
          <CardContent>
            <form onSubmit={handleInsemination} className="space-y-3">
              {formError && <p className="text-sm text-clay-600 dark:text-clay-400">{formError}</p>}
              <div className="grid grid-cols-3 gap-4">
                <div>
                  {animals.length > 0 ? (
                    <SearchableSelect label="Dam (Female)" value={form.dam_id} onChange={(v) => setForm({ ...form, dam_id: v })} options={animals} placeholder="Search female..." />
                  ) : (
                    <Input label="Dam (Female) ID" type="number" value={form.dam_id || ''} onChange={(e) => setForm({ ...form, dam_id: e.target.value ? parseInt(e.target.value) : null })} />
                  )}
                </div>
                <Input label="Sire Identity *" value={form.sire_identity} onChange={(e) => setForm({ ...form, sire_identity: e.target.value })} placeholder="Tag or external ID" />
                <DatePicker label="Date *" value={form.insemination_date} onChange={(e) => setForm({ ...form, insemination_date: e.target.value })} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <SearchableSelect label="Type" value={form.insemination_type} onChange={(v) => setForm({ ...form, insemination_type: v })} options={inseminationTypeOpts} />
                <Input label="Notes" value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} />
              </div>
              <div className="flex gap-3">
                <Button type="submit" size="sm">Save</Button>
                <Button type="button" variant="ghost" size="sm" onClick={() => setShowForm(false)}>Cancel</Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      <DataTable
        columns={columns}
        data={records}
        loading={loading}
        emptyTitle="No breeding records"
        emptyDescription="Log the first insemination to start tracking breeding cycles."
        emptyAction={<Button size="sm" onClick={() => setShowForm(true)}><Plus className="w-4 h-4" /> Log Insemination</Button>}
        pagination={pagination}
        onPageChange={fetchRecords}
        renderMobileCard={renderMobileCard}
      />

      <Drawer
        open={calvingDrawer.open}
        onClose={() => setCalvingDrawer({ open: false, recordId: null })}
        title="Record Calving"
      >
        <form onSubmit={handleRecordCalving} className="space-y-3">
          <DatePicker label="Calving Date" value={calvingForm.actual_calving_date} onChange={(e) => setCalvingForm({ ...calvingForm, actual_calving_date: e.target.value })} />
          <Input label="Offspring Count" type="number" value={calvingForm.offspring_count} min="1" max="5" onChange={(e) => updateOffspringCount(e.target.value)} />

          {calvingForm.register_offspring && (
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-sm font-medium text-ink-900 dark:text-ink-100">Gender Split</label>
                <span className="text-xs text-slate2-400">
                  {calvingForm.calving_genders.filter(g => g === 'Female').length} F \u00B7 {calvingForm.calving_genders.filter(g => g === 'Male').length} M
                </span>
              </div>
              <input type="range" min="0" max={parseInt(calvingForm.offspring_count) || 1}
                value={calvingForm.calving_genders.filter(g => g === 'Female').length}
                onChange={(e) => {
                  const females = parseInt(e.target.value)
                  const total = parseInt(calvingForm.offspring_count) || 1
                  const genders = []
                  for (let i = 0; i < total; i++) genders.push(i < females ? 'Female' : 'Male')
                  setCalvingForm({ ...calvingForm, calving_genders: genders })
                }}
                className="w-full h-2 rounded-lg appearance-none cursor-pointer bg-mist-50 dark:bg-mist-900 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-pasture-500" />
              <div className="flex justify-between text-xs text-slate2-400 mt-0.5">
                <span>All Female</span>
                <span>All Male</span>
              </div>
            </div>
          )}

          {!calvingForm.register_offspring && (
            <SearchableSelect label="Gender" value={calvingForm.calving_genders[0] || 'Female'} onChange={(v) => setCalvingForm({ ...calvingForm, calving_genders: [v] })} options={genderOpts} />
          )}

          <Input label="Breed (defaults to dam's breed)" value={calvingForm.calving_breed} onChange={(e) => setCalvingForm({ ...calvingForm, calving_breed: e.target.value })} placeholder="Inherited from dam" />

          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" checked={calvingForm.register_offspring} onChange={(e) => setCalvingForm({ ...calvingForm, register_offspring: e.target.checked })} className="rounded" />
            <span className="text-ink-900 dark:text-ink-100">Auto-register offspring as new animals</span>
          </label>

          {calvingForm.register_offspring && (
            <p className="text-xs text-pasture-600 dark:text-pasture-400">Offspring will be created with auto-generated tags and linked to this dam.</p>
          )}

          <div className="flex gap-3 pt-2">
            <Button type="submit">Save</Button>
            <Button type="button" variant="ghost" onClick={() => setCalvingDrawer({ open: false, recordId: null })}>Cancel</Button>
          </div>
        </form>
      </Drawer>
    </div>
  )
}
