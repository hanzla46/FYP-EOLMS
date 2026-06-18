import { forwardRef } from 'react'
import { cn } from '../../lib/utils'

const Input = forwardRef(({ className, error, label, id, ...props }, ref) => (
  <div className="w-full">
    {label && (
      <label htmlFor={id} className="block text-sm font-medium text-ink-900 dark:text-ink-100 mb-1">
        {label}
      </label>
    )}
    <input
      ref={ref}
      id={id}
      className={cn(
        'w-full h-10 px-3 rounded-sm border text-sm ledger-mono',
        'bg-white dark:bg-mist-900 dark:text-ink-100',
        'placeholder:text-slate2-400 dark:placeholder:text-slate2-600',
        'focus:outline-2 focus:outline-offset-2 focus:outline-pasture-500',
        error
          ? 'border-clay-400 dark:border-clay-400'
          : 'border-slate2-400 dark:border-slate2-600',
        className
      )}
      {...props}
    />
    {error && <p className="mt-1 text-xs text-clay-600 dark:text-clay-400">{error}</p>}
  </div>
))
Input.displayName = 'Input'

const Select = forwardRef(({ className, error, label, id, children, ...props }, ref) => (
  <div className="w-full">
    {label && (
      <label htmlFor={id} className="block text-sm font-medium text-ink-900 dark:text-ink-100 mb-1">
        {label}
      </label>
    )}
    <select
      ref={ref}
      id={id}
      className={cn(
        'w-full h-10 px-3 rounded-sm border text-sm',
        'bg-white dark:bg-mist-900 dark:text-ink-100',
        'focus:outline-2 focus:outline-offset-2 focus:outline-pasture-500',
        error
          ? 'border-clay-400 dark:border-clay-400'
          : 'border-slate2-400 dark:border-slate2-600',
        className
      )}
      {...props}
    >
      {children}
    </select>
    {error && <p className="mt-1 text-xs text-clay-600 dark:text-clay-400">{error}</p>}
  </div>
))
Select.displayName = 'Select'

const Textarea = forwardRef(({ className, error, label, id, ...props }, ref) => (
  <div className="w-full">
    {label && (
      <label htmlFor={id} className="block text-sm font-medium text-ink-900 dark:text-ink-100 mb-1">
        {label}
      </label>
    )}
    <textarea
      ref={ref}
      id={id}
      className={cn(
        'w-full px-3 py-2 rounded-sm border text-sm',
        'bg-white dark:bg-mist-900 dark:text-ink-100',
        'placeholder:text-slate2-400 dark:placeholder:text-slate2-600',
        'focus:outline-2 focus:outline-offset-2 focus:outline-pasture-500',
        error
          ? 'border-clay-400 dark:border-clay-400'
          : 'border-slate2-400 dark:border-slate2-600',
        className
      )}
      {...props}
    />
    {error && <p className="mt-1 text-xs text-clay-600 dark:text-clay-400">{error}</p>}
  </div>
))
Textarea.displayName = 'Textarea'

export { Input, Select, Textarea }
