import { useState } from 'react'

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
      <label className="block text-sm font-medium text-gray-700">{label}</label>
      <div className="flex items-center gap-3">
        <input type="file" onChange={handleFileChange} accept={accept}
          className="text-sm text-gray-600 file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100" />
        {selectedFile && (
          <button type="button" onClick={handleUpload} disabled={uploading}
            className="px-4 py-1.5 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 text-sm font-medium">
            {uploading ? 'Uploading...' : 'Upload'}
          </button>
        )}
      </div>
      {error && <p className="text-xs text-red-600">{error}</p>}
      {selectedFile && <p className="text-xs text-gray-500">{selectedFile.name} ({(selectedFile.size / 1024).toFixed(1)} KB)</p>}
      {previewUrl && (
        <img src={previewUrl} alt="Preview" className="mt-2 w-32 h-32 object-cover rounded-lg border" />
      )}
    </div>
  )
}
