import { useState } from 'react'
import { Button } from './ui/Button'

export default function FileUpload({ onUpload, accept = 'image/jpeg,image/png,image/webp,application/pdf', label = 'Upload File', preview = false }) {
  const [selectedFile, setSelectedFile] = useState(null)
  const [previewUrl, setPreviewUrl] = useState(null)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState('')

  const handleFileChange = (e) => {
    const file = e.target.files[0]
    if (!file) return
    setError('')

    const maxSize = file.type === 'application/pdf' ? 10 * 1024 * 1024 : 5 * 1024 * 1024
    if (file.size > maxSize) {
      setError(`File too large. Max ${maxSize / (1024 * 1024)}MB.`)
      return
    }

    setSelectedFile(file)
    if (preview && file.type.startsWith('image/')) {
      setPreviewUrl(URL.createObjectURL(file))
    }
  }

  const handleUpload = async () => {
    if (!selectedFile) return
    setUploading(true)
    setError('')
    try {
      await onUpload(selectedFile)
      setSelectedFile(null)
      setPreviewUrl(null)
    } catch (err) {
      setError(err.response?.data?.error || 'Upload failed.')
    } finally {
      setUploading(false)
    }
  }

  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-ink-900 dark:text-ink-100">{label}</label>
      <div className="flex items-center gap-3">
        <input type="file" onChange={handleFileChange} accept={accept}
          className="text-sm text-ink-900 dark:text-ink-100 file:mr-3 file:py-1.5 file:px-3 file:rounded-sm file:border-0 file:text-sm file:font-medium file:bg-pasture-100 dark:file:bg-pasture-600/20 file:text-pasture-600 dark:file:text-pasture-400 hover:file:bg-pasture-200 dark:hover:file:bg-pasture-600/30" />
        {selectedFile && (
          <Button size="sm" type="button" onClick={handleUpload} disabled={uploading}>
            {uploading ? 'Uploading...' : 'Upload'}
          </Button>
        )}
      </div>
      {error && <p className="text-xs text-clay-600 dark:text-clay-400">{error}</p>}
      {selectedFile && <p className="text-xs text-slate2-400">{selectedFile.name} ({(selectedFile.size / 1024).toFixed(1)} KB)</p>}
      {previewUrl && (
        <img src={previewUrl} alt="Preview" className="mt-2 w-32 h-32 object-cover rounded-sm border border-slate2-400/20 dark:border-slate2-600/20" />
      )}
    </div>
  )
}
