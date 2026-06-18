import { cn } from '../../lib/utils'

export function Tabs({ tabs, activeTab, onChange, className }) {
  return (
    <div className={cn('flex border-b border-slate2-400/20 dark:border-slate2-600/20', className)}>
      {tabs.map((tab) => (
        <button
          key={tab.key}
          onClick={() => onChange?.(tab.key)}
          className={cn(
            'px-4 py-2.5 text-sm font-medium border-b-2 transition-colors -mb-px',
            activeTab === tab.key
              ? 'border-pasture-500 text-pasture-600 dark:text-pasture-400'
              : 'border-transparent text-slate2-400 hover:text-ink-900 dark:hover:text-ink-100'
          )}
        >
          {tab.label}
        </button>
      ))}
    </div>
  )
}
