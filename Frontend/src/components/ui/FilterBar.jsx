import { useState, useRef, useEffect } from 'react'
import { Search, X } from 'lucide-react'
import { Input } from './Input'
import SearchableSelect from '../SearchableSelect'
import { cn } from '../../lib/utils'

export function FilterBar({ onSearch, onFilter, filters = [], className }) {
  const [search, setSearch] = useState('')
  const [activeFilters, setActiveFilters] = useState({})
  const debounceRef = useRef(null)

  useEffect(() => {
    return () => { if (debounceRef.current) clearTimeout(debounceRef.current) }
  }, [])

  const handleSearch = (e) => {
    const v = e.target.value
    setSearch(v)
    if (debounceRef.current) clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => onSearch?.(v), 250)
  }

  const handleFilterChange = (key, value) => {
    setActiveFilters(prev => {
      const next = { ...prev }
      if (value === '' || value === undefined || value === null) {
        delete next[key]
      } else {
        next[key] = value
      }
      onFilter?.(next)
      return next
    })
  }

  const clearSearch = () => {
    setSearch('')
    if (debounceRef.current) clearTimeout(debounceRef.current)
    onSearch?.('')
  }

  return (
    <div className={cn('flex flex-col sm:flex-row gap-3', className)}>
      <div className="relative flex-1 max-w-xs">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate2-400" />
        <Input
          value={search}
          onChange={handleSearch}
          placeholder="Search..."
          className="pl-9 h-9 text-sm"
        />
        {search && (
          <button
            onClick={clearSearch}
            className="absolute right-2 top-1/2 -translate-y-1/2 text-slate2-400 hover:text-ink-900 dark:hover:text-ink-100"
          >
            <X className="w-3 h-3" />
          </button>
        )}
      </div>
      {filters.map((f) => {
        const opts = f.options.map(o => ({ id: o.value, label: o.label }))
        return (
          <SearchableSelect
            key={f.key}
            value={activeFilters[f.key] || ''}
            onChange={(v) => handleFilterChange(f.key, v)}
            options={opts}
            placeholder={f.label}
            className="w-40"
          />
        )
      })}
    </div>
  )
}
