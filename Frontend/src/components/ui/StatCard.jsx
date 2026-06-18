import { cn } from '../../lib/utils'

export function StatCard({ title, value, icon: Icon, trend, variant = 'default', className, children }) {
  const colors = {
    default: 'bg-white dark:bg-[#16201A] border-slate2-400/20 dark:border-slate2-600/20',
    pasture: 'bg-pasture-100/50 dark:bg-pasture-600/10 border-pasture-600/20 dark:border-pasture-400/20',
    wheat: 'bg-wheat-100/50 dark:bg-wheat-500/10 border-wheat-500/20 dark:border-wheat-400/20',
    clay: 'bg-clay-100/50 dark:bg-clay-600/10 border-clay-600/20 dark:border-clay-400/20',
  }

  return (
    <div className={cn('rounded-md border p-4', colors[variant], className)}>
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-medium text-slate2-400 dark:text-slate2-600 uppercase tracking-wider">{title}</p>
          <p className="mt-1 text-2xl font-semibold text-ink-900 dark:text-ink-100 ledger-mono">{value}</p>
          {trend && (
            <p className={cn('text-xs mt-1', trend > 0 ? 'text-pasture-600 dark:text-pasture-400' : 'text-clay-600 dark:text-clay-400')}>
              {trend > 0 ? '+' : ''}{trend}%
            </p>
          )}
        </div>
        {Icon && (
          <div className="p-2 rounded-md bg-white/50 dark:bg-mist-900/30">
            <Icon className="w-5 h-5 text-slate2-400 dark:text-slate2-600" />
          </div>
        )}
      </div>
      {children}
    </div>
  )
}
