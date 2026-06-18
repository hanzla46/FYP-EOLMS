import { PackageOpen } from 'lucide-react'
import { cn } from '../../lib/utils'

export function EmptyState({ icon: Icon, title, description, action, className }) {
  return (
    <div className={cn('flex flex-col items-center justify-center py-12 px-4 text-center', className)}>
      {Icon ? (
        <Icon className="w-12 h-12 text-slate2-400 dark:text-slate2-600 mb-3" />
      ) : (
        <PackageOpen className="w-12 h-12 text-slate2-400 dark:text-slate2-600 mb-3" />
      )}
      <h3 className="text-sm font-medium text-ink-900 dark:text-ink-100">{title || 'No records found'}</h3>
      {description && (
        <p className="mt-1 text-xs text-slate2-400 dark:text-slate2-600 max-w-sm">{description}</p>
      )}
      {action && <div className="mt-4">{action}</div>}
    </div>
  )
}
