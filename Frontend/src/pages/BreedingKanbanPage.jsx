import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import breedingService from '../services/breedingService'
import { StatusPill } from '../components/ui/Badge'
import { TagBadge } from '../components/ui/TagBadge'
import { Card, CardContent } from '../components/ui/Card'

const stages = [
  { key: 'pending', label: 'Pending Check', filter: (r) => !r.pregnancy_check_date },
  { key: 'confirmed', label: 'Confirmed Pregnant', filter: (r) => r.pregnancy_confirmed && !r.actual_calving_date },
  { key: 'due', label: 'Due Soon', filter: (r) => {
    const today = new Date().toISOString().split('T')[0]
    return r.estimated_calving_date && r.estimated_calving_date <= today && !r.actual_calving_date && r.pregnancy_confirmed
  }},
  { key: 'calved', label: 'Calved', filter: (r) => !!r.actual_calving_date },
  { key: 'not_pregnant', label: 'Not Pregnant', filter: (r) => r.pregnancy_check_date && !r.pregnancy_confirmed },
]

export default function BreedingKanbanPage() {
  const [records, setRecords] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    breedingService.list({ limit: 200 }).then(res => {
      setRecords(res.data.data)
    }).catch(console.error).finally(() => setLoading(false))
  }, [])

  const getBreedingStatus = (r) => {
    if (r.pregnancy_confirmed && r.actual_calving_date) return `Calved (${r.offspring_count})`
    if (r.pregnancy_confirmed) return 'Pregnant'
    if (r.pregnancy_check_date && !r.pregnancy_confirmed) return 'Not Pregnant'
    return 'Pending'
  }

  if (loading) {
    return (
      <div>
        <div className="flex items-center gap-2 mb-4"><div className="h-4 w-24 bg-slate2-400/20 animate-pulse rounded" /></div>
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          {stages.map((_, i) => (
            <div key={i} className="space-y-3">
              {Array.from({ length: 3 }).map((_, j) => (
                <div key={j} className="h-24 bg-white dark:bg-[#16201A] rounded-md border border-slate2-400/20 animate-pulse" />
              ))}
            </div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Link to="/breeding" className="text-slate2-400 hover:text-ink-900 dark:hover:text-ink-100">
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <h1 className="text-xl font-semibold text-ink-900 dark:text-ink-100">Breeding Pipeline</h1>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        {stages.map((stage) => {
          const items = records.filter(stage.filter)
          return (
            <div key={stage.key} className="space-y-2">
              <div className="flex items-center justify-between px-2">
                <h3 className="text-xs font-semibold uppercase tracking-wider text-slate2-400">{stage.label}</h3>
                <span className="text-xs text-slate2-400 bg-mist-50 dark:bg-mist-900 px-1.5 py-0.5 rounded-full">{items.length}</span>
              </div>
              <div className="space-y-2 min-h-[100px]">
                {items.map((r) => (
                  <Link key={r.id} to={`/breeding`}>
                    <Card className="hover:border-pasture-400/30 cursor-pointer transition-colors">
                      <CardContent className="p-3">
                        <div className="flex items-center justify-between mb-1">
                          <TagBadge tag={r.dam_tag} species={r.dam_species} />
                          <StatusPill status={getBreedingStatus(r)} />
                        </div>
                        <div className="text-xs text-slate2-400 space-y-0.5">
                          <p>Sire: <span className="font-mono">{r.sire_identity}</span></p>
                          <p>Inseminated: {r.insemination_date?.split('T')[0]}</p>
                          {r.estimated_calving_date && (
                            <p className={r.estimated_calving_date <= new Date().toISOString().split('T')[0] ? 'text-wheat-500 font-medium' : ''}>
                              Due: {r.estimated_calving_date.split('T')[0]}
                            </p>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                ))}
                {items.length === 0 && (
                  <div className="h-16 border border-dashed border-slate2-400/20 dark:border-slate2-600/20 rounded-md flex items-center justify-center text-xs text-slate2-400">
                    No animals
                  </div>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
