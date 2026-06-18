import { useState, useEffect, useRef, useCallback } from 'react'
import { createPortal } from 'react-dom'

export default function SearchableSelect({ value, onChange, options = [], placeholder = 'Search...', label = '', required = false, disabled = false, className = '' }) {
  const [search, setSearch] = useState('')
  const [open, setOpen] = useState(false)
  const [selectedLabel, setSelectedLabel] = useState('')
  const [dropdownRect, setDropdownRect] = useState({ top: 0, left: 0, width: 0 })
  const wrapperRef = useRef(null)
  const inputRef = useRef(null)
  const dropdownRef = useRef(null)

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
      const clickedOutsideWrapper = wrapperRef.current && !wrapperRef.current.contains(e.target)
      const clickedOutsideDropdown = !dropdownRef.current || !dropdownRef.current.contains(e.target)
      if (clickedOutsideWrapper && clickedOutsideDropdown) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const openDropdown = useCallback(() => {
    if (disabled) return
    const rect = wrapperRef.current?.getBoundingClientRect()
    if (rect) {
      let top = rect.bottom + 4
      if (top + 192 > window.innerHeight) top = rect.top - 196
      setDropdownRect({ top, left: rect.left, width: rect.width })
    }
    setOpen(true)
  }, [disabled])

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

  const dropdown = open && (
    <div
      ref={dropdownRef}
      style={{ top: dropdownRect.top, left: dropdownRect.left, width: dropdownRect.width }}
      className="fixed z-[60] bg-white dark:bg-[#16201A] border border-slate2-400/20 dark:border-slate2-600/20 rounded-sm shadow-lg max-h-48 overflow-y-auto"
    >
      {filtered.length === 0 ? (
        <div className="px-3 py-2 text-sm text-slate2-400">No results found</div>
      ) : (
        filtered.map(opt => (
          <div
            key={opt.id}
            onMouseDown={(e) => e.stopPropagation()}
            onClick={() => handleSelect(opt)}
            className={`px-3 py-2 text-sm cursor-pointer hover:bg-mist-50 dark:hover:bg-mist-900 ${opt.id === value ? 'bg-pasture-100 dark:bg-pasture-600/20 font-medium text-pasture-600 dark:text-pasture-400' : 'text-ink-900 dark:text-ink-100'}`}
          >
            <div>{opt.label}</div>
            {opt.sub && <div className="text-xs text-slate2-400">{opt.sub}</div>}
          </div>
        ))
      )}
    </div>
  )

  return (
    <div ref={wrapperRef} className={`relative ${className}`}>
      {label && <label className="block text-sm font-medium text-ink-900 dark:text-ink-100 mb-1">{label}{required && ' *'}</label>}
      <div className="relative">
        {selectedLabel && !open ? (
          <div className="w-full h-10 px-3 rounded-sm border border-slate2-400 dark:border-slate2-600 text-sm flex items-center justify-between bg-white dark:bg-mist-900 dark:text-ink-100 cursor-pointer hover:border-pasture-400"
            onClick={openDropdown}>
            <span className="truncate">{selectedLabel}</span>
            <button type="button" onClick={(e) => { e.stopPropagation(); handleClear(); }}
              className="ml-2 text-slate2-400 hover:text-clay-400 text-xs">&times;</button>
          </div>
        ) : (
          <input
            ref={inputRef}
            type="text"
            value={open ? search : selectedLabel || ''}
            onChange={(e) => { setSearch(e.target.value); if (!open) openDropdown() }}
            onFocus={openDropdown}
            placeholder={placeholder}
            disabled={disabled}
            className={`w-full h-10 px-3 rounded-sm border border-slate2-400 dark:border-slate2-600 text-sm bg-white dark:bg-mist-900 dark:text-ink-100 placeholder:text-slate2-400 focus:outline-2 focus:outline-offset-2 focus:outline-pasture-500 ${disabled ? 'opacity-50' : ''}`}
          />
        )}
      </div>
      {createPortal(dropdown, document.body)}
    </div>
  )
}
