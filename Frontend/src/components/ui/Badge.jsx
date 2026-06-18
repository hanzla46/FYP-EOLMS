import { cn } from '../../lib/utils'

const variants = {
  success: 'bg-pasture-100 text-pasture-600 dark:bg-pasture-600/20 dark:text-pasture-400',
  pending: 'bg-wheat-100 text-wheat-500 dark:bg-wheat-500/20 dark:text-wheat-400',
  critical: 'bg-clay-100 text-clay-600 dark:bg-clay-600/20 dark:text-clay-400',
  neutral: 'bg-mist-50 text-slate2-400 dark:bg-mist-900 dark:text-slate2-600',
}

const statusMap = {
  // success / pasture
  Active: 'success',
  Healthy: 'success',
  Calved: 'success',
  Completed: 'success',
  Income: 'success',

  // pending / wheat
  Pending: 'pending',
  Pregnant: 'pending',
  'Due soon': 'pending',
  Awaiting: 'pending',
  Bred: 'pending',
  'Confirmed Pregnant': 'pending',
  Quarantined: 'pending',

  // critical / clay
  Critical: 'critical',
  Overdue: 'critical',
  Failed: 'critical',
  'Suspected': 'critical',
  'Not Pregnant': 'critical',
  Deceased: 'critical',
  Expense: 'critical',

  // neutral / slate
  Sold: 'neutral',
  Inactive: 'neutral',
  Archived: 'neutral',
  Dry: 'neutral',
  Disabled: 'neutral',
}

function variantForStatus(status) {
  for (const [key, variant] of Object.entries(statusMap)) {
    if (status?.toLowerCase().includes(key.toLowerCase())) return variant
  }
  return 'neutral'
}

export function StatusPill({ status, className }) {
  const variant = variantForStatus(status)
  return (
    <span className={cn(
      'inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium tracking-wide',
      variants[variant],
      className
    )}>
      {status}
    </span>
  )
}

export function Badge({ children, variant = 'neutral', className }) {
  return (
    <span className={cn(
      'inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium tracking-wide',
      variants[variant],
      className
    )}>
      {children}
    </span>
  )
}

export { variants as badgeVariants }
