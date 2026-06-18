import { useState, useRef, useEffect, useCallback } from 'react'
import { createPortal } from 'react-dom'
import { AnimatePresence, motion } from 'framer-motion'
import { ChevronLeft, ChevronRight, Calendar } from 'lucide-react'
import { cn } from '../../lib/utils'

const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']
const DAYS = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa']

function getDaysInMonth(year, month) {
  return new Date(year, month + 1, 0).getDate()
}

function getFirstDayOfMonth(year, month) {
  return new Date(year, month, 1).getDay()
}

function formatDate(y, m, d) {
  return `${y}-${String(m + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`
}

function parseDate(str) {
  if (!str) return null
  const parts = str.split('-')
  return new Date(parseInt(parts[0]), parseInt(parts[1]) - 1, parseInt(parts[2]))
}

export function DatePicker({ value, onChange, label, className, error, placeholder, id, name }) {
  const [open, setOpen] = useState(false)
  const today = new Date()
  const parsed = parseDate(value)
  const [viewDate, setViewDate] = useState(parsed || today)
  const [inputValue, setInputValue] = useState(value || '')
  const [popupPos, setPopupPos] = useState({ top: 0, left: 0 })
  const ref = useRef(null)
  const inputRef = useRef(null)

  useEffect(() => {
    setInputValue(value || '')
    const p = parseDate(value)
    if (p) setViewDate(p)
  }, [value])

  useEffect(() => {
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) {
        setOpen(false)
        if (!value) setInputValue('')
        else setInputValue(value)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [value])

  const openPicker = () => {
    if (open) return
    const rect = ref.current?.querySelector('input')?.getBoundingClientRect()
    if (rect) {
      const top = rect.bottom + 4
      let left = rect.left
      if (left + 272 > window.innerWidth) left = window.innerWidth - 280
      setPopupPos({ top, left })
    }
    setOpen(true)
  }

  const selectDate = useCallback((y, m, d) => {
    const formatted = formatDate(y, m, d)
    setViewDate(new Date(y, m, d))
    setInputValue(formatted)
    setOpen(false)
    inputRef.current?.focus()
    onChange?.({ target: { value: formatted, name } })
  }, [onChange, name])

  const daysInMonth = getDaysInMonth(viewDate.getFullYear(), viewDate.getMonth())
  const firstDay = getFirstDayOfMonth(viewDate.getFullYear(), viewDate.getMonth())
  const prevMonth = () => setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() - 1, 1))
  const nextMonth = () => setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() + 1, 1))

  const calendarDays = []
  for (let i = 0; i < firstDay; i++) calendarDays.push(null)
  for (let d = 1; d <= daysInMonth; d++) calendarDays.push(d)

  const handleInputChange = (e) => setInputValue(e.target.value)

  const handleInputBlur = () => {
    const p = parseDate(inputValue)
    if (p && !isNaN(p.getTime())) {
      onChange?.({ target: { value: inputValue, name } })
    } else if (!inputValue && value) {
      onChange?.({ target: { value: '', name } })
    }
  }

  const calendarPopup = (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0, y: -4, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -4, scale: 0.98 }}
          transition={{ duration: 0.12 }}
          style={{ top: popupPos.top, left: popupPos.left }}
          className="fixed z-[60] w-[272px] bg-white dark:bg-[#16201A] rounded-md border border-slate2-400/20 dark:border-slate2-600/20 shadow-lg overflow-hidden"
        >
          <div className="flex items-center justify-between px-3 py-2 border-b border-slate2-400/10 dark:border-slate2-600/10">
            <button
              type="button"
              onClick={prevMonth}
              className="p-1 rounded-sm hover:bg-mist-50 dark:hover:bg-mist-900 text-slate2-400 hover:text-ink-900 dark:hover:text-ink-100"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <p className="text-sm font-medium text-ink-900 dark:text-ink-100">
              {MONTHS[viewDate.getMonth()]} {viewDate.getFullYear()}
            </p>
            <button
              type="button"
              onClick={nextMonth}
              className="p-1 rounded-sm hover:bg-mist-50 dark:hover:bg-mist-900 text-slate2-400 hover:text-ink-900 dark:hover:text-ink-100"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          <div className="grid grid-cols-7 gap-px bg-slate2-400/10 dark:bg-slate2-600/10">
            {DAYS.map(d => (
              <div key={d} className="bg-mist-50 dark:bg-mist-900 py-1.5 text-center text-[10px] font-medium text-slate2-400 uppercase tracking-wider">
                {d}
              </div>
            ))}
            {calendarDays.map((day, i) => {
              if (!day) return <div key={`e${i}`} className="bg-white dark:bg-[#16201A] py-1" />
              const isToday = day === today.getDate() && viewDate.getMonth() === today.getMonth() && viewDate.getFullYear() === today.getFullYear()
              const isSelected = parsed && day === parsed.getDate() && viewDate.getMonth() === parsed.getMonth() && viewDate.getFullYear() === parsed.getFullYear()

              return (
                <button
                  type="button"
                  key={day}
                  onClick={() => selectDate(viewDate.getFullYear(), viewDate.getMonth(), day)}
                  className={cn(
                    'bg-white dark:bg-[#16201A] py-1.5 text-center text-sm transition-colors relative',
                    isSelected
                      ? 'bg-pasture-500 dark:bg-pasture-400 text-white font-semibold rounded-sm z-10 shadow-sm'
                      : isToday
                        ? 'text-pasture-600 dark:text-pasture-400 font-semibold'
                        : 'text-ink-900 dark:text-ink-100 hover:bg-mist-50 dark:hover:bg-mist-900 rounded-sm',
                  )}
                >
                  {day}
                </button>
              )
            })}
          </div>

          {value && (
            <div className="px-3 py-2 border-t border-slate2-400/10 dark:border-slate2-600/10 flex justify-between">
              <span className="text-xs text-slate2-400">{value}</span>
              <button
                type="button"
                onClick={() => {
                  setInputValue('')
                  onChange?.({ target: { value: '', name } })
                  setOpen(false)
                }}
                className="text-xs text-clay-600 dark:text-clay-400 hover:underline"
              >
                Clear
              </button>
            </div>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  )

  return (
    <div ref={ref} className={cn('relative', className)}>
      {label && (
        <label htmlFor={id} className="block text-sm font-medium text-ink-900 dark:text-ink-100 mb-1">
          {label}
        </label>
      )}
      <div className="relative">
        <input
          ref={inputRef}
          id={id}
          type="text"
          value={inputValue}
          onChange={handleInputChange}
          onFocus={openPicker}
          onBlur={handleInputBlur}
          placeholder={placeholder || 'YYYY-MM-DD'}
          className={cn(
            'w-full h-10 pl-3 pr-9 rounded-sm border text-sm bg-white dark:bg-mist-900 dark:text-ink-100',
            'placeholder:text-slate2-400 dark:placeholder:text-slate2-600',
            'focus:outline-2 focus:outline-offset-2 focus:outline-pasture-500',
            error
              ? 'border-clay-400 dark:border-clay-400'
              : 'border-slate2-400 dark:border-slate2-600',
          )}
        />
        <button
          type="button"
          tabIndex={-1}
          onClick={openPicker}
          className="absolute right-1 top-1/2 -translate-y-1/2 p-1.5 rounded-sm text-slate2-400 hover:text-pasture-500 dark:hover:text-pasture-400"
        >
          <Calendar className="w-4 h-4" />
        </button>
      </div>
      {error && <p className="mt-1 text-xs text-clay-600 dark:text-clay-400">{error}</p>}

      {createPortal(calendarPopup, document.body)}
    </div>
  )
}
