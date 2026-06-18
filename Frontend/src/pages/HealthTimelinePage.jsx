import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { ArrowLeft, Stethoscope, Syringe, Pill } from 'lucide-react'
import healthService from '../services/healthService'
import animalService from '../services/animalService'
import SearchableSelect from '../components/SearchableSelect'
import { StatusPill } from '../components/ui/Badge'
import { Card, CardContent } from '../components/ui/Card'
import { EmptyState } from '../components/ui/EmptyState'

export default function HealthTimelinePage() {
  const [animals, setAnimals] = useState([])
  const [selectedAnimal, setSelectedAnimal] = useState(null)
  const [records, setRecords] = useState([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    animalService.list({ limit: 200 }).then(res => setAnimals(res.data.data.map(a => ({ id: a.id, label: `${a.tag_number}`, sub: `${a.species} \u00B7 ${a.breed || ''}` }))))
  }, [])

  const handleAnimalSelect = async (id) => {
    setSelectedAnimal(id)
    if (!id) { setRecords([]); return }
    setLoading(true)
    try {
      const res = await healthService.animalHistory(id)
      setRecords(res.data.data || [])
    } catch (err) { console.error(err) }
    finally { setLoading(false) }
  }

  const getRecordIcon = (r) => {
    if (r.vaccination_schedule_name) return <Syringe className="w-4 h-4" />
    if (r.medication_given) return <Pill className="w-4 h-4" />
    return <Stethoscope className="w-4 h-4" />
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Link to="/health" className="text-slate2-400 hover:text-ink-900 dark:hover:text-ink-100">
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <h1 className="text-xl font-semibold text-ink-900 dark:text-ink-100">Health Timeline</h1>
        </div>
      </div>

      <div className="mb-4 max-w-sm">
        <SearchableSelect
          label="Select Animal"
          value={selectedAnimal}
          onChange={handleAnimalSelect}
          options={animals}
          placeholder="Search animal..."
        />
      </div>

      {!selectedAnimal || records.length === 0 ? (
        <Card>
          <CardContent>
            <EmptyState
              icon={Stethoscope}
              title={selectedAnimal ? "No health records for this animal" : "Select an animal to view timeline"}
              description={selectedAnimal ? "Log the first health record for this animal." : "Choose an animal from the dropdown above to see its medical history."}
            />
          </CardContent>
        </Card>
      ) : loading ? (
        <div className="space-y-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-20 bg-white dark:bg-[#16201A] rounded-md border border-slate2-400/20 animate-pulse" />
          ))}
        </div>
      ) : (
        <div className="relative">
          <div className="absolute left-5 top-0 bottom-0 w-px bg-slate2-400/20 dark:bg-slate2-600/20" />
          <div className="space-y-4">
            {records.map((r) => {
              const isSuspected = r.diagnosis?.toLowerCase().includes('suspected') || r.diagnosis?.toLowerCase().includes('anthrax')
              return (
                <div key={r.id} className="relative pl-12">
                  <div className={`absolute left-3.5 top-4 w-3.5 h-3.5 rounded-full border-2 border-white dark:border-[#16201A] ${isSuspected ? 'bg-clay-400' : r.vaccination_schedule_name ? 'bg-pasture-400' : 'bg-wheat-400'}`} />
                  <Card>
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          {getRecordIcon(r)}
                          <span className="text-sm font-medium text-ink-900 dark:text-ink-100">
                            {r.vaccination_schedule_name || r.diagnosis || 'Checkup'}
                          </span>
                          {isSuspected && <StatusPill status="Suspected" />}
                        </div>
                        <span className="text-xs text-slate2-400">{r.record_date?.split('T')[0]}</span>
                      </div>
                      <div className="text-xs text-slate2-400 space-y-1">
                        <p>Vet: {r.vet_name}</p>
                        {r.treatment && <p>Treatment: {r.treatment}</p>}
                        {r.medication_given && (
                          <p>Medication: {r.medication_given} — {r.medication_quantity} {r.medication_unit}</p>
                        )}
                        {r.withdrawal_days > 0 && (
                          <p className="text-wheat-500 dark:text-wheat-400">Withdrawal: {r.withdrawal_days} days</p>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </div>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}
