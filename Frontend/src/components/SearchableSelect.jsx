import { useState, useEffect, useRef } from 'react'

export default function SearchableSelect({ value, onChange, options = [], placeholder = 'Search...', label = '', required = false, disabled = false }) {
  const [search, setSearch] = useState('')
  const [open, setOpen] = useState(false)
  const [selectedLabel, setSelectedLabel] = useState('')
  const wrapperRef = useRef(null)

  useEffect(() => {
    if (value) {
      const opt = options.find(o => o.id === value)
      if (opt) setSelectedLabel(opt.label)
    } else {
      setSelectedLabel('')
    }
  }, [value, options])

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const filtered = search
    ? options.filter(o => o.label.toLowerCase().includes(search.toLowerCase()) || o.sub?.toLowerCase().includes(search.toLowerCase()))
    : options

  const handleSelect = (opt) => {
    onChange(opt.id)
    setSelectedLabel(opt.label)
    setSearch('')
    setOpen(false)
  }

  const handleClear = () => {
    onChange(null)
    setSelectedLabel('')
    setSearch('')
  }

  return (
    <div ref={wrapperRef} className="relative">
      {label && <label className="block text-sm font-medium text-gray-700 mb-1">{label}{required && ' *'}</label>}
      <div className="relative">
        {selectedLabel && !open ? (
          <div className={`w-full px-3 py-2 border rounded-lg text-sm flex items-center justify-between ${disabled ? 'bg-gray-100' : 'cursor-pointer hover:border-blue-400'}`}
            onClick={() => !disabled && setOpen(true)}>
            <span className="truncate">{selectedLabel}</span>
            <button type="button" onClick={(e) => { e.stopPropagation(); handleClear(); }}
              className="ml-2 text-gray-400 hover:text-red-500 text-xs">&times;</button>
          </div>
        ) : (
          <input
            type="text"
            value={open ? search : selectedLabel || ''}
            onChange={(e) => { setSearch(e.target.value); setOpen(true) }}
            onFocus={() => setOpen(true)}
            placeholder={placeholder}
            disabled={disabled}
            className={`w-full px-3 py-2 border rounded-lg text-sm focus:ring-1 focus:ring-blue-500 focus:border-blue-500 outline-none ${disabled ? 'bg-gray-100' : ''}`}
          />
        )}
      </div>
      {open && (
        <div className="absolute z-50 mt-1 w-full bg-white border rounded-lg shadow-lg max-h-48 overflow-y-auto">
          {filtered.length === 0 ? (
            <div className="px-3 py-2 text-sm text-gray-500">No results found</div>
          ) : (
            filtered.map(opt => (
              <div
                key={opt.id}
                onClick={() => handleSelect(opt)}
                className={`px-3 py-2 text-sm cursor-pointer hover:bg-blue-50 ${opt.id === value ? 'bg-blue-50 font-medium' : ''}`}
              >
                <div>{opt.label}</div>
                {opt.sub && <div className="text-xs text-gray-400">{opt.sub}</div>}
              </div>
            ))
          )}
        </div>
      )}
    </div>
  )
}
