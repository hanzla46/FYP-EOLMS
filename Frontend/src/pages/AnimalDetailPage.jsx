import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import QRCode from 'react-qr-code'
import animalService from '../services/animalService'
import breedService from '../services/breedService'
import uploadService from '../services/uploadService'
import productionService from '../services/productionService'
import FileUpload from '../components/FileUpload'
import { Button } from '../components/ui/Button'
import { StatusPill } from '../components/ui/Badge'
import { toast } from 'sonner'
import { TagBadge } from '../components/ui/TagBadge'
import { Card, CardContent } from '../components/ui/Card'
import { Dialog } from '../components/ui/Dialog'
import { Input, Textarea } from '../components/ui/Input'
import { DatePicker } from '../components/ui/DatePicker'
import SearchableSelect from '../components/SearchableSelect'

const allStatuses = ['Active','Quarantined','Pregnant','Dry','Deceased','Sold']

export default function AnimalDetailPage() {
  const { id } = useParams()
  const [animal, setAnimal] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [editing, setEditing] = useState(false)
  const [editForm, setEditForm] = useState({})
  const [breeds, setBreeds] = useState([])
  const [statusForm, setStatusForm] = useState('')
  const [productionStats, setProductionStats] = useState(null)

  const fetchAnimal = async () => {
    try {
      const res = await animalService.getById(id)
      setAnimal(res.data.data)
      productionService.animalStats(id).then(r => setProductionStats(r.data.data)).catch(() => {})
    } catch (err) {
      setError('Animal not found.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchAnimal() }, [id])

  const handleEdit = () => {
    setEditForm({
      breed: animal.breed || '',
      date_of_birth: animal.date_of_birth ? animal.date_of_birth.split('T')[0] : '',
      dam_id: animal.dam_id || '',
      sire_identity: animal.sire_identity || '',
      weight_kg: animal.weight_kg || '',
      color: animal.color || '',
      notes: animal.notes || '',
    })
    breedService.list(animal.species).then(res => setBreeds(res.data.data))
    setEditing(true)
  }

  const handleUpdate = async (e) => {
    e.preventDefault()
    try {
      const payload = {}
      Object.entries(editForm).forEach(([k, v]) => { if (v !== undefined && v !== '') payload[k] = v })
      if (payload.dam_id) payload.dam_id = parseInt(payload.dam_id)
      if (payload.weight_kg) payload.weight_kg = parseFloat(payload.weight_kg)
      await animalService.update(id, payload)
      setEditing(false)
      toast.success('Animal updated')
      fetchAnimal()
    } catch (err) {
      toast.error(err.response?.data?.error || 'Update failed.')
    }
  }

  const handleStatusChange = async () => {
    if (!statusForm) return
    try {
      await animalService.updateStatus(id, statusForm)
      setStatusForm('')
      toast.success('Status updated')
      fetchAnimal()
    } catch (err) {
      toast.error(err.response?.data?.error || 'Status change failed.')
    }
  }

  if (loading) {
    return (
      <div>
        <div className="h-4 w-24 bg-slate2-400/20 dark:bg-slate2-600/20 rounded animate-pulse mb-4" />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 h-64 bg-white dark:bg-[#16201A] rounded-md border border-slate2-400/20 dark:border-slate2-600/20 animate-pulse" />
          <div className="h-64 bg-white dark:bg-[#16201A] rounded-md border border-slate2-400/20 dark:border-slate2-600/20 animate-pulse" />
        </div>
      </div>
    )
  }

  if (error && !animal) return <div className="text-center py-8 text-clay-600 dark:text-clay-400">{error}</div>

  return (
    <div>
      <Link to="/animals" className="inline-flex items-center gap-1 text-sm text-slate2-400 hover:text-ink-900 dark:hover:text-ink-100 mb-4">
        <ArrowLeft className="w-3 h-3" /> Back to Animals
      </Link>

      {error && <div className="mb-4 p-3 bg-clay-100 dark:bg-clay-600/20 border border-clay-400/30 dark:border-clay-400/20 text-clay-600 dark:text-clay-400 rounded-sm text-sm">{error}</div>}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Card>
            <CardContent>
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-16 h-16 rounded-full bg-mist-50 dark:bg-mist-900 border border-slate2-400/20 dark:border-slate2-600/20 flex items-center justify-center overflow-hidden">
                    {animal.profile_photo_path ? (
                      <img src={uploadService.getFileUrl(animal.profile_photo_path, 'animal', animal.id)} alt={animal.tag_number} className="w-full h-full object-cover" />
                    ) : (
                      <TagBadge tag={animal.tag_number} species={animal.species} />
                    )}
                  </div>
                  <div>
                    <h1 className="text-xl font-semibold text-ink-900 dark:text-ink-100">{animal.tag_number}</h1>
                    <p className="text-sm text-slate2-400">{animal.species} {animal.breed ? `\u00B7 ${animal.breed}` : ''}</p>
                  </div>
                </div>
                <StatusPill status={animal.status} />
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                <div><span className="text-xs text-slate2-400 block">Gender</span><span className="font-medium text-ink-900 dark:text-ink-100">{animal.gender}</span></div>
                <div><span className="text-xs text-slate2-400 block">Date of Birth</span><span className="font-medium text-ink-900 dark:text-ink-100">{animal.date_of_birth ? animal.date_of_birth.split('T')[0] : '\u2014'}</span></div>
                <div><span className="text-xs text-slate2-400 block">Weight</span><span className="font-medium text-ink-900 dark:text-ink-100">{animal.weight_kg ? `${animal.weight_kg} kg` : '\u2014'}</span></div>
                <div><span className="text-xs text-slate2-400 block">Color</span><span className="font-medium text-ink-900 dark:text-ink-100">{animal.color || '\u2014'}</span></div>
                <div><span className="text-xs text-slate2-400 block">Dam</span><span className="font-medium text-ink-900 dark:text-ink-100">{animal.dam_tag || animal.dam_id || '\u2014'}</span></div>
                <div><span className="text-xs text-slate2-400 block">Sire</span><span className="font-medium text-ink-900 dark:text-ink-100">{animal.sire_identity || '\u2014'}</span></div>
                <div><span className="text-xs text-slate2-400 block">RFID</span><span className="font-mono text-sm text-ink-900 dark:text-ink-100">{animal.rfid_tag || '\u2014'}</span></div>
                <div><span className="text-xs text-slate2-400 block">Registered by</span><span className="font-medium text-ink-900 dark:text-ink-100">{animal.created_by_name}</span></div>
              </div>

              <div className="grid grid-cols-3 gap-3 mb-6">
                <div className="bg-pasture-100/50 dark:bg-pasture-600/10 rounded-md p-3 text-center">
                  <div className="text-2xl font-bold text-pasture-600 dark:text-pasture-400 ledger-mono">{animal.health_record_count}</div>
                  <div className="text-xs text-pasture-600/80 dark:text-pasture-400/80">Health Records</div>
                </div>
                <div className="bg-wheat-100/50 dark:bg-wheat-500/10 rounded-md p-3 text-center">
                  <div className="text-2xl font-bold text-wheat-500 ledger-mono">{animal.breeding_record_count}</div>
                  <div className="text-xs text-wheat-500/80 dark:text-wheat-400/80">Breedings</div>
                </div>
                <div className="bg-pasture-100/50 dark:bg-pasture-600/10 rounded-md p-3 text-center">
                  <div className="text-2xl font-bold text-pasture-600 dark:text-pasture-400 ledger-mono">{animal.production_log_count}</div>
                  <div className="text-xs text-pasture-600/80 dark:text-pasture-400/80">Production Logs</div>
                </div>
              </div>

              {productionStats && productionStats.stats.length > 0 && (
                <div className="border-t border-slate2-400/20 dark:border-slate2-600/20 pt-4 mb-4">
                  <span className="text-xs text-slate2-400 block mb-2">Production Summary</span>
                  <div className="grid grid-cols-2 gap-3">
                    {productionStats.stats.map((s) => (
                      <div key={s.production_type} className="bg-mist-50 dark:bg-mist-900 rounded-sm p-3">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-xs font-medium text-ink-900 dark:text-ink-100">{s.production_type}</span>
                          <span className="text-xs text-slate2-400">{s.total_logs} logs</span>
                        </div>
                        <div className="text-lg font-bold text-ink-900 dark:text-ink-100 ledger-mono">
                          {parseFloat(s.total_quantity).toLocaleString()}
                          <span className="text-xs font-normal text-slate2-400 ml-1">{s.production_type === 'Milk' ? 'L' : 'kg'}</span>
                        </div>
                        <div className="flex gap-3 mt-1 text-xs text-slate2-400">
                          <span>Avg: {parseFloat(s.avg_quantity).toFixed(1)}</span>
                          <span>Max: {parseFloat(s.max_quantity).toLocaleString()}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {animal.notes && (
                <div className="border-t border-slate2-400/20 dark:border-slate2-600/20 pt-4">
                  <span className="text-xs text-slate2-400 block mb-1">Notes</span>
                  <p className="text-sm text-ink-900 dark:text-ink-100">{animal.notes}</p>
                </div>
              )}

              <div className="border-t border-slate2-400/20 dark:border-slate2-600/20 pt-4 mt-4 flex gap-3 flex-wrap">
                <Button size="sm" onClick={handleEdit}>Edit Details</Button>
                <SearchableSelect
                  value={statusForm}
                  onChange={setStatusForm}
                  options={allStatuses.filter(s => s !== animal.status).map(s => ({id:s,label:s}))}
                  placeholder="Change Status..."
                />
                <Button size="sm" variant="secondary" disabled={!statusForm} onClick={handleStatusChange}>Update Status</Button>
              </div>
            </CardContent>
          </Card>
        </div>

        <div>
          <Card>
            <CardContent className="flex flex-col items-center">
              {animal.profile_photo_path ? (
                <div className="mb-4">
                  <img src={uploadService.getFileUrl(animal.profile_photo_path, 'animal', animal.id)} alt={animal.tag_number}
                    className="w-48 h-48 object-cover rounded-md border border-slate2-400/20 dark:border-slate2-600/20" />
                </div>
              ) : (
                <div className="mb-4 w-48 h-48 bg-mist-50 dark:bg-mist-900 rounded-md border border-slate2-400/20 dark:border-slate2-600/20 flex items-center justify-center text-slate2-400 text-sm">
                  No photo
                </div>
              )}
              <FileUpload
                onUpload={(file) => uploadService.uploadAnimalPhoto(animal.id, file).then(() => fetchAnimal())}
                accept="image/jpeg,image/png,image/webp"
                label="Upload Photo"
                preview={false}
              />
              <div className="w-full border-t border-slate2-400/20 dark:border-slate2-600/20 my-4" />
              <h3 className="text-sm font-medium text-ink-900 dark:text-ink-100 mb-4">QR Code</h3>
              <div className="bg-white dark:bg-mist-900 p-4 rounded-md border border-slate2-400/20 dark:border-slate2-600/20">
                <QRCode value={animal.tag_number} size={180} level="M" />
              </div>
              <p className="mt-3 text-xs text-slate2-400 text-center font-mono break-all">{animal.tag_number}</p>
              <p className="mt-1 text-xs text-slate2-400">Scan for animal profile</p>
            </CardContent>
          </Card>
        </div>
      </div>

      <Dialog open={editing} onClose={() => setEditing(false)} title="Edit Animal">
        <form onSubmit={handleUpdate} className="space-y-3">
          {Object.entries(editForm).map(([key, val]) => (
            <div key={key}>
              <label className="block text-xs font-medium text-slate2-400 mb-1 capitalize">{key.replace(/_/g, ' ')}</label>
              {key === 'notes' ? (
                <Textarea value={val} onChange={(e) => setEditForm({ ...editForm, [key]: e.target.value })} rows={2} />
              ) : key === 'date_of_birth' ? (
                <DatePicker value={val} onChange={(e) => setEditForm({ ...editForm, [key]: e.target.value })} />
              ) : key === 'breed' ? (
                <>
                  <Input value={val} onChange={(e) => setEditForm({ ...editForm, [key]: e.target.value })} list="breed-edit-list" />
                  <datalist id="breed-edit-list">{breeds.map(b => <option key={b} value={b} />)}</datalist>
                </>
              ) : (
                <Input value={val} onChange={(e) => setEditForm({ ...editForm, [key]: e.target.value })} />
              )}
            </div>
          ))}
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="ghost" size="sm" onClick={() => setEditing(false)}>Cancel</Button>
            <Button type="submit" size="sm">Save</Button>
          </div>
        </form>
      </Dialog>
    </div>
  )
}
