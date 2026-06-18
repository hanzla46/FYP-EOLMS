import { cn } from '../../lib/utils'

export function Skeleton({ className }) {
  return (
    <div className={cn('animate-pulse rounded-sm bg-slate2-400/20 dark:bg-slate2-600/20', className)} />
  )
}

export function TableRowSkeleton({ cols }) {
  return (
    <div className="flex items-center gap-4 px-4 py-3 border-b border-slate2-400/10 dark:border-slate2-600/10">
      {Array.from({ length: cols || 5 }).map((_, i) => (
        <Skeleton key={i} className="h-4 flex-1" />
      ))}
    </div>
  )
}

export function CardSkeleton() {
  return (
    <div className="p-5 space-y-3">
      <Skeleton className="h-5 w-1/3" />
      <Skeleton className="h-8 w-1/2" />
    </div>
  )
}
